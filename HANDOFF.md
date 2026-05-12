# Nvmcars — Handoff per nuova chat Claude

> **Per il prossimo Claude**: leggi tutto questo prima di toccare codice. È self-contained, non ti serve la cronologia delle chat precedenti.
> **Per Alberto (founder)**: questo è il riassunto di tutto. Aprire nuova chat, dire "leggi HANDOFF.md" e proseguire.

---

## 1. Cos'è Nvmcars

Marketplace italiano che mette in contatto **automobilisti** (Cliente) e **officine** (Professionista).

- Cliente: cerca officina vicina → vede prezzi → prenota → riceve slot → conferma orario → paga (in-app o in officina) → recensisce
- Officina: riceve richieste → propone slot disponibili → conferma con cliente → segna lavorazione in corso → segna completato → riceve pagamento (meno 2% commissione Nvmcars se in-app)
- Sicurezza pagamento: Stripe Connect Express (la commissione 2% trattiene fino a completamento lavoro) — **ancora da integrare**
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
| Pagamenti | **Stripe Connect Express** + commissione 2% | ❌ Mock polished + "in officina" |
| Lookup targa | **Targato.it API** (a consumo €0.10/req) | ❌ Mock 5 targhe |
| Push | expo-notifications | ❌ Zero (notifiche in-app via store sì) |
| Crash | Sentry (free tier) | ❌ Zero |
| Mappe | react-native-maps (presente in deps) | ✅ Lista officine ha modalità mappa |
| Image picker | expo-image-picker (presente) | ✅ Funziona, file locale |

**Target finale**: app pubblicata su **App Store** (iOS) E **Google Play** (Android).

---

## 3. Obiettivo finale dichiarato dal founder

> "Voglio l'app completa al 100%, installata sul mio iPhone E sul mio Android, la testo a fondo, poi decido quando pubblicarla negli store."

NON pubblicare niente senza permesso esplicito. Il founder vuole testare prima.

---

## 4. Stato reale per area (al 2026-05-12, post Round 2-3)

### ✅ FATTO

#### Frontend pro completo
- **Onboarding wizard 6 step** (`ProOnboardingScreen.tsx`):
  - Step 1 titolare: nome, cognome, telefono (validato IT)
  - Step 2 fiscali: ragione sociale, P.IVA (con checksum), CF (con checksum), SDI/PEC, IBAN
  - Step 3 officina: nome, indirizzo, CAP, città, provincia (con validazione sigla), telefono, descrizione (min 30 char), foto multiple
  - Step 4 orari: 7 giorni con orario apri/chiudi/chiuso
  - Step 5 servizi: toggle servizi + prezzo base
  - Step 6 riepilogo + pubblica → status = "active"
- **ProProfileScreen** riprogettata:
  - Header con foto/logo officina
  - Pillola stato: `draft` (warning) / `active` (success)
  - Card "Profilo incompleto" se mancano dati (mostra quali) + CTA "Completa ora"
  - Toggle "Sto accettando richieste" (acceptingRequests)
  - ActionRows: Chat, Modifica officina, Listino, Notifiche, Impostazioni
  - Sezione dati fiscali
- **ProEditWorkshopScreen** persiste su `useWorkshopStore`, foto gallery, validazioni IT, geocoding automatico al salvataggio
- **ProPriceListScreen**: toggle servizi + prezzo base + **override per marca/modello** (modal selezione brand/model)
- **ProCalendarScreen**: tap giorno per chiusura singola + bottom sheet per periodo ferie (from/to/reason)
- **ProRequestsScreen**: filtri (Nuove/Confermate/Storico/Tutte), pull-to-refresh, azioni contestuali:
  - Stato `requested` → tasti "Rifiuta" + "📅 Proponi orari"
  - Stato `confirmed` → tasti "💬 Chat" + "🔧 Inizia lavorazione"
  - Stato `in_progress` → tasto "🏁 Concludi appuntamento" (auto-append a libretto auto cliente)
