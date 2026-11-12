# MedTech Academy

**Medizintechnik verstehen – nicht nur auswendig lernen.**

MedTech Academy ist eine interaktive, deutschsprachige E-Learning-Plattform für Medizingeräte. Sie richtet sich an Studierende, Auszubildende, Medizintechniker:innen und klinisches Personal. Ziel ist ein Verständnis, das im Alltag trägt: Wie ist ein Gerät aufgebaut? Welches physikalische Prinzip steckt dahinter? Wie bedient man es sicher, und wie erkennt man Fehler?

Das erste vollständige Modul behandelt das **Beatmungsgerät (Intensivrespirator)**. Weitere Geräte (Patientenmonitor, Defibrillator, EKG, Infusions- und Spritzenpumpe, Ultraschall, Röntgen, Anästhesiearbeitsplatz, Dialyse) stehen bereits als „In Vorbereitung“ im Katalog.

---

## Funktionen

- **Gerätekatalog** mit Kategorien und Filter (`#/katalog?kategorie=<id>`).
- **Modulseite** mit Lernzielen, Lektionsübersicht, Fortschritt und Quellen.
- **Sechs Lektionen pro Modul:** Grundlagen → Aufbau → Funktionsweise → Bedienung → Interaktives Training → Abschlusstest.
- **Interaktive Widgets** für das Beatmungsmodul:
  - *Geräte-Explorer*: anklickbares Schema mit allen Komponenten im Gasweg, Erkundungs- und Quizmodus.
  - *Atemzyklus*: animierter Ablauf von Inspiration, Plateau und Exspiration mit Ventilstellungen.
  - *Bewegungsgleichung*: P<sub>aw</sub> = PEEP + V/C + R·V̇ interaktiv, mit Druck-Zeit-Kurve.
  - *Beatmungssimulator*: VC/PC, Patiententypen (gesund, ARDS, obstruktiv), Echtzeit-Kurven, Messwerte, Alarme, Inspirations-/Exspirations-Hold, „Erklär mir das“ und Missionen.
  - *Kurvendetektiv*: Beatmungskurven interpretieren.
- **Lernspiele:** Zuordnen, Reihenfolge, Fehlersuche, klinische Fallbeispiele mit Verzweigungen.
- **Wissenschecks** mit sofortigem Feedback und ausführlichen Erklärungen.
- **Abschlusstest:** themenausgewogen aus einem Fragenpool gezogen, Auswertung nach Themen mit Wiederholungsempfehlungen.
- **Training-Hub** mit Blitzrunde und Spielen über alle Module.
- **Gamification:** XP, Level, Serien (Streaks), Abzeichen, Tagesaufgaben. XP gibt es bei Wiederholungen nur für Verbesserungen, damit sich Farming nicht lohnt.
- **Profil** mit Aktivitätsdiagramm, Statistiken und Abzeichen. Der Fortschritt wird lokal im Browser (`localStorage`) gespeichert.
- **Barrierefreiheit:** vollständig per Tastatur bedienbar, ARIA-Rollen und -Labels, sichtbarer Fokus, `prefers-reduced-motion` wird respektiert.
- **Responsiv:** Desktop, Tablet und Smartphone ab 360 px Breite.

## Tech-Stack

| Bereich | Technologie |
| --- | --- |
| Build | Vite 5 |
| UI | React 18, TypeScript (strict) |
| Routing | react-router-dom 6 (`HashRouter`) |
| Styling | CSS Modules + Design-Tokens (`src/styles/tokens.css`) |
| Tests | Vitest |

Bewusst **keine weiteren Laufzeit-Abhängigkeiten**: keine UI-, Chart- oder Markdown-Bibliotheken. Diagramme, Kurven und Animationen sind selbst mit SVG, Canvas und CSS umgesetzt; Inhalte nutzen einen kleinen eigenen Markdown-Renderer.

## Schnellstart

Voraussetzung: Node.js ≥ 18.

```bash
npm install      # Abhängigkeiten installieren
npm run dev      # Entwicklungsserver (Standard: http://localhost:5173)
npm run build    # Typprüfung + Produktionsbuild nach dist/
npm run preview  # Produktionsbuild lokal ansehen
npm test         # Unit- und Inhaltstests (Vitest)
```

Da ein `HashRouter` verwendet wird, lässt sich der Inhalt von `dist/` auf jedem statischen Webserver betreiben, ohne serverseitige Rewrites.

## Routen

| Route | Inhalt |
| --- | --- |
| `#/` | Startseite mit Empfehlung, Fortschritt und Tagesaufgaben |
| `#/katalog[?kategorie=<id>]` | Gerätekatalog |
| `#/modul/:moduleId` | Modulübersicht |
| `#/modul/:moduleId/lektion/:lessonId` | Lektion (Lektion vom Typ `pruefung` zeigt den Abschlusstest) |
| `#/training` | Quiz- & Spielebereich |
| `#/profil` | Lernfortschritt, Statistiken, Abzeichen |

## Architektur

