# Audit completo Nvmcars — esito e roadmap

Audit dell'intera app (6 revisioni parallele: auth/navigazione, bookings/quotes/pagamenti,
store/servizi, UI/UX, backend Supabase, i18n). Questo documento elenca **cosa è stato
corretto** e **cosa resta** (con la soluzione consigliata), distinguendo i fix verificabili
in locale da quelli che richiedono backend live (Supabase/Stripe).

Stato build a fine pass: `lint` 0 errori · `typecheck` 0 errori · **50 test** verdi · `expo export` OK.

---

## ✅ Corretto in questo pass

### Correttezza / anti-crash
- `notificationMeta` ora ha un fallback (tipo non mappato non fa crashare le notifiche).
- `AddCarScreen`: accesso difensivo a `CAR_BRANDS[make]` (niente crash su marca assente).
- `ProDashboard`: i contatori "in attesa" e "confermati" includono tutti gli stati equivalenti
  (`requested/pending`, `confirmed/in_progress`) — prima sotto-contava.
- Macchina a stati prenotazioni: `selectSlot` agisce solo da `slot_proposed`;
  `canProComplete` ristretto a `in_progress` (no salto di stato).

### Store / persistenza
- Seed reviews solo in modalità mock (niente recensioni finte mischiate ai dati reali).
- `partialize` su reviews/diy/service-log: non si persiste più `loading` (no blocco in caricamento).

### Backend (migrations)
- **0014**: realtime su `bookings` e `notifications` (prima le sottoscrizioni non scattavano).
- (0012/0013 dalla fase chat: realtime + trigger conversazioni.)

### Servizi (allineamento RLS dopo hardening)
- **Signup professionista riparato**: usa le RPC `validate_invite_code`/`redeem_invite_code`
  invece di leggere `invite_codes` (bloccato dalla RLS → prima il signup falliva sempre).
- `getDac7Status`: legge via RPC `get_my_profile()` (la colonna `dac7_complete` non ha grant diretto).
- `listVisibleWorkshops`: seleziona solo colonne pubbliche (non scarica più `fiscal_data`,
  `owner_data`, `stripe_account_id` in lista).

### UI / UX (più bella, dark-mode safe)
- `WorkshopCard`: nome/città troncati a 1 riga, badge "PROMOSSO" tematico, **placeholder
  immagine** con fallback su errore/foto mancante.
- `TextField`: stato **focus** (bordo accent).
- `PickerSheet`: safe-area inferiore + scrim tematico.
- Chat: etichette di **accessibilità** su allega/invia, glifo "invia" leggibile da disabilitato.
- (Dalla fase chat: separatori data, empty state, stato consegna, keyboard, scroll, upload media.)

---

## ⚠️ Da completare (richiede backend live / scelte di prodotto)

Questi sono bug reali individuati ma **non auto-applicati** perché invasivi e non verificabili
senza Supabase/Stripe attivi. Per ognuno la soluzione consigliata.

### 🔴 Sicurezza / dati
1. **PII officine esposte a livello DB** — `workshops_select_public` (0005) lascia leggere a
   qualunque utente autenticato anche `fiscal_data`, `owner_data`, `stripe_account_id`.
   *Fix consigliato*: spostare quei campi in una tabella `workshop_private` (RLS solo owner)
   **oppure** esporre il browse via una view `v_workshops_public` (security definer, sole colonne
   safe) e revocare la SELECT diretta. Il client già non li richiede più in lista (mitigazione).
2. **Self-assign del ruolo professionista** — `handle_new_user` (0001) si fida di
   `raw_user_meta_data->>'role'`: una signup forgiata può crearsi `role='professional'`.
   *Fix*: `handle_new_user` forza sempre `customer`; l'elevazione a `professional` avviene
   **dentro** `redeem_invite_code` (security definer) dopo aver validato l'invito.
   ⚠️ Va testato sul flusso auth reale (altrimenti rompe il signup pro).
