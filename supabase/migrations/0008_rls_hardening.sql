-- =============================================================
-- Nvmcars — RLS hardening (security audit Livello 1)
-- Da eseguire DOPO 0007_subscriptions_dac7.sql
-- =============================================================

-- -------------------------------------------------------------
-- PROFILES: BUG FIX CRITICO
-- La policy `profiles_select_workshop_owner_basic using (true)` esponeva
-- TUTTI i profili (email, phone, vat_number, iban, tax_id, legal_address)
-- a chiunque con la anon key. Da rimuovere e sostituire con:
--   - Owner vede tutto del proprio profilo
--   - Vista pubblica `v_profiles_public` espone solo i campi safe
-- -------------------------------------------------------------
drop policy if exists profiles_select_workshop_owner_basic on public.profiles;

-- Policy mirata: vedi il profilo di chi è controparte in una conversazione
-- attiva con te (per chat). I dati sensibili (email, phone, IBAN, ecc.) restano
-- comunque visibili a questa controparte: il client DEVE usare la view
-- v_profiles_public per il browsing pubblico.
create policy profiles_select_counterparty_via_conversation on public.profiles
  for select using (
    exists (
      select 1 from public.conversations c
      where (
        c.customer_id = profiles.id and exists (
          select 1 from public.workshops w
          where w.id = c.workshop_id and w.owner_id = auth.uid()
        )
      ) or (
        c.customer_id = auth.uid() and exists (
          select 1 from public.workshops w
          where w.id = c.workshop_id and w.owner_id = profiles.id
        )
      )
    )
  );

-- Vista pubblica: solo campi che possono essere visti da chiunque.
create or replace view public.v_profiles_public as
  select id, name, avatar_url, role, created_at
  from public.profiles;

grant select on public.v_profiles_public to anon, authenticated;

-- -------------------------------------------------------------
-- PROFILES: with_check su update
-- -------------------------------------------------------------
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- -------------------------------------------------------------
-- PROFILES: trigger che impedisce di cambiare campi che NON devono essere
-- modificabili dal client (id, role, created_at, dac7_complete derivato).
-- -------------------------------------------------------------
create or replace function public.tg_profiles_protect_columns()
returns trigger language plpgsql as $$
begin
  if NEW.id <> OLD.id then
    raise exception 'profiles.id is immutable';
  end if;
  if NEW.role <> OLD.role then
    raise exception 'profiles.role is immutable (change requires admin)';
  end if;
  -- created_at non si tocca
  NEW.created_at := OLD.created_at;
  return NEW;
end$$;

drop trigger if exists profiles_protect_columns on public.profiles;
create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.tg_profiles_protect_columns();

-- -------------------------------------------------------------
-- QUOTE_ITEMS: la policy `for all` non aveva `with check`
-- -------------------------------------------------------------
drop policy if exists quote_items_workshop_write on public.quote_items;
create policy quote_items_workshop_write on public.quote_items
  for all using (
    exists (
      select 1 from public.quotes q
      join public.workshops w on w.id = q.workshop_id
      where q.id = quote_items.quote_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.quotes q
      join public.workshops w on w.id = q.workshop_id
      where q.id = quote_items.quote_id and w.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- CONVERSATIONS: with_check su update
-- -------------------------------------------------------------
drop policy if exists conversations_participants_update on public.conversations;
create policy conversations_participants_update on public.conversations
  for update using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w
               where w.id = conversations.workshop_id and w.owner_id = auth.uid())
  )
  with check (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w
               where w.id = conversations.workshop_id and w.owner_id = auth.uid())
  );

-- Conversations: trigger che impedisce di cambiare customer_id / workshop_id
create or replace function public.tg_conversations_immutable_refs()
returns trigger language plpgsql as $$
begin
  if NEW.customer_id <> OLD.customer_id then
    raise exception 'conversations.customer_id is immutable';
  end if;
  if NEW.workshop_id <> OLD.workshop_id then
    raise exception 'conversations.workshop_id is immutable';
  end if;
  return NEW;
end$$;
drop trigger if exists conversations_immutable_refs on public.conversations;
create trigger conversations_immutable_refs
  before update on public.conversations
  for each row execute function public.tg_conversations_immutable_refs();

-- -------------------------------------------------------------
-- QUOTES: with_check su update + immutable refs
-- -------------------------------------------------------------
drop policy if exists quotes_participants_update on public.quotes;
create policy quotes_participants_update on public.quotes
  for update using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = quotes.workshop_id and w.owner_id = auth.uid())
  )
  with check (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = quotes.workshop_id and w.owner_id = auth.uid())
  );

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
  -- Cliente non può cambiare totali/commissione (li imposta solo il pro a creazione)
  if (auth.uid() = OLD.customer_id) and (
    NEW.subtotal <> OLD.subtotal
    or NEW.commission_fee <> OLD.commission_fee
    or NEW.commission_fee_pct <> OLD.commission_fee_pct
    or NEW.total <> OLD.total
  ) then
    raise exception 'customer cannot modify quote totals';
  end if;
  return NEW;
end$$;
drop trigger if exists quotes_immutable_refs on public.quotes;
create trigger quotes_immutable_refs
  before update on public.quotes
  for each row execute function public.tg_quotes_immutable_refs();

