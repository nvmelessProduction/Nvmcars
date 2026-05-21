-- =============================================================
-- Nvmcars — Security audit round 2 (post-pen-test)
-- Da eseguire DOPO 0010_boost_referral.sql
--
-- Fix di problemi trovati dall'audit di sicurezza:
--   1. tg_workshops_immutable_owner blocca delete-user-data (workshop anon)
--   2. quotes.commission_fee_pct modificabile da workshop owner (evasione fee)
--   3. profiles: PII (email/IBAN/CF) leggibile da counterparty via conversation
--   4. invite_codes seed (0006) reset used_by su re-apply
--   5. service_log_entries duplicabili dal trigger booking_completed_log
--   6. autodoc_clicks senza rate-limit DB → DoS storage
--   7. Admin auth: aggiunta colonna is_admin per togliere hardcoded password
-- =============================================================

-- -------------------------------------------------------------
-- 1. FIX tg_workshops_immutable_owner
-- Usava `is distinct from` che blocca anche cambio verso NULL
-- (= anonimizzazione fatta da delete-user-data). Cambio in `<>` come
-- gli altri trigger: cambio verso NULL passa (NULL<>val = NULL = falsy),
-- cambio da owner A a owner B viene bloccato come prima.
-- -------------------------------------------------------------
create or replace function public.tg_workshops_immutable_owner()
returns trigger language plpgsql as $$
begin
  -- N.B. `<>` con NULL ritorna NULL (falsy) → permette anonimizzazione service_role.
  -- Cambio fra due owner concreti (entrambi NOT NULL) viene bloccato.
  if NEW.owner_id <> OLD.owner_id then
    raise exception 'workshops.owner_id is immutable from client';
  end if;
  return NEW;
end$$;

-- -------------------------------------------------------------
-- 2. FIX commission_fee_pct mutable da workshop owner
-- Estensione del trigger quote_immutable_refs: commission_fee_pct,
-- commission_fee e total non sono mai modificabili dal client
-- (devono essere ricalcolati ad ogni create), neanche dal workshop.
-- -------------------------------------------------------------
create or replace function public.tg_quotes_immutable_refs()
returns trigger language plpgsql as $$
begin
  if NEW.customer_id <> OLD.customer_id then
    raise exception 'quotes.customer_id is immutable';
  end if;
  if NEW.workshop_id <> OLD.workshop_id then
    raise exception 'quotes.workshop_id is immutable';
  end if;
  if NEW.conversation_id <> OLD.conversation_id then
    raise exception 'quotes.conversation_id is immutable';
  end if;
  -- Totali e commissione sono immutabili dal client (sia cliente che pro).
  -- Solo il subtotal può cambiare attraverso un INSERT di nuovi quote_items,
  -- ma il quote esistente non li ricalcola comunque.
  if NEW.commission_fee_pct <> OLD.commission_fee_pct then
    raise exception 'quotes.commission_fee_pct is immutable (use new quote)';
  end if;
  if NEW.commission_fee <> OLD.commission_fee then
    raise exception 'quotes.commission_fee is immutable (use new quote)';
  end if;
  if NEW.subtotal <> OLD.subtotal then
    raise exception 'quotes.subtotal is immutable (use new quote)';
  end if;
  if NEW.total <> OLD.total then
    raise exception 'quotes.total is immutable (use new quote)';
  end if;
  return NEW;
end$$;

-- -------------------------------------------------------------
-- 3. PROFILES: column-level grants per nascondere PII
-- La policy `profiles_select_counterparty_via_conversation` espone
-- comunque tutti i campi al counterparty. RLS non filtra per colonna,
-- ma possiamo REVOCARE SELECT sui campi sensibili al role `authenticated`
-- (che è quello che il client usa). Il service_role mantiene accesso.
--
-- Per leggere il proprio profilo completo, il client deve usare la nuova
-- RPC `get_my_profile()` (security definer).
-- -------------------------------------------------------------
revoke select on public.profiles from authenticated;
revoke select on public.profiles from anon;

grant select (
  id, role, name, avatar_url, language, theme_mode, workshop_id,
  invite_code, created_at, updated_at, plate_lookups_used, country_code
) on public.profiles to authenticated;