3. **Lista utenti admin** — `adminUsers.listAllRealUsers` legge colonne PII di `profiles`
   ora revocate → ritorna vuoto. *Fix*: edge function service-role gated su `profiles.is_admin`.
4. **Admin legacy con password hardcoded** (`src/data/admins.ts`) — già dietro il flag
   `EXPO_PUBLIC_ENABLE_LEGACY_ADMIN` (off di default). *Fix*: rimuovere del tutto il percorso
   legacy e basarsi solo su `is_admin` server-side. (Richiede conferma: cambia l'accesso admin.)
5. `autodoc_clicks`: l'insert client non setta `user_id` → il rate-limit per-utente non scatta.
   *Fix*: settare `user_id` dalla sessione o passare da edge function.

### 🟠 Pagamenti (flusso Stripe) — verificabile solo con Stripe attivo
6. **Le quote non vengono persistite sul backend**: `createQuoteRemote`/`updateQuoteStatusRemote`
   esistono ma non sono mai chiamate dallo store → il PaymentIntent non trova la quote e il
   pagamento reale ripiega sul mock. *Fix*: in `useQuoteStore.create/setStatus` chiamare le
   funzioni remote quando `isSupabaseConfigured`, usando l'id remoto.
7. **"Pagato" segnato lato client** prima della conferma del webhook (`PaymentScreen`).
   *Fix*: dopo il PaymentSheet andare in stato "in elaborazione" e lasciare che il webhook
   `stripe-webhook` porti la quote a `paid`.
8. "Paga in officina" lascia la quote `accepted` (ri-pagabile). *Fix*: stato terminale dedicato.
9. Le quote `validUntil` scadute restano pagabili. *Fix*: trattarle come non pagabili in UI + edge.
10. `autodoc_product` sulle righe quote non viene scritto in `quote_items` (feature persa lato remoto).
11. `QuoteStatus` (TS) manca `refunded` (presente nel DB). *Fix*: aggiungerlo all'union.

### 🟡 Store / sync
12. **Service-log e promemoria** non si sincronizzano col backend (manca `hydrate` + chiamate
    remote, che però esistono in `services/serviceLog.ts`). *Fix*: aggiungere hydrate + scritture remote.
13. `setServices` (workshops) fa delete+insert non atomico: un insert fallito azzera i prezzi.
    *Fix*: upsert con `onConflict` o RPC transazionale.
14. Notifiche: possibili duplicati tra push ottimistico ed eco realtime; subscription non chiusa al logout.
15. Favorites: `hydrate` non propaga uno svuotamento remoto. *Fix*: il service ritorni `null` su errore.
16. Impersonation admin annullata da `onAuthChange` in modalità Supabase. *Fix*: ignorare il sync durante l'impersonation.

### 🔵 UI/UX rimanenti (rifiniture)
- Colori hardcoded `#10B981/#F59E0B/...` in alcune schermate (`QuoteDetail`, `SubscriptionManage`,
  pillole difficoltà DIY, badge stato pro) → usare `colors.success/warning/danger` per il dark mode.
- Placeholder immagini anche su `WorkshopDetail` e avatar `ProProfile` (come fatto su `WorkshopCard`).
- Estrarre un componente condiviso `ChatComposer` (input chat duplicato) e `ListRow`.
- Stringhe non tradotte in `CustomerProfile`/`PartsSearch` ("FAI DA TE", "Ricambi auto").
- `OnboardingScreen`: aggiungere `onScrollToIndexFailed`.

### Note positive (verificate, nessun bug)
- i18n: parità it/en garantita a compile-time, nessun `t.x` indefinito.
- Matematica commissione (5%×2) e split Stripe Connect corretti.
- Firma webhook Stripe verificata; edge functions con auth + CORS + Zod + rate-limit.
- Nessun hook condizionale residuo; nessun `console.log` di troppo; nessun TODO critico.
