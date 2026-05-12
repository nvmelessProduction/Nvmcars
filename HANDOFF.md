# Nvmcars — Handoff per nuova chat Claude

> **Per il prossimo Claude**: leggi tutto questo prima di toccare codice. È self-contained, non ti serve la cronologia delle chat precedenti.
> **Per Alberto (founder)**: questo è il riassunto di tutto. Aprire nuova chat, dire "leggi HANDOFF.md" e proseguire.

---

## 1. Cos'è Nvmcars

Marketplace italiano che mette in contatto **automobilisti** (Cliente) e **officine** (Professionista).

- Cliente: cerca officina vicina → vede prezzi → prenota o paga → recensisce
- Officina: riceve richieste → chatta → manda preventivo → riceve pagamento (meno 2% commissione Nvmcars)
- Sicurezza pagamento: Stripe Connect Express (la commissione 2% trattiene fino a completamento lavoro)
- Lingue: **IT primario**, EN come secondario completo
- Mercato: **Italia**, parte da Milano

**Branch di sviluppo**: `claude/nvmcars-mobile-app-setup-Vle5S` (commit e push solo qui)

---

## 2. Stack tecnico (deciso)

| Componente | Scelta | Stato |
|---|---|---|
| Frontend | **Expo SDK 54** + React Native 0.81 + TypeScript strict | ✅ Funzionante |
| State management | **Zustand** + AsyncStorage (persist) | ✅ Mock funzionante |
| Navigation | `@react-navigation/native-stack` + bottom tabs | ✅ |
| Backend | **Supabase** (region Frankfurt EU) | ⏳ Schema scritto, non deployato |
| Auth | Supabase Auth (email+password) | ⏳ Solo mock zustand |
| Pagamenti | **Stripe Connect Express** + commissione 2% | ❌ Zero |
| Lookup targa | **Targato.it API** (a consumo €0.10/req) | ❌ Mock 5 targhe |
| Push | expo-notifications | ❌ Zero |
| Crash | Sentry (free tier) | ❌ Zero |
| Mappe | react-native-maps (presente in deps) | ❌ Non integrato |
| Image picker | expo-image-picker (presente) | ✅ Funziona, file locale |

**Target finale**: app pubblicata su **App Store** (iOS) E **Google Play** (Android). L'app è cross-platform fin dal primo giorno — non c'è codice iOS-only o Android-only se non nelle config native.

---

## 3. Obiettivo finale dichiarato dal founder

> "Voglio l'app completa al 100%, installata sul mio iPhone E sul mio Android, la testo a fondo, poi decido quando pubblicarla negli store."

Quindi NON pubblicare niente senza permesso esplicito. Il founder vuole testare prima.

---

## 4. Stato reale per area (al 2026-05-12)

### ✅ FATTO

#### Frontend mock (~85% completo)
- Onboarding 4 slide + role selection (Cliente / Professionista)
- Auth screens: Login, Register Customer, Register Professional con codice invito
- Tab navigation cliente: Home, Bookings, Favorites, Notifications, Profile
- Tab navigation pro: Dashboard, Requests, Price list, Calendar, Profile
- Aggiunta auto: ricerca targa **(rate-limited: 1 sola volta per utente totale)** + inserimento manuale per marca/modello
- Lista officine + filtri + dettaglio officina
- Booking form (richiesta servizio)
- Chat cliente ↔ officina con allegati (foto/video/preventivi)
- Preventivi: creazione (pro) + dettaglio + accept/reject (cliente)
- Pagamento simulato (carta finta) + ricevuta
- Recensioni a 5 stelle
- Pro: gestione richieste (accetta/rifiuta/completa), listino prezzi base, calendario con giorni chiusi, edit officina
- **Pro: schermata "Le mie chat"** con badge non-letti (Round 2A)
- Temi: chiaro / scuro / auto
- i18n: IT (default) + EN completi

#### Compliance Apple/Google (Round 1, commit `42aefc9`)
- `src/screens/legal/PrivacyPolicyScreen.tsx` — 6 sezioni GDPR
- `src/screens/legal/TermsOfServiceScreen.tsx` — 7 sezioni
- `src/screens/legal/DataExportScreen.tsx` — esporta JSON via Share sheet (mock)
- `src/screens/legal/DeleteAccountScreen.tsx` — wipe locale + logout (richiesto da Apple)
- `src/lib/wipeUserData.ts` — pulisce AsyncStorage keys, preserva tema/lingua
- Tutte e 4 accessibili da Settings → Privacy & terms / Account, sia cliente che pro

