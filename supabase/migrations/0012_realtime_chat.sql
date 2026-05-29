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
