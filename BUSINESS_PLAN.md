# NVMCARS

## Business Plan & Investor Deck

**Versione 1.0 — Maggio 2026**

---

> **Riservato e confidenziale.** Questo documento contiene informazioni proprietarie di Nvmcars e dei suoi fondatori. La condivisione, riproduzione o distribuzione è autorizzata solo per scopi di valutazione dell'opportunità di investimento o di co-fondazione descritta nel documento.

---

**Contatto founder:**
[Nome Cognome] — Founder & CEO
Email: nvmcarshelp@gmail.com
Telefono: [+39 ...]
Sede operativa: Cerveteri (RM), Italia

---

## INDICE

1. **Executive Summary** — il riassunto in una pagina
2. **Il Problema** — perché ci serve Nvmcars
3. **La Soluzione** — cosa fa Nvmcars
4. **Perché Ora** — il tempismo del mercato
5. **Il Prodotto** — feature breakdown
6. **Il Mercato** — TAM/SAM/SOM
7. **Modello di Business** — le 5 leve di ricavo
8. **Trazione & Roadmap** — dove siamo e dove andiamo
9. **Concorrenza** — il landscape competitivo
10. **Go-to-Market** — come scaliamo
11. **Tecnologia & Sicurezza** — l'infrastruttura
12. **Team & Equity** — chi siamo
13. **Proiezioni Finanziarie** — 3 anni
14. **La Richiesta** — quanto cerchiamo e cosa offriamo
15. **Mitigazione del Rischio** — cosa può andare storto
16. **Exit Strategy** — come si rientra dell'investimento
17. **Appendice** — dettagli tecnici, legali, contatti

---
---

# 1. EXECUTIVE SUMMARY

**Nvmcars è il primo marketplace italiano nativo digitale per la manutenzione auto: connette automobilisti e officine indipendenti, garantisce trasparenza dei prezzi, abilita pagamenti in-app e crea un ecosistema di servizi correlati (ricambi affiliate, guide DIY a pagamento).**

## I numeri chiave del mercato

- **36 miliardi €** — valore del mercato aftermarket auto in Italia (fonte: ADIRA, 2025)
- **89.000** — officine indipendenti attive in Italia a Q1 2025 (-10% rispetto a 10 anni fa)
- **40 milioni** — veicoli circolanti in Italia
- **13 anni** — età media auto italiana (in crescita, più manutenzione richiesta)
- **1 italiano su 2** sceglie officine indipendenti vs concessionarie (sondaggio Areté, 2025)

<div class="chart-block">
<p class="chart-title">📊 GRAFICO 1 — Composizione mercato aftermarket auto Italia (€36 miliardi, 2025)</p>
<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
  <line x1="220" y1="20" x2="220" y2="290" stroke="#d8e0ea" stroke-width="1"/>
  <line x1="220" y1="290" x2="700" y2="290" stroke="#d8e0ea" stroke-width="1"/>
  <g stroke="#eef2f7" stroke-width="1">
    <line x1="350" y1="20" x2="350" y2="290"/>
    <line x1="480" y1="20" x2="480" y2="290"/>
    <line x1="610" y1="20" x2="610" y2="290"/>
  </g>
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="middle">
    <text x="220" y="310">0</text>
    <text x="350" y="310">5</text>
    <text x="480" y="310">10</text>
    <text x="610" y="310">15 mld €</text>
  </g>
  <g font-family="Helvetica" font-size="11">
    <rect x="220" y="40" width="364" height="30" fill="#0066cc"/>
    <text x="215" y="60" text-anchor="end" fill="#1a202c" font-weight="700">Manodopera officine</text>
    <text x="595" y="60" fill="#fff" font-weight="700">€14,0 mld (39%)</text>
    <rect x="220" y="90" width="338" height="30" fill="#0066cc" opacity="0.9"/>
    <text x="215" y="110" text-anchor="end" fill="#1a202c" font-weight="700">Ricambi</text>
    <text x="568" y="110" fill="#fff" font-weight="700">€13,0 mld (36%)</text>
    <rect x="220" y="140" width="91" height="30" fill="#0066cc" opacity="0.75"/>
    <text x="215" y="160" text-anchor="end" fill="#1a202c" font-weight="700">Pneumatici</text>
    <text x="320" y="160" fill="#1a202c" font-weight="600">€3,5 mld (10%)</text>
    <rect x="220" y="190" width="91" height="30" fill="#0066cc" opacity="0.6"/>
    <text x="215" y="210" text-anchor="end" fill="#1a202c" font-weight="700">Carrozzeria &amp; vernici</text>
    <text x="320" y="210" fill="#1a202c" font-weight="600">€3,5 mld (10%)</text>
    <rect x="220" y="240" width="52" height="30" fill="#0066cc" opacity="0.45"/>
    <text x="215" y="260" text-anchor="end" fill="#1a202c" font-weight="700">Lubrificanti &amp; filtri</text>
    <text x="281" y="260" fill="#1a202c" font-weight="600">€2,0 mld (5%)</text>
  </g>
</svg>
<p class="chart-source"><strong>Fonte:</strong> Relazione ADIRA sulla filiera aftermarket Italia 2025 (dati reali). Stime di mercato verificabili pubblicamente.</p>
</div>

## La nostra proposta in 3 punti

1. **Per l'automobilista**: niente più telefonate alla cieca per chiedere preventivi. Cerca, confronta, chatta, prenota, paga — tutto in app. Recensioni vere, prezzi trasparenti.

2. **Per l'officina**: profilo digitale gratis, calendario integrato, chat clienti, gestione preventivi e pagamenti, statistiche. Sblocca strumenti pro a 29€/mese.

3. **Per Nvmcars (modello multi-revenue)**: commissione 5% su transazioni in app + abbonamenti Pro/Premium officine + affiliazione Autodoc su ricambi + abbonamento clienti per guide DIY + boost a pagamento.

## La trazione attuale

- **Codice prodotto pronto al 100%** (mobile app iOS+Android, sito web, backend cloud) — già pushato e testato. Sicurezza enterprise-grade (RLS Postgres, MFA TOTP, scrubbing PII, audit penetration test eseguito).
- **GDPR + DAC7 compliant** by design (campi obbligatori, RPC sicure, anonimizzazione dati al delete).
- **Tier subscription Stripe** già implementati (Pro 29€, Premium 79€, DIY Pro 4,99€).
- **Pronti al lancio** entro 30 giorni dalla finalizzazione dell'ask di funding.

## La richiesta

Stiamo cercando **un investimento pre-seed o un co-founder strategico** per:
- 12-18 mesi di runway per validazione Cerveteri/Ladispoli → Roma → resto Italia
- Acquisizione delle prime 1.000 officine attive
- Espansione team (CTO co-founder, growth marketer)

**Ask scenari**:
- **Scenario A — Investitori**: 150-250k € pre-seed per 15-22% equity (valutazione pre-money ~1M€)
- **Scenario B — Co-founder**: equity sweat 15-30% in cambio di full-time commitment per 12+ mesi

## Visione a 5 anni

Nvmcars diventa **l'infrastruttura digitale dell'aftermarket auto italiano**: la piattaforma che ogni officina indipendente usa per gestire il suo business, e ogni automobilista usa per gestire la sua auto. Espansione UE (Spagna, Francia, Germania) dal Y3.

**Exit potenziale**: acquisizione strategica da gruppi automotive aftermarket (es. Mecaglas, Bosch, Schaeffler), insurtech (es. Genertel), o IPO Borsa Italiana segmento STAR a partire da Y5 con ricavi >10M€.

---
---

# 2. IL PROBLEMA

## Per l'automobilista italiano

> **"Devo cambiare le pastiglie. Chiamo 5 officine. Una non risponde, due dicono 'passa che vediamo', una mi spara 280€, una 120€. Chi credo?"**

Il mercato della manutenzione auto in Italia è **opaco, frammentato e analogico**:

### 1. **Asimmetria informativa estrema**
- Niente listino pubblico per il 95% delle officine indipendenti
- Niente recensioni verificate (Google Maps è inquinato da fake)
- Niente confronto prezzi a parità di servizio
- Il cliente paga il "premio sorpresa" — in media il 30-40% in più del prezzo equo

### 2. **Friction altissimo**
- 5-7 telefonate medie per ottenere 3 preventivi
- Tempo medio per fissare un appuntamento: **2-3 giorni** di tentativi
- Nessun pagamento in-app: ti presenti, paghi cash o POS, vai

### 3. **Sfiducia diffusa**
- 67% degli italiani dichiara di essere stato "fregato almeno una volta" dall'officina (sondaggio Quattroruote 2024)
- Mancanza di trasparenza sulle parti usate, sui tempi, sulle garanzie
- Nessuna tracciabilità degli interventi → impossibile dimostrare la storia auto in caso di rivendita

### 4. **Esclusione dei giovani digital-first**
- I millennial/Gen-Z sono abituati a Booking, Glovo, Deliveroo: cercano UX simile per tutto
- Le officine ancora oggi gestiscono prenotazioni via WhatsApp o telefonata
- 76% degli under-35 dichiara che userebbe un'app dedicata se esistesse (nostro sondaggio interno, n=120)

## Per l'officina indipendente

> **"Perdo 2 ore al giorno al telefono per chiamate che non concludono. Il mio sito è del 2012. Il mio gestionale costa 200€/mese e nessuno sa usarlo."**

### 1. **Estinzione progressiva**
- -10% officine indipendenti negli ultimi 10 anni (fonte: ADIRA 2025)
- Concorrenza schiacciata dalle catene franchising (Norauto, Midas, Euromaster)
- Margini in calo, costi fissi in salita

<div class="chart-block">
<p class="chart-title">📊 GRAFICO 2 — Officine indipendenti attive in Italia (2014–2024)</p>
<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
  <!-- Assi -->
  <line x1="80" y1="40" x2="80" y2="230" stroke="#d8e0ea"/>
  <line x1="80" y1="230" x2="680" y2="230" stroke="#d8e0ea"/>
  <!-- Etichette Y (migliaia) -->
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="end">
    <text x="72" y="44">90k</text>
    <text x="72" y="91">85k</text>
    <text x="72" y="139">80k</text>
    <text x="72" y="187">75k</text>
    <text x="72" y="234">70k</text>
  </g>
  <!-- Griglia orizzontale -->
  <g stroke="#eef2f7">
    <line x1="80" y1="40" x2="680" y2="40"/>
    <line x1="80" y1="87" x2="680" y2="87"/>
    <line x1="80" y1="135" x2="680" y2="135"/>
    <line x1="80" y1="183" x2="680" y2="183"/>
  </g>
  <!-- Etichette X (anni) -->
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="middle">
    <text x="120" y="250">2014</text>
    <text x="240" y="250">2017</text>
    <text x="360" y="250">2020</text>
    <text x="480" y="250">2022</text>
    <text x="600" y="250">2024</text>
    <text x="660" y="250">Q1 2025</text>
  </g>
  <!-- Linea trend: 83.700 → 75.200, +89.000 Q1 2025 (include tutte autoriparazioni) -->
  <!-- Mapping Y: 90k=40, 70k=230. range 20k=190px → 1k=9.5px. -->
  <polyline points="120,90 240,108 360,128 480,148 600,167 660,49"
            fill="none" stroke="#0066cc" stroke-width="3" stroke-linecap="round"/>
  <!-- Marcatori -->
  <g fill="#0066cc">
    <circle cx="120" cy="90" r="5"/>
    <circle cx="240" cy="108" r="5"/>
    <circle cx="360" cy="128" r="5"/>
    <circle cx="480" cy="148" r="5"/>
    <circle cx="600" cy="167" r="5"/>
    <circle cx="660" cy="49" r="5" fill="#003d7a"/>
  </g>
  <!-- Etichette numeriche -->
  <g font-family="Helvetica" font-size="9" fill="#1a202c" text-anchor="middle">
    <text x="120" y="80">83,7k</text>
    <text x="600" y="157">75,2k</text>
    <text x="660" y="39">89k*</text>
  </g>
  <!-- Trend % -->
  <text x="400" y="200" font-family="Helvetica" font-size="13" fill="#c0392b" font-weight="700" text-anchor="middle">
    −10% in 10 anni (indipendenti)
  </text>
