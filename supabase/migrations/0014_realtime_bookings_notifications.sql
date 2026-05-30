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
