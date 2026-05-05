# Nvmcars 🚗

App mobile (iOS + Android) per la prenotazione e il confronto di prezzi di servizi di manutenzione auto. MVP per l'area di **Cerveteri / Ladispoli (RM)**.

> Risolviamo i problemi della tua auto in modo invisibile e senza stress.

---

## ⚙️ Stack tecnologico

| Area | Tecnologia |
|---|---|
| Framework | **React Native + Expo SDK 52** |
| Linguaggio | **TypeScript** |
| Navigazione | React Navigation (native-stack) |
| Stili | **NativeWind** (Tailwind CSS per RN) |
| State | **Zustand** + AsyncStorage (persistenza) |
| Validazione form | Zod |
| Mappe / GPS | react-native-maps + expo-location |
| Backend (futuro) | Firebase Auth + Firestore |

---

## ✨ Funzionalità MVP

### 👥 Doppio profilo
- **Cliente**: registrazione standard (email, nome, telefono, password).
- **Professionista**: registrazione **protetta da codice invito** (es. `NVM-CRV-A4F9`).

### 🚗 Lato Cliente
- Onboarding e selezione ruolo.
- Home con servizi rapidi (Tagliando, Cambio Gomme, Carrozzeria, Batteria, Freni, Revisione).
- Lista officine con prezzo, distanza, rating + filtri (distanza / prezzo / rating).
- Dettaglio officina con listino prezzi.
- **Prenotazione via WhatsApp** in un tap.
- Profilo personale con logout.

### 🔧 Lato Professionista
- Dashboard con statistiche.
- Lista richieste ricevute (mock).
- Profilo officina con logout.

---

## 🚀 Come farlo girare in locale

### 1. Prerequisiti
Devi avere installati:
- **Node.js >= 20 LTS** ([scaricalo qui](https://nodejs.org)).
- **npm** (incluso con Node).
- **App Expo Go** sul tuo telefono ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).

Verifica:
```bash
node -v   # deve stampare v20 o superiore
npm -v
```

### 2. Clona e installa

```bash
git clone <url-del-repo> Nvmcars
cd Nvmcars
git checkout claude/nvmcars-mobile-app-setup-Vle5S
npm install
```

> ⏱️ Il primo `npm install` può durare 2-4 minuti perché Expo + React Native scaricano molte dipendenze.

### 3. Avvia il dev server

```bash
npx expo start
```

Si aprirà un terminale interattivo con un **QR code**.

### 4. Apri l'app sul telefono
- **iPhone**: apri la **fotocamera** → inquadra il QR → tocca la notifica per aprire in Expo Go.
- **Android**: apri **Expo Go** → tocca *"Scan QR code"* → inquadra il QR.

> 💡 PC e telefono devono essere sulla **stessa rete Wi-Fi**.
> Se non funziona, premi `s` nel terminale Expo per passare in modalità "tunnel" (più lenta ma funziona ovunque).

### 5. Hot reload
Modifica un qualsiasi file `.tsx` e salvalo: l'app si aggiorna sul telefono in <1 secondo. Se qualcosa va storto, premi `r` nel terminale per ricaricare manualmente.

---

## 🧪 Come testare i flussi

### Flusso Cliente
1. Apri l'app → vedi l'onboarding → tap **"Iniziamo"**.
2. Tap **"Sono un Cliente"** → compila email, nome, telefono, password → tap **"Crea account"**.
3. Atterri sulla Home → tap su un servizio (es. **Tagliando**) o su **"Officine vicino a me"**.
4. Vedi la lista ordinabile per distanza/prezzo/rating.
5. Tap su un'officina → vedi dettaglio + listino prezzi.
6. Tap **"Prenota su WhatsApp"** → si apre WhatsApp con messaggio precompilato.

### Flusso Professionista
1. Onboarding → **"Sono un Professionista"**.
2. Inserisci uno di questi codici invito di test:
   - `NVM-CRV-A4F9` (Cerveteri)
   - `NVM-CRV-B72X` (Cerveteri)
   - `NVM-LAD-D33M` (Ladispoli)
   - `NVM-LAD-E55Q` (Ladispoli)
3. Compila i dati dell'officina + Partita IVA → registrati.
4. Atterri sulla Dashboard professionista.

### Flusso Login (demo)
La schermata Login attualmente mostra un Alert che ti permette di entrare al volo come Cliente o Professionista demo, senza creare un nuovo account. Verrà sostituita con Firebase Auth.

---

## 🗂️ Struttura del progetto

```
Nvmcars/
├── App.tsx                      # entry-point: monta RootNavigator
├── app.json                     # configurazione Expo (permessi, bundle id)
├── babel.config.js              # NativeWind + Reanimated
├── metro.config.js              # NativeWind transformer
├── tailwind.config.js           # tema custom (palette ink/accent)
├── global.css                   # direttive Tailwind
└── src/
    ├── components/              # PrimaryButton, ServiceChip, WorkshopCard…
    ├── data/                    # workshops mock, services, codici invito
    ├── hooks/                   # useUserLocation
    ├── navigation/              # Root/Auth/Customer/Pro Navigator
    ├── screens/
    │   ├── auth/                # Onboarding, RoleSelection, Login, 2× Register
    │   ├── customer/            # Home, WorkshopList, WorkshopDetail, Profile
    │   └── professional/        # Dashboard, Requests, Profile
    ├── store/                   # useAuthStore (Zustand + AsyncStorage)
    ├── theme/                   # palette colori
    ├── types/                   # tipi TS condivisi
    └── utils/                   # whatsapp, distance (haversine)
```

---

## 🔐 Codici invito di test

Per il test MVP locale i codici sono **hardcoded** in `src/data/inviteCodes.ts` e validati lato app. **In produzione** dovranno essere spostati su Firestore + validati da una Cloud Function (vedi roadmap).

| Codice | Regione |
|---|---|
| `NVM-CRV-A4F9` | Cerveteri |
| `NVM-CRV-B72X` | Cerveteri |
| `NVM-CRV-C81K` | Cerveteri |
| `NVM-LAD-D33M` | Ladispoli |
| `NVM-LAD-E55Q` | Ladispoli |
| `NVM-LAD-F09P` | Ladispoli |

---

## 🛣️ Roadmap dopo l'MVP

- [ ] **Firebase Auth** (email + password + recovery).
- [ ] **Firestore** per `users`, `workshops`, `invite_codes`, `requests`.
- [ ] **Cloud Function** per la validazione server-side dei codici invito.
- [ ] Vista **Mappa** con marker delle officine in `WorkshopListScreen`.
- [ ] Push notifications per i professionisti (nuove richieste).
- [ ] Pagamento in-app (anticipo prenotazione).
- [ ] Gestione listino prezzi self-service per i professionisti.
- [ ] Recensioni post-servizio.
- [ ] Build EAS per pubblicazione su App Store + Play Store.

---

## 💰 Costi pubblicazione (per riferimento)

- **Apple Developer Program**: 99 USD / anno (rinnovo annuale).
- **Google Play Console**: 25 USD una tantum.
- **Expo / EAS Build**: free tier sufficiente per l'MVP.

---

## 📝 Note di sviluppo

- Il branch attivo è `claude/nvmcars-mobile-app-setup-Vle5S`.
- L'autenticazione è **mock** (zustand + AsyncStorage). Firebase verrà integrato in una iterazione successiva.
- I dati delle officine sono **mock** in `src/data/workshops.ts` (6 officine reali su Cerveteri/Ladispoli con coordinate plausibili).
- L'app non richiede backend per girare in locale.
