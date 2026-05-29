# Security Audit — Round 1 (Blocco 10a)

Audit fatto sul branch `claude/fix-critical-bugs-QDk1X` il 2026-05-21.
Stato: Livello 1 completato + Livello 2 parziale (solo Sentry scrubbing).

## Vulnerabilità critiche trovate e sistemate

### 1. `profiles_select_workshop_owner_basic using (true)` — esposizione PII
**Severità: ALTA**

La policy in `0002_rls_policies.sql:28-29` permetteva a CHIUNQUE in possesso
della anon key (cioè qualunque utente loggato, e tramite reverse-engineering
APK anche utenti anonimi) di leggere TUTTI i profili, compresi: `email`,
`phone`, `vat_number`, oltre ai campi DAC7 che stiamo aggiungendo (`tax_id`,
`iban`, `legal_address`).

**Fix in `0008_rls_hardening.sql`:**
- Rimossa la policy `using (true)`.
- Aggiunta `profiles_select_counterparty_via_conversation`: vedi il profilo
  altrui solo se hai una conversation con quel profilo.
- Creata view `v_profiles_public` con solo `id, name, avatar_url, role,
  created_at` — esposta a `anon` e `authenticated`. Il client deve usare
  questa view per il browsing pubblico (TODO front-end).

### 2. `invite_codes_select_public using (true)` — leak codici invito
**Severità: MEDIA**

La policy permetteva di listare tutti i codici invito (anche quelli mai usati)
con la sola anon key. Un attaccante poteva trovare un codice non usato e
registrarsi come pro senza autorizzazione.

**Fix in `0008_rls_hardening.sql`:**
- Rimossa la policy SELECT.
- Aggiunte due RPC `security definer`: `validate_invite_code(code)` per la
  validazione e `redeem_invite_code(code)` per il riscatto. Il client non
  vede più la tabella, solo l'esito.

### 3. Policy UPDATE senza `with check` — confused-deputy
**Severità: MEDIA**

Le policy `profiles_update_own`, `quote_items_workshop_write`,
`conversations_participants_update`, `quotes_participants_update`,
`bookings_participants_update`, `workshops_update_owner`,
`reviews_customer_update` non avevano `with check`. Permettevano in teoria di
trasferire una riga su un'altra entità (es. cambiare `customer_id` di una
quote per regalarla a un altro utente).

**Fix in `0008_rls_hardening.sql`:**
- Tutte le policy update riscritte con `with check`.
- Aggiunti trigger `BEFORE UPDATE` `tg_*_immutable_refs` che vietano la
  modifica di campi chiave (customer_id, workshop_id, conversation_id, role,
  owner_id). Nel caso di `quotes` il trigger vieta anche al cliente di
  modificare totali/commissione.

### 4. Token Supabase in AsyncStorage (chiaro)
**Severità: MEDIA**

`src/lib/supabase.ts:17` usava `AsyncStorage` per la sessione, che su Android
è in chiaro nel sandbox dell'app. Su device root/jailbroken o backup ADB la
session è estraibile.

**Fix:**
- Aggiunta dep `expo-secure-store` (Keychain iOS / Keystore Android cifrato hw).
- Nuovo adapter `src/lib/secureStorage.ts` con chunking trasparente per il
  limite 2KB Android e fallback ad AsyncStorage quando la dep manca (web).
- `src/lib/supabase.ts` aggiornato per usare l'adapter.

### 5. Edge functions senza Zod / senza rate-limit
**Severità: MEDIA**

Le edge function `plate-lookup`, `stripe-create-payment-intent`,
`stripe-create-account-link`, `send-push` validavano l'input a mano (o quasi)
e non avevano rate-limit. In particolare `send-push` era esposta con
`--no-verify-jwt` — chiunque conoscesse l'URL poteva inviare push spam.

**Fix:**
- Nuovi shared helpers in `supabase/functions/_shared/`:
  - `validate.ts`: parsing JSON + schema Zod + risposta 400 standard
  - `rateLimit.ts`: rate-limit con backend Upstash Redis (free tier) e
    fallback in-memory
  - `auth.ts`: estrazione utente dal JWT + client admin
- Tutte le edge function riscritte con `parseBody`, `rateLimit`, `requireUser`.
- `send-push` ora richiede JWT (rimosso `--no-verify-jwt` dal commento).
- `stripe-create-payment-intent` verifica esplicitamente che il chiamante sia
  il `customer_id` della quote (in più al check RLS).
