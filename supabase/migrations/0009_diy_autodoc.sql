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

create policy diy_feedback_select_own on public.diy_guide_feedback
  for select using (user_id = auth.uid());

create policy diy_feedback_insert_own on public.diy_guide_feedback
  for insert with check (user_id = auth.uid());

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

create policy autodoc_clicks_select_own on public.autodoc_clicks
  for select using (user_id = auth.uid());

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