#### Backend Supabase scritto ma non deployato (commit `bda9ea6`)
File pronti da incollare nel SQL editor di Supabase (in ordine):
- `supabase/migrations/0001_initial_schema.sql` — 13 tabelle (profiles, workshops, workshop_services, cars, conversations, messages, quotes, quote_items, bookings, reviews, notifications, favorites, plate_lookups, invite_codes) + trigger auto-profile-on-signup
- `supabase/migrations/0002_rls_policies.sql` — Row Level Security completo
- `supabase/migrations/0003_storage_buckets.sql` — 3 bucket (`chat-media` private, `workshop-photos` public, `avatars` public) + policy path-based
- `supabase/README.md` — guida step-by-step per Alberto

#### UX fix critici da test live (Round 2A, commit `798346d`)
- `src/components/KAV.tsx` — wrapper KeyboardAvoidingView con `useHeaderHeight()` per offset corretto su iOS. **12 schermate** migrate.
- `src/components/AttachSheet.tsx` — timeout 120→350ms (iOS modal-dismiss race)
- `src/utils/mediaPicker.ts` — try/catch + Alert visibile + `videoQuality` enum corretto + cameraType esplicito
- `src/screens/professional/ProChatsListScreen.tsx` — nuova lista conversazioni pro

#### Build / dev
- `app.json` configurato con bundle ID `com.nvmcars.app`, scheme `nvmcars`, permessi iOS (NSCameraUsageDescription, NSLocationWhenInUseUsageDescription, NSPhotoLibraryUsageDescription, NSMicrophoneUsageDescription), permessi Android (CAMERA, RECORD_AUDIO, ACCESS_FINE_LOCATION, READ_MEDIA_*)
- `eas.json` presente
- `@supabase/supabase-js` in deps
- `src/lib/supabase.ts` client con AsyncStorage session
- `.env.example` template

### ❌ DA FARE — backend (0% live)

Tutto è bloccato finché Alberto non crea il progetto Supabase e ti dà URL + anon key.

Quando arrivano le keys:
1. Le metti in `.env` (gitignored): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. **Migrare 10 store zustand → query Supabase**:
   - `useAuthStore` → Supabase Auth (signup/login/reset/email verify)
   - `useCarStore` → tabella `cars`
   - `useBookingsStore` → tabella `bookings`
   - `useFavoritesStore` → tabella `favorites`
   - `useReviewsStore` → tabella `reviews`
   - `useChatStore` → `conversations` + `messages` + **subscription realtime**
   - `useQuoteStore` → `quotes` + `quote_items`
   - `useNotificationsStore` → tabella `notifications`
   - Workshop list (oggi `src/data/workshops.ts`) → tabella `workshops` (con `v_workshop_stats` view)
3. **Persistenza che oggi è fake**:
   - `ProEditWorkshopScreen` "Salva" → aggiorna riga `workshops`
   - `ProCalendarScreen` "Salva" → aggiorna `workshops.hours` o tabella dedicata
   - `ProPriceListScreen` "Salva" → upsert `workshop_services`
4. **Foto/video chat** → upload reale su bucket `chat-media`, salva `media_url` in `messages`
5. **Foto profilo / officina** → bucket `avatars` / `workshop-photos`

### ❌ DA FARE — Stripe (0%)

Serve account Stripe Connect attivo di Alberto. Poi:
1. **Edge Function** `create-payment-intent`:
   - Input: quoteId
   - Calcola: subtotale + commissione 2% Nvmcars
   - Crea PaymentIntent Stripe con `application_fee_amount` e `transfer_data.destination = workshop.stripe_account_id`
   - Ritorna `client_secret`
2. **Edge Function** `stripe-webhook`:
   - Verifica firma webhook
   - Su `payment_intent.succeeded`: aggiorna `quotes.status = 'paid'`, `paid_at = now()`, crea notifica per officina, manda push
3. **Stripe Connect onboarding officina**:
   - Schermata in ProProfile: "Configura pagamenti"
   - Edge Function `create-stripe-account-link` → AccountLink per onboarding
   - Stato visibile: pending / restricted / active
4. **PaymentSheet RN SDK**:
   - Già planned in deps? Verificare. Aggiungere `@stripe/stripe-react-native` se manca
   - Sostituire `PaymentScreen` mock con presentPaymentSheet({ clientSecret })

