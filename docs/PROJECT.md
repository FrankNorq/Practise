# Propositionsoptimerare for Svensk Travsport

## Vad ar det har?
Ett verktyg som hjalper propositionsskrivare inom svensk travsport att skapa optimala loppvillkor. Malet ar att varje aktiv hast ska ha minst ett passande lopp inom 30 minuters korrradie varje manad.

## Problemet
- Svenska travsporten har ~33 banor och ~20 000 lopp/ar
- Propositioner (loppvillkor) definierar vilka hastar som far starta — baserat pa prisklass, alder, kon, ras m.m.
- Manga hastar saknar passande lopp inom rimligt avstand, vilket leder till farre starter och forlust av intakter
- Battre propositioner = fler starter = mer spelomsattning = sparade miljoner

## Domankunskap

### Startmetoder
- **Autostart**: Alla hastar startar bakom en bil, lika villkor
- **Voltstart**: Hastar startar fran stilla, ofta med fordelar/nackdelar beroende pa sparpats

### Ras-interaktion
- **Varmblod** (standardbred) och **kallblod** (nordsvensk/norsk) tavlar normalt separat
- Ummaker har experimenterat med blandlopp ("hot") dar kallblod och varmblod moter varandra — varmbloden star langre bak vid start

### Tre intressentgrupper att balansera
1. **Spelare/ATG**: Vill ha spannande lopp med jamna falt — driver spelomsattning
2. **Hastagare/tranare**: Vill ha relevanta lopp inom rimligt avstand — driver startviljan
3. **Branschen/ST**: Vill maximera antal starter, omsattning och hastvalfard

Optimeringsalgoritmen kan inte bara maximera tackning — den maste ocksa skapa attraktiva falt som genererar spelintresse.

---

## Teknikstack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Leaflet (karta) + Recharts (diagram)
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM + SQLite
- **Monorepo**: npm workspaces (`packages/server`, `packages/client`)

## Datakallor
ATG/Svensk Travsports API:er ar begransade/stangda. MVP byggs med **realistisk mockdata**:
- 33 riktiga banor med GPS-koordinater
- ~15 000 genererade hastar med realistiska fordelningar
- 6 manaders loppkalender

## Projektstruktur (planerad)
```
ai/
  package.json                    # Monorepo root
  docs/
    PROJECT.md                    # <- du laser denna fil
  packages/
    server/src/
      index.ts                    # Express entry
      db/schema.ts                # Drizzle schema
      db/seed.ts                  # Seeda mockdata
      routes/                     # tracks, horses, propositions, coverage, optimization
      services/
        optimizer.ts              # Greedy set cover-algoritm (karnlogik)
        coverageCalculator.ts     # Berakna tackning per segment
        gapAnalysis.ts            # Identifiera underservade segment
        mockDataGenerator.ts      # Generera realistisk data
      utils/
        geo.ts                    # Avstandsberakning
        segments.ts               # Hastsegmentering
    client/src/
      components/
        dashboard/                # PopulationDashboard, SegmentChart
        gaps/                     # GapAnalysis, GapHeatmap
        generator/                # PropositionGenerator, SuggestionCard
        coverage/                 # CoverageMap, TrackMarker
```

## Databasschema (SQLite)
- **tracks**: id, name, city, region_id, lat, lng, track_length_m, category, has_auto_start, has_volt_start
- **horses**: id, name, birth_year, gender, breed, total_earnings_sek, start_points, home_track_id, home_lat, home_lng, is_active
- **propositions**: id, track_id, race_date, race_number, min_age, max_age, gender_restriction, breed_restriction, max/min_earnings_sek, distance_m, start_method, first_prize_sek, max_starters, status
- **drive_time_cache**: from_track_id, to_track_id, drive_minutes, distance_km

## Segmenteringsmodell
Hastar segmenteras pa: aldersgrupp (2ar, 3ar, 4-5ar, 6-9ar, 10+), kon, ras, prisklass (7 band fran 0 till open class), region (9 st). Ca 200-400 aktiva segment av ~2 835 mojliga.

## Optimeringsalgoritm (karnlogik)
**Mal**: Maximera andelen hastar med minst 1 kvalificerat lopp inom 30 min korrradie per manad.

1. Forberakna narbarhetsmatris: hast -> Set<banor inom 30 min>
2. Berakna nuvarande tackning: vilka hastar har redan ett passande lopp?
3. Identifiera storsta otackta segment (population x (1 - tackning))
4. For given (bana, datum, loppnr): foresla proposition som tacker flest nya hastar
5. Batch-optimering: efter valt lopp 1, uppdatera tackning, optimera lopp 2 osv.

Problemstorleken (~15k hastar, 33 banor) ar liten nog for greedy in-memory-berakning i JS.

## API-endpoints
- `GET /api/tracks` — alla banor med koordinater
- `GET /api/horses/segments` — population per segment
- `GET /api/coverage?month=X` — tackningsgrad per segment
- `GET /api/coverage/gaps?month=X` — underservade segment
- `POST /api/optimize/suggest` — foresla proposition for bana/datum
- `POST /api/optimize/evaluate` — utvardera en utkast-propositions inverkan
- CRUD for propositioner

## React-sidor
1. **Dashboard** (`/dashboard`): Population-oversikt, fordelningsdiagram, regionuppdelning
2. **Gap-analys** (`/gaps`): Varmekarta (prisklass x region), lista underservade segment
3. **Propositionsgenerator** (`/generator`): Valj bana/datum -> se rankade forslag med tackningsinverkan -> redigera/spara
4. **Tackningskarta** (`/coverage`): Leaflet-karta med bankmarkeringar fargkodade efter tackning

## Implementeringsfaser

### Fas 1: Grund
1. Initiera monorepo med npm workspaces
2. Satt upp Express + TypeScript + Drizzle + SQLite
3. Definiera databasschema
4. Bygg mockdatagenerator (33 banor, 15k hastar, loppkalender)
5. Seeda databasen
6. Satt upp React + Vite + Tailwind + React Router

### Fas 2: Dashboard + Population
7. Bygg track- och population-endpoints
8. Skapa PopulationDashboard med diagram
9. Skapa SwedishMap-komponent med Leaflet

### Fas 3: Tackningsmotor
10. Implementera coverageCalculator.ts
11. Implementera gapAnalysis.ts
12. Bygg coverage-endpoints
13. Bygg GapAnalysis-sida med varmekarta
14. Lagg till tackningslager pa kartan

### Fas 4: Propositionsoptimerare
15. Implementera optimizer.ts (greedy set cover)
16. Bygg optimize-endpoints
17. Bygg PropositionGenerator-sida
18. Lagg till proposition-CRUD
19. Implementera batch-optimering for hela tavlingsdagar

### Fas 5: Polish
20. Tacknings-tidslinje (manadstrend)
21. Exportfunktion (PDF/CSV)
22. Polera UI, laddningstillstand, felhantering
23. Skapa demo med fore/efter-scenarion

## Framtida utbyggnad
- Riktig data fran ST/ATG nar API-tillgang beviljas
- Multi-objektiv optimering (tackning + faltkonkurrens + spelattraktivitet)
- What-if-analys ("vad om vi lagger till en tavlingsdag pa bana X?")
- Tranarvy: se vilka kommande lopp ens hastar kvalificerar for
