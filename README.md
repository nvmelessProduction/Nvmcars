# Nvmcars 🚗

App mobile (iOS + Android) per la prenotazione e il confronto di prezzi di servizi di manutenzione auto. MVP per l'area di **Cerveteri / Ladispoli (RM)**.

> Risolviamo i problemi della tua auto in modo invisibile e senza stress.

---

## ⚙️ Stack tecnologico

| Area | Tecnologia |
|---|---|
| Framework | **React Native + Expo SDK 52** |
| Linguaggio | **TypeScript** |
| Navigazione | React Navigation (bottom-tabs + native-stack) |
| Stili | **NativeWind v2** + theme provider (dark mode + light) |
| Animazioni | **react-native-reanimated** (fade-in, scale on press, micro-interactions) |
| State | **Zustand** + AsyncStorage (persistenza) |
| Validazione form | Zod |
| Mappe / GPS | react-native-maps + expo-location |
| i18n | Sistema interno IT/EN |
| Backend | **Supabase** (Postgres + Auth + Storage + Edge Functions, region EU) |
| Pagamenti | **Stripe Connect Express** (commissione 2%) |

---

## ✨ Funzionalità presenti

### 🚦 Globale
- **Doppio profilo**: Cliente / Professionista, con UI completamente diverse.
- **Dark mode** automatico (segue il sistema) o forzato a light/dark.
- **i18n IT / EN** con switch in Impostazioni.
- **Animazioni** Reanimated su bottoni, card e transizioni.
- **Onboarding tutorial** swipeable (4 pagine) al primo avvio.

### 👤 Lato Cliente — 5 tab bottom

#### 🏠 Home
- Saluto personalizzato.
- Quick-card "La mia auto" con targa e modello (o CTA "Aggiungi auto").
- Griglia 6 servizi rapidi (Tagliando, Cambio Gomme, Carrozzeria, Batteria, Freni, Revisione).
- Bottone "Officine vicino a me".

#### 🚗 La mia auto (dal profilo)
- **Inserimento targa** con form completo: marca, modello, anno, alimentazione, cilindrata, soprannome.
- Catalogo 10 marche × ~4 modelli = 40+ veicoli mock.
- Calcolo automatico della **categoria auto** (City / Compact / Sedan / SUV / Premium).
- **Listino prezzi adattato** ad ogni cliente sulla base della categoria della sua auto (es. tagliando 89 € su una Fiat Panda, 130 € su una BMW X3).
- Gestione multi-auto con auto attiva selezionabile.

#### 🔍 Lista officine
- Toggle **Lista / Mappa** (con marker reali react-native-maps).
- **Filtri**: ordinamento (distanza / prezzo / rating) + città (Cerveteri / Ladispoli / tutte).
- Card officina con foto, prezzo dinamico per la tua auto, distanza, rating, stato Aperto/Chiuso in tempo reale, cuoricino preferiti.

#### 📅 Le mie prenotazioni
- Tab "In corso" / "Storico".
- Dettaglio prenotazione con stato, prezzo, messaggio, data programmata.
- Azioni: contatta su WhatsApp, annulla, lascia recensione (se completata).

#### ❤️ Preferite
- Lista officine salvate con cuoricino.

#### 🔔 Notifiche
- Notifiche per: prenotazione accettata, rifiutata, completata, recensione richiesta, promo.
- Badge con contatore non lette sulla tab.
- "Segna tutte come lette".

#### 👤 Profilo + Impostazioni
- Dati personali, gestione auto, impostazioni, logout.
- **Impostazioni**: tema (auto/chiaro/scuro), lingua (IT/EN), about/versione.

#### 📋 Dettaglio officina
- Foto, nome, indirizzo, stato aperto/chiuso, descrizione, orari settimanali completi.
- **Listino completo** con prezzo personalizzato per la tua auto + prezzo standard barrato.
- Lista recensioni clienti.
- Bottoni: **Chat in-app** (con risposte mock) + **Prenota**.

#### 💬 Chat in-app
- UI chat completa con bolle messaggi, timestamp.
- Risposta automatica mock dell'officina (per simulare l'esperienza).

#### ✅ Form prenotazione
- Riepilogo servizio + officina.
- **Prezzo finale** calcolato sulla categoria della tua auto.
- Messaggio libero.
- Doppia conferma: solo in-app OPPURE in-app + WhatsApp.

#### ⭐ Recensione
- Rating interattivo a 5 stelle.
- Commento libero.

### 🔧 Lato Professionista — 5 tab bottom

#### 📊 Dashboard
- Statistiche rapide: nuove richieste, confermate, rating medio, ricavi stimati.
- Anteprima ultime 3 recensioni.
- Link a Statistiche dettagliate.

#### 📊 Statistiche dettagliate
- **Conversion rate** con barra di progresso.
- **Grafico settimanale** delle richieste (7 giorni).
- **Top servizi richiesti** con barre proporzionali.

