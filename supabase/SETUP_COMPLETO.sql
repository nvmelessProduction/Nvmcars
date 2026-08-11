-- =============================================================================
-- Nvmcars — SETUP COMPLETO DEL DATABASE
--
-- COSA FARE:
--   1. Apri il tuo progetto su https://supabase.com
--   2. Sidebar sinistra -> SQL Editor -> New query
--   3. Incolla TUTTO questo file
--   4. Premi Run (in basso a destra)
--
-- Ci mette ~10 secondi. Alla fine deve dire "Success".
--
-- Questo file unisce le 14 migrazioni in supabase/migrations/ nell'ordine
-- corretto. E' RI-ESEGUIBILE: se lo lanci due volte non da' errore, quindi se
-- qualcosa va storto a meta' puoi semplicemente rilanciarlo.
--
-- NON modificare a mano: e' generato da scripts/gen-setup-sql.js
-- Generato il: 2026-08-11
-- =============================================================================


-- =============================================================================
-- 0001_initial_schema.sql
-- =============================================================================

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


-- =============================================================================
-- 0002_rls_policies.sql
-- =============================================================================

-- =============================================================
-- Nvmcars — Row Level Security policies
-- Paste this AFTER 0001_initial_schema.sql in the Supabase SQL Editor.
-- =============================================================

-- Enable RLS on all tables
alter table public.profiles            enable row level security;
alter table public.workshops           enable row level security;
alter table public.workshop_services   enable row level security;
alter table public.cars                enable row level security;
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.quotes              enable row level security;
alter table public.quote_items         enable row level security;
alter table public.bookings            enable row level security;
alter table public.reviews             enable row level security;
alter table public.notifications       enable row level security;
alter table public.favorites           enable row level security;
alter table public.plate_lookups       enable row level security;
alter table public.invite_codes        enable row level security;

-- -------------------------------------------------------------
-- PROFILES
-- -------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_select_workshop_owner_basic on public.profiles;
create policy profiles_select_workshop_owner_basic on public.profiles
  for select using (true);  -- public read of name/avatar; sensitive fields are not in shared queries

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid());

-- Insert handled by trigger handle_new_user(), but allow self-insert as fallback
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

-- -------------------------------------------------------------
-- WORKSHOPS (public read; owner can update)
-- -------------------------------------------------------------
drop policy if exists workshops_select_public on public.workshops;
create policy workshops_select_public on public.workshops
  for select using (active = true);

drop policy if exists workshops_update_owner on public.workshops;
create policy workshops_update_owner on public.workshops
  for update using (owner_id = auth.uid());

drop policy if exists workshops_insert_owner on public.workshops;
create policy workshops_insert_owner on public.workshops
  for insert with check (owner_id = auth.uid());

-- -------------------------------------------------------------
-- WORKSHOP SERVICES (public read; owner write)
-- -------------------------------------------------------------
drop policy if exists workshop_services_select_public on public.workshop_services;
create policy workshop_services_select_public on public.workshop_services
  for select using (true);

drop policy if exists workshop_services_write_owner on public.workshop_services;
create policy workshop_services_write_owner on public.workshop_services
  for all using (
    exists (
      select 1 from public.workshops w
      where w.id = workshop_services.workshop_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workshops w
      where w.id = workshop_services.workshop_id and w.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- CARS (only owner)
-- -------------------------------------------------------------
drop policy if exists cars_owner_all on public.cars;
create policy cars_owner_all on public.cars
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- -------------------------------------------------------------
-- CONVERSATIONS (customer or workshop owner)
-- -------------------------------------------------------------
drop policy if exists conversations_participants on public.conversations;
create policy conversations_participants on public.conversations
  for select using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.workshops w
      where w.id = conversations.workshop_id and w.owner_id = auth.uid()
    )
  );

drop policy if exists conversations_customer_insert on public.conversations;
create policy conversations_customer_insert on public.conversations
  for insert with check (customer_id = auth.uid());

drop policy if exists conversations_participants_update on public.conversations;
create policy conversations_participants_update on public.conversations
  for update using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.workshops w
      where w.id = conversations.workshop_id and w.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- MESSAGES (participants of conversation only)
-- -------------------------------------------------------------
drop policy if exists messages_participants_select on public.messages;
create policy messages_participants_select on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (
          c.customer_id = auth.uid()
          or exists (select 1 from public.workshops w where w.id = c.workshop_id and w.owner_id = auth.uid())
        )
    )
  );

