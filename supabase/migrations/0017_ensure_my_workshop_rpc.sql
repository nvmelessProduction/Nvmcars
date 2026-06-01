-- ============================================================================
-- 0017 — RPC ensure_my_workshop(): crea/collega l'officina del pro in modo
--        sicuro, AGGIRANDO la RLS (SECURITY DEFINER) e SENZA duplicati.
-- ----------------------------------------------------------------------------
-- Problema risolto:
--   L'INSERT su workshops dal client falliva con
--   "new row violates row-level security policy for table workshops"
--   (la policy workshops_insert_owner pretende owner_id = auth.uid(), e in
--   alcuni stati/sessioni l'INSERT diretto veniva comunque rifiutato).
--   Inoltre i tentativi ripetuti creavano officine DUPLICATE.
--
-- Soluzione (server-authoritative, idempotente):
--   Una funzione SECURITY DEFINER che gira con i privilegi del proprietario
--   (bypassa la RLS in modo controllato), legge auth.uid() dal chiamante,
--   riusa l'officina esistente se c'è (niente duplicati) o ne crea UNA sola,
--   e la collega al profilo. Ritorna l'id dell'officina.
-- ============================================================================

create or replace function public.ensure_my_workshop()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ws  uuid;
begin
  if v_uid is null then
    raise exception 'no_session';
  end if;

  -- 1) Riusa l'officina già collegata al profilo, se valida.
  select workshop_id into v_ws from public.profiles where id = v_uid;
  if v_ws is not null and exists (select 1 from public.workshops where id = v_ws) then
    return v_ws;
  end if;

  -- 2) Altrimenti riusa una qualsiasi officina di cui sono proprietario.
  select id into v_ws from public.workshops where owner_id = v_uid order by created_at asc limit 1;

  -- 3) Se non esiste, creane UNA in bozza.
  if v_ws is null then
    insert into public.workshops (owner_id, name, city, address, lat, lng, status)
    values (v_uid, '', '', '', 0, 0, 'draft')
    returning id into v_ws;
  end if;

  -- 4) Collega l'officina al profilo.
  update public.profiles set workshop_id = v_ws where id = v_uid;
  return v_ws;
end$$;

grant execute on function public.ensure_my_workshop() to authenticated;

-- ----------------------------------------------------------------------------
-- PULIZIA DUPLICATI: se i tentativi precedenti hanno creato più officine vuote
-- per lo stesso proprietario, tieni solo la più vecchia e cancella le altre
-- bozze vuote (senza nome). Sicuro: non tocca officine con un nome compilato.
-- ----------------------------------------------------------------------------
with ranked as (
  select id, owner_id,
         row_number() over (partition by owner_id order by created_at asc) as rn
  from public.workshops
  where coalesce(name, '') = '' and status = 'draft'
)
delete from public.workshops w
using ranked r
where w.id = r.id and r.rn > 1;