#### 📨 Richieste
- Tab "In attesa" / "Confermate" / "Completate" / "Tutte".
- Per ogni richiesta: servizio, cliente, messaggio, prezzo.
- Azioni: **Accetta** / **Rifiuta** / **Apri chat** / **Segna completata**.
- Le azioni triggherano automaticamente notifiche al cliente.

#### 💶 Listino self-service
- Tutti i 10 servizi disponibili come toggle ATTIVO/OFF.
- Editor inline del prezzo base per ciascun servizio attivo.

#### 🗓️ Calendario disponibilità
- Calendario mensile interattivo con navigazione tra mesi.
- Tocca un giorno per marcarlo come **chiuso** (cerchio rosso).
- Indicatore "Oggi" (bordo accent).
- Salvataggio disponibilità.

#### 👤 Profilo + Impostazioni
- Dati profilo officina, modifica officina, settings, logout.
- **Modifica officina**: nome, indirizzo, telefono, descrizione.

---

## 🚀 Come farlo girare in locale

### 1. Prerequisiti
- **Node.js >= 20 LTS**
- **App Expo Go** sul telefono: [iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. Clona e installa (Windows PowerShell)

Se hai già il progetto e devi solo aggiornarlo:

```powershell
cd C:\Users\alber\Documents\Nvmcars
git fetch origin
git reset --hard origin/main
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
```

Se clone fresh:

```bash
git clone <url-repo> Nvmcars
cd Nvmcars
git checkout main
npm install
```

> ⏱️ L'install dura 2-4 min e installa ~900 pacchetti — è normale.

### 3. Avvia

```bash
npx expo start
```

Quando vedi il QR code, **premi `s`** per passare in modalità Expo Go.

Poi:
- **iPhone**: Fotocamera nativa → inquadra QR → tocca la notifica.
- **Android**: Apri Expo Go → "Scan QR code".

### 4. Per generare l'APK di test

```bash
eas build --platform android --profile preview
```

(Devi essere loggato con `eas login`. La build dura ~10 min, alla fine ti dà un link per scaricare l'`.apk`.)

---

## 🧪 Guida di test passo-passo

### 🟢 Test 1 — Onboarding + scelta ruolo
1. Apri l'app → vedi le 4 slide swipeable dell'onboarding (puoi premere "Salta").
2. Tocca "Iniziamo" sull'ultima.
3. Schermata "Benvenuto, come vuoi usare Nvmcars?".

### 🚗 Test 2 — Flusso Cliente completo
1. Tocca **"Sono un Cliente"** → compila il form (nome, email, telefono, password >= 6) → "Crea account".
2. Atterri sulla **Home** con saluto personalizzato.
3. Tocca la card azzurra **"Aggiungi la tua auto"**.
4. Inserisci targa (es. `AB123CD`), seleziona marca (es. Fiat) → modello (es. Panda), anno, cilindrata, alimentazione, soprannome opzionale → "Salva la mia auto".
5. Torni in Home: ora la card mostra "Fiat Panda · AB123CD".
6. Tocca **"Tagliando"** → vedi la lista officine ordinata per distanza.
7. **Toggle Mappa**: passa alla vista mappa con marker.
8. Filtra per **Cerveteri** e ordina per **Prezzo**.
9. Tocca un'officina → vedi il dettaglio con prezzo **adattato alla tua Panda** (City car → -15% rispetto al prezzo standard barrato).
10. Tocca il **cuoricino** in alto a destra sulla foto → l'officina viene aggiunta ai preferiti.
11. Scrolla giù → vedi le recensioni di altri clienti.
12. Tocca **"Prenota"** → form con prezzo finale → messaggio opzionale → "Conferma e invia richiesta".
13. Vai sulla tab **Preferite** → vedi l'officina salvata.
14. Vai sulla tab **Prenotazioni** → vedi 3 prenotazioni demo + la tua appena creata.
15. Apri una prenotazione completata → tocca "Lascia una recensione" → 5 stelle + commento → "Pubblica".
16. Vai sulla tab **Notifiche** → vedi le notifiche con badge → "Segna tutte come lette".
17. Vai sulla tab **Profilo** → tocca **Impostazioni** → cambia **Tema** in "Scuro" → l'app diventa dark.
18. Cambia **Lingua** in "English" → tutta l'UI passa in inglese istantaneamente.

### 🔧 Test 3 — Flusso Professionista
1. Profilo → Logout → "Sono un Professionista".
2. Codice invito: **`NVM-CRV-A4F9`** (Cerveteri) o **`NVM-LAD-D33M`** (Ladispoli).
3. Compila i dati e P.IVA (11 cifre) → "Verifica codice e registrati".
4. Atterri sulla **Dashboard Pro**: vedi statistiche (nuove richieste, confermate, rating, ricavi).
5. Tocca "Vai a statistiche dettagliate" → vedi conversion rate, grafico settimanale, top servizi.
6. Vai sulla tab **Richieste** → filtro "In attesa" → vedi la richiesta inviata dal cliente nel Test 2 (se hai fatto la prenotazione).
7. Tocca **Accetta** → la richiesta passa a "Confermata" → il cliente riceverà una notifica.
8. Filtra **Confermate** → tocca **💬 Chat** → invia un messaggio al cliente.
9. Tocca **Segna completata** → il cliente riceve la notifica "Lascia una recensione".
10. Vai sulla tab **Listino** → toggle ON/OFF dei servizi, modifica un prezzo, salva.
11. Vai sulla tab **Calendario** → tocca alcuni giorni futuri per marcarli chiusi → "Salva disponibilità".
12. Vai sulla tab **Profilo** → tocca **Modifica officina** → cambia descrizione → Salva.

### 💬 Test 4 — Chat bidirezionale (richiede 2 device o 2 sessioni)
1. Sul telefono A: login come Cliente → apri dettaglio officina → tocca **"Chatta in app"** → manda un messaggio. L'officina risponde automaticamente dopo 1 secondo.
2. Sul telefono B: login come Pro → tab Richieste → filtro Confermate → tocca **💬 Chat** sulla richiesta → vedi i messaggi del cliente → rispondi.

> 💡 **Nota**: la chat funziona via store locale (Zustand persistito). I messaggi tra cliente e pro sono visibili solo sullo stesso dispositivo. Per chat real-time tra device serve Firebase Firestore (M2 della roadmap).

### 🌙 Test 5 — Dark mode + i18n
1. Impostazioni → Tema "Scuro" → verifica che tutte le schermate (Home, Lista, Dettaglio, Profilo, Pro Dashboard, ecc.) abbiano colori dark coerenti.
2. Cambia lingua in English → verifica che le label cambino in tempo reale senza ricaricare l'app.

---

## 🔐 Codici invito di test

| Codice | Regione |
|---|---|
| `NVM-CRV-A4F9` | Cerveteri |
| `NVM-CRV-B72X` | Cerveteri |
| `NVM-CRV-C81K` | Cerveteri |
| `NVM-LAD-D33M` | Ladispoli |
| `NVM-LAD-E55Q` | Ladispoli |
| `NVM-LAD-F09P` | Ladispoli |

Ogni codice si "consuma" dopo l'uso (validazione one-shot).

---

## 🗂️ Struttura del progetto

```
Nvmcars/
├── App.tsx
├── app.json · babel.config.js · metro.config.js · tailwind.config.js
├── eas.json · .npmrc
└── src/
    ├── components/         # PrimaryButton, Card, TextField, WorkshopCard,
    │                       # ServiceChip, RatingStars, StatCard, EmptyState,
    │                       # ScreenContainer
    ├── data/               # workshops, services, carBrands, inviteCodes
    ├── hooks/              # useUserLocation
    ├── i18n/               # it.ts + en.ts + index.ts
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   ├── AuthNavigator.tsx
    │   ├── CustomerNavigator.tsx  (bottom tabs)
    │   ├── ProNavigator.tsx       (bottom tabs)
    │   ├── types.ts
    │   └── stacks/         # 10 stack file (5 customer + 5 pro)
    ├── screens/
    │   ├── auth/           # Onboarding tutorial, RoleSelection, Login,
    │   │                   # RegisterCustomer, RegisterProfessional
    │   ├── customer/       # Home, WorkshopList (map+filtri), WorkshopDetail
    │   │                   # (recensioni), MyCar, AddCar, MyBookings,
    │   │                   # MyBookingDetail, BookingForm, Favorites,
    │   │                   # Notifications, Chat, AddReview, Profile, Settings
    │   └── professional/   # ProDashboard, ProStats, ProRequests, ProChat,
    │                       # ProPriceList, ProCalendar, ProEditWorkshop,
    │                       # ProProfile, ProSettings
    ├── store/              # 9 store Zustand (auth, car, favorites, bookings,
    │                       #   notifications, reviews, chat, theme, language)
    ├── theme/              # lightColors + darkColors
    ├── types/              # tutti i tipi TS condivisi
    └── utils/              # whatsapp deep-link, haversine distance
```

---

## 🛣️ Roadmap dopo il frontend

Il frontend è completo (mock-driven). Le milestone successive aggiungono il backend reale:

- [ ] **M1 — Firebase Auth + Firestore** per persistenza reale e multi-device.
- [ ] **M2 — Cloud Functions** per validazione server-side dei codici invito.
- [ ] **M3 — Push notifications** (EAS push) per pro e clienti.
- [ ] **M4 — Pubblicazione store** (EAS Build production → Play Store).
- [ ] **M5 — Pagamenti in-app** (Stripe) per acconto prenotazione.
- [ ] **M6 — Branding finale** (logo, icona, splash personalizzati).

---

## 💰 Costi pubblicazione (riferimento)

- **Apple Developer Program**: 99 USD / anno.
- **Google Play Console**: 25 USD una tantum.
- **Expo / EAS Build**: free tier sufficiente per MVP.
