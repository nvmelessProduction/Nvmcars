# Nvmcars — Come andare ONLINE in 30 minuti

Tutto il codice è pronto. Manca solo "accendere" il backend Supabase e collegare l'app. Qui ti dico esattamente cosa fare, in ordine.

## Cosa avrai alla fine

Dopo questi step, quando aprirai l'app sul telefono (via Expo Go o APK), parlerà con il **vero** backend Supabase su internet. Gli amici a cui dai l'APK si vedranno tra loro. I dati saranno persistenti nel cloud.

L'unica cosa che NON funzionerà ancora è Stripe (per i pagamenti veri serve un account Stripe Live, ma c'è la modalità Test che funziona gratis).

## Step 0 — Cosa devi avere a portata di mano

- **PC Windows** (vedo che usi Windows dal path `C:\Users\alber\...`)
- **Node.js 18+** installato (se hai `npm` già funzionante sei a posto)
- **Account Supabase** (ce l'hai già, progetto `wdfoxsecsgilyixadidp`)
- **Password DB Postgres** del progetto Supabase
  - La trovi su: https://supabase.com/dashboard/project/wdfoxsecsgilyixadidp/settings/database
  - Sezione "Database Password". Se l'hai persa, fai "Reset database password" (ti rigenera una nuova).
- 30 minuti di tempo

## Step 1 — Pull dell'ultimo codice

Apri PowerShell, vai nella cartella del progetto:

```powershell
cd C:\Users\alber\OneDrive\Escritorio\Nvmcars
git fetch origin
git checkout claude/fix-critical-bugs-QDk1X
git pull
npm install
```

Questo scarica tutto quello che ho fatto io (10 migrations, 12 edge functions, ~40 schermate nuove).

## Step 2 — Lancia il go-live script

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\go-live.ps1
```

Lo script fa tutto da solo:

1. Installa Supabase CLI (se non ce l'hai)
2. Ti fa fare login Supabase nel browser
3. Linka il progetto `wdfoxsecsgilyixadidp` (chiede la password DB qui)
4. Applica le 10 migrations al DB online
5. Deploya le 11 edge functions
6. Ti chiede se vuoi settare i secrets Stripe (saltabile)
7. Rigenera il `.env` locale

Se va tutto bene, vedi `✅ NVMCARS È ONLINE` alla fine.

## Step 3 — Verifica che il DB sia popolato

Vai su Supabase dashboard → Table Editor:
- https://supabase.com/dashboard/project/wdfoxsecsgilyixadidp/editor

Dovresti vedere ~20 tabelle: `profiles`, `workshops`, `cars`, `bookings`, `quotes`, `diy_guides`, `subscriptions`, `workshop_boosts`, `referral_codes`, ecc.

In `diy_guides` ci sono già 3 righe (le guide seed che ho aggiunto: cambio tergicristalli, filtro aria, lampadina fanale).

## Step 4 — Verifica che le edge functions siano deployate

Vai su Supabase dashboard → Edge Functions:
- https://supabase.com/dashboard/project/wdfoxsecsgilyixadidp/functions

Dovresti vedere 11 funzioni in stato "ACTIVE":
- `autodoc-search`, `delete-user-data`, `export-user-data`, `plate-lookup`,
  `send-push`, `stripe-cancel-subscription`, `stripe-create-account-link`,
  `stripe-create-boost`, `stripe-create-payment-intent`,
  `stripe-create-subscription`, `stripe-webhook`

## Step 5 — Lancia l'app in modalità "tunnel"

Sempre da PowerShell nella cartella progetto:

```powershell
npx expo start --tunnel
```

`--tunnel` significa: il bundle dell'app passa attraverso il server Expo (ngrok-like), quindi **anche un telefono su un'altra rete WiFi può scaricarlo dal tuo PC**.

In pratica: vedi un QR code in console.

## Step 6 — Apri sul telefono Android

1. Installa **Expo Go** dal Play Store (gratis): https://play.google.com/store/apps/details?id=host.exp.exponent
2. Apri Expo Go
3. Scansiona il QR code che vedi in console
4. L'app si scarica e si avvia

**A questo punto l'app è online.** Ogni cosa che fai (registrazione, profilo, chat) viene salvata nel Supabase cloud, non in locale.

## Step 7 — Test che è davvero online

Apri 2 telefoni (o uno tuo e uno di un amico):

1. Registra 2 account diversi (es. uno cliente, uno officina pro)
2. Il pro completa l'onboarding e pubblica l'officina
3. Il cliente cerca l'officina e gli scrive in chat
4. Verifica che la chat funzioni in tempo reale fra i due telefoni

Se questo funziona = **sei davvero online**. ✅

## Step 8 — APK installabile (senza Expo Go)

Quando vuoi un APK vero da regalare in giro:

```powershell
npx eas-cli login
npx eas-cli init    # solo la prima volta, crea EAS project ID
npx eas-cli build --platform android --profile preview
```

Crea l'APK sul cloud Expo (gratis fino a 30 build/mese). Quando finisce, ricevi un link via email tipo:
`https://expo.dev/artifacts/.../build.apk`

Scarica, manda l'APK in WhatsApp ai tuoi amici, lo installano.

**Importante**: per la prima `eas init`, ti darà un `EAS Project ID`. Aprirà `app.json` per metterlo dentro. Il file ora ha `"projectId": "PLACEHOLDER-REPLACE-WITH-EAS-PROJECT-ID"`. Sostituisci con quello vero.

## Step 9 — Sito web (opzionale, gratis)

Il sito web (cartella `web/`) può andare live gratis su Cloudflare Pages:

1. Crea account Cloudflare (gratis)
2. Pages → "Connect to Git" → autorizza GitHub → seleziona il repo
3. Build settings:
   - Build command: `cd web && npm install && npm run build`
   - Build output: `web/.next`
4. Variabili d'ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL=https://wdfoxsecsgilyixadidp.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1KOA9_Jwoplz7OAm-XoQDw_-xzWWm6Z`
5. Salva e deploya

Avrai un URL tipo `nvmcars-xxx.pages.dev`. Quando avrai il dominio, lo punterai lì.

## Step 10 — Quando vuoi i pagamenti (Stripe)

Senza Stripe l'app funziona, ma:
- Niente subscription Pro/Premium/DIY Pro
- Niente boost a pagamento
- Niente pagamento preventivo in app

Per attivare:

1. Crea account Stripe (https://dashboard.stripe.com/register)
2. Attiva "Connect" → tipo Express → mercato Italia
3. Vai in Products → crea 3 prodotti subscription:
   - Pro 29€/mese → copia `price_xxx`
   - Premium 79€/mese → copia `price_xxx`
   - DIY Pro 4,99€/mese → copia `price_xxx`
4. Configura webhook in Stripe:
   - URL: `https://wdfoxsecsgilyixadidp.supabase.co/functions/v1/stripe-webhook`
   - Eventi: `payment_intent.succeeded`, `payment_intent.payment_failed`,
     `account.updated`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `invoice.payment_failed`
   - Copia il signing secret `whsec_xxx`
5. Setta i secrets su Supabase:

```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_PRO=price_xxx
supabase secrets set STRIPE_PRICE_PREMIUM=price_xxx
supabase secrets set STRIPE_PRICE_DIY_PRO=price_xxx
```

6. Aggiungi nel `.env` locale:

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Riavvia Expo. Da ora Stripe funziona in modalità Test (carte fake tipo `4242 4242 4242 4242`).

## Cose che potrebbero andare male e come risolvere

### `supabase login` non apre il browser
Lancia direttamente: `supabase login --token <token>` dopo aver creato un Personal Access Token su https://supabase.com/dashboard/account/tokens

### `supabase db push` dice "password incorrect"
Resetta la password DB su Supabase dashboard → Settings → Database → "Reset database password".

### Una migration fallisce
Probabile causa: una migration precedente già applicata in modo parziale. Apri SQL Editor su Supabase, copia-incolla manualmente solo la migration fallita.

### `expo start --tunnel` dice "ngrok required"
Lancia `npm install -g @expo/ngrok` poi riprova.

### Expo Go non scansiona il QR
Vai su Wi-Fi telefono → assicurati che il PC sia sulla stessa rete. Se non funziona ugualmente, sul QR code Expo c'è anche un link tipo `exp://...`: aprilo manualmente in Expo Go (icona "+").

### Edge function ritorna 401
Le edge function richiedono il JWT del client. Verifica che `EXPO_PUBLIC_SUPABASE_ANON_KEY` nel `.env` sia corretta. Se hai cambiato anon key, devi rigenerare `.env`.

### `eas build` chiede project ID
Lancia prima `eas init` (una sola volta). Ti dà un UUID, lo mette in `app.json` al posto del placeholder.

## Punti chiave da ricordare

- **Tutto il codice è già scritto**. Non manca nessuna feature lato programmazione.
- **Il backend Supabase esiste già** (`wdfoxsecsgilyixadidp`). Devi solo applicargli le migrations e deployare le edge functions.
- **`expo start --tunnel`** è il modo più veloce per testare l'app online — non serve build APK.
- **APK reale** = `eas build --profile preview` (preview = APK firmato per testing).
- **Costo per andare online MINIMO**: 0€ (Supabase free + Expo free + Cloudflare Pages free).
- **Costo per pubblicare sugli store**: 99€/anno Apple + 25€ una tantum Google. Stripe gratis (commissione su transazione).