### ❌ DA FARE — Targato.it (0%)

Serve API key Targato.it (o equivalente).
1. **Edge Function** `plate-lookup`:
   - Input: plate
   - Check rate-limit lato server: `select count(*) from plate_lookups where user_id = auth.uid()` — se >= 1 ritorna error
   - Chiama API esterna
   - Salva risultato in `plate_lookups` con cost_cents
   - Ritorna dati auto
2. **App**: `src/data/plateLookup.ts` → chiama Edge Function invece di hardcoded lookup

### ❌ DA FARE — Push notifications (0%)

1. `expo-notifications` install + config in `app.json`
2. Richiesta permesso al primo login → salva `push_token` in `profiles`
3. Apple Push Notification: serve certificato APNs dal Developer account
4. Android: serve FCM project (gratis Google)
5. **Edge Functions trigger su database events**:
   - Nuovo messaggio → push al destinatario
   - Nuovo preventivo → push al cliente
   - Preventivo accettato → push all'officina
   - Pagamento ricevuto → push all'officina
   - Prenotazione accettata/rifiutata → push al cliente
   - Recensione ricevuta → push all'officina

### ❌ DA FARE — Native features mancanti

1. **Geolocation reale** (`expo-location` già in deps):
   - Permesso al primo accesso lista officine
   - `useUserLocation` hook che ritorna `{lat, lng}` reale
   - Distanza vera con `src/utils/distance.ts`
2. **Mappa officina** (`react-native-maps` già in deps):
   - Integrare in `WorkshopDetailScreen`
   - Tasto "Apri in Google/Apple Maps" → deep link `maps://` o `https://maps.google.com/?q=...`
3. **Deep linking** (`expo-linking` già in deps):
   - Schema `nvmcars://quote/abc123` → apre QuoteDetail
   - Configurare in navigation linking config
4. **App Tracking Transparency** iOS (richiesto anche se non tracci):
   - `expo-tracking-transparency` plugin
   - Prompt al primo launch

### ❌ DA FARE — Pro features

Round 2B non ancora iniziato:
1. **Prezzo per marca/modello** nel listino officina (richiesta esplicita founder):
   - Estendere data model: `workshop_services` ha override `byBrand` e `byModel`
   - UI in `ProPriceListScreen`: per ogni servizio, sotto al "Prezzo base" lista di override "+aggiungi per marca / modello"
   - Resolver client: `getPrice(workshop, service, car)` → cerca override modello → marca → base
   - Mostra al cliente badge "Prezzo specifico per la tua auto" se c'è override
2. **Pro Dashboard** revisione (vedi `ProDashboardScreen` — controllare cosa manca)
3. **Pro Edit Workshop / Calendar** — vedi punto Backend, oggi sono finti

### ❌ DA FARE — UX polish

19 stringhe italiane hardcoded (audit precedente, da spostare in i18n):
- `BookingFormScreen` linee 51, 70, 71, 74, 78, 107, 136, 153, 156, 163
- `AddCarScreen` linee 69-70
- `AddReviewScreen` linea 54
- `ChatScreen` linea 76 (risposta automatica "Grazie del messaggio...")
- `PaymentScreen` linee 49, 69-73
- `PaymentSuccessScreen` linea 67
- `QuoteDetailScreen` linee 34, 105
- `ProCalendarScreen` linee 67, 77-78
- `ProEditWorkshopScreen` linee 45, 64
- `LoginScreen` linea 37

Altro polish:
- Splash screen custom (oggi default Expo)
- App icon definitiva 1024×1024 + adaptive icon Android (foreground + background)
- Loading skeleton invece di spinner generico
- Error states espliciti (no rete, server down, sessione scaduta)
- Pull-to-refresh nelle liste
- Haptic feedback su azioni importanti (`expo-haptics`)

### ❌ DA FARE — Account developer + asset store

#### Alberto deve fare:
- **Apple Developer Program** €99/anno (24-48h verifica)
- **Google Play Console** €25 una volta (1-2 giorni)
- **Dominio nvmcars.it** registrato
- **Email** `support@nvmcars.it` e `privacy@nvmcars.it` attive
- **Sito** anche solo landing page con link a Privacy + Terms