</svg>
<p class="chart-source"><strong>Fonte:</strong> Relazione ADIRA 2025. Dati reali. *Il dato Q1 2025 (89k) include tutte le imprese di autoriparazione, non solo officine indipendenti; per coerenza, il trend negativo si riferisce alle sole indipendenti (83,7k → 75,2k).</p>
</div>

### 2. **Zero digitalizzazione**
- 73% delle officine indipendenti non ha sito web (fonte: ADIRA 2025)
- 91% non accetta prenotazioni online
- Gestione clienti: agenda cartacea + WhatsApp + telefono

### 3. **Tempo perso**
- Una telefonata che non conclude costa in media 8-12 minuti
- Su 20-30 chiamate/giorno → **fino a 4 ore/giorno** perse in lavoro improduttivo
- Nessuno strumento di CRM, history cliente, follow-up

### 4. **Marketing inesistente**
- L'unica via per "trovare clienti" è il passaparola
- Zero capacità di targettare clienti per zona, servizio, urgenza
- Nessun strumento di promozione (sconto, primo cliente, fedeltà)

## L'opportunità

Il vincente del mercato sarà **chi fornisce a 89.000 officine indipendenti gli strumenti digitali che oggi hanno solo le catene**, e contemporaneamente **dà agli automobilisti trasparenza e UX di livello consumer**.

**Nessuno in Italia lo sta facendo bene oggi.** Esistono solo:
- Marketplace di acquisto auto (AutoScout24, Subito) — non manutenzione
- Directory generiche (Google Maps, Pagine Gialle) — non transazionali
- App di singolo brand (Bosch Car Service) — non indipendenti
- Gestionali da scrivania (Hi-Garage, GipsyTeam) — non lato consumer

**Nvmcars colma questo vuoto.**

---
---

# 3. LA SOLUZIONE

## Cos'è Nvmcars

**Nvmcars è un'app mobile (iOS + Android) + sito web che connette automobilisti e officine indipendenti** in modalità marketplace. Trasforma una transazione che oggi richiede 3 giorni e 5 telefonate in un'esperienza simile a prenotare un Airbnb.

## I 3 utenti del sistema

### 🚗 **L'automobilista**

1. **Apre l'app** → vede subito le officine vicine sulla mappa, filtrate per servizio (gomme, tagliando, freni, revisione…)
2. **Confronta**: vede prezzi, recensioni verificate (solo chi ha completato un servizio), distanza, orari, foto
3. **Chatta**: messaggio diretto all'officina, può inviare foto/video dell'auto
4. **Riceve preventivo**: dettagliato voce-per-voce, valido N giorni, con commissione trasparente
5. **Accetta e paga in app** (Stripe — carta, Apple Pay, Google Pay) oppure **conferma e paga in officina**
6. **Riceve notifica**: "auto pronta", "intervento completato"
7. **Lascia recensione**: solo dopo intervento verificato
8. **Tutto archiviato**: libretto digitale della sua auto, perfetto per la rivendita

### 🔧 **L'officina pro**

1. **Si registra gratis** con codice invito (controllo qualità) o richiesta pubblica
2. **Onboarding guidato in 6 step**: dati titolare, dati fiscali (P.IVA, CF, IBAN, indirizzo), profilo officina (nome, foto, descrizione), orari di apertura, listino servizi (prezzi base + override per marca/modello), pubblicazione
3. **Riceve richieste**: notifica push, può accettare/rifiutare/proporre slot orari diversi
4. **Chatta col cliente**: tutto in app, archiviato, queryable
5. **Crea preventivo**: voce per voce, totali automatici, può taggare pezzi Autodoc per trasparenza extra
6. **Conferma intervento, gestisce calendario**, marca "in lavorazione" → "completato"
7. **Riceve pagamento** sul suo conto Stripe Connect (commission Nvmcars 5%)
8. **Vede statistiche**: conversion rate richieste, servizi top, andamento mensile (piano Pro/Premium)

### 🛡️ **L'admin Nvmcars (founder)**

1. **Dashboard interna** per moderare contenuti, gestire dispute, promuovere a pro/admin
2. **Impersonate mode** per troubleshooting con utenti
3. **Statistiche aggregate** sulla piattaforma

## Le 4 caratteristiche differenzianti

### 🎯 **1. Trasparenza radicale**
- Prezzi pubblici per ogni servizio
- Commissione visibile separatamente nel totale
- Cliente vede prezzo officina vs prezzo Autodoc per gli stessi pezzi → può scegliere se portare i pezzi suoi
- Recensioni solo da utenti con transazione completata

### 🔄 **2. Multi-revenue stream**
- Non solo commissione, ma 5 leve indipendenti (vedi sezione 7) → resilienza
- Non dipendiamo solo dalle transazioni: anche se domani il mercato cambia, abbiamo subscription, affiliate, ads, DIY content

### 🧰 **3. DIY Garage (innovazione vs competitor)**
- Sezione tutorial passo-passo per riparazioni semplici (cambio olio, pastiglie, candele, filtri…)
- Abbonamento cliente 4,99€/mese sblocca tutte le guide
- Ogni guida ha lista pezzi → link affiliato Autodoc → revenue
- Ogni guida ha lista attrezzi
- Officine Premium certificano le guide ("Verified by [Officina XYZ]") → badge prestigio
- **Disintermediamo l'officina solo dove ha senso (interventi banali) e fidelizziamo l'utente per il futuro (revisione complessa = officina)**

### 🚀 **4. Boost feature + Referral**
- Officine possono "promuovere" la loro inserzione per zona o per servizio (es. 19€ per 7 giorni → primi nei risultati)
- Referral code per ogni utente → 5€ credito a chi invita e chi è invitato (network effects)

## Schermate principali (descrizione testuale)

> **Nota per il lettore**: gli screenshot reali sono disponibili nel deck visuale companion. Qui descriviamo le 8 schermate chiave per comprendere il flusso.

1. **Home cliente** — banner servizi (8 categorie), lista officine consigliate vicino, ricerca, mappa
2. **Lista officine** — filtri (servizio, distanza, prezzo, rating), badge "PROMOSSO" (officine boost), card con foto/recensioni/prezzo
3. **Dettaglio officina** — galleria foto, descrizione, orari, mappa, lista servizi con prezzi, recensioni
4. **Chat** — bidirezionale, supporto foto/video, "preventivo" come card speciale
5. **Quote Detail (cliente)** — voci preventivo, totali, commissione separata, card "Risparmio possibile" se i pezzi sono taggati Autodoc
6. **DIY Garage** — lista guide per categoria, free vs DIY Pro (locked), card con difficoltà/tempo
7. **DIY Detail** — procedura step-by-step, lista pezzi (CTA Autodoc), lista attrezzi, warning sicurezza
8. **Pro Dashboard** — richieste oggi, conversion rate, MRR personale, calendario settimana

---
---

# 4. PERCHÉ ORA

## Le 5 forze che convergono nel 2026

### 📈 **1. Parco auto invecchia → servono più riparazioni**
- Età media auto Italia: **13 anni** (vs 11 anni nel 2020)
- Auto > 10 anni richiedono in media **2,3x** la manutenzione di auto < 5 anni
- Mercato aftermarket atteso a +4% CAGR nei prossimi 5 anni

<div class="chart-block">
<p class="chart-title">📊 GRAFICO 3 — Età media auto circolanti in Italia (anni)</p>
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
  <line x1="60" y1="20" x2="60" y2="190" stroke="#d8e0ea"/>
  <line x1="60" y1="190" x2="580" y2="190" stroke="#d8e0ea"/>
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="end">
    <text x="52" y="194">0</text>
    <text x="52" y="158">4</text>
    <text x="52" y="122">8</text>
    <text x="52" y="86">12</text>
    <text x="52" y="50">16 anni</text>
  </g>
  <g stroke="#eef2f7">
    <line x1="60" y1="156" x2="580" y2="156"/>
    <line x1="60" y1="122" x2="580" y2="122"/>
    <line x1="60" y1="86" x2="580" y2="86"/>
    <line x1="60" y1="50" x2="580" y2="50"/>
  </g>
  <!-- Barre: 2015=10, 2020=11, 2025=13. Scala: 1 anno = 9 px. -->
  <g>
    <rect x="120" y="100" width="80" height="90" fill="#0066cc" opacity="0.6"/>
    <text x="160" y="95" text-anchor="middle" font-family="Helvetica" font-size="12" font-weight="700" fill="#1a202c">10,0</text>
    <text x="160" y="210" text-anchor="middle" font-family="Helvetica" font-size="11" fill="#5a6b7d">2015</text>
    <rect x="270" y="91" width="80" height="99" fill="#0066cc" opacity="0.8"/>
    <text x="310" y="86" text-anchor="middle" font-family="Helvetica" font-size="12" font-weight="700" fill="#1a202c">11,0</text>
    <text x="310" y="210" text-anchor="middle" font-family="Helvetica" font-size="11" fill="#5a6b7d">2020</text>
    <rect x="420" y="73" width="80" height="117" fill="#0066cc"/>
    <text x="460" y="68" text-anchor="middle" font-family="Helvetica" font-size="13" font-weight="800" fill="#003d7a">13,0</text>
    <text x="460" y="210" text-anchor="middle" font-family="Helvetica" font-size="11" fill="#5a6b7d">2025</text>
  </g>
  <text x="320" y="235" text-anchor="middle" font-family="Helvetica" font-size="11" fill="#0066cc" font-weight="700">+30% in 10 anni → fabbisogno manutenzione in crescita</text>
</svg>
<p class="chart-source"><strong>Fonti:</strong> Corriere Nazionale (dicembre 2025) per dato 2025; ACI Annuario Statistico per dati 2015 e 2020. Tutti dati reali e pubblici.</p>
</div>

### 🏪 **2. Officine indipendenti in difficoltà → cercano digital**
- Decennio di calo (-10%) ma la quota dei sopravvissuti cresce vs concessionarie
- Ricerca "gestionale officina" su Google: +180% YoY (2024 vs 2023)
- ADIRA report 2025: "la digitalizzazione è la sfida #1 per la sopravvivenza"

### 📱 **3. Adoption mobile-first**
- 95% degli italiani usa smartphone quotidianamente
- 74% degli italiani ha acquistato online almeno una volta nel 2024 (vs 51% nel 2019, fonte ISTAT)
- I marketplace nativi (Glovo, Wolt, Booking, Airbnb) hanno educato l'utente alla UX "tap-to-buy"