- **ProProposeSlotsScreen**: UI custom con chip data (oggi/+gg) + chip ora (18 slot 8-18:00) + durata + nota cliente, max 5 slot proposti
- **ProChatsListScreen** come tab dedicata (non più sepolta in Profilo)
- **ProChatScreen** marca conversazione letta lato pro all'apertura
- **ProNotificationsScreen** accessibile da Profile, badge unread
- **ProStatsScreen** aggiornata con nuovi stati booking
- **Bottom tabs pro** nuovo ordine: 📊 Dashboard / 📨 Richieste (badge) / 💬 Chat (badge) / 🗓️ Calendario / 👤 Profilo

#### Frontend cliente completo
- **HomeScreen, RoleSelection, Onboarding 4 slide** invariati
- **Auth screens**: Login, Register Customer, Register Professional (codice invito)
- **WorkshopListScreen**: filtri città + sort distanza/prezzo/rating, modalità mappa, usa `resolvePrice()` per mostrare prezzo specifico
- **WorkshopDetailScreen**:
  - Banner "Officina in pausa" se `acceptingRequests = false`
  - Sezione prezzi con badge "✨ Prezzo specifico per la tua auto" se override marca/modello matcha
  - Prezzo base barrato se override → effetto wow
- **BookingFormScreen** crea richiesta in stato `requested`, manda notifica al pro, banner officina in pausa che disabilita invio
- **MyBookingsScreen**: tab Upcoming/History con stati nuovi inclusi, pull-to-refresh, badge dedicato in tab quando ci sono slot da confermare
- **MyBookingDetailScreen** completa:
  - In `slot_proposed` mostra elenco orari proposti dal pro con CTA "Conferma orario"
  - In `confirmed` mostra appuntamento + reminder
  - In `in_progress` mostra "Lavorazione in corso"
  - In `completed` CTA "Lascia recensione"
  - In `rejected/cancelled_by_pro` mostra motivo
  - Tasti "Contatta officina" e "Annulla" contestuali
- **ChatScreen** marca conversazione letta lato customer all'apertura
- **PaymentScreen** polished:
  - Banner giallo "Pagamento in-app a breve disponibile"
  - Scelta metodo: 💳 Carta (Demo) / 🏪 Paga in officina
  - Carta demo simula 1.6s di processing, "Paga in officina" non fa addebito ma cambia stato quote
- **CarServiceLogScreen** (NUOVA): libretto digitale per auto con storico interventi + sezione promemoria revisione/tagliando
- **Booking completato** → auto-aggiunge entry al libretto auto del cliente
- **NotificationsScreen** cliente: badge unread, mark all read, pull-to-refresh, empty state migliorato
- **Tab cliente** badge dedicato per slot in attesa di conferma (📅) e notifiche (🔔)

#### Compliance Apple/Google
- `src/screens/legal/PrivacyPolicyScreen.tsx` — 6 sezioni GDPR
- `src/screens/legal/TermsOfServiceScreen.tsx` — 7 sezioni
- `src/screens/legal/DataExportScreen.tsx` — esporta JSON via Share sheet (mock)
- `src/screens/legal/DeleteAccountScreen.tsx` — wipe locale + logout (richiesto da Apple)
- `src/lib/wipeUserData.ts` — pulisce AsyncStorage keys, preserva tema/lingua

#### Backend Supabase scritto ma non deployato
File pronti da incollare nel SQL editor (in ordine):
- `supabase/migrations/0001_initial_schema.sql` — 13 tabelle + trigger auto-profile-on-signup
- `supabase/migrations/0002_rls_policies.sql` — Row Level Security base
- `supabase/migrations/0003_storage_buckets.sql` — 3 bucket
- `supabase/migrations/0004_round3_extensions.sql` ⭐ NEW — estensioni: vacations, service_price_overrides, service_log_entries, car_reminders, workshops.fiscal_data/owner_data/photos[]/status/accepting_requests, bookings stati nuovi + proposed_slots, notifications.related_kind, trigger auto-log su booking completed, view v_workshop_completeness
- `supabase/migrations/0005_round3_rls.sql` ⭐ NEW — RLS per le tabelle nuove
- `supabase/README.md` — guida step-by-step aggiornata