#### Asset che servono:
- Icona 1024×1024 (PNG, no trasparenza, no angoli arrotondati per iOS)
- Adaptive icon Android (foreground PNG 1024×1024 + background color)
- Screenshot **iOS**: 3 device size (6.7" / 5.5" / iPad 12.9") × 3-5 schermate
- Screenshot **Android**: 2 phone size + 1 tablet
- Feature graphic Play Store 1024×500
- Descrizione breve (80 char) + lunga (4000 char) IT + EN
- Categorie store + keywords ASO

---

## 5. Distribuzione: iOS E Android

L'app deve girare bene su **entrambi**. Non c'è codice iOS-only o Android-only nel codebase.

### Test su dispositivo personale prima di pubblicare

#### Iter di test (3 livelli)

##### Livello 1 — Expo Go (gratis, immediato)
Funziona ORA per testing UI. Non funziona per: Stripe SDK, push notifications, login Apple.
- iPhone: App Store → "Expo Go" → installa → scansiona QR fotocamera
- Android: Play Store → "Expo Go" → installa → scansiona QR dentro l'app
- Comando: `npx expo start --tunnel` (più lento ma funziona ovunque)

##### Livello 2 — Development Build (quando integriamo Stripe/push)
- Build custom con `eas build --profile development --platform ios` (richiede Apple Dev attivo)
- Build custom con `eas build --profile development --platform android` (gratis, output APK)
- Installa una volta sul telefono → poi iterare codice JS è veloce come Expo Go

##### Livello 3 — Production-like
- **iOS** → **TestFlight**:
  - `eas build --profile production --platform ios`
  - `eas submit -p ios` upload automatico ad App Store Connect
  - Invitare via TestFlight (email Alberto)
  - Alberto installa l'app come da App Store
- **Android** → 2 opzioni:
  - Opzione A (più veloce): `eas build --profile preview --platform android` → output APK → Alberto scarica e installa direttamente sul telefono (deve abilitare "fonti sconosciute")
  - Opzione B (più "vera"): `eas submit -p android --track internal` → Play Console Internal Testing → Alberto installa via Play Store

**Per il primo test 360° del founder**: useremo **TestFlight** per iPhone e **APK diretto** per Android. Più rapido e niente attesa store approval.

### Pubblicazione finale (SOLO con permesso esplicito)

- iOS: App Store review ~24-48h (a volte più)
- Android: Play Store review ~1-3 giorni (più veloce)
- Allinearli per uscire insieme

---

## 6. Regole business importanti (NON SCORDARLE)

1. **Lookup targa**: ogni utente ha **1 sola** chiamata API gratis per tutto il suo account. Implementato lato client in `useCarStore.canUsePlateLookup()`. Deve essere **ribadito anche lato server** nell'Edge Function (controllare `plate_lookups` table). Auto successive → modalità manuale obbligatoria.

2. **Commissione 2%**: solo se il cliente paga in-app. Il preventivo include `commission_fee_pct` (default 0.020). Se cliente paga in officina → 0% commissione, ma niente garanzia di trasferimento Nvmcars.

3. **Onboarding professionali è "by invite"**: serve `inviteCode` valido per registrarsi come pro. Oggi hardcoded in `src/data/inviteCodes.ts`. In backend va in tabella `invite_codes` (già nello schema).

4. **GDPR / Italia**:
   - Server Supabase EU obbligatorio (Frankfurt)
   - Privacy Policy + Terms accessibili in-app E pubblicati su sito
   - Tasto "Elimina account" obbligatorio per Apple
   - Esportazione dati obbligatoria per GDPR
   - Fatture conservate 10 anni per legge fiscale italiana (nota già in Terms)

5. **Foro competente**: Tribunale di Milano (già nei Terms)

---

## 7. Cosa Alberto deve fare PRIMA che si possa procedere

Sono **3 cose**, in ordine di priorità per sbloccare lavoro:

### 🟢 Adesso (15 min totali)
1. **Crea progetto Supabase** → https://supabase.com → New project → name `nvmcars` → region **Frankfurt eu-central-1** → password forte
2. Nel SQL editor del progetto, esegui in ordine: `0001_initial_schema.sql`, `0002_rls_policies.sql`, `0003_storage_buckets.sql`
3. Project Settings → API → copia **URL** + **anon key** → **mandami in chat**

### 🟡 Stasera / domani
4. **Apple Developer Program** €99 — https://developer.apple.com/programs/enroll/ — verifica 24-48h
5. **Google Play Console** €25 — https://play.google.com/console/signup — verifica 1-2 giorni
6. **Stripe Connect** registrazione — https://stripe.com (in Test mode per iniziare)

### 🔵 Quando hai tempo
7. **Targato.it** — account + acquista pacchetto 300-500 lookups (€30-50)
8. **Dominio nvmcars.it** + email support@/privacy@
9. **Branding finale**: icona 1024×1024, screenshot demo, descrizione store

---

## 8. Roadmap per il prossimo Claude

**Round 2B** (prossimo):
- Prezzi per marca/modello: extend data model + UI + resolver

**Round 3**: Backend live
- Solo quando Alberto manda URL+anon key Supabase
- Migrare tutti gli store + persistenza pro

**Round 4**: Pagamenti
- Solo quando Stripe attivo
- Edge Functions + PaymentSheet RN SDK

**Round 5**: Push + native polish
- expo-notifications
- expo-location reale
- react-native-maps integrata
- Deep linking

**Round 6**: Pre-pubblicazione
- Splash + icona definitiva
- Asset store
- Sentry crash reporting
- Test 360° su entrambi i device

**Round 7**: Build TestFlight (iOS) + APK (Android)
- Solo con Apple Developer attivo
- Test fisico dal founder
- Iterate sui bug

**Round 8**: Submission store (solo con OK esplicito del founder)

---

## 9. File di riferimento rapido

| Categoria | Path |
|---|---|
| App entry | `App.tsx` |
| Config Expo | `app.json` |
| Navigation root | `src/navigation/RootNavigator.tsx` |
| Param types | `src/navigation/types.ts` |
| Tema | `src/store/useThemeStore.ts`, `src/theme/colors.ts` |
| i18n | `src/i18n/it.ts`, `src/i18n/en.ts`, `src/i18n/index.ts` |
| Mock data | `src/data/workshops.ts`, `src/data/services.ts`, `src/data/carBrands.ts`, `src/data/plateLookup.ts`, `src/data/inviteCodes.ts` |
| Schema backend | `supabase/migrations/*.sql` |
| Setup guide founder | `supabase/README.md` |
| Compliance screens | `src/screens/legal/*.tsx` |
| Wipe + export | `src/lib/wipeUserData.ts` |
| Supabase client stub | `src/lib/supabase.ts` |
| Keyboard helper | `src/components/KAV.tsx` |
| Media picker | `src/utils/mediaPicker.ts` |
| Distance util | `src/utils/distance.ts` |

---

## 10. Comandi utili

```bash
# Dev server (con QR per Expo Go)
npx expo start --tunnel

# Typecheck (deve uscire 0)
npx tsc --noEmit

# Reset metro cache (se cambi deps o config)
npx expo start --clear

# Build EAS development (quando serviranno Stripe/push)
eas build --profile development --platform ios
eas build --profile development --platform android

# Build EAS preview (APK Android scaricabile)
eas build --profile preview --platform android

# Build EAS production
eas build --profile production --platform all
eas submit -p ios
eas submit -p android --track internal
```

---

## 11. Come iniziare la prossima sessione

Quando Alberto apre nuova chat e dice "leggi HANDOFF.md", il nuovo Claude deve:

1. Leggere questo file integralmente
2. Fare `git log --oneline -5` per vedere ultimi commit
3. Fare `npx tsc --noEmit` per verificare che tutto compili (deve uscire 0)
4. **Chiedere ad Alberto se ha già i 3 signup fatti** (Supabase / Apple Dev / Stripe)
5. Se sì → procedere col Round corrispondente
6. Se no → continuare il polish del frontend (Round 2B: prezzi marca/modello, o le 19 stringhe i18n)

**NON pubblicare niente negli store senza permesso esplicito di Alberto.**
**NON creare PR a meno che richiesta esplicitamente.**
**Commit + push su `claude/nvmcars-mobile-app-setup-Vle5S` dopo ogni Round.**

---

## 12. Ultima nota

Il founder è italiano, scrive in italiano (a volte con errori di battitura), preferisce risposte concise e action-oriented in italiano. Tecnico ma non sviluppatore: vuole dettagli quando chiede ma non un wall of text non richiesto. È pragmatico: ha già preso decisioni grosse (stack, modello business, mercato), ora vuole eseguire.

Il suo obiettivo emotivo: vedere l'app finita sul suo iPhone e Android **funzionante al 100%** prima di pubblicare. Da lì decide tempistiche.

**Buon lavoro.**