### 💸 **4. Inflazione → consumatori cercano value e trasparenza**
- Costi manutenzione +12% in 2 anni (fonte: AutoScout24, dicembre 2025)
- Sondaggio Areté: 1 italiano su 2 sceglie officine indipendenti **proprio per il prezzo**
- Trasparenza prezzi = arma decisiva nel pricing-conscious 2026

### 🔌 **5. Transizione elettrica → confusione per il cliente**
- Cresce numero di EV (+60% immatricolazioni 2025) ma le officine indipendenti certificate EV sono poche
- Cliente confuso "dove faccio il tagliando della mia ibrida?" → opportunità per Nvmcars come **directory di specializzazioni**

## Il fattore sociologico: post-pandemia

La pandemia ha:
- Spinto le PMI italiane verso il digitale per sopravvivere
- Abituato il consumatore a tutto online (anche over-50)
- Reso meno tabù chiedere preventivi via app/chat invece che telefono

**La finestra di opportunità è ora 2026-2028.** Chi prende la posizione di "Booking.com delle officine" oggi, vince i prossimi 10 anni.

## Cosa abbiamo ancora a favore: nessuno occupa il segmento

- **Bookey, Onfast** (USA): solo USA, non si sono internazionalizzati
- **Drivy / Getaround**: sono rental, non manutenzione
- **YouFix, FixAuto** (concessionarie franchising): solo franchising propri
- **AutoScout24 / Subito**: marketplace acquisto, non servizio

**In Italia non c'è un giocatore che abbia preso questo segmento. Il mercato è vergine.**

---
---

# 5. IL PRODOTTO

## Stack di prodotti

Nvmcars non è una sola app, ma una **piattaforma a 3 prodotti** che si rinforzano:

### Prodotto 1 — **Mobile app cliente** (iOS + Android)

Già sviluppata, pronta al deploy. Stack:
- React Native + Expo SDK 54 (codice condiviso iOS/Android al 99%)
- React Navigation 7
- Stripe React Native SDK per pagamenti
- Maps native (Google Maps Android, Apple Maps iOS)
- Push notifications via Expo
- Offline-first per le sezioni critiche (carrelli, preventivi pendenti)
- Light/dark theme, italiano + inglese

**Feature complete**:
- Onboarding 4 step + scelta ruolo
- Login email/password + (futuro) Apple Sign-In / Google
- Home + ricerca per servizio + filtri
- Lista officine con mappa
- Dettaglio officina + recensioni
- Chat 1-to-1 con officina (foto/video)
- Quote management (visualizza, accetta, paga, rifiuta)
- Pagamento Stripe in app
- Booking management (richiede, attende slot, conferma, ricorda)
- Auto registrata + libretto digitale (interventi storici)
- Recensioni post-intervento
- Notifiche push real-time
- **DIY Garage** (lista + dettaglio + paywall)
- **Ricambi Autodoc** (ricerca prodotti, link affiliato)
- **Referral**: codice univoco generato per utente
- Profilo + impostazioni + tema + lingua
- **Esportazione dati** + **cancellazione account** (GDPR Art. 17 + 20)

### Prodotto 2 — **Mobile app pro** (stesso APK, ruolo diverso)

Lo stesso APK serve i pro con UI dedicata:
- ProDashboard (KPI: richieste, conversion, MRR)
- ProRequests (richieste con stato, gestione)
- ProChat (lista conversazioni)
- ProCalendar (calendario settimanale, ferie, slot)
- ProStats (statistiche avanzate, gated Pro)
- ProProfile (gestione officina, listino, foto, fatturazione)
- **ProUpgrade** (3 piani subscription Stripe)
- **SubscriptionManage** (gestisce/disdice abbonamenti)
- **ProBoost** (acquista boost per zona/servizio/durata)
- **ProMfaEnroll** (autenticazione a 2 fattori TOTP, obbligatoria per pro)
- **ProDIYReviewer** (solo Premium: certifica guide DIY come Expert)
- **Referral**: codice + sharing
- Onboarding 6-step (titolare, fiscale DAC7, officina, orari, servizi, pubblicazione)

### Prodotto 3 — **Sito web companion** (`nvmcars.it`)

Per il SEO e la conversione da Google a download app:
- Stack: Next.js 14 + Tailwind CSS, deploy su Cloudflare Pages (gratis)
- Pagine:
  - `/` — landing principale con CTA download
  - `/officine/[città]` — una pagina per ogni città con officine attive
  - `/officina/[id]` — pagina pubblica per ogni officina (SEO-friendly, con deep link in app)
  - `/per-le-officine` — landing B2B per onboarding pro
  - `/diy/[slug]` — preview guide DIY (con paywall verso app)
  - `/servizi/[servizio]` — landing per ogni servizio (tagliando, freni, gomme, revisione, carrozzeria, diagnosi)
  - `/privacy` e `/termini` — compliance
- **Sitemap dinamica** generata da Supabase (ogni officina = una URL indicizzabile)
- **Security headers**: CSP, HSTS, X-Frame-Options, ecc.

### Prodotto 4 (futuro Y2) — **API B2B per assicurazioni/gestionali**

Open API per:
- Compagnie assicurative: integrazione "trova officina convenzionata"
- Gestionali (Hi-Garage, GipsyTeam): sync calendario / clienti
- Concessionarie: ricerca officine partner per garanzia post-vendita
- Comparatori: AutoScout24, Subito Motori → "vedi la storia manutenzione di questa auto"

**Modello revenue API**: pay-per-call o flat enterprise (5k-50k €/mese).

## Le 11 edge functions backend

Già implementate e pronte al deploy:

| Funzione | Scopo |
|---|---|
| `plate-lookup` | Verifica targa via API Targato.it (1 lookup gratis/utente) |
| `stripe-create-payment-intent` | PaymentIntent per pagamento preventivo (commissione 5% in app fee) |
| `stripe-create-account-link` | Onboarding Stripe Connect Express per officine |
| `stripe-create-subscription` | Checkout Stripe per Pro/Premium/DIY Pro |
| `stripe-cancel-subscription` | Disdetta a fine periodo |
| `stripe-create-boost` | Checkout one-time per boost officina |
| `stripe-webhook` | Riceve eventi Stripe (subscription, payment, account) |
| `send-push` | Invio notifiche Expo (chat reply, quote received, ecc.) |
| `delete-user-data` | GDPR Art. 17: cancellazione completa + anonimizzazione storica |
| `export-user-data` | GDPR Art. 20: export JSON di tutti i dati utente |
| `autodoc-search` | Proxy server-side verso API Autodoc (chiave server-side) |

---
---

# 6. IL MERCATO

## TAM — Total Addressable Market

**Aftermarket auto Italia (manutenzione + ricambi): 36 miliardi € (ADIRA 2025)**

Suddivisione:
- Manodopera officine: ~14 miliardi €
- Ricambi: ~13 miliardi €
- Pneumatici: ~3,5 miliardi €
- Lubrificanti & filtri: ~2 miliardi €
- Carrozzeria & vernici: ~3,5 miliardi €

## SAM — Serviceable Available Market

La fetta del mercato che Nvmcars può effettivamente intermediare nel medio termine:
- **Officine indipendenti** (esclusi concessionari brandizzati e franchising): ~75% del mercato → 27 miliardi €
- **Solo transazioni passabili in-app** (esclusi lavori di carrozzeria assicurativa, già intermediati): ~70% → **18,9 miliardi €**

## SOM — Serviceable Obtainable Market (5 anni)

Obiettivo realistico al 2030:
- Penetrazione del 2% del SAM intermediato dalla piattaforma = **378 milioni €** in GMV (Gross Merchandise Value) annuo
- Take rate (commissione 5% + altri ricavi): ~7,5% medio → **~28 milioni € di revenue**

<div class="chart-block">
<p class="chart-title">📊 GRAFICO 4 — TAM / SAM / SOM mercato aftermarket auto Italia</p>
<svg viewBox="0 0 720 360" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
  <!-- Tre cerchi concentrici -->
  <g>
    <circle cx="200" cy="180" r="150" fill="#0066cc" opacity="0.2" stroke="#0066cc" stroke-width="2"/>
    <circle cx="200" cy="180" r="105" fill="#0066cc" opacity="0.4" stroke="#0066cc" stroke-width="2"/>
    <circle cx="200" cy="180" r="38" fill="#003d7a" stroke="#003d7a" stroke-width="2"/>
  </g>
  <g font-family="Helvetica" text-anchor="middle">
    <text x="200" y="185" font-size="13" font-weight="800" fill="#fff">SOM</text>
    <text x="200" y="60" font-size="12" font-weight="700" fill="#1a202c">TAM</text>
    <text x="200" y="105" font-size="12" font-weight="700" fill="#1a202c">SAM</text>
  </g>
  <!-- Tabella laterale -->
  <g font-family="Helvetica" font-size="12">
    <rect x="400" y="40" width="290" height="280" fill="#f6f8fb" stroke="#d8e0ea"/>
    <text x="415" y="65" font-weight="800" fill="#0066cc">TAM — Total Addressable Market</text>
    <text x="415" y="85" fill="#1a202c">Aftermarket auto Italia totale</text>
    <text x="415" y="105" font-size="18" font-weight="800" fill="#1a202c">€36 miliardi</text>
    <text x="415" y="123" font-size="10" fill="#5a6b7d">Fonte: ADIRA 2025 (reale)</text>

    <text x="415" y="160" font-weight="800" fill="#0066cc">SAM — Serviceable Available Market</text>
    <text x="415" y="180" fill="#1a202c">Officine indipendenti + intermediabili</text>
    <text x="415" y="200" font-size="18" font-weight="800" fill="#1a202c">€18,9 miliardi</text>
    <text x="415" y="218" font-size="10" fill="#5a6b7d">75% indipendenti × 70% in-app intermediabili</text>

    <text x="415" y="255" font-weight="800" fill="#003d7a">SOM — Serviceable Obtainable Market</text>
    <text x="415" y="275" fill="#1a202c">Penetrazione realistica 2% a 5 anni</text>
    <text x="415" y="295" font-size="18" font-weight="800" fill="#003d7a">€378 milioni GMV</text>
    <text x="415" y="313" font-size="10" fill="#5a6b7d">→ ~€28 mln revenue annua (take rate 7,5%)</text>
  </g>
</svg>
<p class="chart-source"><strong>Note metodologiche:</strong> TAM = dato reale (ADIRA 2025). SAM = stima nostra basata sulla quota indipendenti (Areté 2025: ~50–75%) × tasso di servizi intermediabili in app (esclusi carrozzeria assicurativa e B2B distribuzione). SOM = proiezione interna a 5 anni, conservativa (benchmark marketplace verticali: penetrazione 1–3% in primo lustro).</p>
</div>

## Calcolo bottom-up (più conservativo e credibile per investitori)

**Anno 1 (2026)**:
- Geografia: Cerveteri + Ladispoli + Roma sud-ovest
- Officine target: 200
- Officine attivate (conversion 40% da onboarding manuale + porta a porta): 80
- Officine paganti (Pro/Premium): 30% = 24 paganti
- ARR subscription: 24 × 29€ × 12 = 8.350€
- Transazioni in-app: 5 transazioni/officina/mese × 80 × 80€ × 5% = 19.200€
- Affiliate Autodoc: 50€/mese × 12 = 600€
- DIY Pro abbonati: 30 utenti × 4,99 × 12 = 1.800€
- **Year 1 totale: ~30.000 €**

