# Nvmcars Backend — Setup guide

Questa è la guida per attivare il backend di Nvmcars. **Tu fai i passi 1-4** sotto. Io (Claude) prendo le tue chiavi e collego l'app.

## 0. Cosa ti servirà alla fine

Quattro account (3 gratis, 1 Apple a €99/anno):
1. **Supabase** (gratis per partire)
2. **Stripe Connect** (gratis, pagamenti su tx)
3. **Targato.it o equivalente** (a consumo, ~€0.10-0.30 per lookup)
4. **Apple Developer + Google Play** (€99/anno + €25 una volta)

---

## 1. Supabase (~10 minuti)

### 1.1 Crea il progetto
1. Vai su https://supabase.com → **Sign up** (puoi usare GitHub)
2. Crea un nuovo progetto:
   - **Name**: `nvmcars`
   - **Database Password**: generata, **salvala in un password manager** (non te la mostrerà più)
   - **Region**: **Frankfurt (eu-central-1)** ← importante per GDPR
   - **Pricing**: Free per iniziare. Passi a Pro (€25/mese) quando hai dati reali da proteggere con backup.
3. Aspetta ~2 minuti che il progetto si crei.

### 1.2 Esegui le migrazioni
Nel pannello Supabase del tuo progetto:
1. Sidebar sinistra → **SQL Editor** → **New query**
2. Apri `supabase/migrations/0001_initial_schema.sql` (in questo repo)
3. Copia tutto, incolla nell'editor, **Run** (in basso a destra)
4. Ripeti con `supabase/migrations/0002_rls_policies.sql`
5. Ripeti con `supabase/migrations/0003_storage_buckets.sql`

Dovresti vedere "Success. No rows returned." dopo ognuno.

### 1.3 Recupera le chiavi
Sidebar → **Project Settings** → **API**. Copia:
- **Project URL** (es. `https://abcdefgh.supabase.co`)
- **anon public** key (la lunga `eyJ...`)
- **service_role** key — **NON** condividere mai. Mi servirà SOLO per le Edge Functions, te la chiederò separatamente.

### 1.4 Mandami `URL` + `anon key`
Incollameli in chat. Le metterò io nel `.env` del progetto e l'app si collegherà al tuo database.

---

## 2. Stripe Connect (~15 minuti)

### 2.1 Crea l'account
1. Vai su https://stripe.com → **Sign up**
2. Setup business:
   - Tipo: **Individual / Company** (a seconda di come fatturi)
   - Country: **Italy**
   - Business type: scegli quello vero (forfettario è OK)
3. Inserisci IBAN dove riceverai i tuoi guadagni 2%.

### 2.2 Abilita Connect
1. Sidebar → **Connect** → **Get started**
2. Scegli **Platform or marketplace** (sei TU che gestisci il marketplace, le officine sono i "connected accounts")
3. Account type: **Express** (più semplice per le officine — Stripe gestisce KYC per te)
4. Branding: nome "Nvmcars", logo (te lo passo dopo), colori brand.

### 2.3 Recupera le chiavi
- **Developers** → **API keys**:
  - **Publishable key** (`pk_test_...`) → mi serve per l'app
  - **Secret key** (`sk_test_...`) → **non condividere via chat**, la metto io direttamente nelle Edge Functions di Supabase
- Lascia per ora la **modalità Test** attiva. Passeremo a Live solo prima del lancio.

### 2.4 Mandami `pk_test_...`
La metto nel `.env`. La `sk_test_...` la imposterò nel pannello Supabase (`Edge Functions → Secrets`).

---

## 3. Targato.it (o alternativa) — Lookup targa (~10 minuti)

Opzioni in ordine di costo/qualità:
| Provider | Costo | Dati restituiti | Note |
|---|---|---|---|
| **Targato.it API** | ~€0.10/req | Marca, Modello, Anno, Alim., Cilindrata, KW | Più completo, italiano |
| **Carplate.it** | ~€0.20/req | Idem | Buona qualità |
| **API Visure / PRA** | €2-5/req | Tutto + intestatari | Troppo caro per il nostro use case |

**Mio consiglio**: Targato.it.

### 3.1 Registrazione
1. Vai su https://targato.it
2. Crea un account business
3. Acquista un pacchetto di chiamate API (di solito €30-50 per 300-500 lookups)
4. Recupera **API Key** dal pannello

### 3.2 Mandami la API key separatamente
La metto come secret in Supabase Edge Functions. **NON** finirà mai sul telefono dell'utente.

---

## 4. Apple Developer + Google Play (~30 minuti + verifica Apple ~24h)

### Apple Developer (€99/anno)
1. https://developer.apple.com/programs/enroll/
2. Tipo: **Individual** (più semplice; "Organization" richiede D-U-N-S Number gratis ma ci impieghi 1-2 settimane in più)
3. Paga €99 con carta. Verifica Apple in 24-48h.

### Google Play Console (€25 una volta)
1. https://play.google.com/console/signup
2. Account business, paga €25 una volta.
3. Approvazione: ~1-2 giorni.

### Cosa mi serve da te
Quando entrambi sono attivi, ti chiederò solo:
- **Team ID** (Apple, lo trovi in Membership)
- **Service Account JSON** (Google Play, lo genero io con le tue istruzioni)

Senza questi non possiamo firmare i build per gli store.

---

## 5. Cosa accade ai costi mentre svilupiamo

Nel mese di sviluppo (Sett. 1-6 dal piano):
| Voce | Quando paghi |
|---|---|
| Supabase Free | €0 sempre |
| Stripe Test mode | €0 sempre (no transazioni reali) |
| Targato.it | €0 finché non integro la API live (Settimana 4) |
| Apple Developer | €99 al momento dell'iscrizione (Settimana 1 idealmente) |
| Google Play | €25 al momento dell'iscrizione |

**Tot durante lo sviluppo: ~€135** (Apple + Google).

I costi mensili veri partono solo dopo il lancio.

---

## 6. Sicurezza: cosa NON condividere mai

| Chiave | Dove vive | Condividere con me? |
|---|---|---|
| Supabase **anon key** | App (`.env`) | ✅ Sì, in chat va bene |
| Supabase **service_role** | Solo Edge Functions | ❌ Te la setto io via pannello |
| Stripe **publishable** | App (`.env`) | ✅ Sì |
| Stripe **secret** | Solo Edge Functions | ❌ Te la setto io via pannello |
| Targato.it API key | Solo Edge Functions | ❌ Te la setto io via pannello |
| Database password Supabase | Solo password manager | ❌ Mai a nessuno |

Le secret key vanno **solo** nei "Secrets" delle Edge Functions di Supabase. L'app le chiama via Edge Function, mai direttamente.

---

## 7. Prossimo step per te

Inizia da **Supabase (passo 1)**. Quando hai:
- URL del progetto
- anon key

Scrivimeli e procedo. Mentre io collego l'app, tu puoi iniziare le iscrizioni Apple/Google in parallelo (sono lente per via delle verifiche).