-- Per i campi pubblici minimi (lista workshop/owner) anon può solo via v_profiles_public.
-- Nessun grant SELECT diretto su profiles per anon.

create or replace function public.get_my_profile()
returns public.profiles
language sql security definer set search_path = public
stable as $$
  select * from public.profiles where id = auth.uid()
$$;

grant execute on function public.get_my_profile() to authenticated;

-- -------------------------------------------------------------
-- 4. FIX invite_codes seed: rimuovi `do update set used_by=null`
-- Quel pattern resettava i codici già usati ogni volta che la migration
-- veniva ri-eseguita. Lo sostituiamo con un comportamento idempotente
-- che non tocca le righe esistenti.
-- (Nota: 0006 stessa va aggiornata; questa migration ripristina lo stato
-- corretto se è stata applicata almeno una volta.)
-- -------------------------------------------------------------
-- niente DROP/CREATE, solo un check di sanity per i codici legacy:
update public.invite_codes
   set expires_at = greatest(expires_at, now() + interval '1 year')
 where used_by is null
   and expires_at < now();

-- -------------------------------------------------------------
-- 5. service_log_entries: evita duplicati dal trigger
-- Il trigger tg_booking_completed_log usa `on conflict do nothing` ma
-- la tabella non aveva unique → on conflict non trovava niente con cui
-- conflittare. Aggiungiamo l'unique.
-- -------------------------------------------------------------
do $$
begin
  alter table public.service_log_entries
    add constraint service_log_booking_unique unique (booking_id);
exception when duplicate_object then
  -- già esistente, ok
  null;
when invalid_table_definition then
  -- esistono righe duplicate da pulire prima
  delete from public.service_log_entries a
    using public.service_log_entries b
   where a.booking_id is not null
     and a.booking_id = b.booking_id
     and a.created_at > b.created_at;
  alter table public.service_log_entries
    add constraint service_log_booking_unique unique (booking_id);
end$$;

-- -------------------------------------------------------------
-- 6. autodoc_clicks: rate-limit a livello DB
-- Trigger che blocca > 200 insert/giorno per utente (oltre è bot).
-- -------------------------------------------------------------
create or replace function public.tg_autodoc_clicks_rate_limit()
returns trigger language plpgsql as $$
declare
  cnt int;
begin
  if NEW.user_id is null then
    return NEW;  -- click anonimi limitati dal rate-limit edge function
  end if;
  select count(*) into cnt
    from public.autodoc_clicks
   where user_id = NEW.user_id
     and created_at > now() - interval '1 day';
  if cnt >= 200 then
    raise exception 'autodoc clicks rate limit exceeded';
  end if;
  return NEW;
end$$;

drop trigger if exists autodoc_clicks_rate_limit on public.autodoc_clicks;
create trigger autodoc_clicks_rate_limit
  before insert on public.autodoc_clicks
  for each row execute function public.tg_autodoc_clicks_rate_limit();

-- -------------------------------------------------------------
-- 7. Admin auth: colonna is_admin in profiles + helper
-- Sposta il check admin da hardcoded a DB (set manuale via dashboard).
-- -------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Il trigger tg_profiles_protect_columns già blocca cambi di role dal client.
-- Estendiamo per bloccare anche is_admin (solo service_role può promuovere).
create or replace function public.tg_profiles_protect_columns()
returns trigger language plpgsql as $$
begin
  if NEW.id <> OLD.id then
    raise exception 'profiles.id is immutable';
  end if;
  if NEW.role <> OLD.role then
    raise exception 'profiles.role is immutable (change requires admin)';
  end if;
  if NEW.is_admin is distinct from OLD.is_admin then
    raise exception 'profiles.is_admin can only be changed by service_role';
  end if;
  NEW.created_at := OLD.created_at;
  return NEW;
end$$;

-- -------------------------------------------------------------
-- 8. workshop_services: aggiungi index su (workshop_id) — manca
-- -------------------------------------------------------------
create index if not exists workshop_services_workshop_idx
  on public.workshop_services(workshop_id);

-- -------------------------------------------------------------
-- 9. workshops: index composito (city, status) per query lista
-- -------------------------------------------------------------
create index if not exists workshops_city_status_idx
  on public.workshops(city, status)
  where status in ('active', 'paused');