drop policy if exists messages_participants_insert on public.messages;
create policy messages_participants_insert on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          c.customer_id = auth.uid()
          or exists (select 1 from public.workshops w where w.id = c.workshop_id and w.owner_id = auth.uid())
        )
    )
  );

-- -------------------------------------------------------------
-- QUOTES (customer or workshop owner)
-- -------------------------------------------------------------
drop policy if exists quotes_participants_select on public.quotes;
create policy quotes_participants_select on public.quotes
  for select using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = quotes.workshop_id and w.owner_id = auth.uid())
  );

drop policy if exists quotes_workshop_insert on public.quotes;
create policy quotes_workshop_insert on public.quotes
  for insert with check (
    exists (select 1 from public.workshops w where w.id = workshop_id and w.owner_id = auth.uid())
  );

drop policy if exists quotes_participants_update on public.quotes;
create policy quotes_participants_update on public.quotes
  for update using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = quotes.workshop_id and w.owner_id = auth.uid())
  );

-- -------------------------------------------------------------
-- QUOTE ITEMS (via quote parent)
-- -------------------------------------------------------------
drop policy if exists quote_items_participants_select on public.quote_items;
create policy quote_items_participants_select on public.quote_items
  for select using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_items.quote_id
        and (
          q.customer_id = auth.uid()
          or exists (select 1 from public.workshops w where w.id = q.workshop_id and w.owner_id = auth.uid())
        )
    )
  );

drop policy if exists quote_items_workshop_write on public.quote_items;
create policy quote_items_workshop_write on public.quote_items
  for all using (
    exists (
      select 1 from public.quotes q
      join public.workshops w on w.id = q.workshop_id
      where q.id = quote_items.quote_id and w.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- BOOKINGS (customer + workshop owner)
-- -------------------------------------------------------------
drop policy if exists bookings_participants_select on public.bookings;
create policy bookings_participants_select on public.bookings
  for select using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = bookings.workshop_id and w.owner_id = auth.uid())
  );

drop policy if exists bookings_customer_insert on public.bookings;
create policy bookings_customer_insert on public.bookings
  for insert with check (customer_id = auth.uid());

drop policy if exists bookings_participants_update on public.bookings;
create policy bookings_participants_update on public.bookings
  for update using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = bookings.workshop_id and w.owner_id = auth.uid())
  );

-- -------------------------------------------------------------
-- REVIEWS (anyone can read, customer can write)
-- -------------------------------------------------------------
drop policy if exists reviews_select_public on public.reviews;
create policy reviews_select_public on public.reviews
  for select using (true);

drop policy if exists reviews_customer_insert on public.reviews;
create policy reviews_customer_insert on public.reviews
  for insert with check (customer_id = auth.uid());

drop policy if exists reviews_customer_update on public.reviews;
create policy reviews_customer_update on public.reviews
  for update using (customer_id = auth.uid());

drop policy if exists reviews_customer_delete on public.reviews;
create policy reviews_customer_delete on public.reviews
  for delete using (customer_id = auth.uid());

-- -------------------------------------------------------------
-- NOTIFICATIONS (only owner)
-- -------------------------------------------------------------
drop policy if exists notifications_owner_all on public.notifications;
create policy notifications_owner_all on public.notifications
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -------------------------------------------------------------
-- FAVORITES (only owner)
-- -------------------------------------------------------------
drop policy if exists favorites_owner_all on public.favorites;
create policy favorites_owner_all on public.favorites
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -------------------------------------------------------------
-- PLATE LOOKUPS (only owner, READ-ONLY at app level)
-- Writes happen ONLY through Edge Function with service-role key.
-- -------------------------------------------------------------
drop policy if exists plate_lookups_owner_select on public.plate_lookups;
create policy plate_lookups_owner_select on public.plate_lookups
  for select using (user_id = auth.uid());

-- -------------------------------------------------------------
-- INVITE CODES (read-only; writes through Edge Functions/admin)
-- -------------------------------------------------------------
drop policy if exists invite_codes_select_public on public.invite_codes;
create policy invite_codes_select_public on public.invite_codes
  for select using (true);


-- =============================================================================
-- 0003_storage_buckets.sql
-- =============================================================================

