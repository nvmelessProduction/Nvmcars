-- =============================================================
-- Nvmcars — Subscriptions + DAC7 compliance + commissione 5%
-- Da eseguire DOPO 0006_seed_invite_codes.sql
-- =============================================================

-- -------------------------------------------------------------
-- COMMISSION RATE: 2% -> 5%
-- -------------------------------------------------------------
-- Solo il default per le NUOVE quotes. Le esistenti restano col valore già salvato.
alter table public.quotes
  alter column commission_fee_pct set default 0.050;

-- -------------------------------------------------------------
-- PROFILES: campi DAC7 (obbligo UE per marketplace)
-- I venditori/pro UE devono fornire: P.IVA, codice fiscale, IBAN,
-- indirizzo legale, paese. Vedi: https://taxation-customs.ec.europa.eu/dac7
-- -------------------------------------------------------------
alter table public.profiles
  add column if not exists tax_id text,                       -- codice fiscale persona
  add column if not exists iban text,                         -- IBAN per payout
  add column if not exists legal_address text,                -- via, civico, cap, città
  add column if not exists country_code text not null default 'ITA' check (length(country_code) = 3),
  add column if not exists dac7_complete boolean not null default false;

create index if not exists profiles_country_idx on public.profiles(country_code);

-- Helper: marca dac7_complete = true quando tutti i campi richiesti sono presenti
-- (solo per ruolo professional)
create or replace function public.tg_check_dac7()
returns trigger language plpgsql as $$
begin
  if NEW.role = 'professional' then
    NEW.dac7_complete :=
      NEW.tax_id is not null and length(NEW.tax_id) > 0
      and NEW.vat_number is not null and length(NEW.vat_number) > 0
      and NEW.iban is not null and length(NEW.iban) > 0
      and NEW.legal_address is not null and length(NEW.legal_address) > 0
      and NEW.country_code is not null;
  else
    NEW.dac7_complete := true;  -- not required for customers
  end if;
  return NEW;
end$$;

drop trigger if exists profiles_check_dac7 on public.profiles;
create trigger profiles_check_dac7
  before insert or update on public.profiles
  for each row execute function public.tg_check_dac7();

-- -------------------------------------------------------------
-- COUNTRIES (per espansione UE futura: pricing e commission per paese)
-- -------------------------------------------------------------
create table if not exists public.countries (
  code text primary key check (length(code) = 3),  -- ISO 3166-1 alpha-3
  name text not null,
  currency text not null default 'EUR',
  commission_fee_pct numeric(4,3) not null default 0.050,
  pro_price_cents int not null default 2900,           -- €29.00
  premium_price_cents int not null default 7900,       -- €79.00
  diy_price_cents int not null default 499,            -- €4.99
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.countries (code, name, currency, commission_fee_pct, pro_price_cents, premium_price_cents)
values
  ('ITA', 'Italia', 'EUR', 0.050, 2900, 7900),
  ('ESP', 'España', 'EUR', 0.050, 2900, 7900),
  ('FRA', 'France', 'EUR', 0.050, 2900, 7900),
  ('DEU', 'Deutschland', 'EUR', 0.050, 2900, 7900)
on conflict (code) do nothing;

-- -------------------------------------------------------------
-- SUBSCRIPTIONS (Pro/Premium per officine + DIY Pro per clienti)
-- -------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tier text not null check (tier in ('free', 'pro', 'premium', 'diy_pro')),
  stripe_subscription_id text unique,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  status text not null default 'active'
    check (status in ('active','past_due','canceled','trialing','incomplete','incomplete_expired','unpaid')),
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- un utente può avere max 1 sub per "famiglia" (officina vs cliente)
  unique (user_id, tier)
);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id, status);
create index if not exists subscriptions_stripe_sub_idx on public.subscriptions(stripe_subscription_id);

create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function public.tg_set_updated_at();

alter table public.subscriptions enable row level security;

-- L'utente vede e gestisce solo le proprie subscription
create policy subscriptions_owner_select on public.subscriptions
  for select using (user_id = auth.uid());

-- INSERT/UPDATE/DELETE solo via service_role (edge function stripe-create-subscription)
-- => nessuna policy = nessun accesso col JWT cliente

-- -------------------------------------------------------------
-- HELPER VIEW: tier corrente per utente
-- -------------------------------------------------------------
create or replace view public.v_user_tier as
select
  p.id as user_id,
  p.role,
  coalesce(
    (select tier from public.subscriptions s
     where s.user_id = p.id
       and s.status in ('active','trialing')
       and (s.current_period_end is null or s.current_period_end > now())
     order by case s.tier when 'premium' then 1 when 'pro' then 2 when 'diy_pro' then 3 else 4 end
     limit 1),
    'free'
  ) as current_tier
from public.profiles p;

grant select on public.v_user_tier to authenticated;