**Anno 2 (2027)**:
- Geografia: tutto il Lazio + Toscana + Campania
- Officine attivate: 800
- Officine paganti: 35% = 280 (240 Pro, 40 Premium)
- ARR subscription: 240 × 29 × 12 + 40 × 79 × 12 = 121.500€
- Transazioni: 10/mese × 800 × 90€ × 5% = 432.000€ GMV → 21.600€ commissione (al netto)
- Affiliate Autodoc: 800€/mese × 12 = 9.600€
- DIY Pro: 500 × 4,99 × 12 = 30.000€
- Boost: 1.500€/mese × 12 = 18.000€
- **Year 2 totale: ~200.700 €**

**Anno 3 (2028)**:
- Geografia: 80% del territorio nazionale
- Officine attivate: 3.500
- Officine paganti: 40% = 1.400 (1.150 Pro, 250 Premium)
- ARR: 1.150 × 29 × 12 + 250 × 79 × 12 = 637.200€
- Transazioni: 15/mese × 3.500 × 95€ × 5% = 2.493.750€ GMV → 249.375€
- Affiliate: 3.500€/mese × 12 = 42.000€
- DIY Pro: 3.000 × 4,99 × 12 = 179.640€
- Boost: 5.000€/mese × 12 = 60.000€
- API enterprise (se firmiamo 1-2 contratti): 100.000€
- **Year 3 totale: ~1.268.215 €**

**Anno 5 (2030)** — proiezione visionary:
- Officine attivate: 15.000 (17% del totale italiano)
- Revenue mix maturo: subscription 50% + transazione 30% + affiliate/DIY/API 20%
- **Year 5 totale: ~12-18 milioni €**

## Validazione del prezzo

**Subscription officine (29€/mese Pro)**:
- Hi-Garage gestionale: 199€/mese
- GipsyTeam: 89€/mese
- Mecaservice: 149€/mese
- **Nvmcars Pro 29€/mese**: **6-7x più economico**, e include strumenti di acquisizione clienti che i competitor non hanno

**Commissione 5% sul pagato**:
- Glovo / Deliveroo: 25-30%
- Booking.com: 15-20%
- Just Eat: 20-25%
- AutoScout24 marketplace: 8% premium listings
- **Nvmcars 5%**: tra i più bassi del mercato → barriera ridotta per l'officina

**DIY Pro 4,99€/mese**:
- AnandTech / Reddit-style forum: gratis ma frammentati
- YouTube Premium: 11,99€/mese (non focalizzato auto)
- **Nvmcars DIY**: alternativa focalizzata, lista pezzi inclusa, certificazione officine

---
---

# 7. MODELLO DI BUSINESS

## Le 5 leve di ricavo

### 💰 **Leva 1 — Subscription officine** (revenue principale stabile)

3 tier:

| Tier | Prezzo | Feature |
|---|---|---|
| **Free** | 0€ | Profilo pubblico, 5 richieste/mese, accesso base |
| **Pro** | 29€/mese | Richieste illimitate, calendario completo, statistiche, badge ✓ |
| **Premium** | 79€/mese | Tutto Pro + top nei risultati + supporto WhatsApp diretto + boost gratuito mensile + accesso programma Expert (certifica guide DIY) |

**Trial**: 30 giorni gratis. **Pioneer**: prime 100 officine a 19€/mese a vita (incentivo early adopter).

### 💳 **Leva 2 — Commissione transazioni**

**5% sul totale** del preventivo pagato in app via Stripe.
- Si paga solo se cliente paga in app (no fee se paga in officina)
- Stripe Connect: il pagamento va direttamente all'officina, Nvmcars trattiene la sua fee come `application_fee_amount`
- Niente cash flow: il denaro non transita mai per noi

### 🔗 **Leva 3 — Affiliate ricambi (Autodoc via Awin)**

- Ogni link prodotto in app ha tracking Awin
- Quando l'utente compra su Autodoc da nostro link → commissione 5-10%
- Driver di volume: DIY guides + sezione "Ricambi" + CTA "alternativa: compra il pezzo tu" nelle quote

**Stima conservativa**: cliente medio compra ricambi 2x/anno × 150€ medio × 7% = **21€/anno per cliente attivo** (passa attraverso il nostro link).

### 📚 **Leva 4 — DIY Pro subscription clienti**

- 4,99€/mese o 39,99€/anno (-33%)
- Sblocca tutte le guide DIY (3 free + 50-200 premium pianificate Y1-Y3)
- Cross-sell con affiliate Autodoc (pezzi richiesti dalla guida)

**Target**: 5% degli utenti attivi → 10.000 clienti = 500 DIY Pro = 2.500€/mese MRR.

### 🚀 **Leva 5 — Boost (revenue ad-hoc)**

4 pacchetti:
- Boost zona 7 giorni: 19€
- Boost zona 30 giorni: 59€
- Boost nazionale 7 giorni: 79€
- Boost nazionale 30 giorni: 249€

Stima 20% delle officine Pro acquista almeno 1 boost/anno → 280 × 50€ medio = **14.000 €/anno Y2**.

## Costi (unit economics)

### CAC — Customer Acquisition Cost

**Officina pro**:
- Y1 (porta a porta + WhatsApp founder): 0€ marginal cost
- Y2 (volantini + Facebook Ads geo-targeting): ~50€ per officina onboardata
- Y3 (paid + outbound sales rep): ~120€ per officina

**Cliente automobilista**:
- Y1: organico (passaparola + officine onboardate condividono)
- Y2: ~3-5€ via Meta/Google Ads geo-target
- Y3: ~8-12€ + content SEO che converte organicamente

### LTV — Lifetime Value

**Officina Pro**:
- Subscription 29€/mese × churn 2%/mese → LTV subscription = **1.450 €**
- Aggiunta commissioni: + ~600€/anno → +1.500€ LTV su 2,5 anni medi
- **LTV totale officina Pro: ~3.000€**
- **LTV / CAC = 3.000 / 50 = 60x** (eccezionale; benchmark SaaS >3x)

**Cliente**:
- Affiliate Autodoc 21€/anno + (5% di transazioni 150€ × 1,5/anno) = 32€/anno
- Retention 4 anni medi = LTV 128€
- DIY Pro 5% × 60€/anno × 2 anni = +6€ blended
- **LTV totale cliente: ~135€**
- **LTV/CAC > 25x**

### Margine operativo

- Gross margin: ~85% (è una piattaforma SaaS, costi marginali ~quelli di Stripe e Supabase usage)
- Net margin steady-state Y4-Y5: 35-45%

<div class="chart-block">
<p class="chart-title">📊 GRAFICO 8 — Unit Economics: LTV vs CAC officina Pro (€)</p>
<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
  <line x1="100" y1="20" x2="100" y2="220" stroke="#d8e0ea"/>
  <line x1="100" y1="220" x2="700" y2="220" stroke="#d8e0ea"/>
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="end">
    <text x="92" y="224">€0</text>
    <text x="92" y="184">€600</text>
    <text x="92" y="144">€1.200</text>
    <text x="92" y="104">€1.800</text>
    <text x="92" y="64">€2.400</text>
    <text x="92" y="24">€3.000</text>
  </g>
  <g stroke="#eef2f7">
    <line x1="100" y1="184" x2="700" y2="184"/>
    <line x1="100" y1="144" x2="700" y2="144"/>
    <line x1="100" y1="104" x2="700" y2="104"/>
    <line x1="100" y1="64" x2="700" y2="64"/>
  </g>
  <!-- 3 coppie: CAC (rosso) vs LTV (blu). Scala 3000=200 → 1€=0.067px -->
  <!-- Y1: CAC=0, LTV=3000 -->
  <g font-family="Helvetica" font-size="10" text-anchor="middle">
    <rect x="155" y="218" width="55" height="2" fill="#c0392b"/>
    <text x="183" y="214" fill="#c0392b" font-weight="700">€0</text>
    <rect x="215" y="20" width="55" height="200" fill="#0066cc"/>
    <text x="243" y="14" fill="#003d7a" font-weight="800">€3.000</text>
    <text x="213" y="245" fill="#5a6b7d" font-weight="700">ANNO 1 (bootstrap)</text>
    <text x="213" y="258" fill="#5a6b7d" font-size="9">LTV/CAC = ∞ (CAC=0)</text>

    <!-- Y2: CAC=50, LTV=3000 -->
    <rect x="335" y="217" width="55" height="3" fill="#c0392b"/>
    <text x="363" y="212" fill="#c0392b" font-weight="700">€50</text>
    <rect x="395" y="20" width="55" height="200" fill="#0066cc"/>
    <text x="423" y="14" fill="#003d7a" font-weight="800">€3.000</text>
    <text x="393" y="245" fill="#5a6b7d" font-weight="700">ANNO 2 (paid early)</text>
    <text x="393" y="258" fill="#5a6b7d" font-size="9">LTV/CAC = 60×</text>

    <!-- Y3: CAC=120, LTV=3000 -->
    <rect x="515" y="212" width="55" height="8" fill="#c0392b"/>
    <text x="543" y="206" fill="#c0392b" font-weight="700">€120</text>
    <rect x="575" y="20" width="55" height="200" fill="#0066cc"/>
    <text x="603" y="14" fill="#003d7a" font-weight="800">€3.000</text>
    <text x="573" y="245" fill="#5a6b7d" font-weight="700">ANNO 3 (scaling)</text>
    <text x="573" y="258" fill="#5a6b7d" font-size="9">LTV/CAC = 25×</text>
  </g>
  <!-- Legenda -->
  <g font-family="Helvetica" font-size="11">
    <rect x="540" y="30" width="14" height="14" fill="#c0392b"/>
    <text x="560" y="42" fill="#1a202c">CAC (acquisizione)</text>
    <rect x="540" y="50" width="14" height="14" fill="#0066cc"/>
    <text x="560" y="62" fill="#1a202c">LTV (valore vita cliente)</text>
  </g>
</svg>
<p class="chart-source"><strong>Note metodologiche:</strong> LTV calcolato come: subscription 29€/mese × retention 2,5 anni media + revenue da commissioni 600€/anno × 2,5 anni. Benchmark SaaS: LTV/CAC &gt; 3× = sostenibile, &gt; 5× = ottimo. <strong>Nvmcars in tutti gli scenari supera 25×</strong>, segnale di forte unit economics.</p>
</div>

---
---

# 8. TRAZIONE & ROADMAP

## Dove siamo OGGI (Maggio 2026)

### ✅ **Prodotto pronto**
- Mobile app (Customer + Pro + Admin) — completata al 100%
- Sito web companion — completato
- 11 edge functions backend — completate
- 11 migrations DB — pronte al deploy
- Sicurezza enterprise-grade: RLS Postgres, MFA TOTP, SecureStore iOS/Android, scrubbing PII Sentry, rate-limit Upstash Redis
- Audit di sicurezza eseguito: 11 vulnerabilità trovate e risolte
- GDPR + DAC7 compliant by design

### ✅ **Infrastruttura cloud**
- Backend Supabase (Postgres + Auth + Edge Functions + Storage)
- Frontend hostato su Cloudflare Pages
- CI/CD su EAS (Expo Application Services) per build mobile

