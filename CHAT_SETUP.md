# Attivare la chat al 100% (real-time tra dispositivi)

La chat funziona in due modalità:

- **Modalità demo (senza backend):** se le variabili Supabase non sono impostate,
  la chat usa uno store locale (Zustand) con dati seed e una risposta automatica.
  I messaggi restano sul singolo dispositivo. Utile per provare la UI.
- **Modalità completa (real-time):** con Supabase configurato, i messaggi vengono
  salvati nel DB, sincronizzati **in tempo reale tra cliente e officina**, con foto/
  video su storage privato e contatori "non letti" gestiti dal server.

Questa guida attiva la **modalità completa**.

---

## 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) → **New project**.
2. Regione consigliata: **EU (Frankfurt)** (privacy/GDPR + latenza Italia).
3. Annota da **Project Settings → API**:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 2. Imposta le variabili d'ambiente

Copia `.env.example` in `.env` (già in `.gitignore`) e compila:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> Riavvia `npx expo start -c` dopo aver cambiato il `.env` (il flag `-c` pulisce la cache).

## 3. Applica le migration al database

Le migration in `supabase/migrations/` creano tabelle, RLS, storage **e** la
configurazione realtime/trigger della chat. Le due nuove rilevanti sono:

- `0012_realtime_chat.sql` → abilita Supabase Realtime su `messages` e `conversations`
- `0013_chat_triggers.sql` → trigger che aggiorna anteprima/ultimo messaggio/non-letti

### Opzione A — Supabase CLI (consigliata)

```bash
npm i -g supabase            # se non l'hai
supabase login
supabase link --project-ref <PROJECT_REF>   # il ref è nell'URL del progetto
supabase db push                            # applica tutte le migration in ordine
```

### Opzione B — SQL Editor (manuale)

Apri **Dashboard → SQL Editor** e incolla/esegui **in ordine** i file da
`0001_*.sql` fino a `0013_*.sql`. Sono idempotenti dove possibile.

## 4. Verifica Realtime e Storage (1 minuto)

- **Database → Replication → `supabase_realtime`**: devono comparire le tabelle
  `messages` e `conversations`. (Le aggiunge la migration 0012; se usi il toggle
  manuale della dashboard, abilita le stesse due tabelle.)
- **Storage**: deve esistere il bucket **`chat-media`** (privato). Lo crea la
  migration `0003_storage_buckets.sql`.

## 5. Abilita l'autenticazione email

**Dashboard → Authentication → Providers → Email**: attivo.
(Per i test puoi disattivare temporaneamente "Confirm email".)

## 6. Avvia e prova su due dispositivi

```bash
npm install
npx expo start -c
```

1. **Dispositivo A** — login come **Cliente** → apri un'officina → **"Chatta in app"** → invia un messaggio (vedrai 🕐 → ✓ quando è consegnato).
2. **Dispositivo B** — login come **Professionista** (proprietario di quell'officina) → tab **Richieste/Chat** → apri la conversazione: il messaggio appare **in tempo reale**. Rispondi e guarda l'aggiornamento istantaneo sul dispositivo A.
3. Prova un **allegato** (foto/video): viene caricato su `chat-media` e visibile su entrambi i dispositivi.

---

## Come capire al volo in che modalità sei

All'avvio, se mancano le env Supabase, in console appare:

```
[Nvmcars] Supabase env vars missing... The app will run in offline/mock mode until configured.
```

Se **non** vedi questo log, sei in modalità completa.

## Indicatori di stato messaggio

| Glifo | Significato |
|------|-------------|
| 🕐 | In invio (upload media / insert in corso) |
| ✓ | Inviato e persistito sul server |
| ⚠️ | Invio fallito (es. rete assente o permesso storage) |

## Risoluzione problemi

| Sintomo | Causa probabile | Soluzione |
|--------|------------------|-----------|
| I messaggi non arrivano sull'altro device | Tabelle non in `supabase_realtime` | Riapplica `0012`, verifica in Database → Replication |
| Contatori "non letti" sbagliati | Trigger non applicato | Riapplica `0013` |
| Le foto inviate sono rotte sull'altro device | Bucket `chat-media` mancante o RLS | Verifica bucket (`0003`) e che l'utente sia partecipante della conversazione |
| Messaggio resta su ⚠️ | INSERT rifiutato dalla RLS | Assicurati che `sender_id` = utente loggato e che faccia parte della conversazione |
| Niente sync e log "offline/mock mode" | Env mancanti | Compila `.env` e riavvia con `-c` |
