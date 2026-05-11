-- =============================================================
-- Nvmcars — Initial schema
-- Paste this in the Supabase SQL Editor and "Run".
-- =============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- PROFILES (extends auth.users)
-- -------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('customer', 'professional')),
  name text not null,
  phone text,
  email text,
  avatar_url text,
  vat_number text,
  invite_code text,
  workshop_id uuid,
  plate_lookups_used int not null default 0,
  push_token text,
  language text not null default 'it',
  theme_mode text not null default 'auto' check (theme_mode in ('auto','light','dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_workshop_idx on public.profiles(workshop_id);

-- -------------------------------------------------------------
-- WORKSHOPS
-- -------------------------------------------------------------
create table public.workshops (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  city text not null,
  address text not null,
  phone text,
  lat double precision not null,
  lng double precision not null,
  rating numeric(2,1) not null default 0,
  reviews_count int not null default 0,
  photo_url text,
  description text,
  hours jsonb,
  stripe_account_id text,
  stripe_charges_enabled boolean not null default false,
  verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workshops_city_idx on public.workshops(city);
create index workshops_active_idx on public.workshops(active);

alter table public.profiles
  add constraint profiles_workshop_fk
  foreign key (workshop_id) references public.workshops(id) on delete set null;

-- -------------------------------------------------------------
-- WORKSHOP SERVICES (pricing per service per workshop)
-- -------------------------------------------------------------
create table public.workshop_services (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  service_key text not null,
  base_price numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workshop_id, service_key)
);

-- -------------------------------------------------------------
-- CARS
-- -------------------------------------------------------------
create table public.cars (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  plate text not null,
  make text not null,
  model text not null,
  year int not null check (year between 1950 and 2100),
  fuel text not null check (fuel in ('benzina','diesel','ibrido','elettrico','gpl','metano')),
  displacement int not null default 0,
  category text not null check (category in ('city','compact','sedan','suv','premium')),
  nickname text,
  was_plate_lookup boolean not null default false,
  created_at timestamptz not null default now()
);
create index cars_owner_idx on public.cars(owner_id);
create unique index cars_owner_plate_uq on public.cars(owner_id, upper(plate));

-- -------------------------------------------------------------
-- CONVERSATIONS
-- -------------------------------------------------------------
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  last_message_preview text,
  last_message_at timestamptz,
  customer_unread int not null default 0,
  workshop_unread int not null default 0,
  created_at timestamptz not null default now(),
  unique (customer_id, workshop_id)
);
create index conversations_customer_idx on public.conversations(customer_id);
create index conversations_workshop_idx on public.conversations(workshop_id);

-- -------------------------------------------------------------
-- MESSAGES
-- -------------------------------------------------------------
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'text' check (kind in ('text','image','video','quote','system')),
  text text,
  media_url text,
  media_width int,
  media_height int,
  quote_id uuid,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages(conversation_id, created_at);

-- -------------------------------------------------------------
-- QUOTES (preventivi)
-- -------------------------------------------------------------
create table public.quotes (
  id uuid primary key default uuid_generate_v4(),
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  title text not null,
  notes text,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  commission_fee_pct numeric(4,3) not null default 0.020,
  commission_fee numeric(10,2) not null check (commission_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','paid','expired','refunded')),
  valid_until timestamptz not null,
  accepted_at timestamptz,
  paid_at timestamptz,
  payment_ref text,
  stripe_payment_intent text,
  stripe_transfer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quotes_customer_idx on public.quotes(customer_id);
create index quotes_workshop_idx on public.quotes(workshop_id);
create index quotes_conversation_idx on public.quotes(conversation_id);
create index quotes_status_idx on public.quotes(status);

-- Link messages.quote_id to quotes.id (added after both tables exist)
alter table public.messages
  add constraint messages_quote_fk
  foreign key (quote_id) references public.quotes(id) on delete set null;

-- -------------------------------------------------------------
-- QUOTE ITEMS
-- -------------------------------------------------------------
create table public.quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  position int not null default 0
);
create index quote_items_quote_idx on public.quote_items(quote_id);

-- -------------------------------------------------------------
-- BOOKINGS
-- -------------------------------------------------------------
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  car_id uuid references public.cars(id) on delete set null,
  service_key text not null,
  estimated_price numeric(10,2),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','completed','cancelled')),
  message text,
  scheduled_at timestamptz,
  quote_id uuid references public.quotes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_customer_idx on public.bookings(customer_id);
create index bookings_workshop_idx on public.bookings(workshop_id);
create index bookings_status_idx on public.bookings(status);

-- -------------------------------------------------------------
-- REVIEWS
-- -------------------------------------------------------------
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index reviews_workshop_idx on public.reviews(workshop_id);
create index reviews_customer_idx on public.reviews(customer_id);

-- -------------------------------------------------------------
-- NOTIFICATIONS
-- -------------------------------------------------------------
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  related_id uuid,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- -------------------------------------------------------------
-- FAVORITES
-- -------------------------------------------------------------
create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, workshop_id)
);

-- -------------------------------------------------------------
-- PLATE LOOKUPS (rate-limit + cost tracking + audit)
-- -------------------------------------------------------------
create table public.plate_lookups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plate text not null,
  result jsonb,
  provider text,
  cost_cents int,
  created_at timestamptz not null default now()
);
create index plate_lookups_user_idx on public.plate_lookups(user_id, created_at desc);

-- -------------------------------------------------------------
-- INVITE CODES (for professional registration)
-- -------------------------------------------------------------
create table public.invite_codes (
  code text primary key,
  workshop_id uuid references public.workshops(id) on delete set null,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- -------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger workshops_set_updated_at before update on public.workshops
  for each row execute function public.tg_set_updated_at();
create trigger workshop_services_set_updated_at before update on public.workshop_services
  for each row execute function public.tg_set_updated_at();
create trigger quotes_set_updated_at before update on public.quotes
  for each row execute function public.tg_set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.tg_set_updated_at();

-- -------------------------------------------------------------
-- PROFILE AUTO-CREATION ON SIGNUP
-- (Auth user gets a matching public.profiles row automatically)
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- HELPER VIEWS
-- -------------------------------------------------------------
create or replace view public.v_workshop_stats as
select
  w.id as workshop_id,
  coalesce(avg(r.rating), 0)::numeric(2,1) as avg_rating,
  count(r.id) as reviews_count,
  count(distinct b.id) filter (where b.status = 'completed') as completed_bookings,
  count(distinct b.id) filter (where b.status = 'pending') as pending_bookings
from public.workshops w
left join public.reviews r on r.workshop_id = w.id
left join public.bookings b on b.workshop_id = w.id
group by w.id;