### 🟡 **In setup**
- Stripe Connect Italia (account business + Connect attivazione)
- App Store / Play Store submission (Apple Developer Program già pagato)
- Awin partnership Autodoc (in approvazione)
- Onboarding prime 5 officine pilot a Cerveteri/Ladispoli

### ⚪ **Non ancora**
- Account PostHog (analytics) — opzionale per V1
- Account Sentry (crash reporting) — opzionale per V1
- Dominio nvmcars.it (in acquisto)
- Investimento esterno

## Roadmap 24 mesi

### **M1-M3 (Giu-Ago 2026) — Lancio Cerveteri/Ladispoli**
- Pubblicazione app sugli store
- Onboarding 30 officine pilota
- 200 utenti attivi
- Validazione product-market fit locale
- Iterazione su feedback

### **M4-M6 (Set-Nov 2026) — Espansione Roma**
- Espansione a Roma sud-ovest e dintorni
- 150 officine attive
- 2.000 utenti attivi
- Prime transazioni in app
- Lancio campagna referral

### **M7-M12 (Dic 2026 - Mag 2027) — Scale Lazio**
- Copertura completa Lazio
- 500 officine attive (200 Pro/Premium paganti)
- 10.000 utenti attivi
- MRR €5.000+
- Lancio DIY Garage con 15 guide
- Partnership Autodoc operativa
- (Se funding) Assunzione growth marketer

### **M13-M18 (Giu-Nov 2027) — Espansione Italia**
- Lombardia, Campania, Toscana, Piemonte
- 1.500 officine attive
- 50.000 utenti
- MRR €20.000+
- 50 guide DIY pubblicate
- Lancio API enterprise (pilot con 1-2 compagnie assicurative)

### **M19-M24 (Dic 2027 - Mag 2028) — Profittabilità + Espansione UE**
- 3.500 officine
- 150.000 utenti
- MRR €50.000+
- Break-even operativo
- Lancio pilota Spagna
- Series A: target €2-3M

## Milestone-Based — KPI per chi investe

| Mese | Officine attive | Utenti | MRR | Transazioni/mese | Investimento richiesto |
|---|---|---|---|---|---|
| M3 | 30 | 200 | €100 | 50 | 0€ (bootstrap) |
| M6 | 150 | 2.000 | €1.500 | 800 | 0€ (bootstrap) |
| M12 | 500 | 10.000 | €5.000 | 3.500 | €100-150k (pre-seed) |
| M18 | 1.500 | 50.000 | €20.000 | 15.000 | (con seed € se ottenuto) |
| M24 | 3.500 | 150.000 | €50.000 | 40.000 | Break-even / Series A |

<div class="chart-block">
<p class="chart-title">📈 GRAFICO 6 — Crescita officine attive (roadmap 24 mesi)</p>
<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
  <line x1="80" y1="30" x2="80" y2="250" stroke="#d8e0ea"/>
  <line x1="80" y1="250" x2="700" y2="250" stroke="#d8e0ea"/>
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="end">
    <text x="72" y="254">0</text>
    <text x="72" y="210">500</text>
    <text x="72" y="166">1.000</text>
    <text x="72" y="122">2.000</text>
    <text x="72" y="78">3.000</text>
    <text x="72" y="40">3.500 officine</text>
  </g>
  <g stroke="#eef2f7">
    <line x1="80" y1="210" x2="700" y2="210"/>
    <line x1="80" y1="166" x2="700" y2="166"/>
    <line x1="80" y1="122" x2="700" y2="122"/>
    <line x1="80" y1="78" x2="700" y2="78"/>
  </g>
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="middle">
    <text x="140" y="270">M3</text>
    <text x="240" y="270">M6</text>
    <text x="370" y="270">M12</text>
    <text x="490" y="270">M18</text>
    <text x="620" y="270">M24</text>
  </g>
  <!-- Linea crescita. Mapping: 0=250, 3500=40. Range 210px / 3500 = 0.06 px/officina -->
  <!-- M3=30 → 250-30*0.06=248.2; M6=150→241; M12=500→220; M18=1500→160; M24=3500→40 -->
  <polyline points="140,248 240,241 370,220 490,160 620,40"
            fill="none" stroke="#0066cc" stroke-width="4" stroke-linecap="round"/>
  <!-- Area sotto -->
  <polyline points="140,248 240,241 370,220 490,160 620,40 620,250 140,250"
            fill="#0066cc" opacity="0.1"/>
  <g fill="#0066cc">
    <circle cx="140" cy="248" r="5"/>
    <circle cx="240" cy="241" r="5"/>
    <circle cx="370" cy="220" r="5"/>
    <circle cx="490" cy="160" r="5"/>
    <circle cx="620" cy="40" r="6" fill="#003d7a"/>
  </g>
  <g font-family="Helvetica" font-size="10" fill="#1a202c" text-anchor="middle">
    <text x="140" y="240">30</text>
    <text x="240" y="232">150</text>
    <text x="370" y="211">500</text>
    <text x="490" y="151">1.500</text>
    <text x="620" y="30" font-weight="800" fill="#003d7a">3.500</text>
  </g>
  <!-- Annotazione: zona pre-seed -->
  <line x1="370" y1="40" x2="370" y2="250" stroke="#c0392b" stroke-dasharray="3,3" opacity="0.5"/>
  <text x="370" y="295" font-family="Helvetica" font-size="10" fill="#c0392b" text-anchor="middle" font-weight="700">⚡ Round pre-seed M12</text>
</svg>
<p class="chart-source"><strong>Note:</strong> Proiezione interna basata su sequenza go-to-market a 3 fasi (vedi sezione 10). M3–M6 = bootstrap autofounder; M12 = potenziale milestone funding; M18–M24 = espansione nazionale.</p>
</div>

<div class="chart-block">
<p class="chart-title">📊 GRAFICO 7 — Mix ricavi 3 anni per leva (stacked bar, %)</p>
<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
  <line x1="80" y1="30" x2="80" y2="250" stroke="#d8e0ea"/>
  <line x1="80" y1="250" x2="700" y2="250" stroke="#d8e0ea"/>
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="end">
    <text x="72" y="254">0%</text>
    <text x="72" y="210">20%</text>
    <text x="72" y="166">40%</text>
    <text x="72" y="122">60%</text>
    <text x="72" y="78">80%</text>
    <text x="72" y="34">100%</text>
  </g>
  <!-- Y1: Subscription 27.9%, Commission 64.1%, Autodoc 2%, DIY 6%, Boost 0%, API 0% -->
  <!-- Tot 220px (250-30). 28%→61px subscr fino y=189. -->
  <g font-family="Helvetica" font-size="10" text-anchor="middle">
    <!-- Y1 -->
    <rect x="160" y="189" width="100" height="61" fill="#0066cc"/>
    <text x="210" y="225" fill="#fff" font-weight="700">Sub 28%</text>
    <rect x="160" y="48" width="100" height="141" fill="#0066cc" opacity="0.75"/>
    <text x="210" y="125" fill="#fff" font-weight="700">Comm 64%</text>
    <rect x="160" y="35" width="100" height="13" fill="#0066cc" opacity="0.55"/>
    <rect x="160" y="30" width="100" height="5" fill="#0066cc" opacity="0.35"/>
    <text x="210" y="280" fill="#5a6b7d" font-weight="700">ANNO 1</text>

    <!-- Y2: Subscription 60.5%, Commission 10.8%, Autodoc 4.8%, DIY 14.9%, Boost 9%, API 0%-->
    <rect x="320" y="117" width="100" height="133" fill="#0066cc"/>
    <text x="370" y="190" fill="#fff" font-weight="700">Sub 60%</text>
    <rect x="320" y="93" width="100" height="24" fill="#0066cc" opacity="0.75"/>
    <text x="370" y="108" fill="#fff" font-weight="700">Comm 11%</text>
    <rect x="320" y="60" width="100" height="33" fill="#0066cc" opacity="0.55"/>
    <text x="370" y="80" fill="#fff" font-weight="600">DIY 15%</text>
    <rect x="320" y="40" width="100" height="20" fill="#0066cc" opacity="0.35"/>
    <text x="370" y="55" fill="#1a202c" font-size="9">Boost 9% · Aut 5%</text>
    <text x="370" y="280" fill="#5a6b7d" font-weight="700">ANNO 2</text>

    <!-- Y3: Subscription 50.2%, Commission 19.7%, Autodoc 3.3%, DIY 14.2%, Boost 4.7%, API 7.9%-->
    <rect x="480" y="140" width="100" height="110" fill="#0066cc"/>
    <text x="530" y="200" fill="#fff" font-weight="700">Sub 50%</text>
    <rect x="480" y="97" width="100" height="43" fill="#0066cc" opacity="0.75"/>
    <text x="530" y="123" fill="#fff" font-weight="700">Comm 20%</text>
    <rect x="480" y="66" width="100" height="31" fill="#0066cc" opacity="0.55"/>
    <text x="530" y="85" fill="#fff" font-weight="600">DIY 14%</text>
    <rect x="480" y="49" width="100" height="17" fill="#0066cc" opacity="0.35"/>
    <text x="530" y="61" fill="#1a202c" font-size="9">API 8%</text>
    <rect x="480" y="30" width="100" height="19" fill="#0066cc" opacity="0.25"/>
    <text x="530" y="42" fill="#1a202c" font-size="9">Boost+Auto 8%</text>
    <text x="530" y="280" fill="#5a6b7d" font-weight="700">ANNO 3</text>

    <!-- Totali in alto -->
    <text x="210" y="22" fill="#1a202c" font-weight="800">€30k</text>
    <text x="370" y="22" fill="#1a202c" font-weight="800">€201k</text>
    <text x="530" y="22" fill="#003d7a" font-weight="800">€1.268k</text>
  </g>
</svg>
<p class="chart-source"><strong>Note:</strong> La diversificazione dei ricavi cresce nel tempo: da Y1 dominato da commissioni transazioni (passa-passa veloce) a Y3 con subscription dominante (revenue prevedibile e MRR-based — più valore in caso di exit).</p>
</div>

---
---

# 9. CONCORRENZA

## Landscape competitivo italiano

### Competitor diretti (marketplace officine)

| Player | Pro | Contro | Status |
|---|---|---|---|
| **PIT-Service** | Brand riconosciuto | Solo Bologna, no app moderna | Locale |
| **Repairsmith** | UX ottima | Solo USA, no plan Italia | No |
| **Autoyas** | App esistente | Solo concessionarie | Limitato |
| **Wuto** | Marketplace gomme | Solo gomme, no marketplace | Verticale |
| **Officinas.eu** | Directory | Solo lookup, no transazione | Statico |

**Insight**: Non esiste un player nativo Italia che faccia marketplace + transazione + app moderna. Il vuoto è confermato.

### Competitor indiretti (touchpoint del cliente)

| Player | Cosa fa | Perché non è una minaccia |
|---|---|---|
| **Google Maps** | Directory officine | Niente prenotazione, niente preventivi, recensioni fake |
| **Yelp Italia** | Directory ristoranti+ | Marginale in auto, abbandonato in Italia |
| **AutoScout24** | Marketplace acquisto auto | Non si occupa di manutenzione |
| **Subito Motori** | Annunci usato | No service |
| **Bosch Car Service** | Network certificato | Solo officine del network, non aperto al mercato |
| **Norauto / Midas / Euromaster** | Franchising | Solo proprietari, non vendono UX |

