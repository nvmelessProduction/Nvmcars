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
create policy workshop_vacations_select_public on public.workshop_vacations
  for select using (true);

-- Solo il pro proprietario può modificare le sue ferie
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
create policy service_price_overrides_select_public on public.service_price_overrides
  for select using (true);

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
create policy service_log_select_owner on public.service_log_entries
  for select using (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.owner_id = auth.uid()
    )
  );

-- Anche l'officina che ha eseguito il servizio può vedere/inserire l'entry
create policy service_log_select_workshop on public.service_log_entries
  for select using (
    workshop_id is not null and exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.owner_id = auth.uid()
    )
  );

-- Inserimento: dal trigger (security definer) o dall'officina dopo lavorazione
create policy service_log_insert_workshop on public.service_log_entries
  for insert with check (
    workshop_id is null or exists (
      select 1 from public.workshops w
      where w.id = workshop_id and w.owner_id = auth.uid()
    )
  );

-- Il cliente può eliminare voci del suo libretto
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
create policy car_reminders_select_owner on public.car_reminders
  for select using (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.owner_id = auth.uid()
    )
  );

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
create policy workshops_select_public on public.workshops
  for select using (status in ('active', 'paused'));
-- Nota: paused è visibile (con banner UI), draft no.