**Credenziali Alberto già fornite** (in `.env` locale, gitignored):
- URL: `https://wdfoxsecsgilyixadidp.supabase.co`
- Anon key: `sb_publishable_1KOA9_Jwoplz7OAm-XoQDw_-xzWWm6Z` (formato publishable nuovo, sicuro client-side)

**Da fare nel Round 3 vero**: migrare 11 store zustand → query Supabase (1-2 sessioni dense). Schema è già allineato al codice client.

### ❌ DA FARE — backend (0% live)

Tutto bloccato finché Alberto non crea progetto Supabase + URL + anon key.

Quando arrivano le keys, da migrare:
1. `.env`: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. **Estendere schema SQL** per:
   - Workshop: `fiscal_data` (jsonb), `owner` (jsonb), `photos[]`, `vacations[]`, `status`, `accepting_requests`
   - `service_price_overrides` (tabella nuova)
   - Booking: stati nuovi, `proposed_slots` (jsonb), `proposed_at`, `proposed_note`, `selected_slot_id`, `started_at`, `completed_at`, `cancelled_at`, `cancellation_reason`, `photos[]`
   - Notification.type ampliato
   - `service_log_entries` (tabella nuova)
   - `car_reminders` (tabella nuova)
3. **Migrare 11 store zustand → query Supabase**:
   - `useAuthStore`, `useCarStore`, `useBookingsStore`, `useFavoritesStore`, `useReviewsStore`, `useChatStore`, `useQuoteStore`, `useNotificationsStore`, **`useWorkshopStore`** (nuovo, gestione officina pro), **`useServiceLogStore`** (nuovo, libretto auto)

### ❌ DA FARE — Stripe (0%)

Vedi Round 4 più sotto.

### ❌ DA FARE — Targato.it (0%)

Vedi Round 3 più sotto.

### ❌ DA FARE — Push notifications (0%)

Notifiche **in-app** funzionano via `useNotificationsStore` + helper `notifyEvent()`. Per push reali servono:
1. `expo-notifications` install + config in `app.json`
2. Permesso al primo login → salva `push_token` in `profiles`
3. APNs cert (Apple Dev) + FCM project (Google)
4. Edge Functions trigger su eventi DB

### ❌ DA FARE — Native features

1. **Geolocation reale** (`expo-location` già in deps): `useUserLocation` parzialmente fatto, da rifinire
2. **Mappa officina** in `WorkshopDetailScreen` (oggi solo lista)
3. **Deep linking** schema `nvmcars://`
4. **App Tracking Transparency** iOS

### ❌ DA FARE — Pre-pubblicazione

- Splash screen custom (oggi default Expo)
- App icon definitiva 1024×1024 + adaptive icon Android
- Sentry crash reporting
- Haptic feedback (`expo-haptics`)
- Audit accessibilità completo (font dinamici, contrasto)

---

## 5. Architettura tecnica chiave (NEW)

### Stores zustand persistenti (AsyncStorage)
| Store | Cosa contiene |
|---|---|
| `useAuthStore` | user logged in, hasOnboarded, registrazione |
| `useCarStore` | cars[] con make/model/plate/categoria, plateLookupsUsed (rate-limit) |
| `useWorkshopStore` ⭐ NEW | ownWorkshops record id→Workshop con fiscalData, owner, photos[], vacations[], priceOverrides[], status, acceptingRequests + helper `useOwnWorkshop`, `useResolvedWorkshop`, `missingOnboardingSteps()` |
| `useBookingsStore` | bookings[] con flusso stati esteso + `proposeSlots`, `selectSlot`, `startWork`, `completeWork`, `rejectBooking`, `cancelByCustomer/Pro` |
| `useChatStore` | conversations + messages + `unreadCount` (customer) e `unreadCountPro` separati + `markRead(role)` |
| `useNotificationsStore` | notifications + helper `notifyEvent()` esportato |
| `useServiceLogStore` ⭐ NEW | entries[] (storico interventi auto) + reminders[] (CarReminder) |
| `useQuoteStore` | preventivi |
| `useFavoritesStore` | id officine preferite |
| `useReviewsStore` | recensioni |
| `useThemeStore` / `useLanguageStore` | tema + lingua |