-- =============================================================
-- Nvmcars — Storage buckets + policies
-- Paste AFTER 0001+0002 in the Supabase SQL Editor.
-- =============================================================

-- chat-media: photos and videos sent in chat (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-media',
  'chat-media',
  false,
  52428800, -- 50 MB cap
  array['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime']
) on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- workshop-photos: public photos for workshop profile
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workshop-photos',
  'workshop-photos',
  true,
  10485760, -- 10 MB cap
  array['image/jpeg','image/png','image/webp']
) on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- avatars: public small avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB cap
  array['image/jpeg','image/png','image/webp']
) on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- -------------------------------------------------------------
-- chat-media: only conversation participants can read/write
-- Object path convention: {conversation_id}/{message_id}.{ext}
-- -------------------------------------------------------------
drop policy if exists chat_media_participants_read on storage.objects;
create policy chat_media_participants_read on storage.objects
  for select using (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.conversations c
      where c.id::text = split_part(name, '/', 1)
        and (
          c.customer_id = auth.uid()
          or exists (select 1 from public.workshops w where w.id = c.workshop_id and w.owner_id = auth.uid())
        )
    )
  );

drop policy if exists chat_media_participants_write on storage.objects;
create policy chat_media_participants_write on storage.objects
  for insert with check (
    bucket_id = 'chat-media'
    and exists (
      select 1 from public.conversations c
      where c.id::text = split_part(name, '/', 1)
        and (
          c.customer_id = auth.uid()
          or exists (select 1 from public.workshops w where w.id = c.workshop_id and w.owner_id = auth.uid())
        )
    )
  );

-- -------------------------------------------------------------
-- workshop-photos: public read, owner write
-- Path: {workshop_id}/{filename}
-- -------------------------------------------------------------
drop policy if exists workshop_photos_public_read on storage.objects;
create policy workshop_photos_public_read on storage.objects
  for select using (bucket_id = 'workshop-photos');

drop policy if exists workshop_photos_owner_write on storage.objects;
create policy workshop_photos_owner_write on storage.objects
  for insert with check (
    bucket_id = 'workshop-photos'
    and exists (
      select 1 from public.workshops w
      where w.id::text = split_part(name, '/', 1) and w.owner_id = auth.uid()
    )
  );

drop policy if exists workshop_photos_owner_delete on storage.objects;
create policy workshop_photos_owner_delete on storage.objects
  for delete using (
    bucket_id = 'workshop-photos'
    and exists (
      select 1 from public.workshops w
      where w.id::text = split_part(name, '/', 1) and w.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- avatars: public read, self write (path = {user_id}/...)
-- -------------------------------------------------------------
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_self_write on storage.objects;
create policy avatars_self_write on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists avatars_self_update on storage.objects;
create policy avatars_self_update on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );

drop policy if exists avatars_self_delete on storage.objects;
create policy avatars_self_delete on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );


-- =============================================================================
-- 0004_round3_extensions.sql
-- =============================================================================

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


-- =============================================================================
-- 0005_round3_rls.sql
-- =============================================================================

-- =============================================================
-- Nvmcars — Round 3 RLS policies (per le tabelle aggiunte in 0004)
-- Da eseguire DOPO 0004_round3_extensions.sql
-- =============================================================

alter table public.workshop_vacations       enable row level security;
alter table public.service_price_overrides  enable row level security;
alter table public.service_log_entries      enable row level security;
alter table public.car_reminders            enable row level security;

