-- =============================================================
-- Nvmcars — Boost feature + Referral system
-- Da eseguire DOPO 0009_diy_autodoc.sql
-- =============================================================

-- -------------------------------------------------------------
-- WORKSHOP_BOOSTS (officine "promosse" — top nei risultati per zona/categoria)
-- -------------------------------------------------------------
create table if not exists public.workshop_boosts (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  start_at timestamptz not null default now(),
  end_at timestamptz not null,
  paid_amount_cents int not null check (paid_amount_cents >= 0),
  zone_cap text,                 -- CAP della zona (es. "00052"). NULL = nazionale.
  service_key text,              -- limita a un servizio specifico. NULL = tutti.
  stripe_payment_intent text,
  status text not null default 'active' check (status in ('active','expired','refunded','pending')),
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists workshop_boosts_active_idx
  on public.workshop_boosts(workshop_id, status, end_at);
create index if not exists workshop_boosts_zone_idx
  on public.workshop_boosts(zone_cap, status, end_at) where status = 'active';

alter table public.workshop_boosts enable row level security;

create policy workshop_boosts_select_public on public.workshop_boosts
  for select using (status = 'active' and end_at > now());

create policy workshop_boosts_select_owner on public.workshop_boosts
  for select using (
    exists (select 1 from public.workshops w
            where w.id = workshop_id and w.owner_id = auth.uid())
  );

-- INSERT solo via edge function (service_role). Niente policy.

-- -------------------------------------------------------------
-- REFERRAL_CODES
-- -------------------------------------------------------------
create table if not exists public.referral_codes (
  code text primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('customer','pro')),
  uses_remaining int not null default 100 check (uses_remaining >= 0),
  reward_credit_cents int not null default 500, -- 5€ di credito a chi invita
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists referral_codes_owner_idx on public.referral_codes(owner_user_id);

alter table public.referral_codes enable row level security;

-- Il codice è pubblicamente validabile via RPC, ma la riga è del proprietario
create policy referral_codes_select_owner on public.referral_codes
  for select using (owner_user_id = auth.uid());

create policy referral_codes_insert_self on public.referral_codes
  for insert with check (owner_user_id = auth.uid());

-- -------------------------------------------------------------
-- REFERRAL_REDEMPTIONS
-- -------------------------------------------------------------
create table if not exists public.referral_redemptions (
  id uuid primary key default uuid_generate_v4(),
  code text not null references public.referral_codes(code) on delete cascade,
  redeemed_by_user_id uuid not null references public.profiles(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  reward_credit_cents int not null default 500,
  -- Un utente non può essere referred più di una volta
  unique (redeemed_by_user_id)
);

create index if not exists referral_redemptions_code_idx
  on public.referral_redemptions(code);

alter table public.referral_redemptions enable row level security;

create policy referral_redemptions_select_party on public.referral_redemptions
  for select using (
    redeemed_by_user_id = auth.uid()
    or exists (select 1 from public.referral_codes c
               where c.code = referral_redemptions.code and c.owner_user_id = auth.uid())
  );

-- -------------------------------------------------------------
-- RPC: riscatta referral code (transazionale)
-- -------------------------------------------------------------
create or replace function public.redeem_referral_code(p_code text)
returns table(success boolean, reason text, reward_credit_cents int)
language plpgsql security definer set search_path = public as $$
declare
  rec record;
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    return query select false, 'unauthorized'::text, 0;
    return;
  end if;

  -- non si può usare il proprio codice
  select * into rec from public.referral_codes
    where code = upper(trim(p_code)) for update;
  if not found then
    return query select false, 'not_found'::text, 0;
    return;
  end if;
  if rec.owner_user_id = uid then
    return query select false, 'self_referral'::text, 0;
    return;
  end if;
  if rec.expires_at is not null and rec.expires_at < now() then
    return query select false, 'expired'::text, 0;
    return;
  end if;
  if rec.uses_remaining <= 0 then
    return query select false, 'no_uses_left'::text, 0;
    return;
  end if;

  -- check: già usato da questo utente?
  if exists (select 1 from public.referral_redemptions r where r.redeemed_by_user_id = uid) then
    return query select false, 'already_redeemed'::text, 0;
    return;
  end if;

  insert into public.referral_redemptions (code, redeemed_by_user_id, reward_credit_cents)
    values (rec.code, uid, rec.reward_credit_cents);

  update public.referral_codes
    set uses_remaining = uses_remaining - 1
    where code = rec.code;

  return query select true, 'ok'::text, rec.reward_credit_cents;
end$$;

grant execute on function public.redeem_referral_code(text) to authenticated;

-- -------------------------------------------------------------
-- HELPER VIEW: officine "boosted" attive ora (per sort)
-- -------------------------------------------------------------
create or replace view public.v_active_boosts as
select
  b.workshop_id,
  b.zone_cap,
  b.service_key,
  b.end_at
from public.workshop_boosts b
where b.status = 'active' and b.end_at > now();

grant select on public.v_active_boosts to anon, authenticated;