### Resolver prezzo (NEW)
`src/utils/pricing.ts → resolvePrice(workshop, serviceKey, car)` ritorna:
```
{ finalPrice, basePrice, source: "base" | "category" | "brand" | "model", override? }
```
Ordine di priorità: **model override** > **brand override** > **category multiplier** > **base price**.

Usato in: `WorkshopDetailScreen`, `WorkshopListScreen`, `BookingFormScreen`.

### Validatori italiani (NEW)
`src/utils/validators.ts`:
- `validateVAT` (checksum P.IVA 11 cifre)
- `validateCF` (16 char checksum + accetta P.IVA come CF persona giuridica)
- `validateCAP` (5 cifre)
- `validateProvince` (sigla 2 lettere + whitelist 110 province IT)
- `validatePhoneIT` (`+39` opzionale, prefisso 3, 10-11 cifre)
- `validateSDI` (6-7 alfanumerici, opzionale)
- `validatePEC` (email, opzionale)
- `validateIBANIT` (formato IT + 22 char, opzionale)

### Geocode mock (NEW)
`src/utils/geocode.ts → geocodeAddress({address, city, cap})`: 20 città italiane mappate con lat/lng + fallback con jitter. Usato all'onboarding e ad ogni save di `ProEditWorkshopScreen`.

### Booking status meta (NEW)
`src/utils/bookingStatus.ts → statusMeta(status)`: ritorna `{label, color, icon}`. Helper: `canCustomerCancel`, `canProAct`, `canProStart`, `canProComplete`. Backward-compat con i vecchi stati "pending"/"accepted" (migration v2 in `useBookingsStore`).

### Tipi nuovi (`src/types/index.ts`)
- `WorkshopFiscalData`, `WorkshopOwner`, `WorkshopVacation`, `WorkshopStatus`
- `ServicePriceOverride { id, serviceKey, brand?, model?, price }`
- `BookingSlot { id, startAt, durationMinutes }`
- `BookingStatus` esteso: `requested | slot_proposed | confirmed | in_progress | completed | cancelled_by_customer | cancelled_by_pro | rejected` + retro: `pending | accepted`
- `NotificationType` esteso (20+ tipi)
- `ServiceLogEntry`, `CarReminder`, `CarReminderKind`

---

## 6. Regole business importanti (NON SCORDARLE)

1. **Lookup targa**: 1 sola chiamata gratis per utente (rate-limit client `useCarStore.canUsePlateLookup()`; da ribadire server-side).
2. **Commissione 2%**: solo se cliente paga in-app. Mock attuale: "Paga in officina" → 0% commissione.
3. **Onboarding pro by invite**: codice in `src/data/inviteCodes.ts` (hardcoded mock).
4. **GDPR + Italia**: Server Supabase Frankfurt obbligatorio, Privacy+Terms in-app, delete account funzionante, fatture conservate 10 anni.
5. **Foro competente**: Tribunale di Milano (Terms art. 7).
6. **Officina visibile ai clienti SOLO se**: `status === "active"` E `acceptingRequests !== false`. In `WorkshopListScreen` un workshop in `draft` viene filtrato.

---

## 7. Cosa Alberto deve fare PRIMA che si possa procedere

### 🟢 Adesso (15 min totali)
1. ✅ **Progetto Supabase creato** — URL e anon key sono in `.env` locale (gitignored)
2. **Esegui le 5 migrazioni SQL** nel SQL Editor di Supabase in ordine:
   - `0001_initial_schema.sql`
   - `0002_rls_policies.sql`
   - `0003_storage_buckets.sql`
   - `0004_round3_extensions.sql` (NUOVO)
   - `0005_round3_rls.sql` (NUOVO)
