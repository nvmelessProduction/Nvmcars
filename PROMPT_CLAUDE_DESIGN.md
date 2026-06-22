# 🎨 Prompt da inviare a Claude (design)

Copia tutto il blocco qui sotto e incollalo a Claude per il redesign visivo di Nvmcars.

---

Sei un product designer senior specializzato in app mobile iOS/Android. Devi ridisegnare
**da zero l'intero linguaggio visivo** di **Nvmcars**, un'app di manutenzione auto, mantenendo
intatta l'architettura tecnica esistente. Voglio un look **caldo, amichevole e rassicurante**.

## Cos'è Nvmcars
App mobile (React Native + Expo) per **prenotare e confrontare servizi di manutenzione auto**
nella zona di Cerveteri/Ladispoli. Due tipi di utente con UI distinte:
- **Cliente**: aggiunge la sua auto (targa), cerca officine vicine, riceve preventivi, chatta,
  prenota, paga in app, lascia recensioni, ha guide "fai da te" e ricerca ricambi.
- **Professionista (officina)**: dashboard, gestione richieste, creazione preventivi, listino
  prezzi, calendario disponibilità, statistiche.
Il tono di voce è semplice e amichevole: "Risolviamo i problemi della tua auto senza stress."

## Obiettivo emotivo del redesign
L'utente medio è una persona normale, spesso ansiosa quando l'auto ha problemi. Il design deve
trasmettere **fiducia, calore e semplicità** — l'opposto del freddo gergo da meccanico. Pensa a un
incrocio tra Airbnb (accogliente), Revolut (chiaro) e Duolingo (giocoso ma non infantile).
Niente estetica "tech/cyber". Sì a: colori caldi, angoli morbidi, illustrazioni, micro-animazioni gentili.

## VINCOLO TECNICO IMPORTANTE (non rompere il codice)
L'app usa un sistema di **design token** già cablato in tutto il codice. Il redesign deve
**riempire questi stessi token**, non inventarne una struttura nuova. Devi produrre i valori per
due temi (chiaro e scuro) che rispettino ESATTAMENTE questo contratto TypeScript:

```ts
type ThemeColors = {
  bg: string;            // sfondo schermata
  bgElevated: string;    // card / superfici sollevate
  bgHeader: string;      // header/hero in cima alle schermate
  border: string;
  text: string;          // testo primario
  textMuted: string;     // testo secondario
  textInverse: string;   // testo su sfondo accent
  onHeader: string;      // testo sopra bgHeader
  onHeaderMuted: string;
  scrim: string;         // overlay modali (rgba)
  accent: string;        // colore brand principale (CTA, link, selezioni)
  accentSoft: string;    // versione tenue dell'accent (rgba), per sfondi pill/badge
  success: string;       // verde conferma
  danger: string;        // rosso errore
  warning: string;       // giallo/arancio attenzione
};
```
Token attuali (da SOSTITUIRE con la palette calda): accent ciano `#06B6D4`, sfondi slate freddi.

Esistono anche scale `spacing` (xs..xxxl) e `radius` (sm/md/...): puoi proporne di nuove
ma mantieni i nomi delle chiavi.

## Cosa devi consegnare
1. **Palette completa** per `lightColors` e `darkColors` (tutti i token sopra, in formato pronto
   da incollare in `src/theme/colors.ts`), coerente con lo stile caldo & amichevole. Indica i
   rapporti di contrasto AA per testo/sfondo.
2. **Tipografia**: scala di dimensioni/pesi (display, title, body, caption) con un suggerimento di
   font caldo e leggibile (es. un sans morbido tipo "Nunito", "Poppins" o il system rounded di iOS),
   e indicazioni su come applicarla.
3. **Linguaggio dei componenti** — specifiche visive (raggi, ombre, padding, stati press/disabled,
   icone) per: bottone primario, card, campo di testo, card officina, "service chip" (pillola
   servizio), stelle rating, card statistica, empty state, bottom tab bar, bolle chat, badge stato.
4. **Direzione illustrazioni/emoji & iconografia**: stile, palette, esempi per gli stati vuoti e
   per i 6 servizi rapidi (Tagliando, Gomme, Carrozzeria, Batteria, Freni, Revisione).
5. **Micro-interazioni** (l'app usa Reanimated): suggerisci 3–4 animazioni gentili (press scale,
   fade-in liste, transizioni) coerenti col tono caldo.
6. **3 schermate chiave ridisegnate** come mockup descrittivi dettagliati (preferibilmente artifact
   visivi o HTML/SVG): **Home cliente**, **Dettaglio officina con listino**, **Dashboard
   professionista**. Mostra il tema chiaro e scuro.

## Requisiti trasversali
- Deve funzionare in **tema chiaro E scuro** (entrambi caldi e accoglienti, non solo "dark = nero").
- Bilingue **IT/EN**: niente testo nelle immagini, lascia spazio a stringhe più lunghe.
- **Accessibilità**: contrasti AA, target touch ≥ 44px, leggibilità per età varie.
- Mantieni riconoscibilità del brand "Nvmcars" 🚗 e un'identità calorosa coerente su tutte le schermate.

## Formato della risposta
Per ogni punto: prima una breve motivazione di design (1-2 frasi), poi i **valori concreti**
(codici colore, px, pesi) pronti per essere implementati. Concludi con il blocco `colors.ts`
completo (light + dark) pronto da incollare.