-- -------------------------------------------------------------
-- WORKSHOP_VACATIONS
-- -------------------------------------------------------------
-- Lettura pubblica (clienti devono sapere quando l'officina è chiusa)
drop policy if exists workshop_vacations_select_public on public.workshop_vacations;
create policy workshop_vacations_select_public on public.workshop_vacations
  for select using (true);

-- Solo il pro proprietario può modificare le sue ferie
drop policy if exists workshop_vacations_write_owner on public.workshop_vacations;
create policy workshop_vacations_write_owner on public.workshop_vacations
  for all using (
    exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- SERVICE_PRICE_OVERRIDES
-- -------------------------------------------------------------
-- Lettura pubblica (clienti vedono i prezzi personalizzati)
drop policy if exists service_price_overrides_select_public on public.service_price_overrides;
create policy service_price_overrides_select_public on public.service_price_overrides
  for select using (true);

drop policy if exists service_price_overrides_write_owner on public.service_price_overrides;
create policy service_price_overrides_write_owner on public.service_price_overrides
  for all using (
    exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- SERVICE_LOG_ENTRIES (libretto auto cliente)
-- -------------------------------------------------------------
-- Il cliente vede solo i propri (entries linkati alle proprie auto)
drop policy if exists service_log_select_owner on public.service_log_entries;
create policy service_log_select_owner on public.service_log_entries
  for select using (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.owner_id = auth.uid()
    )
  );

-- Anche l'officina che ha eseguito il servizio può vedere/inserire l'entry
drop policy if exists service_log_select_workshop on public.service_log_entries;
create policy service_log_select_workshop on public.service_log_entries
  for select using (
    workshop_id is not null and exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.owner_id = auth.uid()
    )
  );

-- Inserimento: dal trigger (security definer) o dall'officina dopo lavorazione
drop policy if exists service_log_insert_workshop on public.service_log_entries;
create policy service_log_insert_workshop on public.service_log_entries
  for insert with check (
    workshop_id is null or exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.owner_id = auth.uid()
    )
  );