3. Verifica nel pannello che le tabelle `workshop_vacations`, `service_price_overrides`, `service_log_entries`, `car_reminders` siano state create.

### 🟡 Stasera / domani
5. **Apple Developer Program** €99 — https://developer.apple.com/programs/enroll/ — verifica 24-48h
6. **Google Play Console** €25 — https://play.google.com/console/signup — verifica 1-2 giorni
7. **Stripe Connect** registrazione — https://stripe.com (Test mode)

### 🔵 Quando hai tempo
8. **Targato.it** — account + pacchetto 300-500 lookups (€30-50)
9. **Dominio nvmcars.it** + email support@/privacy@
10. **Branding finale**: icona, screenshot, descrizione store

---

## 8. Roadmap per il prossimo Claude

**Round 3 — Backend live**:
- Estendere migration SQL per riflettere tipi nuovi (vedi §4)
- Migrare 11 store zustand → Supabase queries + realtime per chat
- Edge Function `plate-lookup` con rate-limit server-side

**Round 4 — Pagamenti Stripe**:
- Edge Function `create-payment-intent` + `stripe-webhook`
- Stripe Connect onboarding officina (Edge Function `create-stripe-account-link`)
- `@stripe/stripe-react-native` SDK
- Sostituire `PaymentScreen` mock con `presentPaymentSheet`

**Round 5 — Push + native polish**:
- expo-notifications con permission + token + edge functions trigger
- expo-location reale
- react-native-maps integrata in `WorkshopDetailScreen`
- Deep linking
- expo-haptics
- ATT iOS

**Round 6 — Pre-pubblicazione**:
- Splash + icona definitiva 1024×1024
- Asset store (screenshot, feature graphic, descrizioni)
- Sentry
- Test 360° entrambi i device

**Round 7 — Build TestFlight (iOS) + APK (Android)**

**Round 8 — Submission store** (solo con OK esplicito)

---

## 9. Cosa testare ORA sul telefono (post Round 2-3)

Quando Alberto fa `npx expo start --tunnel` e apre in Expo Go, testare in ordine:

### Onboarding pro (NUOVO)
1. Registrazione come professionista (codice invito da `inviteCodes.ts`)
2. Profilo si apre con banner giallo "Profilo non completo" → tap "Completa ora"
3. Wizard 6 step: provare i validatori italiani (P.IVA falsa deve dare errore, CF errato idem, CAP non 5 cifre idem, provincia non in lista idem)
4. Step 3 carica foto da galleria (chiede permesso)
5. Step 5 attiva servizi e mette prezzi
6. Step 6 conferma → torna a Profile → ora il banner sparisce, pillola = "ATTIVA" verde

### Listino + override marca/modello (NUOVO)
1. Profile → "Modifica listino"
2. Toggle un servizio + metti prezzo base
3. "+ Aggiungi prezzo personalizzato" → modal:
   - Scegli "Per marca e modello"
   - Seleziona "Fiat" + "Panda"
   - Prezzo override
4. Lista override appare sotto al prezzo base con × per rimuovere

### Flusso prenotazione completo (NUOVO)
1. **Login come cliente** → dovrebbe vedere l'officina che hai pubblicato come pro nella lista (NB: cambia account!)
2. Cliente apre dettaglio officina. Se aveva auto Fiat Panda e hai messo override → vede badge "✨ Prezzo specifico per la tua auto"
3. Cliente clicca su un servizio → BookingForm → "Invia richiesta"
4. **Switch a account pro** → tab Richieste mostra badge con numero
5. Aprire richiesta → tap "📅 Proponi orari"
6. Schermata slot: scegli 2-3 date+ore diverse + nota → "Invia proposta"
7. **Switch a account cliente** → tab Prenotazioni ha badge 📅
8. Apri prenotazione → vedi orari proposti → tap "Conferma orario" su uno
9. **Switch a pro** → richiesta ora è in "Confermate"
10. Pro → "🔧 Inizia lavorazione"
11. Pro → "🏁 Concludi appuntamento"
12. **Cliente** → in libretto auto (My Car → "📋 Storico interventi") deve apparire l'entry auto-aggiunto

