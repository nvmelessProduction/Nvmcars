# 📱 Installare Nvmcars sul tuo iPhone

Hai un account **Apple Developer**: perfetto, è tutto ciò che serve. Qui sotto due strade.
La **Strada A (Expo Go)** è per provare l'app in 5 minuti adesso. La **Strada B (build EAS)**
è per avere l'app *vera* installata sul telefono, con icona in home, come la scaricassi dallo store.

> Dati dell'app già configurati nel progetto:
> - Nome: **Nvmcars** · slug `nvmcars`
> - Bundle ID iOS: **`com.nvmcars.app`**
> - Versione: `1.0.0`

---

## 🟢 Strada A — Provarla SUBITO con Expo Go (nessuna build)

Serve solo per un test rapido. In Expo Go i pagamenti Stripe sono disattivati automaticamente
(l'app ripiega sulla modalità demo); tutto il resto funziona.

1. Sul **Mac/PC**, dentro la cartella del progetto:
   ```bash
   npm install
   npx expo start
   ```
2. Sull'**iPhone** installa **Expo Go** dall'App Store.
3. Apri la **Fotocamera** dell'iPhone e inquadra il **QR code** che appare nel terminale →
   tocca la notifica → l'app si apre dentro Expo Go.

> Se il QR non parte, nel terminale premi `s` per passare alla modalità Expo Go, poi premi `r` per ricaricare.

---

## 🔵 Strada B — Installazione VERA sull'iPhone (build EAS)

Questo produce un'app firmata col tuo Apple Developer e installabile sul telefono.
Ti serve perché Nvmcars usa moduli nativi (mappe, Stripe, secure-store) che vanno oltre Expo Go.

### Passo 0 — Strumenti (una volta sola)
```bash
npm install -g eas-cli
eas login            # accedi con il tuo account Expo (creane uno gratis se non ce l'hai)
```

### Passo 1 — Collega il progetto a EAS
```bash
eas init
```
Questo crea il progetto su Expo e **riempie automaticamente** il `projectId` in `app.json`
(adesso è un placeholder). Conferma quando chiede di creare il progetto.

### Passo 2 — Inserisci le chiavi (Supabase + Stripe)
Senza chiavi l'app gira lo stesso in **modalità demo**. Per usare il backend reale, registra
le variabili su EAS (così finiscono nella build cloud):
```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://TUOPROGETTO.supabase.co" --environment production
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "LA_TUA_ANON_KEY" --environment production
eas env:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_live_o_test_..." --environment production
```
(Le trovi in Supabase → Project Settings → API, e in Stripe → Developers → API keys.)

### Passo 3a — La via più semplice per UN iPhone (build "preview" ad-hoc)
1. Registra il tuo iPhone presso il tuo team Apple:
   ```bash
   eas device:create
   ```
   Ti dà un link/QR: aprilo **dal telefono** e installa il profilo di registrazione.
2. Lancia la build:
   ```bash
   eas build --platform ios --profile preview
   ```
   EAS gestisce **da solo** certificati e provisioning (ti chiede solo le credenziali Apple la prima volta).
3. A fine build (~10–20 min) ricevi un **link**: aprilo dall'iPhone e tocca **Installa**.
   L'app compare in home. ✅

### Passo 3b — In alternativa: TestFlight (consigliato per più tester / pre-store)
1. Su [App Store Connect](https://appstoreconnect.apple.com) crea l'app con bundle id `com.nvmcars.app`.
2. Compila i 3 valori in `eas.json` → `submit.production.ios` (ora sono placeholder):
   - `appleId`: la tua email Apple Developer
   - `appleTeamId`: lo trovi su [Apple Developer → Membership](https://developer.apple.com/account#MembershipDetailsCard)
   - `ascAppId`: l'Apple ID numerico dell'app (in App Store Connect → App → General → App Information)
3. Build di produzione e invio:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios --latest
   ```
4. Sull'iPhone installa **TestFlight** dall'App Store → accetta l'invito → installa Nvmcars.

---

## ✅ Checklist prima di pubblicare sullo Store (più avanti)
- [ ] `app.json` → `projectId` riempito da `eas init`
- [ ] Variabili Supabase/Stripe su EAS (`eas env:list`)
- [ ] `eas.json` → `submit.production.ios` con i 3 valori reali
- [ ] Migrazioni Supabase applicate (cartella `supabase/migrations/`)
- [ ] Icona e splash definitivi (cartella `assets/`)
- [ ] Privacy policy e termini (cartella `src/screens/legal/`) pubblicati e linkati

> Nota: i placeholder in `app.json`/`eas.json` sono volutamente segnaposto — la build
> ad-hoc (Passo 3a) funziona anche senza toccare la sezione `submit`; quei valori servono
> solo per `eas submit` / TestFlight (Passo 3b).