- `stripe-webhook` lasciato intatto: la firma Stripe è la garanzia sufficiente,
  e il rate-limit darebbe falsi positivi sui retry legittimi di Stripe.

### 6. PII inviata a Sentry senza scrubbing
**Severità: BASSA**

Il wrapper Sentry (`src/lib/sentry.ts`) non filtrava email, IBAN, codice
fiscale, token. In caso di errori uncaught con stringhe contenenti PII,
quelli sarebbero finiti in chiaro nel dashboard Sentry (terza parte).

**Fix:**
- Sentry init configurato con `sendDefaultPii: false`, `beforeSend` e
  `beforeBreadcrumb` che fanno scrub di:
  - 13 chiavi sensibili note (`email, phone, iban, tax_id, vat_number,
    legal_address, push_token, password, token, access_token, refresh_token,
    api_key, stripe_*`)
  - pattern testuali IBAN, codice fiscale italiano, email
  - header `Authorization` e `Cookie` rimossi
  - oggetto `user` ridotto al solo `id`

## Cose già OK trovate

- ✅ RLS abilitato su tutte le tabelle (`0002`, `0005`).
- ✅ `stripe-webhook` verifica firma con `constructEventAsync` (`stripe-webhook/index.ts:40`).
- ✅ Stripe pubblicabile key è l'unica chiave esterna esposta al client (corretto, è progettata per esserlo).
- ✅ `plate_lookups` ha solo policy SELECT — scritture solo via service-role.
- ✅ Cars/Favorites/Notifications scoped correttamente per `auth.uid()`.

## Cose rimandate (non fatte in questo round)

Le seguenti voci del piano (Blocco 10b) **non sono state implementate** —
richiedono setup esterno o decisioni di prodotto che escludono che possa
farle io qui:

| Item | Perché rimandato | Cosa serve |
|---|---|---|
| **MFA TOTP per officine** | Richiede schermate Pro MFA + flusso enrollment | 1 giornata di lavoro UI |
| **SSL pinning** | Richiede config Expo plugin nativo + scelta domini | Decisione + ~3h |
| **Headers sicurezza sito web** | Sito web (cartella `web/`) ancora non esiste | Blocco 8 prima |
| **API proxy per Autodoc/Google Maps** | Quelle integrazioni non esistono ancora | Blocchi 6, 8 |
| **Upstash Redis attivo** | Serve account Upstash + secrets settati | Account Upstash + `supabase secrets set` |

## Cose da fare a livello operativo (utente)

1. **Applicare le migrations 0007 e 0008** al DB di produzione:
   ```bash
   npx supabase db push
   ```
2. **Deploy delle edge function modificate + nuove**:
   ```bash
   supabase functions deploy plate-lookup
   supabase functions deploy stripe-create-payment-intent
   supabase functions deploy stripe-create-account-link
   supabase functions deploy send-push
   supabase functions deploy delete-user-data
   supabase functions deploy export-user-data
   ```
3. **(opzionale)** Configurare Upstash Redis per rate-limit serio:
   ```bash
   supabase secrets set UPSTASH_REDIS_REST_URL=https://...
   supabase secrets set UPSTASH_REDIS_REST_TOKEN=...
   ```
4. **Verificare client codice**: dove il client legge da `profiles` tutti i
   campi per il browsing pubblico, sostituire con `v_profiles_public` (la
   nuova policy `select_counterparty_via_conversation` continua a esporre i
   PII alla controparte — accettabile — ma il browsing globale (es. lista
   workshop) NON deve passare più da `profiles`).
5. **Form DAC7**: aggiungere ai form pro (`RegisterProfessionalScreen`,
   `ProOnboardingScreen`, `ProEditWorkshopScreen`) i nuovi campi
   `tax_id`, `iban`, `legal_address`. Il trigger `tg_check_dac7` marcherà
   automaticamente `dac7_complete=true` quando tutti i campi sono presenti.

## Cambi schema introdotti

### `0007_subscriptions_dac7.sql`
- `quotes.commission_fee_pct` default: `0.020` → `0.050`
- `profiles`: aggiunti `tax_id`, `iban`, `legal_address`, `country_code`, `dac7_complete`
- Tabella nuova `countries` (ITA/ESP/FRA/DEU seedati)
- Tabella nuova `subscriptions` (tier free/pro/premium/diy_pro)
- View `v_user_tier`
- Trigger `tg_check_dac7` su profiles

### `0008_rls_hardening.sql`
- Vedi sopra. 7 fix di RLS + 8 trigger di immutabilità + 2 RPC invite_codes.