### Pagamento mock (POLISHED)
1. Dopo che pro manda preventivo nella chat → cliente lo accetta
2. Cliente "Paga in app" → vede schermata con banner giallo "in-app a breve disponibile"
3. Sceglie "🏪 Paga in officina" → conferma → torna alla home con notifica
4. Oppure prova "💳 Carta (Demo)" con dati finti → simulazione 1.6s → success screen

### Calendario pro + ferie
1. Pro → tab Calendario
2. Tap un giorno futuro → si colora rosso (chiuso)
3. Tap "+ Aggiungi periodo di chiusura" → modal date YYYY-MM-DD
4. Inserisci es. 2026-08-10 → 2026-08-20 + reason "Ferie estive" → appare nella lista

### Pausa officina
1. Pro → Profile → toggle "Sto accettando richieste" → OFF
2. Switch cliente → dettaglio officina mostra banner ⏸️ "Questa officina non accetta richieste"
3. BookingForm → tasto "Invia richiesta" disabilitato

### Notifiche
1. Pro → Profile → "🔔 Notifiche" → lista con badge unread
2. Tap notifica → diventa letta
3. Tab Profilo perde il badge contatore

---

## 10. File chiave (cheat sheet)

| Categoria | Path |
|---|---|
| Tipi | `src/types/index.ts` |
| Validatori IT | `src/utils/validators.ts` |
| Geocode mock | `src/utils/geocode.ts` |
| Resolver prezzo | `src/utils/pricing.ts` |
| Status booking | `src/utils/bookingStatus.ts` |
| Workshop store | `src/store/useWorkshopStore.ts` |
| Service log store | `src/store/useServiceLogStore.ts` |
| Pro onboarding | `src/screens/professional/ProOnboardingScreen.tsx` |
| Pro propose slots | `src/screens/professional/ProProposeSlotsScreen.tsx` |
| Pro notifications | `src/screens/professional/ProNotificationsScreen.tsx` |
| Customer service log | `src/screens/customer/CarServiceLogScreen.tsx` |
| Pro navigator (5 tab) | `src/navigation/ProNavigator.tsx` |
| Pro chat stack | `src/navigation/stacks/ProChatStack.tsx` |
| Migration schema | `supabase/migrations/*.sql` (da estendere) |

---

## 11. Comandi utili

```bash
npx expo start --tunnel    # dev server (QR per Expo Go)
npx tsc --noEmit           # typecheck (deve uscire 0)
npx expo start --clear     # reset metro cache
eas build --profile preview --platform android  # APK Android
```

---

## 12. Note sul prossimo Claude

Quando Alberto apre nuova chat:
1. Leggi tutto questo file
2. `git log --oneline -10` per ultimi commit
3. `npm install` se mancano deps
4. `npx tsc --noEmit` (deve uscire 0)
5. Chiedi ad Alberto: hai signup Supabase/Apple/Stripe?
6. Procedi col Round corrispondente

**NON pubblicare niente negli store senza permesso esplicito.**
**NON creare PR a meno che richiesta esplicitamente.**
**Commit + push su `claude/nvmcars-mobile-app-setup-Vle5S` dopo ogni Round.**

---

## 13. Ultima nota

Il founder è italiano, scrive in italiano (a volte con errori di battitura), preferisce risposte concise e action-oriented in italiano. Vuole l'app **perfetta** prima di pubblicare. Pragmatico: stack già scelto, modello business chiaro, ora esecuzione.

Obiettivo emotivo: vedere l'app finita sul suo iPhone e Android **funzionante al 100%**.

**Buon lavoro.**
