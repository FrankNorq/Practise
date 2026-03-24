# Esports Match Tracker

En modern webbsida som visar kommande matcher i **League of Legends** och **Counter-Strike** med data från PandaScore API.

## Funktioner

- Kommande matcher för LoL och CS i separata sektioner
- Lag, logotyper, turnering och starttid (lokal tid)
- Mörkt tema med card-layout och hover-effekter
- Responsiv design som fungerar på mobil
- Laddningsindikator medan data hämtas
- Felhantering med retry-knappar

## Kom igång

1. **Skaffa en API-nyckel** — Skapa ett gratis konto på [pandascore.co](https://pandascore.co) (gratisplanen ger 1000 anrop/timme).

2. **Sätt in din nyckel** — Öppna `script.js` och ersätt `YOUR_PANDASCORE_API_TOKEN` med din nyckel:
   ```js
   const API_TOKEN = 'din-nyckel-här';
   ```

3. **Öppna sidan** — Öppna `index.html` i en webbläsare. Om CORS blockerar (sällsynt), starta en lokal server:
   ```bash
   npx serve .
   # eller
   python -m http.server
   ```

## Filstruktur

```
index.html   — HTML-struktur med sektioner, spinners och felcontainers
style.css    — Mörkt tema, card-grid, hover-effekter, responsiv layout
script.js    — API-anrop, rendering och felhantering
```

## Bygg vidare

- **Fler spel** — Lägg till en rad i `ENDPOINTS`-objektet (t.ex. `dota2: '/dota2/matches/upcoming'`) och kopiera en HTML-sektion.
- **Live-matcher** — Byt endpoint till `/running` och lägg till en "LIVE"-badge med pulserande animation.
- **Auto-uppdatering** — Lägg till `setInterval(() => init(), 60000)` för att polla varje minut.
- **Caching** — Spara senaste svaret i `localStorage` för snabbare laddning.
- **Ljust tema** — CSS-variablerna gör det enkelt att lägga till en dark/light-toggle.