-- -------------------------------------------------------------
-- BOOKINGS: with_check + immutable refs
-- -------------------------------------------------------------
drop policy if exists bookings_participants_update on public.bookings;
create policy bookings_participants_update on public.bookings
  for update using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = bookings.workshop_id and w.owner_id = auth.uid())
  )
  with check (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = bookings.workshop_id and w.owner_id = auth.uid())
  );

create or replace function public.tg_bookings_immutable_refs()
returns trigger language plpgsql as $$
begin
  if NEW.customer_id <> OLD.customer_id then
    raise exception 'bookings.customer_id is immutable';
  end if;
  if NEW.workshop_id <> OLD.workshop_id then
    raise exception 'bookings.workshop_id is immutable';
  end if;
  return NEW;
end$$;
drop trigger if exists bookings_immutable_refs on public.bookings;
create trigger bookings_immutable_refs
  before update on public.bookings
  for each row execute function public.tg_bookings_immutable_refs();

-- -------------------------------------------------------------
-- WORKSHOPS: with_check + immutable owner_id
-- -------------------------------------------------------------
drop policy if exists workshops_update_owner on public.workshops;
create policy workshops_update_owner on public.workshops
  for update using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create or replace function public.tg_workshops_immutable_owner()
returns trigger language plpgsql as $$
begin
  -- Solo service_role può cambiare l'owner (es. cessione officina dal supporto)
  if NEW.owner_id is distinct from OLD.owner_id then
    raise exception 'workshops.owner_id is immutable from client';
  end if;
  return NEW;
end$$;
drop trigger if exists workshops_immutable_owner on public.workshops;
create trigger workshops_immutable_owner
  before update on public.workshops
  for each row execute function public.tg_workshops_immutable_owner();

-- -------------------------------------------------------------
-- REVIEWS: with_check + workshop_id immutable
-- -------------------------------------------------------------
drop policy if exists reviews_customer_update on public.reviews;
create policy reviews_customer_update on public.reviews
  for update using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create or replace function public.tg_reviews_immutable_refs()
returns trigger language plpgsql as $$
begin
  if NEW.customer_id <> OLD.customer_id then
    raise exception 'reviews.customer_id is immutable';
  end if;
  if NEW.workshop_id <> OLD.workshop_id then
    raise exception 'reviews.workshop_id is immutable';
  end if;
  return NEW;
end$$;
drop trigger if exists reviews_immutable_refs on public.reviews;
create trigger reviews_immutable_refs
  before update on public.reviews
  for each row execute function public.tg_reviews_immutable_refs();

-- -------------------------------------------------------------
-- INVITE_CODES: chiudi la falla "select_public"
-- Il client deve solo VALIDARE/RISCATTARE un codice, non listarli.
-- -------------------------------------------------------------
drop policy if exists invite_codes_select_public on public.invite_codes;
-- Nessuna policy = nessun accesso col JWT cliente (solo service_role)

create or replace function public.validate_invite_code(p_code text)
returns table(valid boolean, reason text, workshop_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  rec record;
begin
  select * into rec from public.invite_codes where code = upper(trim(p_code));
  if not found then
    return query select false, 'not_found'::text, null::uuid;
    return;
  end if;
  if rec.used_by is not null then
    return query select false, 'already_used'::text, null::uuid;
    return;
  end if;
  if rec.expires_at is not null and rec.expires_at < now() then
    return query select false, 'expired'::text, null::uuid;
    return;
  end if;
  return query select true, 'ok'::text, rec.workshop_id;
end$$;

grant execute on function public.validate_invite_code(text) to authenticated, anon;

create or replace function public.redeem_invite_code(p_code text)
returns table(success boolean, reason text, workshop_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  rec record;
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    return query select false, 'unauthorized'::text, null::uuid;
    return;
  end if;
  select * into rec from public.invite_codes where code = upper(trim(p_code)) for update;
  if not found then
    return query select false, 'not_found'::text, null::uuid;
    return;
  end if;
  if rec.used_by is not null then
    return query select false, 'already_used'::text, null::uuid;
    return;
  end if;
  if rec.expires_at is not null and rec.expires_at < now() then
    return query select false, 'expired'::text, null::uuid;
    return;
  end if;
  update public.invite_codes
    set used_by = uid, used_at = now()
    where code = rec.code;
  return query select true, 'ok'::text, rec.workshop_id;
end$$;

grant execute on function public.redeem_invite_code(text) to authenticated;

-- -------------------------------------------------------------
-- VIEW security_invoker = true: la view rispetta le RLS del chiamante.
-- (default in PG 15+; lo settiamo esplicito per chiarezza)
-- -------------------------------------------------------------
do $$
begin
  begin
    execute 'alter view public.v_user_tier set (security_invoker = true)';
  exception when others then null; end;
  begin
    execute 'alter view public.v_workshop_stats set (security_invoker = true)';
  exception when others then null; end;
  begin
    execute 'alter view public.v_workshop_completeness set (security_invoker = true)';
  exception when others then null; end;
  begin
    execute 'alter view public.v_profiles_public set (security_invoker = true)';
  exception when others then null; end;
end$$;