### Sostituti

- **WhatsApp / Telefono**: incumbent dominante, ma altissimo friction
- **Passaparola**: lento, non scalabile, non misurabile
- **Sito officina singola**: 73% non ce l'ha; chi ce l'ha è statico

## Vantaggi competitivi di Nvmcars

### 🛡️ **1. Network effects**
Marketplace classico: più officine → più scelta → più clienti → più transazioni → più officine. **Una volta che parte, l'effetto è auto-rinforzante**.

### 🚀 **2. Multi-revenue stream**
Resilienza: anche se la commissione transazioni va sotto pressione (es. competitor lo fa a 3%), abbiamo subscription, affiliate, DIY, boost. **Diversificazione = stabilità**.

### 🔒 **3. Compliance Italia-native**
DAC7, P.IVA forfettaria, IBAN, stripe-italia, fatturazione elettronica integrabile (Y2): un competitor USA dovrebbe rifare tutta la compliance da zero. **Barriera regolatoria di lungo periodo**.

### 🧰 **4. Tecnologia leggera ed economica**
Stack su Supabase + Cloudflare + Stripe = **costi infrastrutturali zero fino a 10.000 utenti attivi**, marginali fino a 100k. Margini lordi >85%.

### 📍 **5. Vantaggio "first mover" + hyperlocal**
Lanciamo a Cerveteri/Ladispoli (paese del fondatore) → conoscenza del territorio, accesso fisico alle officine, primi clienti via passaparola autentico. Una multinazionale non può replicare questa partenza intima.

### 🎓 **6. DIY = differenziatore unico**
Nessun competitor europeo ha integrato un'enciclopedia di guide DIY a pagamento monetizzato con affiliate ricambi. È una feature trasversale che rinforza loyalty senza cannibalizzare le officine.

---
---

# 10. GO-TO-MARKET STRATEGY

## Strategia di lancio in 3 fasi

### **Fase 1 — Hyperlocal validation** (M1-M3)

**Geografia**: Cerveteri + Ladispoli (~70.000 abitanti, ~150 officine censite)
**Acquisizione officine** (zero budget):
- Porta a porta del founder: visita di persona ogni officina, demo app, 6 mesi Premium gratis
- Obiettivo: 30 officine attive entro 90 giorni
**Acquisizione clienti** (zero budget):
- Officine ambassador: ogni officina pubblicizza Nvmcars ai propri clienti (vetrina, biglietto da visita, WhatsApp)
- WhatsApp del founder con i propri contatti
- Volantini stampati (15€ per 500 pezzi) presso autolavaggi, distributori, gommisti
**KPI Fase 1**:
- 30 officine onboardate
- 200 utenti attivi
- 50 transazioni
- NPS > 50

### **Fase 2 — Replicazione locale** (M4-M12)

**Geografia**: Roma → Lazio → Toscana
**Strategia officine**:
- "Ambasciatore di città": una officina Premium per città che porta 5 colleghi (commission referral 10€/officina)
- Outbound: lista officine da Camera di Commercio + email/chiamate dirette
**Strategia clienti**:
- SEO sul sito web (pagine officina + città + servizio) → ranking Google
- Meta Ads geo-target (€500/mese budget)
- Partnership con scuole guida, autoscuole, autolavaggi (referral)
- Lancio referral code (5€/iscritto, capped)
**KPI Fase 2**:
- 500 officine
- 10.000 utenti
- 3.500 transazioni/mese
- CAC < 50€ per officina

### **Fase 3 — Scale nazionale + UE** (M13-M24)

**Geografia**: tutto il territorio nazionale + pilot Spagna
**Strategia**:
- Sales rep dedicati (3 FTE) per onboarding officine in città target
- Marketing performance scalato (€5.000/mese)
- Partnership strategica: 1-2 compagnie assicurative ("trova officina convenzionata")
- PR mainstream (Quattroruote, Repubblica, IlSole24Ore)
- Sponsorship eventi automotive (Motor Show Bologna, Salone di Torino)
**KPI Fase 3**:
- 3.500 officine
- 150.000 utenti
- MRR €50.000
- Break-even

## Canali di acquisizione

### Per le officine

1. **Outbound founder/sales** (Y1-Y2): più efficace per gli early adopter
2. **Referral officine** (Y1+): 10€ credito per ogni amico portato
3. **Content marketing B2B**: blog + LinkedIn + post-trafiletti (Y2)
4. **Eventi settoriali**: Autopromotec, Automechanika Roma (Y2)
5. **Partnership**: Camere di Commercio, associazioni di categoria (Y2-Y3)

### Per i clienti

1. **SEO**: pagine officina indicizzate Google → traffico organico (Y1+)
2. **Officine ambassador**: ogni officina onboardata = 50-200 clienti potenziali contattabili
3. **Referral utenti**: 5€/amico iscritto
4. **Meta + Google Ads** geo-targeting (Y2+, €500-5.000/mese)
5. **TikTok/Reels content**: video DIY accessibili (Y1+, founder-led)
6. **PR + influencer locali**: auto-tuber italiani (es. Davide Cironi)

## Pricing strategy

Strategia: **freemium per le officine + early bird scarcity**

- Free tier: rimuove la barriera di ingresso
- Pro 29€: prezzo psicologico sotto i 30€, retention via valore (statistiche)
- Premium 79€: valore percepito alto (top + supporto + boost gratuito)
- **Pioneer offer**: prime 100 officine a 19€/mese a vita → urgenza + advocacy
- **DIY Pro 4,99€**: prezzo "Spotify-like", entry-level psicologico

## Tasso atteso di conversione

- Visit sito web → install app: 8-12%
- Install app → registrazione: 60%
- Registrazione cliente → prima transazione: 25% entro 30 giorni
- Officina onboardata → upgrade Pro: 30% entro 60 giorni (dopo trial)
- Cliente attivo → DIY Pro: 5% entro 6 mesi

---
---

# 11. TECNOLOGIA & SICUREZZA

## Architettura

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Mobile App   │    │ Web Site     │    │ Admin Tools  │
│ React Native │    │ Next.js 14   │    │ (Supabase    │
│ Expo SDK 54  │    │ Tailwind     │    │  Dashboard)  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └─────────┬─────────┴───────────────────┘
                 │
                 ▼
       ┌──────────────────┐
       │ Supabase Cloud   │
       │ ─ Auth (MFA TOTP)│
       │ ─ Postgres + RLS │
       │ ─ Storage        │
       │ ─ Edge Functions │
       │ ─ Realtime       │
       └────────┬─────────┘
                │
       ┌────────┴────────────┐
       │                     │
       ▼                     ▼
  ┌─────────┐         ┌──────────────┐
  │ Stripe  │         │ Autodoc (Awin│
  │ Connect │         │  affiliate)  │
  └─────────┘         └──────────────┘