```
src/
├── App.tsx                   Routen
├── types/content.ts          Inhaltsmodell (Vertrag zwischen Inhalt und UI)
├── data/
│   ├── categories.ts         Gerätekategorien
│   └── modules/
│       ├── index.ts          Modul-Registry (ALL_MODULES, AVAILABLE_MODULES)
│       ├── upcoming.ts       geplante Module („In Vorbereitung“)
│       └── ventilator/       Beatmungsmodul: lesson1–6, exam.ts, sources.ts, content.test.ts
├── components/
│   ├── ui/                   Button, Card, ProgressBar/-Ring, Chip, Segmented, Icon …
│   ├── layout/               AppShell, Header, MobileNav, Footer
│   └── blocks/               BlockRenderer + Mini-Markdown
├── features/
│   ├── widgets.tsx           Widget-Registry (lazy geladen)
│   ├── explorers/ventilator/ Geräte-Explorer, Atemzyklus
│   ├── simulators/ventilator/Simulator, Modell (model.ts), Bewegungsgleichung, Kurvendetektiv
│   ├── games/                Zuordnen, Reihenfolge, Fehlersuche, Fallbeispiele
│   └── quiz/                 Wissenscheck, Abschlusstest, Blitzrunde, Auswertungslogik
├── lib/                      Gamification (Level, XP, Abzeichen, Tagesaufgaben), Hilfsfunktionen
├── state/progress.tsx        useProgress(): globaler, persistierter Lernfortschritt
├── pages/                    Seiten (Home, Katalog, Modul, Lektion, Training, Profil)
└── styles/                   Design-Tokens und globale Styles
```

### Inhaltsmodell

Inhalte sind **reine, typisierte Daten** (`src/types/content.ts`); die UI rendert sie generisch.

- `DeviceModule` – Gerät mit Metadaten, `lessons`, optionalem `exam`, `practicePool` (Blitzrunde) und `sources`.
- `Lesson` – `id` (URL), `number`, `kind` (`grundlagen` | `aufbau` | `funktion` | `bedienung` | `training` | `pruefung`), Lernziele, XP und `sections`.
- `Section` – Titel und eine Liste von `Block`s.
- `Block` – `text`, `heading`, `callout` (u. a. Variante `model` für vereinfachte Modelle), `keyTerms`, `formula`, `steps`, `facts`, `table`, `widget`, `quiz`, `matching`, `ordering`, `faultFinder`, `case`, `sources`.
- `Question` – `single`, `multiple`, `truefalse`, `numeric` (mit Einheit und Toleranz); jede Frage hat Thema, Schwierigkeit und Erklärung.
- `Exam` – Anzahl Fragen, Bestehensgrenze, Pool, Bonus-XP und `topicLessons` (Thema → Lektion für Wiederholungsempfehlungen).

Texte nutzen einen **Mini-Markdown-Dialekt**: Absätze, `- `/`1. `-Listen, `**fett**`, `*kursiv*`, `` `code` ``, `[Link](url)`, Tiefstellung `~2~` (z. B. `F~I~O~2~`, `cmH~2~O`) und Hochstellung `^2^`.

### Widget-Registry

Interaktive Komponenten werden in Inhalten über einen String-Schlüssel eingebunden:

```ts
{ type: 'widget', widget: 'vent-simulator', props: { missions: true, initialPatient: 'ards' } }
```

`src/features/widgets.tsx` ordnet jedem Schlüssel eine lazy geladene Komponente zu (`vent-explorer`, `vent-breath-cycle`, `vent-equation`, `vent-simulator`, `vent-curve-detective`). So bleiben Inhalte und Code entkoppelt, und die Startseite lädt schnell.

### Fortschritt und Gamification

`useProgress()` (`src/state/progress.tsx`) ist die einzige Schnittstelle zum Lernfortschritt: `completeLesson`, `recordAnswer`, `recordGame`, `recordExam`, `solveSimChallenge`, `recordBlitz`, `awardXp` u. a. Alle Änderungen laufen über eine zentrale Funktion, die XP, Tagesaufgaben, Abzeichen und Level-Ups konsistent verbucht. Die Regeln selbst (Level-Schwellen, XP-Werte, Abzeichen) liegen als reine Funktionen in `src/lib/gamification.ts` und sind getestet.

## Ein neues Gerätemodul hinzufügen

