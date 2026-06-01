-- ============================================================================
-- 0016 — Crea l'officina automaticamente alla registrazione del professionista
-- ----------------------------------------------------------------------------
-- BUG RISOLTO: la creazione dell'officina avveniva lato CLIENT (app) subito
-- dopo signUp, con un INSERT su public.workshops. Ma la policy RLS
-- `workshops_insert_owner` richiede owner_id = auth.uid(), e se la
-- registrazione richiede CONFERMA EMAIL non esiste ancora una sessione
-- (auth.uid() è null) → l'INSERT viene rifiutato → l'officina NON viene creata.
-- Risultato: il professionista esiste ma la sua officina non è nel database, e
-- al salvataggio del profilo compare "officina non trovata / deve essere creata".
--
-- SOLUZIONE (server-authoritative): il trigger handle_new_user, che gira come
-- SECURITY DEFINER (bypassa la RLS), crea l'officina in bozza e la collega al
-- profilo nello stesso momento in cui crea il profilo. Funziona SEMPRE, con o
-- senza conferma email, indipendentemente dalla sessione del client.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_workshop_id uuid;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'customer');

  -- Profilo (come prima)
  insert into public.profiles (id, role, name, email, phone)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;

  -- Se è un professionista, crea l'officina in bozza e collegala al profilo.
  -- Solo se il profilo non ha già un'officina collegata (idempotente).
  if v_role = 'professional' then
    select workshop_id into v_workshop_id from public.profiles where id = new.id;
    if v_workshop_id is null then
      insert into public.workshops (owner_id, name, city, address, lat, lng, status)
      values (new.id, '', '', '', 0, 0, 'draft')
      returning id into v_workshop_id;

      update public.profiles
        set workshop_id = v_workshop_id,
            vat_number = coalesce(new.raw_user_meta_data->>'vat_number', vat_number),
            invite_code = coalesce(new.raw_user_meta_data->>'invite_code', invite_code)
      where id = new.id;
    end if;
  end if;

  return new;
end$$;

-- Il trigger on_auth_user_created esiste già (0001) e punta a questa funzione:
-- essendo CREATE OR REPLACE, ora esegue la versione aggiornata.
