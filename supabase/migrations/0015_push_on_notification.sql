-- ============================================================================
-- 0015 — Push automatica all'inserimento di una notifica
-- ----------------------------------------------------------------------------
-- Finora `send-push` esisteva ma NESSUNO la chiamava: i token venivano salvati
-- ma nessun push partiva mai quando l'app era chiusa/in background. Qui:
--   1. aggiungiamo la colonna `related_kind` alla tabella notifications
--      (il client la legge/scrive già — vedi src/services/notifications.ts —
--       ma 0001 non l'aveva creata: gli INSERT con related_kind fallivano);
--   2. creiamo un trigger AFTER INSERT che chiama l'edge function `send-push`
--      via pg_net, in modo server-authoritative.
--
-- Richiede l'estensione pg_net (Database → Extensions → pg_net → Enable) e,
-- per autenticare la chiamata, due secret salvati in Vault:
--   - 'project_url'        es. https://xxxx.supabase.co
--   - 'service_role_key'   la service_role key del progetto
-- Se mancano (o pg_net non è attivo) il trigger NON blocca l'inserimento della
-- notifica: la consegna in-app continua a funzionare, salta solo il push OS.
-- ============================================================================

-- 1) Colonna mancante ------------------------------------------------------
alter table public.notifications
  add column if not exists related_kind text;

-- 2) Estensione pg_net (best-effort) --------------------------------------
do $$
begin
  create extension if not exists pg_net with schema extensions;
exception when others then
  raise notice 'pg_net non disponibile: il push automatico resterà inattivo finché non viene abilitato.';
end $$;

-- 3) Funzione trigger ------------------------------------------------------
create or replace function public.tg_notification_push()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_url   text;
  v_key   text;
begin
  -- Recupera URL progetto e service-role key dal Vault (best-effort).
  begin
    select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'project_url' limit 1;

    select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'service_role_key' limit 1;
  exception when others then
    v_url := null;
    v_key := null;
  end;

  -- Senza configurazione completa non tentiamo la chiamata (niente errori).
  if v_url is null or v_key is null then
    return new;
  end if;

  -- Chiamata async all'edge function; un errore qui non deve mai far fallire
  -- l'INSERT della notifica.
  begin
    perform net.http_post(
      url := v_url || '/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_key
      ),
      body := jsonb_build_object(
        'userId', new.user_id,
        'title', new.title,
        'body', coalesce(new.body, ''),
        'data', jsonb_build_object(
          'related_id', new.related_id,
          'related_kind', new.related_kind,
          'type', new.type
        )
      )
    );
  exception when others then
    raise notice 'tg_notification_push: invio push non riuscito (ignorato).';
  end;

  return new;
end$$;

-- 4) Trigger ---------------------------------------------------------------
drop trigger if exists notifications_send_push on public.notifications;
create trigger notifications_send_push
  after insert on public.notifications
  for each row execute function public.tg_notification_push();