-- Il cliente può eliminare voci del suo libretto
drop policy if exists service_log_delete_owner on public.service_log_entries;
create policy service_log_delete_owner on public.service_log_entries
  for delete using (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- CAR_REMINDERS
-- -------------------------------------------------------------
drop policy if exists car_reminders_select_owner on public.car_reminders;
create policy car_reminders_select_owner on public.car_reminders
  for select using (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists car_reminders_write_owner on public.car_reminders;
create policy car_reminders_write_owner on public.car_reminders
  for all using (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- AGGIORNA POLICY WORKSHOPS: visibilità solo se attiva
-- -------------------------------------------------------------
-- (sostituisce la policy 0002 che usava `active`)
drop policy if exists workshops_select_public on public.workshops;
drop policy if exists workshops_select_public on public.workshops;
create policy workshops_select_public on public.workshops
  for select using (status in ('active', 'paused'));
-- Nota: paused è visibile (con banner UI), draft no.


-- =============================================================================
-- 0006_seed_invite_codes.sql
-- =============================================================================

-- =============================================================
-- Nvmcars — Seed invite codes for pro registration testing
-- Esegui nel SQL Editor di Supabase.
--
-- Crea 20 codici invito attivi per 1 anno, niente workshop_id
-- preassegnato (il workshop viene creato draft alla registrazione).
-- =============================================================

insert into public.invite_codes (code, expires_at) values
  -- Cerveteri / Ladispoli (mock storici per retro-compat)
  ('NVM-CRV-A4F9',  now() + interval '1 year'),
  ('NVM-CRV-B72X',  now() + interval '1 year'),
  ('NVM-CRV-C81K',  now() + interval '1 year'),
  ('NVM-LAD-D33M',  now() + interval '1 year'),
  ('NVM-LAD-E55Q',  now() + interval '1 year'),
  ('NVM-LAD-F09P',  now() + interval '1 year'),
  -- Roma
  ('NVM-RM-2026A',  now() + interval '1 year'),
  ('NVM-RM-2026B',  now() + interval '1 year'),
  ('NVM-RM-2026C',  now() + interval '1 year'),
  ('NVM-RM-2026D',  now() + interval '1 year'),
  -- Milano
  ('NVM-MI-2026A',  now() + interval '1 year'),
  ('NVM-MI-2026B',  now() + interval '1 year'),
  ('NVM-MI-2026C',  now() + interval '1 year'),
  -- Napoli
  ('NVM-NA-2026A',  now() + interval '1 year'),
  ('NVM-NA-2026B',  now() + interval '1 year'),
  -- Torino
  ('NVM-TO-2026A',  now() + interval '1 year'),
  ('NVM-TO-2026B',  now() + interval '1 year'),
  -- Test "free for all"
  ('NVMTEST001',    now() + interval '1 year'),
  ('NVMTEST002',    now() + interval '1 year'),
  ('NVMTEST003',    now() + interval '1 year')
on conflict (code) do nothing;
-- NB: usavamo `do update set used_by = null` che resettava i codici usati
-- a ogni replay della migration. Bug critico in prod, corretto con `do nothing`.

-- Verifica:
select code, used_by, expires_at from public.invite_codes order by code;


-- =============================================================================
-- 0007_subscriptions_dac7.sql
-- =============================================================================

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
drop policy if exists subscriptions_owner_select on public.subscriptions;
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


-- =============================================================================
-- 0008_rls_hardening.sql
-- =============================================================================

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
drop policy if exists profiles_select_counterparty_via_conversation on public.profiles;
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


-- =============================================================================
-- 0009_diy_autodoc.sql
-- =============================================================================

-- =============================================================
-- Nvmcars — DIY Garage + Autodoc parts integration
-- Da eseguire DOPO 0008_rls_hardening.sql
-- =============================================================

-- -------------------------------------------------------------
-- DIY GUIDES (manuale fai-da-te)
-- -------------------------------------------------------------
create table if not exists public.diy_guides (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  category text not null check (category in (
    'motore','freni','sospensioni','elettrico','carrozzeria','filtri','liquidi','pneumatici','altro'
  )),
  difficulty text not null check (difficulty in ('facile','medio','difficile')),
  duration_min int not null,
  cover_image_url text,
  intro text not null,
  content_markdown text not null,
  video_url text,
  parts_list jsonb not null default '[]'::jsonb, -- [{name, autodocQuery, qty}]
  tools_list jsonb not null default '[]'::jsonb, -- [{name, avgPriceEur}]
  warnings text,
  is_premium boolean not null default true,
  reviewer_workshop_id uuid references public.workshops(id) on delete set null,
  reviewed_at timestamptz,
  published boolean not null default false,
  view_count int not null default 0,
  helpful_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diy_guides_category_idx on public.diy_guides(category, published);
create index if not exists diy_guides_published_idx on public.diy_guides(published, created_at desc);

create trigger diy_guides_set_updated_at before update on public.diy_guides
  for each row execute function public.tg_set_updated_at();

alter table public.diy_guides enable row level security;

-- Lettura: guide pubblicate visibili a tutti (preview).
-- Il "premium gate" è fatto lato client + edge function get-diy-content per il body completo.
drop policy if exists diy_guides_select_published on public.diy_guides;
create policy diy_guides_select_published on public.diy_guides
  for select using (published = true);

-- Scrittura: solo service_role (le guide le crei tu, non i pro)

-- -------------------------------------------------------------
-- DIY GUIDE FEEDBACK (utenti votano "utile" / segnalano errori)
-- -------------------------------------------------------------
create table if not exists public.diy_guide_feedback (
  id uuid primary key default uuid_generate_v4(),
  guide_id uuid not null references public.diy_guides(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  helpful boolean not null,
  note text,
  created_at timestamptz not null default now(),
  unique (guide_id, user_id)
);

alter table public.diy_guide_feedback enable row level security;

drop policy if exists diy_feedback_select_own on public.diy_guide_feedback;
create policy diy_feedback_select_own on public.diy_guide_feedback
  for select using (user_id = auth.uid());

drop policy if exists diy_feedback_insert_own on public.diy_guide_feedback;
create policy diy_feedback_insert_own on public.diy_guide_feedback
  for insert with check (user_id = auth.uid());

drop policy if exists diy_feedback_update_own on public.diy_guide_feedback;
create policy diy_feedback_update_own on public.diy_guide_feedback
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- -------------------------------------------------------------
-- QUOTE_ITEMS: aggiungi link Autodoc per ogni voce
-- (l'officina può taggare "questo pezzo lo prendo da Autodoc")
-- -------------------------------------------------------------
alter table public.quote_items
  add column if not exists autodoc_product jsonb;   -- {productId, brand, name, priceCents, url}

-- -------------------------------------------------------------
-- AUTODOC AFFILIATE CLICKS (audit per debugging commissioni)
-- -------------------------------------------------------------
create table if not exists public.autodoc_clicks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  context text not null check (context in ('quote','diy_guide','search','workshop_detail')),
  context_id uuid,
  product_id text,
  click_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists autodoc_clicks_user_idx on public.autodoc_clicks(user_id, created_at desc);

alter table public.autodoc_clicks enable row level security;

drop policy if exists autodoc_clicks_select_own on public.autodoc_clicks;
create policy autodoc_clicks_select_own on public.autodoc_clicks
  for select using (user_id = auth.uid());

drop policy if exists autodoc_clicks_insert_self on public.autodoc_clicks;
create policy autodoc_clicks_insert_self on public.autodoc_clicks
  for insert with check (user_id = auth.uid() or user_id is null);

-- -------------------------------------------------------------
-- SEED: 3 guide DIY base (free) per test
-- -------------------------------------------------------------
insert into public.diy_guides (slug, title, category, difficulty, duration_min, intro, content_markdown, parts_list, tools_list, is_premium, published)
values
  (
    'cambio-tergicristalli',
    'Cambio spazzole tergicristalli',
    'carrozzeria',
    'facile',
    10,
    'In 10 minuti puoi cambiare le spazzole dei tergicristalli senza andare in officina. Risparmi 20-30€.',
    E'# Materiali\n\nVerifica la misura corretta delle spazzole sul libretto auto.\n\n# Procedura\n\n1. Solleva il braccio del tergicristallo.\n2. Premi la linguetta sotto la spazzola.\n3. Sfila la spazzola vecchia.\n4. Inserisci quella nuova fino allo scatto.\n5. Ripeti per l''altro lato.\n\n# Verifica\n\nAccendi i tergicristalli a velocità lenta su parabrezza bagnato. Controlla che puliscano uniforme senza rumore.',
    '[{"name":"Spazzole tergicristallo (misura auto-specifica)","autodocQuery":"spazzole tergicristallo","qty":2}]'::jsonb,
    '[]'::jsonb,
    false,
    true
  ),
  (
    'cambio-filtro-aria',
    'Sostituzione filtro aria motore',
    'filtri',
    'facile',
    15,
    'Un filtro aria pulito = più potenza e meno consumi. Ogni 15.000-20.000 km va sostituito.',
    E'# Sicurezza\n\nMotore freddo. Auto spenta.\n\n# Procedura\n\n1. Apri il cofano.\n2. Trova la scatola del filtro aria (rettangolare, vicino al motore).\n3. Sgancia le clip (di solito 4).\n4. Solleva il coperchio.\n5. Rimuovi il filtro vecchio.\n6. Pulisci la sede con un panno.\n7. Inserisci il nuovo nel verso giusto (freccia indica il flusso).\n8. Richiudi le clip.\n\n# Quando NON farlo da soli\n\nSe la scatola filtro è sigillata o richiede smontaggio di parti motore.',
    '[{"name":"Filtro aria motore (modello specifico)","autodocQuery":"filtro aria","qty":1}]'::jsonb,
    '[]'::jsonb,
    false,
    true
  ),
  (
    'cambio-lampadina-fanale',
    'Sostituzione lampadina fanale anteriore',
    'elettrico',
    'facile',
    15,
    'Cambiare una lampadina H7/H1 di solito si fa in 15 minuti. Multa evitata e visibilità nuova.',
    E'# Materiali\n\nLampadina della stessa sigla (H1, H4, H7, ecc.). Controlla il libretto.\n\n# Procedura\n\n1. Apri il cofano, identifica il blocco fanale.\n2. Rimuovi il tappo posteriore (gomma o plastica).\n3. Scollega il connettore elettrico.\n4. Sgancia la molletta.\n5. Estrai la lampadina.\n6. Inserisci la nuova SENZA toccare il bulbo con le dita (residui di grasso = rottura precoce).\n7. Riaggancia molletta, connettore, tappo.\n\n# Test\n\nAccendi gli abbaglianti e verifica.',
    '[{"name":"Lampadina (H1/H4/H7/H11 da verificare)","autodocQuery":"lampadina fanale","qty":1}]'::jsonb,
    '[]'::jsonb,
    false,
    true
  )
on conflict (slug) do nothing;


-- =============================================================================
-- 0010_boost_referral.sql
-- =============================================================================

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

drop policy if exists workshop_boosts_select_public on public.workshop_boosts;
create policy workshop_boosts_select_public on public.workshop_boosts
  for select using (status = 'active' and end_at > now());

drop policy if exists workshop_boosts_select_owner on public.workshop_boosts;
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
drop policy if exists referral_codes_select_owner on public.referral_codes;
create policy referral_codes_select_owner on public.referral_codes
  for select using (owner_user_id = auth.uid());

drop policy if exists referral_codes_insert_self on public.referral_codes;
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

drop policy if exists referral_redemptions_select_party on public.referral_redemptions;
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


-- =============================================================================
-- 0011_security_audit_round2.sql
-- =============================================================================

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


-- =============================================================================
-- 0012_realtime_chat.sql
-- =============================================================================

-- ============================================================================
-- 0012 — Realtime per la chat
-- ----------------------------------------------------------------------------
-- Senza questo, le sottoscrizioni `postgres_changes` del client (vedi
-- src/services/chat.ts → subscribeToMessages) non ricevono MAI gli eventi:
-- la tabella `messages` non era inclusa nella publication `supabase_realtime`.
-- Risultato: i messaggi non si sincronizzano tra dispositivi diversi
-- (l'altro utente li vede solo riaprendo la chat, che ricarica via SELECT).
--
-- Includiamo anche `conversations` così la lista chat può aggiornare in tempo
-- reale ultimo messaggio e contatori non letti.
--
-- La SELECT-RLS necessaria al realtime esiste già:
--   messages_participants_select / conversations_participants (0002).
-- Realtime rispetta la RLS, quindi gli eventi arrivano solo ai partecipanti.
-- ============================================================================

-- La publication di default di Supabase. La creiamo solo se manca (es. DB
-- non-Supabase usato in test).
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- REPLICA IDENTITY FULL: le sottoscrizioni usano un filtro su conversation_id;
-- garantisce che la colonna del filtro sia presente nel payload di replica
-- anche per UPDATE/DELETE.
alter table public.messages replica identity full;
alter table public.conversations replica identity full;

-- Aggiunge le tabelle alla publication (idempotente).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end $$;


-- =============================================================================
-- 0013_chat_triggers.sql
-- =============================================================================

-- ============================================================================
-- 0013 — Trigger chat: metadati conversazione server-authoritative
-- ----------------------------------------------------------------------------
-- A ogni nuovo messaggio aggiorna in modo ATOMICO la conversazione:
--   - last_message_preview / last_message_at
--   - incrementa il contatore non-letti del DESTINATARIO
-- Prima questo veniva fatto lato client (best-effort, non atomico, race su
-- invii concorrenti). Ora è autorevole nel DB; il client tiene solo un
-- aggiornamento ottimistico che viene riconciliato a ogni hydrate/realtime.
--
-- SECURITY DEFINER: il trigger gira con i privilegi del proprietario, così
-- l'update passa anche se la RLS dell'utente non coprisse i contatori.
-- ============================================================================

create or replace function public.tg_messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer uuid;
  v_preview  text;
begin
  select customer_id into v_customer
  from public.conversations
  where id = new.conversation_id;

  v_preview := case new.kind
    when 'image' then '📷 Foto'
    when 'video' then '🎬 Video'
    when 'quote' then '💶 Preventivo'
    when 'system' then coalesce(new.text, 'Aggiornamento')
    else coalesce(new.text, '')
  end;

  update public.conversations
  set last_message_preview = v_preview,
      last_message_at      = new.created_at,
      customer_unread      = customer_unread + case when new.sender_id = v_customer then 0 else 1 end,
      workshop_unread      = workshop_unread + case when new.sender_id = v_customer then 1 else 0 end
  where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert
  after insert on public.messages
  for each row execute function public.tg_messages_after_insert();


-- =============================================================================
-- 0014_realtime_bookings_notifications.sql
-- =============================================================================

-- ============================================================================
-- 0014 — Realtime per bookings e notifications
-- ----------------------------------------------------------------------------
-- src/services/bookings.ts (subscribeToBookings) e
-- src/services/notifications.ts (subscribeToNotifications) si sottoscrivono a
-- postgres_changes su queste tabelle, ma 0012 aveva aggiunto alla publication
-- solo messages/conversations. Senza queste righe gli aggiornamenti live di
-- stato prenotazione e le notifiche non arrivano mai (serve un reload).
--
-- REPLICA IDENTITY FULL: le sottoscrizioni filtrano su customer_id/workshop_id
-- (bookings) e user_id (notifications); garantisce che le colonne del filtro
-- siano nel payload anche per UPDATE/DELETE. La RLS di SELECT esistente limita
-- comunque la consegna ai soli aventi diritto.
-- ============================================================================

alter table public.bookings replica identity full;
alter table public.notifications replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;


-- =============================================================================
-- VERIFICA: esegui questa query dopo il setup.
-- Deve restituire una riga per ogni tabella creata (una ventina circa).
-- =============================================================================
-- select table_name from information_schema.tables
--   where table_schema = 'public' order by table_name;
