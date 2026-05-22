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
on conflict (code) do update
  set expires_at = excluded.expires_at,
      used_by   = null,
      used_at   = null;

-- Verifica:
select code, used_by, expires_at from public.invite_codes order by code;
