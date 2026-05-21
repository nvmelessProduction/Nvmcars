# Deploy checklist — Round 2

Questa sessione ha aggiunto tutto quello che era fattibile dal piano senza
credenziali esterne. Per portare in produzione, segui questi step in ordine.

## 1. Schema DB (8 migrations totali)

```bash
cd /path/to/Nvmcars
npx supabase db push
```

Migrations nuove introdotte:
- `0007_subscriptions_dac7.sql` — commission 5%, DAC7, subscriptions, countries
- `0008_rls_hardening.sql` — bug PII fix, immutability triggers, invite_code RPC
- `0009_diy_autodoc.sql` — DIY guides + 3 guide seed + autodoc_clicks + quote_items.autodoc_product
- `0010_boost_referral.sql` — workshop_boosts + referral_codes + referral_redemptions + RPC

## 2. Edge functions

```bash
# Funzioni esistenti rifattorizzate
supabase functions deploy plate-lookup
supabase functions deploy stripe-create-payment-intent
supabase functions deploy stripe-create-account-link
supabase functions deploy send-push
supabase functions deploy stripe-webhook --no-verify-jwt

# Funzioni nuove
supabase functions deploy delete-user-data
supabase functions deploy export-user-data
supabase functions deploy stripe-create-subscription
supabase functions deploy stripe-cancel-subscription
supabase functions deploy stripe-create-boost
supabase functions deploy autodoc-search
```

## 3. Secrets da settare in Supabase

```bash
# Stripe (obbligatori)
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe prices subscription (crea prima i price su Stripe Dashboard)
supabase secrets set STRIPE_PRICE_PRO=price_xxx
supabase secrets set STRIPE_PRICE_PREMIUM=price_xxx
supabase secrets set STRIPE_PRICE_DIY_PRO=price_xxx

# Targato.it (quando attiverai plate lookup vero)
supabase secrets set TARGATO_API_KEY=...

# Autodoc (quando attiverai l'API)
supabase secrets set AUTODOC_API_KEY=...

# (Opzionali) Upstash Redis per rate-limit serio
supabase secrets set UPSTASH_REDIS_REST_URL=https://...
supabase secrets set UPSTASH_REDIS_REST_TOKEN=...
```

## 4. Stripe Dashboard

1. Vai su https://dashboard.stripe.com/products
2. Crea 3 prodotti ricorrenti:
   - "Nvmcars Pro" — 29€/mese
   - "Nvmcars Premium" — 79€/mese
   - "Nvmcars DIY Pro" — 4,99€/mese
3. Copia i price IDs (price_xxx) e settali come secrets sopra
4. Configura il webhook: https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhook
   con eventi: `payment_intent.succeeded`, `payment_intent.payment_failed`,
   `account.updated`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`

## 5. Variabili `.env` client (Expo app)

Il programma che genera il `.env` deve includere anche:

```
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...    # opzionale
EXPO_PUBLIC_POSTHOG_API_KEY=phc_...                  # opzionale
EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com    # opzionale
EXPO_PUBLIC_AUTODOC_AFFILIATE_ID=<awin-publisher-id> # opzionale (registrati su Awin)
```

## 6. Build app Expo

```bash
# Una volta che hai EAS project ID (sostituisci PLACEHOLDER in app.json)
eas build --platform android --profile preview   # APK di test
eas build --platform ios --profile production    # poi submit
eas build --platform android --profile production
```

## 7. Sito web (cartella `web/`)

Skeleton Next.js 14 + Tailwind pronto. Deploy gratis su Cloudflare Pages
oppure Vercel.

```bash
cd web
npm install
cp .env.example .env.local   # poi compila
npm run dev                  # local test
npm run build                # produzione
```

Deploy:
- **Cloudflare Pages**: connetti repo, build command `npm run build`, output `.next`
- **Vercel**: `vercel --prod` dalla cartella `web/`

## 8. Asset design da preparare

Mancano (non li posso generare io):
- `assets/icon.png` (1024×1024) — icona app
- `assets/splash.png` (1284×2778) — splash screen
- `assets/adaptive-icon.png` — Android adaptive icon
- Screenshot store (5-8 per ognuno di iOS/Android)
- Logo OpenGraph 1200×630 per il sito web

## 9. Cose offline da fare TU

Riprese dal piano (sezione 8):
1. Compra dominio `nvmcars.it` (Cloudflare ~10€/anno)
2. Apri account Apple Developer (99€/anno)
3. Apri Stripe Italia + Connect
4. Registrati come affiliato Autodoc su Awin/Tradedoubler (gratis)
5. Crea account iubenda free + genera Privacy Policy + Termini
6. Crea progetto Supabase di produzione (free tier 500MB)
7. Apri P.IVA forfettaria (Fiscozen online, ~1 settimana)

## 10. Verifica funzionale dopo deploy

- [ ] Login utente customer → vede HomeScreen
- [ ] Login utente pro → vede ProDashboard
- [ ] Naviga a ProUpgrade → tre piani visibili, click "Attiva Pro" → Stripe Checkout si apre
- [ ] Naviga a Referral → codice generato, condivisione funziona
- [ ] Naviga a DIY List → 3 guide free visibili, premium con lucchetto
- [ ] Naviga a Parts Search → digita "pastiglie freno", risultati mock visibili
- [ ] Profilo customer → "Esporta dati" → JSON con dati corretti
- [ ] Profilo customer → "Cancella account" → flusso completo OK
- [ ] Pagamento di una quote → application_fee 5% applicato
- [ ] MFA pro → QR code mostrato, codice TOTP verifica OK