1. **Ordner anlegen:** `src/data/modules/<geraet>/`.
2. **Quellen erfassen:** `sources.ts` mit `Source`-Einträgen (Bücher, Leitlinien, Normen). Inhalte verweisen über Block `{ type: 'sources', ids: [...] }` darauf.
3. **Lektionen schreiben:** je eine Datei pro Lektion (`lesson1-grundlagen.ts` …), jeweils ein `Lesson`-Objekt mit Sections und Blocks. Die Lektion vom Typ `pruefung` braucht keine eigenen Fragen: Sie zeigt automatisch den Abschlusstest.
4. **Abschlusstest:** `exam.ts` mit Fragenpool, `questionCount`, `passScore`, `xp` und `topicLessons`. Optional einen `practicePool` für die Blitzrunde.
5. **Modul zusammensetzen:** `index.ts` exportiert ein `DeviceModule` mit `status: 'available'`, einer passenden `category` aus `src/data/categories.ts` und einem `icon` aus `src/components/ui/Icon.tsx` (neue Icons nur ergänzen, nie entfernen).
6. **Registrieren:** in `src/data/modules/index.ts` zu `ALL_MODULES` hinzufügen und den Platzhalter aus `upcoming.ts` entfernen.
7. **Interaktive Widgets (optional):** Komponente mit Default-Export unter `src/features/explorers/<geraet>/` bzw. `src/features/simulators/<geraet>/` anlegen, in `WIDGET_KEYS` und `WIDGETS` in `src/features/widgets.tsx` eintragen und im Inhalt per `widget`-Block einbinden.
8. **Testen:** Für das Beatmungsmodul prüft `content.test.ts` Konsistenz (eindeutige IDs, gültige Antwortindizes, bekannte Widgets und Quellen, Themen-Zuordnung im Test). Für ein neues Modul einen entsprechenden Test anlegen, dann `npm test` und `npm run build` ausführen.

Fortschritt, Abzeichen („Modul gemeistert“), Katalog, Modulseite und Training-Hub übernehmen das neue Modul automatisch.

## Didaktisches Konzept

- **Vom Prinzip zur Praxis:** Jede Lektion baut auf der vorherigen auf – Physik und Physiologie, dann Aufbau, Funktionsweise, Bedienung und schließlich Anwendung in Fallbeispielen.
- **Aktives Lernen:** Erkunden, Ausprobieren und Vorhersagen statt reinem Lesen. Simulator-Missionen machen Zusammenhänge erfahrbar (z. B. wie Compliance und Resistance die Druckkurve verändern).
- **Sofortiges, erklärendes Feedback:** Jede Frage erklärt, *warum* eine Antwort richtig oder falsch ist.
- **Kognitive Entlastung:** kurze Abschnitte, Schlüsselbegriffe, Formeln mit Variablenlegende, klare visuelle Hierarchie.
- **Transfer in die Klinik:** Fallbeispiele, Fehlersuche und Alarmmanagement nach systematischen Schemata (z. B. DOPES).
- **Motivation ohne Verspieltheit:** XP, Level und Abzeichen belohnen Lernfortschritt und echte Verbesserung, nicht bloßes Wiederholen.
- **Überprüfbarer Lernerfolg:** themenausgewogener Abschlusstest mit gezielten Wiederholungsempfehlungen.

## Wissenschaftliche Qualität und Quellen

Die Inhalte orientieren sich an etablierter Fachliteratur, Leitlinien und Normen, unter anderem:

- Rathgeber: *Grundlagen der maschinellen Beatmung*
- Larsen / Mathes: *Beatmung*
- Oczenski: *Atmen – Atemhilfen*
- Tobin: *Principles and Practice of Mechanical Ventilation*
- West: *Respiratory Physiology*
- Chatburn: Klassifikation von Beatmungsmodi
- ARDS Network (2000), Amato et al. (2015, Driving Pressure), Berlin-Definition des ARDS
- S3-Leitlinie „Invasive Beatmung und Einsatz extrakorporaler Verfahren bei akuter respiratorischer Insuffizienz“ (AWMF 001-021)
- DIN EN ISO 80601-2-12, IEC 60601-1-8 (Alarmsysteme), MPBetreibV, MDR

Die vollständigen Angaben stehen in `src/data/modules/ventilator/sources.ts` und am Ende der jeweiligen Lektionen.

Grundsätze:

- Formeln und Zahlenwerte sind physikalisch und physiologisch konsistent (z. B. Bewegungsgleichung, τ = R·C, Sollgewicht (PBW) nach ARDSNet, P<sub>plat</sub> ≤ 30 cmH₂O, ΔP ≤ 15 cmH₂O).
- **Vereinfachte Modelle sind als solche gekennzeichnet** (Hinweisbox „Modell“). Der Simulator nutzt ein Ein-Kompartiment-Modell und bildet die Wirklichkeit nur näherungsweise ab.
- Es werden keine Statistiken oder Zitate erfunden; wo die Evidenz uneinheitlich ist, wird qualitativ formuliert.

## Haftungsausschluss

MedTech Academy ist ein **Lernangebot**. Es ersetzt weder die gesetzlich vorgeschriebene Geräteeinweisung nach MPBetreibV noch die Gebrauchsanweisung des Herstellers, ärztliche Anordnungen oder lokale Standards (SOPs). Inhalte und Simulationen stellen **keine medizinische Beratung** dar und dürfen nicht für Therapieentscheidungen am Patienten verwendet werden. Gerätespezifische Einstellungen, Alarmgrenzen und Abläufe richten sich stets nach den Herstellerangaben und den Vorgaben der jeweiligen Einrichtung.