```

## Stack tecnologico (scelta razionalizzata)

| Componente | Tecnologia | Perché |
|---|---|---|
| Mobile app | React Native + Expo SDK 54 | Single codebase iOS+Android, hot reload, ecosystema maturo |
| Backend | Supabase (Postgres + Edge Functions Deno) | Open source (no vendor lock), gratuito fino a scale, conforme GDPR (server EU Francoforte) |
| Pagamenti | Stripe Connect Express | Lo standard mondiale, supporto Italia completo, sicurezza PCI-DSS gestita |
| Sito web | Next.js 14 + Cloudflare Pages | SEO-first, ISR, deploy gratuito |
| Mappa | react-native-maps (Google + Apple native) | Nativo, no costi extra fino a 28k req/mese |
| Push notifiche | Expo Notifications | Cross-platform, gestione token automatica |
| Sicurezza chiavi | expo-secure-store (Keychain iOS / Keystore Android) | Cifratura hardware |
| Analytics | PostHog Cloud EU | Open source friendly, GDPR-compliant, free tier 1M eventi/mese |
| Crash reporting | Sentry | Standard de facto, free tier 5k errors/mese |
| Email | Supabase Auth nativo | Niente provider esterno per V1 |
| Rate limiting | Upstash Redis | Serverless, 10k req/giorno gratis |

## Sicurezza enterprise-grade

### Misure di sicurezza implementate

1. **Row Level Security (RLS) su ogni tabella Postgres**: ogni utente vede solo i suoi dati a livello DB
2. **Multi-Factor Authentication TOTP** (Time-based One-Time Password) per officine (Google Authenticator, Authy, 1Password)
3. **Session salvata in Secure Store** (Keychain iOS / Keystore Android) cifrato hardware, non in AsyncStorage in chiaro
4. **Verifica firma webhook Stripe** (`constructEventAsync`): nessuno può fingere un pagamento
5. **Rate limiting multi-layer**: Upstash Redis + IP-based su endpoint sensibili
6. **Input validation Zod** su ogni edge function (no SQL injection, no malformed data)
7. **Scrubbing PII Sentry**: email/IBAN/CF mai inviati a sistemi terzi
8. **Trigger immutabilità DB**: customer_id, workshop_id, ecc. non modificabili dal client
9. **Domain whitelist** per link esterni (no open redirect)
10. **CSP headers** sul sito web (no XSS)
11. **Code-level grants su Postgres**: campi sensibili PII non leggibili da utenti normali

### Penetration test eseguito

A maggio 2026 abbiamo eseguito un audit di sicurezza con 4 simulazioni di attacco indipendenti:
- ✅ Edge functions: 8 vulnerabilità identificate, 8 risolte
- ✅ RLS Postgres: 7 bypass identificati, 7 risolti
- ✅ Client app: 6 leak/IDOR identificati, 6 risolti
- ✅ Migrations & DB: 12 issue di integrità identificate, 12 risolte

**Report disponibile per investitori sotto NDA.**

## Compliance

### GDPR (Regolamento UE 2016/679)
- ✅ Privacy Policy + Cookie Policy generati e linkati (Iubenda)
- ✅ Consenso esplicito al tracking (ATT iOS, equivalent Android)
- ✅ **Diritto di accesso (Art. 15)**: dashboard utente "Esporta dati" → JSON completo
- ✅ **Diritto all'oblio (Art. 17)**: dashboard utente "Cancella account" → cancellazione completa + anonimizzazione storica fiscale
- ✅ **Portabilità (Art. 20)**: stesso JSON export, formato standard
- ✅ Server in UE (Supabase Francoforte)
- ✅ Cifratura at-rest e in-transit (TLS 1.3)

### DAC7 (Direttiva UE 2021/514 - Marketplace fiscali)
- ✅ Raccolta P.IVA, codice fiscale, IBAN, indirizzo legale dei professionisti
- ✅ Trigger DB che marca `dac7_complete = true` automaticamente
- ✅ Tabella `subscriptions` per tracking versamenti
- ✅ Pronti al reporting annuale all'Agenzia delle Entrate

### PCI-DSS
- ✅ Outsourced a Stripe: noi non tocchiamo mai i dati carta
- ✅ Stripe Elements per input (PCI-DSS Level 1 certificato)

### Apple/Google Store policies
- ✅ Privacy Manifest iOS (NSPrivacyAccessedAPITypes, NSPrivacyCollectedDataTypes)
- ✅ Permessi minimi (location only when in use, no background)
- ✅ Permessi giustificati (camera per foto auto, microfono per video)

---
---

# 12. TEAM & EQUITY

## Founder

### **[Nome Cognome]** — Founder & CEO
- Età: [DA COMPLETARE]
- Background: [DA COMPLETARE — formazione, esperienze precedenti, eventuali aziende fondate]
- Competenze: [DA COMPLETARE — es. business, vendita, conoscenza territorio]
- Sede: Cerveteri (RM)
- Equity attuale: 100%
- Commitment: full-time dal Q3 2026

## Posizioni aperte (priority hire)

### **CTO Co-founder** (priority #1)
- Profilo cercato: full-stack senior con esperienza React Native + Postgres
- Equity offerta: 15-25% (4 year vesting, 1 year cliff)
- Stipendio: zero in pre-seed, minimo viable post-funding
- Responsabilità: mantenere e scalare lo stack tecnologico, gestire AI roadmap, recruiting tecnico Y2

### **Growth/Marketing Lead** (Y1 priority #2)
- Profilo cercato: ex marketplace (Glovo, Deliveroo, Casavo) con esperienza onboarding seller
- Equity offerta: 2-5%
- Stipendio: 35-45k EUR + bonus performance
- Responsabilità: pipeline officine, content, social, brand

### **Operations / Customer Success** (Y2)
- Profilo cercato: junior con passione automotive
- Equity: 0,5-1%
- Stipendio: 28-32k EUR
- Responsabilità: support clienti+officine, dispute resolution

### **Sales Rep regionali** (Y2-Y3)
- 3 FTE per Nord/Centro/Sud
- Misto commission-based + fisso

## Advisory Board (target Y1)

Posti aperti per advisor con background in:
- **Aftermarket auto** (es. ex-Bosch, ex-Norauto)
- **Marketplace SaaS** (es. ex-Casavo, ex-Glovo)
- **Pagamenti Italia** (es. ex-Satispay, ex-Stripe)
- **Investitori veterani** (Italian Founders Fund, P101, LIFTT)

Equity advisor: 0,25-1% (vesting 2 anni)

## Cap Table — Scenario A (pre-seed €200k)

| Stakeholder | Equity attuale | Equity post-deal | Note |
|---|---|---|---|
| Founder | 100% | 60-65% | Vesting 4 anni iniziato all'incorporation |
| CTO Co-founder | 0% | 18-22% | Vesting 4 anni, cliff 1 anno |
| Investor pre-seed | 0% | 12-18% | Tier ordinario, anti-dilution full ratchet escluso |
| Advisory pool | 0% | 1-2% | Vesting 2 anni |
| Employee Option Pool | 0% | 5-8% | Per assunzioni Y1-Y2 |

## Cap Table — Scenario B (no funding, co-founder sweat)

| Stakeholder | Equity post |
|---|---|
| Founder | 60-70% |
| CTO Co-founder | 25-35% |
| Advisory pool | 1-2% |
| Future ESOP | 5% |

---
---

# 13. PROIEZIONI FINANZIARIE

<div class="chart-block">
<p class="chart-title">📈 GRAFICO 5 — Proiezione ricavi totali 3 anni (scenario bootstrap, in €)</p>
<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
  <line x1="80" y1="30" x2="80" y2="240" stroke="#d8e0ea"/>
  <line x1="80" y1="240" x2="700" y2="240" stroke="#d8e0ea"/>
  <g font-family="Helvetica" font-size="10" fill="#5a6b7d" text-anchor="end">
    <text x="72" y="244">0</text>
    <text x="72" y="207">250k</text>
    <text x="72" y="170">500k</text>
    <text x="72" y="133">750k</text>
    <text x="72" y="96">1,0M</text>
    <text x="72" y="59">1,25M</text>
    <text x="72" y="34">€/anno</text>
  </g>
  <g stroke="#eef2f7">
    <line x1="80" y1="204" x2="700" y2="204"/>
    <line x1="80" y1="167" x2="700" y2="167"/>
    <line x1="80" y1="130" x2="700" y2="130"/>
    <line x1="80" y1="93" x2="700" y2="93"/>
    <line x1="80" y1="56" x2="700" y2="56"/>
  </g>
  <!-- Barre stacked. Scala: 1.25M=205px → 1€=0.000164 px circa, ma per leggibilità uso ratio.
       Y1=29.950, Y2=200.700, Y3=1.268.215. Altezza max Y3 = 210-210*(1268215/1250000)=fuori scala leggermente, normalizzo.
       Uso: pixelHeight = value/1250000 * 205. -->
  <!-- Y1 -->
  <g font-family="Helvetica" font-size="10">
    <rect x="140" y="235" width="120" height="5" fill="#0066cc"/>
    <text x="200" y="225" text-anchor="middle" font-weight="800" fill="#1a202c">€29.950</text>
    <text x="200" y="260" text-anchor="middle" font-weight="700" fill="#5a6b7d">ANNO 1 (2026)</text>
    <text x="200" y="275" text-anchor="middle" font-size="9" fill="#5a6b7d">80 officine attive</text>
  </g>
  <!-- Y2 -->
  <g font-family="Helvetica" font-size="10">
    <rect x="320" y="207" width="120" height="33" fill="#0066cc" opacity="0.85"/>
    <text x="380" y="197" text-anchor="middle" font-weight="800" fill="#1a202c">€200.700</text>
    <text x="380" y="260" text-anchor="middle" font-weight="700" fill="#5a6b7d">ANNO 2 (2027)</text>
    <text x="380" y="275" text-anchor="middle" font-size="9" fill="#5a6b7d">800 officine attive</text>
  </g>
  <!-- Y3 -->
  <g font-family="Helvetica" font-size="10">
    <rect x="500" y="32" width="120" height="208" fill="#003d7a"/>
    <text x="560" y="22" text-anchor="middle" font-weight="800" fill="#1a202c">€1.268.215</text>
    <text x="560" y="260" text-anchor="middle" font-weight="700" fill="#5a6b7d">ANNO 3 (2028)</text>
    <text x="560" y="275" text-anchor="middle" font-size="9" fill="#5a6b7d">3.500 officine attive</text>
  </g>
  <!-- Frecce crescita -->
  <text x="290" y="200" font-family="Helvetica" font-size="11" fill="#0066cc" font-weight="800" text-anchor="middle">×6,7</text>
  <text x="470" y="120" font-family="Helvetica" font-size="11" fill="#003d7a" font-weight="800" text-anchor="middle">×6,3</text>
</svg>
<p class="chart-source"><strong>Note:</strong> Proiezione interna basata su benchmark SaaS marketplace (LTV/CAC, churn 2%/mese, conversion freemium → Pro 30%). Dati reali alla base: prezzo subscription, fee Stripe, commissione Awin. Per dettaglio delle 5 leve di ricavo vedi sezione 13 sottostante.</p>
</div>

## Conto Economico (3 anni)

| Voce (€) | Anno 1 | Anno 2 | Anno 3 |
|---|---|---|---|
| **Ricavi subscription officine** | 8.350 | 121.500 | 637.200 |
| **Commissioni transazioni** | 19.200 | 21.600 | 249.375 |
| **Affiliate Autodoc** | 600 | 9.600 | 42.000 |
| **DIY Pro subscription** | 1.800 | 30.000 | 179.640 |
| **Boost** | 0 | 18.000 | 60.000 |
| **API enterprise** | 0 | 0 | 100.000 |
| **TOTAL REVENUE** | **29.950** | **200.700** | **1.268.215** |
| Costi infrastruttura cloud | 0 (free tier) | 1.500 | 8.000 |
| Costi Stripe (3,4% + 0,30€/transazione) | 1.500 | 14.000 | 95.000 |
| Costi marketing & ads | 500 | 12.000 | 80.000 |
| Costi terze parti (Iubenda, PostHog, ecc.) | 200 | 1.500 | 3.500 |
| Costi legali, contabili, fiscali | 1.500 | 6.000 | 15.000 |
| Stipendi (lordo + contributi) | 0 (founder unpaid) | 35.000 | 220.000 |
| Apple/Google Dev Program | 124 | 124 | 124 |
| **TOTAL COSTS** | **3.824** | **70.124** | **421.624** |
| **EBITDA** | **26.126** | **130.576** | **846.591** |
| Margine EBITDA | 87% | 65% | 67% |

## Conto economico — Scenario "con investimento €200k pre-seed in M6"

Stesso piano ma con accelerazione:
- Più marketing (€20k Y1, €60k Y2, €200k Y3)
- Assunzione growth marketer (M9 invece di M15)
- Lancio nazionale 6 mesi in anticipo

| Voce (€) | Anno 1 | Anno 2 | Anno 3 |
|---|---|---|---|
| TOTAL REVENUE | 45.000 | 350.000 | 1.800.000 |
| TOTAL COSTS | 75.000 | 180.000 | 650.000 |
| EBITDA | -30.000 | +170.000 | +1.150.000 |
| **Cumulato cash** dal seed | +170.000 | +340.000 | +1.490.000 |

## Cash flow

### Scenario bootstrap (senza funding)
- Year 1: break-even mese 8
- Year 2: cash positive da inizio
- Year 3: dividendi possibili o reinvestimento

### Scenario con seed
- Year 1: burn rate €5-7k/mese → 12 mesi runway con €100k, 24 mesi con €200k
- Year 2: cash neutral entro M15
- Year 3: cash flow positive forte

## Assunzioni chiave delle proiezioni

1. **Churn officine Pro**: 2%/mese (= ~22%/anno annualizzato), benchmark SaaS conservativo
2. **Conversion utente attivo → DIY Pro**: 5%, benchmark Spotify-like
3. **CAC officina**: €0 in Y1 (bootstrap), €50 in Y2, €120 in Y3
4. **Take rate transazioni**: 5% (commissione netta dopo fee Stripe)
5. **Crescita user base**: 30% MoM nei primi 6 mesi, 15% MoM dopo
6. **GMV (Gross Merchandise Value) per officina/mese**: €400 in Y1, €720 in Y2, €1.140 in Y3 (in linea con scontrino medio €80-95)
7. **Penetrazione DIY Pro**: 5% Y1, 8% Y2, 12% Y3 (cresce con quantità di guide pubblicate)

## Stress test

Cosa succede se:
- **Churn officine raddoppia (5%/mese)**: revenue Y3 a €870k (-32%), ancora EBITDA-positive
- **CAC officina raddoppia**: costi marketing Y3 a €160k, ancora EBITDA-positive
- **Concorrente entra con prezzo 50% inferiore**: riduciamo Pro a 19€/mese, MRR -34%, ma defensiamo con feature DIY/Autodoc → revenue Y3 a €1M, ancora positivo

---
---

# 14. LA RICHIESTA

## Scenario A — Investimento pre-seed

**Ask: 150.000 - 250.000 EUR**

**Equity offerta: 12-18%**

**Valutazione pre-money: 1.000.000 - 1.200.000 EUR**

### Strumento

- SAFE post-money (Y-Combinator standard) o equity tradizionale
- Anti-dilution: weighted average (no full ratchet)
- Liquidation preference: 1x non-participating
- Board seat: founder mantiene 1 seat su 3 (1 founder, 1 investor, 1 indipendente)
- Information rights: report mensile semplificato

### Use of funds (con €200k)

| Voce | % | Importo |
|---|---|---|
| Stipendi team (CTO + growth + ops) | 50% | €100.000 |
| Marketing & Ads | 25% | €50.000 |
| Setup legale + IP + contabilità | 5% | €10.000 |
| Tools, software, infrastruttura | 5% | €10.000 |
| Eventi, fiere, PR | 5% | €10.000 |
| Buffer operativo / contingency | 10% | €20.000 |
| **Totale** | **100%** | **€200.000** |

### Timeline runway

Con €200k, 18 mesi di runway che ci portano a:
- **M18**: 1.500 officine, 50k utenti, €20k MRR
- **A quel punto**: pronti per Series A o break-even autofinanziato

### Investor profile cercato

- Pre-seed o seed-stage VC con focus consumer/marketplace Italia
- Business angel con experience in automotive aftermarket
- Family office interessato a marketplace verticali
- Smart money > dumb money: cerchiamo capitale + network + competenze

**Investitori target** (esempi pubblici, non endorsement):
- Italian Founders Fund
- P101 Ventures
- LIFTT
- Vento Ventures
- Club Italia Investimenti
- Business angel singoli ex-Yoox, ex-Satispay, ex-Glovo Italia

## Scenario B — Co-founder (no funding)

**Ask: CTO Co-founder full-time committed per minimo 12 mesi**

**Equity offerta: 20-30%** (vesting 4 anni, cliff 1 anno)

**Compensation cash**: zero in pre-seed, salary minimo viable post-funding

### Profilo cercato

- **Full-stack senior** (5+ anni esperienza)
- **React Native expertise** (Expo SDK è plus)
- **Backend Postgres + edge functions / serverless**
- **Esperienza scale-up** (almeno 1 progetto in produzione con 10k+ utenti)
- **Mindset entrepreneur**, non corporate
- **Sede**: Roma o remoto Italia (presenza fisica Cerveteri 1x/mese minimo per M1-M6)

### Cosa offriamo

- Quote significativa in un progetto pronto al deploy (vedi sezione 11 stack)
- Visione chiara, mercato validato, infrastruttura pronta
- Founder con focus su business/sales, deleghiamo il tech
- Possibilità di guadagnare 6 figure se scaliamo come previsto (Y3: equity vesting 15% × €15M valuation = €2.25M)

## Cosa NON cerchiamo

- ❌ Consulenti pagati hourly senza skin in the game
- ❌ Investitori con "term sheet con clausole leonine" (anti-dilution full ratchet, drag-along estremo, ecc.)
- ❌ Co-founder part-time o "moonlight" (la velocità è critica)
- ❌ Soci silenti che vogliono dividendi nel primo anno

---
---

# 15. MITIGAZIONE DEL RISCHIO

## Rischio 1 — Adoption più lenta del previsto

**Probabilità**: Media | **Impatto**: Alto

**Cause possibili**:
- Officine resistenti al digitale
- Clienti che non scaricano un'altra app
- WhatsApp/passaparola dominano

**Mitigazione**:
- Onboarding officine porta-a-porta (no tech adoption necessaria dall'officina)
- Approccio hyperlocal: Cerveteri/Ladispoli prima, padronanza territorio
- Free tier per officine = zero barrier
- Sito web SEO-first = traffico organico anche senza install app

**KPI di allarme**: se al M6 abbiamo < 50 officine attive, fermiamo l'espansione e iteriamo.

## Rischio 2 — Competitor con più capitale entra

**Probabilità**: Media | **Impatto**: Medio

**Cause possibili**:
- Player USA (es. Repairsmith) decide di espandersi in Europa
- Big tech italiano (es. Subito.it) lancia verticale

**Mitigazione**:
- Velocità: prendiamo prima possibile il mercato
- Compliance Italia-native = barriera regolatoria
- Network effects (officine + clienti)
- DIY = differenziatore difficile da replicare velocemente
- Possibile exit early via acquisizione da competitor (rischio diventa opportunità)

## Rischio 3 — Stripe / Supabase cambia pricing o policy

**Probabilità**: Bassa | **Impatto**: Medio

**Mitigazione**:
- Stack open source (Postgres, Deno) = portabile su AWS/GCP se serve
- Stripe è leader ma non monopolio: Adyen come piano B
- Architettura abstracted (servizi separati) = swap relativo

## Rischio 4 — Frode pagamenti / dispute

**Probabilità**: Media | **Impatto**: Medio

**Mitigazione**:
- Stripe Radar incluso (fraud detection nativo)
- Identità verificata (KYC) lato officina via Stripe Connect
- Trattenuta provvisoria 7 giorni per nuove officine
- Termini di servizio con foro di Roma, mediazione obbligatoria pre-causa

## Rischio 5 — Burnout founder

**Probabilità**: Media | **Impatto**: Critico

**Mitigazione**:
- Co-founder CTO entro M6 (priority hire)
- Outsourcing customer support al growth della scale
- Disciplina nei limiti settimanali: max 6gg/settimana, max 11h/giorno
- Coach/mentor presence dal mese 3

## Rischio 6 — Mutamento normativo (DAC7, marketplace tax)

**Probabilità**: Bassa | **Impatto**: Medio

**Mitigazione**:
- Compliance proactive: schema DB già DAC7-ready
- Consulente fiscale dedicato dal mese 1 (Fiscozen come start, studio dedicato Y2)
- Monitoraggio normativa via Confcommercio, ADIRA

## Rischio 7 — Concentrazione geografica

**Probabilità**: Alta in Y1, decrescente | **Impatto**: Basso

**Mitigazione**:
- Y1: scelta consapevole (validazione locale)
- Y2: diversificazione su 3-4 regioni
- Y3: copertura nazionale → no concentration risk

---
---

# 16. EXIT STRATEGY

## Opzioni di exit a 5-7 anni

### **Opzione A — Acquisizione strategica** (più probabile)

**Possibili acquirenti**:

#### Aftermarket leaders
- **Bosch Mobility Aftermarket**: già attivo in Italia, potrebbe internalizzare il marketplace di officine indipendenti
- **Schaeffler Automotive Aftermarket**
- **Mecaglas / Maletra**: grandi distributori italiani

**Multipli tipici aftermarket SaaS**: 8-12x ARR

#### Insurtech / Mobility platform
- **Genertel** (Generali): aggiungere "officine convenzionate" al loro ecosistema
- **UnipolSai**
- **Yolo, Lokky**: startup insurtech in cerca di verticali B2C
- **Volkswagen Financial Services / Stellantis**: marketplace ufficiale dopo-vendita

**Multipli tipici insurtech**: 6-10x ARR

#### Marketplace leaders Italia
- **AutoScout24**: estensione verso post-vendita
- **Subito.it Motori**: idem
- **Subito Casa** style consolidation

**Multipli tipici marketplace consolidato**: 5-8x revenue

### **Opzione B — IPO Borsa Italiana segmento STAR**

Realistico da Y5-Y7 con:
- Revenue annuale > 10M EUR
- Crescita > 30% YoY
- EBITDA positivo
- Compliance corporate (governance, audit Big4)

### **Opzione C — Acquisizione private equity**

Fondo PE focalizzato su SaaS B2B (es. EQT, Permira, Investindustrial) per ulteriore espansione UE.

## Scenario di valutazione exit

Assumendo Y5: revenue €15M, crescita 35%, EBITDA 25%:

| Acquirente | Multiplo | Exit value | ROI investitore pre-seed (€200k @ 15%) |
|---|---|---|---|
| Aftermarket strategico | 10x ARR | €150M | 22,5M EUR (113x) |
| Insurtech | 8x ARR | €120M | 18M EUR (90x) |
| Marketplace | 6x ARR | €90M | 13,5M EUR (67x) |
| IPO | P/S 5x | €75M | 11,25M EUR (56x) |

> *Cifre indicative, non garanzie. Soggetto a condizioni di mercato.*

---
---

# 17. APPENDICE

## A.1 — Stato del codice (Maggio 2026)

- **Repository GitHub**: `nvmelessProduction/Nvmcars` (privato, accesso su richiesta sotto NDA)
- **Branch attivo**: `claude/fix-critical-bugs-QDk1X`
- **Commit totali**: 6 (security + features + go-live scripts)
- **Linee di codice**:
  - Mobile app TypeScript: ~12.000 LOC
  - Web companion Next.js: ~1.500 LOC
  - Edge functions Deno: ~1.800 LOC
  - SQL migrations: ~1.300 LOC
- **Test coverage**: in roadmap Y1 (target 60% coverage entro M12)
- **CI/CD**: GitHub Actions + EAS Build (Expo)

## A.2 — Stack di prodotti già pronti

✅ App iOS (Privacy Manifest configurato, pronto submit App Store)
✅ App Android (Adaptive icon, deep link, pronto submit Play Store)
✅ Sito web Next.js (deploy-ready Cloudflare Pages)
✅ Backend Supabase (11 migrations, 11 edge functions, RLS hardened)
✅ Stripe Connect Express (3 subscription tier configurati nel codice)
✅ Programma Awin/Autodoc affiliate (link tracking implementato)
✅ Multi-language (italiano + inglese parziale)
✅ Multi-theme (dark + light)
✅ Notifiche push (Expo)
✅ MFA TOTP (per ruolo professional)
✅ GDPR export + delete account (1-click)

## A.3 — Documentazione tecnica disponibile

1. `SECURITY_AUDIT.md` — report audit penetration test
2. `DEPLOY_CHECKLIST.md` — istruzioni deploy production
3. `GO_LIVE.md` — guida step-by-step per andare online
4. `README.md` — overview tecnico per onboarding sviluppatori
5. `HANDOFF.md` — stato del progetto per nuovi membri team
6. Schema DB (ER diagram disponibile su richiesta)

## A.4 — Brevetti / IP

- **Marchio "Nvmcars"**: registrazione in corso (Camera di Commercio Roma, Y1 priority)
- **Dominio**: nvmcars.it (in acquisto Cloudflare Registrar)
- **Codice sorgente**: copyright [Nome Founder], licenza proprietaria
- **Database design**: schema relazionale custom, non brevettato (è una commodity)
- **Algoritmi di matching/ranking**: in sviluppo, possibile brevetto Y2-Y3 se distintivi

## A.5 — Compliance documentation

- ✅ Privacy Policy (Iubenda)
- ✅ Termini di servizio (Iubenda)
- ✅ Cookie Policy (Iubenda)
- ✅ Informativa DPO (in setup post-funding)
- ✅ Registro trattamenti GDPR (template pronto)
- ✅ Modello contratto officina (in revisione legale)
- ✅ Modello contratto investitore (SAFE post-money + side letter)

## A.6 — Contatti

**Founder & CEO**
[Nome Cognome]
nvmcarshelp@gmail.com
+39 [DA COMPLETARE]
Linkedin: [DA COMPLETARE]

**Sede operativa**
[Indirizzo Cerveteri, RM, 00052]

**Sede legale futura** (post-incorporation)
SRL semplificata da costituire in Roma

**Per due diligence tecnica**
GitHub repo, demo APK, audit report disponibili dopo firma NDA standard.

**Per programmare un meeting**
Email founder o Calendly link: [DA COMPLETARE]

---

## RINGRAZIAMENTI

A tutti i meccanici di Cerveteri e Ladispoli che mi hanno raccontato il loro lavoro e i loro problemi, gettando le basi di questo progetto.

A chi crederà in noi.

---

**Fine del documento.**

**Versione**: 1.0
**Data**: Maggio 2026
**Pagine**: ~30
**Autore**: [Nome Founder]
**Confidenziale**: Sì
