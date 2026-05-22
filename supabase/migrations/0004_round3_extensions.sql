-- =============================================================
-- Nvmcars — Round 3 schema extensions
-- Riflette i tipi nuovi aggiunti nel client (vacations, override
-- prezzi marca/modello, dati fiscali pro, stati booking esteso,
-- libretto auto, reminders).
-- Da eseguire DOPO 0001_initial_schema.sql.
-- =============================================================

-- -------------------------------------------------------------
-- WORKSHOPS: estensioni per onboarding pro + ferie + status
-- -------------------------------------------------------------
alter table public.workshops
  add column if not exists cap text,
  add column if not exists province text,
  add column if not exists photos text[] not null default '{}',
  add column if not exists logo_url text,
  add column if not exists status text not null default 'draft'
    check (status in ('draft','active','paused')),
  add column if not exists accepting_requests boolean not null default true,
  add column if not exists in_officina_payment boolean not null default true,
  add column if not exists response_time_hours numeric(4,1),
  add column if not exists auto_reply_out_of_hours text,
  add column if not exists fiscal_data jsonb,
  add column if not exists owner_data jsonb;

create index if not exists workshops_status_idx on public.workshops(status);
create index if not exists workshops_accepting_idx on public.workshops(accepting_requests);

-- -------------------------------------------------------------
-- WORKSHOP VACATIONS (ferie e chiusure programmate)
-- -------------------------------------------------------------
create table if not exists public.workshop_vacations (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  from_date date not null,
  to_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  check (from_date <= to_date)
);
create index if not exists workshop_vacations_workshop_idx
  on public.workshop_vacations(workshop_id, from_date);

-- -------------------------------------------------------------
-- SERVICE PRICE OVERRIDES (prezzi personalizzati marca/modello)
-- -------------------------------------------------------------
create table if not exists public.service_price_overrides (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  service_key text not null,
  brand text,
  model text,
  price numeric(10,2) not null check (price >= 0),
  created_at timestamptz not null default now(),
  -- almeno brand deve essere presente; se model presente serve brand
  check (brand is not null),
  -- unicità: stessa officina+servizio+brand+model non duplica
  unique (workshop_id, service_key, brand, model)
);
create index if not exists service_price_overrides_workshop_idx
  on public.service_price_overrides(workshop_id, service_key);

-- -------------------------------------------------------------
-- BOOKINGS: estensione stati + flusso slot proposal
-- -------------------------------------------------------------
-- Allarghiamo il check constraint
alter table public.bookings
  drop constraint if exists bookings_status_check;

alter table public.bookings
  add constraint bookings_status_check
  check (status in (
    'requested', 'slot_proposed', 'confirmed', 'in_progress',
    'completed', 'cancelled_by_customer', 'cancelled_by_pro', 'rejected',
    -- legacy stati conservati per migrazione retro-compat
    'pending', 'accepted', 'cancelled'
  ));

alter table public.bookings
  add column if not exists proposed_slots jsonb,
  add column if not exists proposed_at timestamptz,
  add column if not exists proposed_note text,
  add column if not exists selected_slot_id text,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancellation_reason text,
  add column if not exists photos text[] not null default '{}';

-- Migrazione retro: i vecchi stati al nuovo schema
update public.bookings set status = 'requested' where status = 'pending';
update public.bookings set status = 'confirmed' where status = 'accepted';
update public.bookings set status = 'cancelled_by_customer' where status = 'cancelled';

-- -------------------------------------------------------------
-- NOTIFICATIONS: tipi estesi + related_kind
-- -------------------------------------------------------------
alter table public.notifications
  add column if not exists related_kind text
    check (related_kind in ('booking','quote','review','conversation','car'));

-- (il check su `type` è soft per permettere nuovi tipi futuri senza migration)

-- -------------------------------------------------------------
-- CONVERSATIONS: già hanno customer_unread + workshop_unread.
-- Nessuna modifica necessaria.
-- -------------------------------------------------------------

-- -------------------------------------------------------------
-- CARS: dati per libretto auto + reminder
-- -------------------------------------------------------------
alter table public.cars
  add column if not exists km int,
  add column if not exists last_service_at timestamptz,
  add column if not exists next_revision_at timestamptz,
  add column if not exists next_service_km int;

-- -------------------------------------------------------------
-- SERVICE LOG ENTRIES (libretto digitale interventi auto)
-- -------------------------------------------------------------
create table if not exists public.service_log_entries (
  id uuid primary key default uuid_generate_v4(),
  car_id uuid not null references public.cars(id) on delete cascade,
  workshop_id uuid references public.workshops(id) on delete set null,
  workshop_name text,
  service_key text not null,
  description text,
  cost numeric(10,2),
  km int,
  performed_at timestamptz not null default now(),
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists service_log_car_idx
  on public.service_log_entries(car_id, performed_at desc);

-- -------------------------------------------------------------
-- CAR REMINDERS (revisione, tagliando, assicurazione, bollo)
-- -------------------------------------------------------------
create table if not exists public.car_reminders (
  id uuid primary key default uuid_generate_v4(),
  car_id uuid not null references public.cars(id) on delete cascade,
  kind text not null check (kind in ('revision','service','insurance','tax')),
  due_at timestamptz not null,
  note text,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (car_id, kind)
);
create index if not exists car_reminders_car_idx on public.car_reminders(car_id, due_at);

-- -------------------------------------------------------------
-- AUTO: quando un booking diventa 'completed', crea voce libretto
-- -------------------------------------------------------------
create or replace function public.tg_booking_completed_log()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'completed' and (OLD.status is null or OLD.status <> 'completed') then
    if NEW.car_id is not null then
      insert into public.service_log_entries (
        car_id, workshop_id, service_key, cost, performed_at, booking_id
      )
      values (
        NEW.car_id, NEW.workshop_id, NEW.service_key, NEW.estimated_price,
        coalesce(NEW.completed_at, now()), NEW.id
      )
      on conflict do nothing;
    end if;
  end if;
  return NEW;
end$$;

drop trigger if exists bookings_completed_log on public.bookings;
create trigger bookings_completed_log
  after update of status on public.bookings
  for each row execute function public.tg_booking_completed_log();

-- -------------------------------------------------------------
-- VIEW pro: missing onboarding steps (server-side gate)
-- -------------------------------------------------------------
create or replace view public.v_workshop_completeness as
select
  w.id as workshop_id,
  (w.owner_data is not null and w.owner_data ? 'firstName'
    and w.owner_data ? 'lastName' and w.owner_data ? 'phone') as has_owner,
  (w.fiscal_data is not null and w.fiscal_data ? 'legalName'
    and w.fiscal_data ? 'vatNumber' and w.fiscal_data ? 'taxCode') as has_fiscal,
  (w.name is not null and w.address is not null and w.cap is not null
    and w.province is not null and array_length(w.photos, 1) >= 1) as has_workshop,
  (w.hours is not null) as has_hours,
  (exists (
    select 1 from public.workshop_services ws where ws.workshop_id = w.id
  )) as has_services,
  (w.status = 'active') as is_published
from public.workshops w;

-- -------------------------------------------------------------
-- FUNZIONE: visibilità officina (per filtro client)
-- -------------------------------------------------------------
create or replace function public.workshop_is_visible(w public.workshops)
returns boolean language sql immutable as $$
  select w.status = 'active' and w.accepting_requests = true
$$;
