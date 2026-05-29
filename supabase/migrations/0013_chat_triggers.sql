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
