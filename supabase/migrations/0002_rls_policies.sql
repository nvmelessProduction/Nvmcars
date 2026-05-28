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
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

create policy profiles_select_workshop_owner_basic on public.profiles
  for select using (true);  -- public read of name/avatar; sensitive fields are not in shared queries

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid());

-- Insert handled by trigger handle_new_user(), but allow self-insert as fallback
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

-- -------------------------------------------------------------
-- WORKSHOPS (public read; owner can update)
-- -------------------------------------------------------------
create policy workshops_select_public on public.workshops
  for select using (active = true);

create policy workshops_update_owner on public.workshops
  for update using (owner_id = auth.uid());

create policy workshops_insert_owner on public.workshops
  for insert with check (owner_id = auth.uid());

-- -------------------------------------------------------------
-- WORKSHOP SERVICES (public read; owner write)
-- -------------------------------------------------------------
create policy workshop_services_select_public on public.workshop_services
  for select using (true);

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
create policy cars_owner_all on public.cars
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- -------------------------------------------------------------
-- CONVERSATIONS (customer or workshop owner)
-- -------------------------------------------------------------
create policy conversations_participants on public.conversations
  for select using (
    customer_id = auth.uid()
    or exists (
      select 1 from public.workshops w
      where w.id = conversations.workshop_id and w.owner_id = auth.uid()
    )
  );

create policy conversations_customer_insert on public.conversations
  for insert with check (customer_id = auth.uid());

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
create policy quotes_participants_select on public.quotes
  for select using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = quotes.workshop_id and w.owner_id = auth.uid())
  );

create policy quotes_workshop_insert on public.quotes
  for insert with check (
    exists (select 1 from public.workshops w where w.id = workshop_id and w.owner_id = auth.uid())
  );

create policy quotes_participants_update on public.quotes
  for update using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = quotes.workshop_id and w.owner_id = auth.uid())
  );

-- -------------------------------------------------------------
-- QUOTE ITEMS (via quote parent)
-- -------------------------------------------------------------
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
create policy bookings_participants_select on public.bookings
  for select using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = bookings.workshop_id and w.owner_id = auth.uid())
  );

create policy bookings_customer_insert on public.bookings
  for insert with check (customer_id = auth.uid());

create policy bookings_participants_update on public.bookings
  for update using (
    customer_id = auth.uid()
    or exists (select 1 from public.workshops w where w.id = bookings.workshop_id and w.owner_id = auth.uid())
  );

-- -------------------------------------------------------------
-- REVIEWS (anyone can read, customer can write)
-- -------------------------------------------------------------
create policy reviews_select_public on public.reviews
  for select using (true);

create policy reviews_customer_insert on public.reviews
  for insert with check (customer_id = auth.uid());

create policy reviews_customer_update on public.reviews
  for update using (customer_id = auth.uid());

create policy reviews_customer_delete on public.reviews
  for delete using (customer_id = auth.uid());

-- -------------------------------------------------------------
-- NOTIFICATIONS (only owner)
-- -------------------------------------------------------------
create policy notifications_owner_all on public.notifications
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -------------------------------------------------------------
-- FAVORITES (only owner)
-- -------------------------------------------------------------
create policy favorites_owner_all on public.favorites
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- -------------------------------------------------------------
-- PLATE LOOKUPS (only owner, READ-ONLY at app level)
-- Writes happen ONLY through Edge Function with service-role key.
-- -------------------------------------------------------------
create policy plate_lookups_owner_select on public.plate_lookups
  for select using (user_id = auth.uid());

-- -------------------------------------------------------------
-- INVITE CODES (read-only; writes through Edge Functions/admin)
-- -------------------------------------------------------------
create policy invite_codes_select_public on public.invite_codes
  for select using (true);
