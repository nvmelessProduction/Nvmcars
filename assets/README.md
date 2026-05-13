# Assets

## Stato

Sono presenti gli SVG di brand:
- `logo-icon-app.svg` — icona quadrata (per app icon)
- `logo-mark.svg` — marchio centrato (per splash)
- `splash.svg` — splash completo
- `logo-horizontal*.svg` — versioni orizzontali (sito/email)

## Cosa serve per gli store

Apple/Google **non accettano SVG**: ti servono PNG specifici.

### App icon iOS (obbligatorio)
- `icon.png` — **1024×1024**, no trasparenza, no angoli arrotondati (li mette iOS)

### Adaptive icon Android (obbligatorio)
- `icon-adaptive.png` — **1024×1024** foreground (oggetto al centro su sfondo trasparente)
- Background color già definito in `app.json` (`#06B6D4`)

### Splash screen
- `splash.png` — **1284×2778** (size iPhone 14 Pro Max, scala bene su altri device)

### Notification icon Android (opzionale ma consigliato)
- `notification-icon.png` — **96×96** monocromatico bianco su trasparente

## Come generare i PNG

Veloce, da terminale macOS/Linux con `librsvg`:

```bash
# 1024×1024 icona
rsvg-convert -w 1024 -h 1024 assets/logo-icon-app.svg -o assets/icon.png

# 1024×1024 adaptive Android
rsvg-convert -w 1024 -h 1024 assets/logo-mark.svg -o assets/icon-adaptive.png

# Splash 1284×2778
rsvg-convert -w 1284 -h 2778 assets/splash.svg -o assets/splash.png

# Notification icon 96×96 bianco
rsvg-convert -w 96 -h 96 assets/logo-mark.svg -o assets/notification-icon.png
```

Oppure usa https://www.appicon.co/ (drag&drop, genera tutto).

## Promemoria

`app.json` punta a:
- `./assets/icon.png`
- `./assets/icon-adaptive.png`
- `./assets/splash.png`
- `./assets/notification-icon.png`

Se mancano, Expo userà i default e gli store rifiuteranno la submission.
