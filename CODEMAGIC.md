# Build su TestFlight con Codemagic — guida passo-passo

Questa guida ti porta da zero a **app installata sul tuo iPhone via TestFlight**.
La pipeline è già scritta in [`codemagic.yaml`](./codemagic.yaml): qui ci sono
solo le cose che vanno fatte **una volta** a mano (account, chiavi, variabili).

> Tempo stimato la prima volta: ~45 min di setup + ~15 min di build.
> Le volte successive: fai solo `git push` e parte tutto da solo.

---

## 0. Cosa ti serve PRIMA di iniziare

| Cosa | Dove | Costo | Note |
|---|---|---|---|
| **Apple Developer Program** | https://developer.apple.com/programs/enroll | €99/anno | Obbligatorio per TestFlight. Verifica in 24-48h. |
| **Account Codemagic** | https://codemagic.io | Gratis* | 500 min/mese gratis su macchine M-series. |
| App registrata su **App Store Connect** | https://appstoreconnect.apple.com | incluso | Vedi §1. |

\* Se sfai login con GitHub puoi collegare il repo in un clic.

---

## 1. Registra l'app su App Store Connect

Va fatto una volta, altrimenti TestFlight non sa dove mettere la build.

1. Vai su https://appstoreconnect.apple.com → **My Apps** → **+** → **New App**.
2. Compila:
   - **Platform**: iOS
   - **Name**: `Nvmcars`
   - **Primary Language**: Italiano
   - **Bundle ID**: seleziona `com.nvmcars.app`
     *(se non c'è in lista, va creato prima su
     https://developer.apple.com/account/resources/identifiers → **+** →
     App IDs → Bundle ID `com.nvmcars.app`)*
   - **SKU**: un codice a piacere, es. `nvmcars-001`
3. Salva. Non serve compilare schede Store, screenshot, ecc.: per TestFlight
   bastano poche cose (le chiede al primo test esterno, non per i test interni).

---

## 2. Crea la chiave App Store Connect API (per la firma + upload)

Questa chiave permette a Codemagic di firmare e caricare la build da solo,
senza certificati `.p12` o Mac.

1. App Store Connect → **Users and Access** → tab **Integrations** →
   **App Store Connect API** → **+** (genera chiave team).
2. **Access**: scegli **App Manager** (o Admin).
3. Scarica il file **`.p8`** (lo puoi scaricare UNA sola volta — conservalo).
4. Annota:
   - **Issuer ID** (in cima alla pagina)
   - **Key ID** (la riga della chiave appena creata)

Poi in **Codemagic**:

1. Apri la tua app in Codemagic → **Settings** ⚙️ →
   **Integrations** → **App Store Connect** → **Add new**.
2. Inserisci:
   - **Name**: `Nvmcars ASC Key`  ← *deve essere identico a quello in `codemagic.yaml`*
   - **Issuer ID**, **Key ID**, e carica il **`.p8`**.
3. Salva.

> Il nome `Nvmcars ASC Key` è già referenziato nel file YAML
> (`integrations.app_store_connect`). Se usi un nome diverso, cambialo anche lì.

---

## 3. Crea il gruppo di variabili `nvmcars_env`

Le chiavi Supabase vengono "cucite" dentro l'app durante la build. Senza,
l'app parte in **modalità demo/mock** (nessun dato reale).

1. In Codemagic → app → **Settings** → **Environment variables**.
2. Crea un **gruppo** chiamato esattamente `nvmcars_env`.
3. Aggiungi queste variabili (prendi i valori dal tuo `.env` locale o dal
   pannello Supabase → Project Settings → API):

   | Nome variabile | Valore | Secure |
   |---|---|---|
   | `EXPO_PUBLIC_SUPABASE_URL` | `https://....supabase.co` | ✅ |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` | ✅ |
   | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` *(opzionale)* | ✅ |
   | `APP_STORE_APPLE_ID` | l'Apple ID numerico dell'app *(opzionale)* | ❌ |

   Spunta **Secure** sulle prime tre.

> `EXPO_PUBLIC_*` sono chiavi pubbliche lato client (anon/publishable): è
> normale e sicuro che finiscano nel bundle. La **secret key** Supabase e la
> **secret key** Stripe NON vanno mai qui — restano nelle Edge Function.

---

## 4. Collega il repo e lancia la build

1. Codemagic → **Add application** → scegli GitHub →
   repo `nvmelessproduction/nvmcars`.
2. Quando chiede il tipo di configurazione, scegli
   **"codemagic.yaml"** (lo rileva da solo nel repo).
3. Seleziona il workflow **`Nvmcars iOS · TestFlight`**.
4. **Branch**: scegli `main` (o il branch che vuoi testare).
5. **Start new build**.

La pipeline fa, in automatico:
`npm ci` → lint/typecheck/test → `expo prebuild` (genera iOS) →
`pod install` → firma → build IPA → **upload su TestFlight**.

Durata tipica: 12-18 minuti.

---

## 5. Installa sull'iPhone

1. Dopo qualche minuto dall'upload, la build appare in App Store Connect →
   la tua app → tab **TestFlight**. Stato iniziale: *"In elaborazione"* →
   poi *"Pronta per il test"* (può chiedere una conferma sull'uso della
   crittografia: rispondi **No** — è già dichiarato in `app.json`).
2. Sull'iPhone installa l'app **TestFlight** dall'App Store.
3. Per i **test interni** (solo tu): in App Store Connect → TestFlight →
   **Internal Testing** → aggiungi te stesso come tester (la tua email Apple).
4. Apri TestFlight sull'iPhone → trovi **Nvmcars** → **Installa**. Fatto. 🎉

> I tester interni (fino a 100, devono essere utenti del tuo team App Store
> Connect) non richiedono la revisione Apple: la build è disponibile subito.
> I tester esterni richiedono una breve revisione (~1 giorno).

---

## 6. Build successive

Da qui in poi è banale: ogni volta che vuoi una nuova build su TestFlight,
fai partire il workflow (manualmente da Codemagic, oppure configura un
trigger su push). Il **build number** si incrementa da solo (`$BUILD_NUMBER`).
Se cambi la versione "marketing" (es. 1.0.0 → 1.1.0), modificala in
`app.json` (`expo.version`).

---

## Problemi comuni

| Sintomo | Causa / Fix |
|---|---|
| `No matching profiles found for bundle identifier "com.nvmcars.app"` | La pipeline ora crea il profilo da sola (`fetch-signing-files --create`). Se l'errore resta: (a) la chiave ASC deve avere ruolo **App Manager** o **Admin** (con ruolo Developer non può creare profili) → rigenerala in §2; (b) verifica che l'integrazione in Codemagic si chiami **esattamente** `Nvmcars ASC Key`; (c) il primo build può volerci 1 min per propagare l'App ID appena creato: rilancia. |
| L'app si apre ma "non vede" i dati | Gruppo `nvmcars_env` mancante o variabili sbagliate (§3). |
| Build fallita su `pod install` | Quasi sempre cache: in Codemagic, **Start new build** con *Clear cache*. |
| `xcode: latest` dà errore | Fissa una versione nota in `codemagic.yaml`, es. `xcode: 16.2`. |
| TestFlight chiede "Export Compliance" | Rispondi **No** (l'app non usa crittografia non esente; già in `app.json`). |

---

## Nota su EAS (alternativa)

Nel repo c'è anche `eas.json`: è la pipeline alternativa di Expo (EAS Build).
Funziona, ma tu hai chiesto **Codemagic**, quindi usa questa guida. I due
sistemi non si pestano i piedi: puoi tenere entrambi i file.
