import type { Lesson } from '@/types/content';

/**
 * Lektion 4 – Bedienung & Anwendung: Gerätecheck, Einweisung, Ersteinstellung,
 * Anzeigen & Kurven, Alarme, DOPES, Risiken und Hygiene.
 */
export const lessonBedienung: Lesson = {
  id: 'bedienung',
  number: 4,
  kind: 'bedienung',
  title: 'Bedienung & Anwendung',
  subtitle: 'Vom Gerätecheck über Einstellungen und Alarme bis zur sicheren Anwendung',
  durationMin: 25,
  xp: 70,
  objectives: [
    'Den Ablauf vor Inbetriebnahme beschreiben: Selbsttest, Schlauchsystemtest und Einweisung nach MPBetreibV',
    'Das Sollgewicht (PBW) berechnen und daraus ein lungenprotektives Tidalvolumen ableiten',
    'Die wichtigsten Einstellparameter und Messwerte erklären',
    'Druck-, Flow- und Volumen-Zeit-Kurven grundlegend interpretieren',
    'Typische Alarme mit Ursachen und ersten Maßnahmen zuordnen',
    'Eine akute Verschlechterung mit dem DOPES-Schema strukturiert abklären',
    'Risiken der Beatmung (VILI, O₂-Toxizität, Hämodynamik, VAP) und Präventionsmaßnahmen benennen',
  ],
  sections: [
    /* ------------------------------------------------------------ */
    {
      id: 'vorbereitung',
      title: 'Vor der Inbetriebnahme',
      blocks: [
        {
          type: 'text',
          md: `Sichere Beatmung beginnt, bevor der Patient angeschlossen ist. Der Ablauf orientiert sich an der Gebrauchsanweisung des Herstellers und an der lokalen SOP – die folgenden Schritte sind bei Intensivbeatmungsgeräten aber weitgehend gleich.`,
        },
        {
          type: 'steps',
          title: 'Checkliste vor dem Anschluss',
          steps: [
            {
              title: 'Einweisung sicherstellen',
              md: `Nach der **Medizinprodukte-Betreiberverordnung (MPBetreibV)** dürfen Medizinprodukte nur von Personen angewendet werden, die die erforderliche Ausbildung bzw. Kenntnis und Erfahrung besitzen und **in das konkrete Gerät eingewiesen** sind. Die Einweisung wird dokumentiert. Wer unsicher ist, holt Hilfe – das ist Professionalität, keine Schwäche.`,
            },
            {
              title: 'Sichtprüfung',
              md: `Gerät, Gehäuse, Netzkabel, Gasschläuche und Anschlüsse auf Beschädigungen prüfen. Prüfplakette bzw. Fristen der **sicherheitstechnischen Kontrolle (STK)** beachten. Gasanschlüsse (O~2~, Druckluft) korrekt und fest gesteckt, Netzanschluss vorhanden, Akku geladen.`,
            },
            {
              title: 'Schlauchsystem korrekt aufbauen',
              md: `Inspirations- und Exspirationsschenkel, Filter, Befeuchtung (aktiver Befeuchter **oder** HME – nie beides zugleich), Y-Stück und ggf. proximalen Flowsensor nach Herstellerangabe anschließen. Exspirationsventil und Flowsensoren korrekt eingesetzt?`,
            },
            {
              title: 'Selbsttest / Gerätecheck durchführen',
              md: `Moderne Geräte führen beim Einschalten einen **Selbsttest** durch bzw. fordern ihn an: Prüfung von Ventilen, Sensoren (inkl. O~2~-Sensor-Kalibrierung), Alarmgebern sowie ein **Dichtigkeitstest** des Schlauchsystems. Dabei wird auch die **Compliance des Schlauchsystems** ermittelt, damit das Gerät die Kompression von Gas im Schlauch bei der Volumenberechnung kompensieren kann. Ein fehlgeschlagener Test ist ein Stoppsignal: Ursache beheben oder Gerät nicht verwenden.`,
            },
            {
              title: 'Notfallausrüstung bereitlegen',
              md: `Am Bettplatz muss ein **Beatmungsbeutel** mit Maske, O~2~-Anschluss und idealerweise PEEP-Ventil griffbereit sein, ebenso eine funktionierende Absaugung. Bei jedem Geräteproblem gilt: Der Patient wird notfalls manuell beatmet.`,
            },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Patient vor Gerät',
          md: `Bei unklarer Störung nie zuerst am Gerät „herumprobieren“, während der Patient unzureichend beatmet ist. Erst die Versorgung des Patienten sichern (Beatmungsbeutel, O~2~), dann den Fehler suchen.`,
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'einstellungen',
      title: 'Patientendaten & Ersteinstellung',
      blocks: [
        {
          type: 'text',
          md: `Die Lungengröße hängt von **Körpergröße und Geschlecht** ab, nicht vom aktuellen Körpergewicht. Deshalb wird das Tidalvolumen auf das **Sollgewicht (Predicted Body Weight, PBW)** bezogen. Viele Geräte berechnen das PBW automatisch, sobald Größe und Geschlecht eingegeben sind – eine falsche Eingabe führt so direkt zu falschen Vorschlagswerten.`,
        },
        {
          type: 'formula',
          expression: 'PBW♂ = 50 + 0,91 · (Größe − 152,4)\nPBW♀ = 45,5 + 0,91 · (Größe − 152,4)',
          explanation:
            'Formel nach ARDS Network (2000). Beispiel: Mann, 175 cm → PBW = 50 + 0,91 · 22,6 ≈ 70,6 kg. Ein VT von 6 ml/kg PBW entspricht dann etwa 423 ml – unabhängig davon, ob der Patient 70 oder 130 kg wiegt.',
          variables: [
            { symbol: 'PBW', meaning: 'Predicted Body Weight (Sollgewicht)', unit: 'kg' },
            { symbol: 'Größe', meaning: 'Körpergröße', unit: 'cm' },
          ],
        },
        {
          type: 'table',
          caption:
            'Wichtige Einstellparameter – typische Ausgangswerte bei Erwachsenen, immer nach ärztlicher Anordnung und SOP',
          head: ['Parameter', 'Bedeutung', 'Typischer Ausgangsbereich (Orientierung)'],
          rows: [
            ['VT (Tidalvolumen)', 'Volumen pro Atemzug', 'ca. 6 ml/kg PBW (lungenprotektiv); höher nur nach ärztlicher Abwägung, meist nicht über 8 ml/kg PBW'],
            ['f (Atemfrequenz)', 'mandatorische Atemzüge pro Minute', 'ca. 12–20/min, angepasst an pH/PaCO~2~ und Auto-PEEP'],
            ['PEEP', 'positiver endexspiratorischer Druck – hält Alveolen offen', 'mindestens ca. 5 cmH~2~O; höher je nach Oxygenierung und Krankheitsbild (z. B. PEEP/F~I~O~2~-Tabelle)'],
            ['F~I~O~2~', 'inspiratorische O~2~-Fraktion', 'initial oft hoch, dann zügig auf die niedrigste F~I~O~2~ titrieren, die das Oxygenierungsziel erreicht'],
            ['Pinsp / Pmax', 'Inspirationsdruck (PC) bzw. obere Druckbegrenzung (VC)', 'so wählen, dass Pplat ≤ 30 cmH~2~O und ΔP möglichst ≤ 15 cmH~2~O'],
            ['Ti bzw. I:E', 'Inspirationszeit bzw. Verhältnis Inspiration zu Exspiration', 'häufig I:E ca. 1:2 (Ti ca. 0,8–1,2 s); bei Obstruktion längere Exspiration'],
            ['Trigger', 'Empfindlichkeit für Patientenatemzüge (Flow oder Druck)', 'so empfindlich wie möglich ohne Autotriggerung (z. B. Flowtrigger wenige L/min)'],
            ['Rampe / Anstiegszeit', 'Zeit bis zum Erreichen des Zieldrucks', 'meist kurz (ca. 0,1–0,2 s); zu steil kann unangenehm sein, zu flach erhöht die Atemarbeit'],
            ['ASB / Druckunterstützung', 'Unterstützung spontaner Atemzüge über PEEP', 'häufig ca. 5–15 cmH~2~O, Ziel: ruhiges Atemmuster mit angemessenem VT'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Keine Therapieempfehlung',
          md: `Die Werte dienen ausschließlich dem Verständnis. Die konkrete Einstellung erfolgt **nach ärztlicher Anordnung**, abhängig vom Krankheitsbild, nach der **Gebrauchsanweisung des Herstellers** und der lokalen SOP.`,
        },
        {
          type: 'quiz',
          title: 'Kurzcheck: Sollgewicht',
          questions: [
            {
              id: 'vent-l4-pbw-vt',
              kind: 'numeric',
              prompt:
                'Eine Patientin ist 165 cm groß und wiegt 95 kg. Welches Tidalvolumen entspricht 6 ml/kg PBW (gerundet auf ganze ml)?',
              answer: 342,
              tolerance: 5,
              unit: 'ml',
              explanation:
                'PBW♀ = 45,5 + 0,91 · (165 − 152,4) = 45,5 + 0,91 · 12,6 ≈ 57,0 kg. VT = 6 ml/kg · 57,0 kg ≈ 342 ml. Das tatsächliche Gewicht (95 kg) spielt keine Rolle – die Lunge wächst nicht mit dem Körpergewicht.',
              topic: 'Parameter',
              difficulty: 2,
            },
            {
              id: 'vent-l4-pbw-basis',
              kind: 'single',
              prompt: 'Worauf wird das Tidalvolumen bei lungenprotektiver Beatmung bezogen?',
              options: [
                'Auf das aktuelle Körpergewicht',
                'Auf das Sollgewicht aus Körpergröße und Geschlecht',
                'Auf den Body-Mass-Index',
                'Auf das Alter',
              ],
              correct: 1,
              explanation:
                'Die Lungengröße korreliert mit Körpergröße und Geschlecht. Deshalb wird VT pro kg **Predicted Body Weight** berechnet. Bezug auf das tatsächliche Gewicht würde bei adipösen Patient:innen zu gefährlich großen Volumina führen.',
              topic: 'Parameter',
              difficulty: 1,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'monitoring',
      title: 'Messwerte & Beatmungskurven',
      blocks: [
        {
          type: 'text',
          md: `Das Gerät zeigt eingestellte **und** gemessene Werte. Entscheidend für die Beurteilung des Patienten sind die **gemessenen** Werte – insbesondere das **exspiratorisch** gemessene Volumen, denn nur Gas, das zurückkommt, war sicher in der Lunge.`,
        },
        {
          type: 'table',
          caption: 'Wichtige Messwerte',
          head: ['Messwert', 'Bedeutung', 'Worauf achten?'],
          rows: [
            ['Ppeak', 'Spitzendruck während der Inspiration', 'Anstieg → Resistance oder Compliance verändert? Mit Pplat vergleichen'],
            ['Pplat', 'Plateaudruck bei Nullflow (Inspiratory Hold)', 'Ziel ≤ 30 cmH~2~O; nur beim passiven Patienten zuverlässig'],
            ['Pmean', 'mittlerer Atemwegsdruck über den gesamten Zyklus', 'wichtig für die Oxygenierung, beeinflusst die Hämodynamik'],
            ['PEEP gesamt', 'endexspiratorischer Druck inkl. Auto-PEEP (endexspiratorischer Hold)', 'Gesamt-PEEP > eingestellter PEEP → intrinsischer PEEP'],
            ['VTe', 'exspiratorisches Tidalvolumen', 'deutlich kleiner als VTi → Leckage (Cuff, Diskonnektion, Fistel)'],
            ['MVe', 'exspiratorisches Atemminutenvolumen', 'Basis für Ventilation; Alarmgrenzen sinnvoll setzen'],
            ['f total', 'gesamte Atemfrequenz (mandatorisch + spontan)', 'f total ≫ eingestellt → Tachypnoe, Dyssynchronie, Autotriggerung?'],
            ['F~I~O~2~', 'gemessene O~2~-Konzentration', 'Abweichung vom Sollwert → Gasversorgung, Mischer, Sensor prüfen'],
            ['etCO~2~', 'endtidales CO~2~ (Kapnometrie)', 'plötzlicher Abfall auf ≈ 0 → Diskonnektion, Dislokation, Kreislaufstillstand'],
          ],
        },
        {
          type: 'heading',
          text: 'Was die Kurven verraten',
        },
        {
          type: 'text',
          md: `- **Druck-Zeit-Kurve:** zeigt PEEP, Druckanstieg, Spitzen- und Plateaudruck. Ein „Einbruch“ zu Beginn der Inspiration deutet auf Patientenaktivität bzw. einen zu niedrigen Flow (Flow-Hunger) hin.
- **Flow-Zeit-Kurve:** zeigt Flowform (konstant bei VC, dezelerierend bei PC) und den exspiratorischen Flow. **Erreicht der Exspirationsflow vor dem nächsten Atemzug nicht null → Auto-PEEP.** Sägezahnartige Schwingungen weisen auf Sekret oder Kondenswasser hin.
- **Volumen-Zeit-Kurve:** zeigt das Tidalvolumen. **Kehrt die Kurve nicht zur Nulllinie zurück**, fehlt exspiratorisches Volumen → Leckage.
- **Schleifen (Loops):** Die **Druck-Volumen-Schleife** zeigt die Dehnbarkeit (flacher → geringere Compliance; ein abflachendes oberes Ende kann Überdehnung anzeigen). Die **Flow-Volumen-Schleife** hilft, Obstruktion und Sekret zu erkennen.`,
        },
        {
          type: 'widget',
          widget: 'vent-simulator',
          props: { initialPatient: 'gesund', initialMode: 'VC' },
          caption:
            'Experimentieren Sie: Ändern Sie VT, Frequenz, PEEP und Modus, wechseln Sie den Patiententyp und beobachten Sie, wie Kurven, Drücke und Alarme reagieren.',
        },
        {
          type: 'quiz',
          title: 'Kurzcheck: Kurven',
          questions: [
            {
              id: 'vent-l4-curve-autopeep',
              kind: 'single',
              prompt:
                'Auf der Flow-Zeit-Kurve erreicht der exspiratorische Flow vor jedem neuen Atemzug nicht die Nulllinie. Was bedeutet das?',
              options: [
                'Leckage im Schlauchsystem',
                'Unvollständige Exspiration mit Gefahr von Auto-PEEP',
                'Zu niedrige F~I~O~2~',
                'Der Trigger ist zu unempfindlich',
              ],
              correct: 1,
              explanation:
                'Der nächste Atemzug beginnt, während noch Gas ausströmt – die Lunge ist nicht entleert. Es droht Air Trapping mit intrinsischem PEEP. Eine Leckage zeigt sich typischerweise eher in der Volumen-Zeit-Kurve (keine Rückkehr zur Nulllinie) und an VTe < VTi.',
              topic: 'Kurven',
              difficulty: 2,
            },
            {
              id: 'vent-l4-vte-leak',
              kind: 'truefalse',
              prompt:
                'Ist das exspiratorische Tidalvolumen (VTe) deutlich kleiner als das inspiratorische (VTi), spricht das für eine Leckage.',
              correct: true,
              explanation:
                'Gas, das abgegeben, aber nicht über den exspiratorischen Flowsensor zurückgemessen wird, ist entwichen – z. B. über einen undichten Cuff, eine Diskonnektion, eine Thoraxdrainage bei bronchopleuraler Fistel oder ein undichtes Schlauchsystem.',
              topic: 'Kurven',
              difficulty: 1,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'alarme',
      title: 'Alarme & akute Verschlechterung',
      blocks: [
        {
          type: 'text',
          md: `Alarme schützen nur, wenn sie **sinnvoll eingestellt** sind und **beachtet** werden. Alarmgrenzen werden an den Patienten angepasst – nicht so eng, dass ständig Fehlalarme entstehen (Gefahr der **Alarmmüdigkeit**), und nicht so weit, dass echte Gefahren unbemerkt bleiben. Alarmsysteme medizinischer Geräte priorisieren Alarme nach Dringlichkeit (hoch, mittel, niedrig; vgl. IEC 60601-1-8).`,
        },
        {
          type: 'table',
          caption: 'Typische Alarme, mögliche Ursachen und erste Maßnahmen',
          head: ['Alarm', 'Typische Ursachen', 'Erste Maßnahmen'],
          rows: [
            ['Hoher Atemwegsdruck', 'Sekret, abgeknickter Tubus/Schlauch, Beißen, Husten/Pressen, Bronchospasmus, Pneumothorax, Dyssynchronie, einseitige Intubation', 'Patient ansehen, auskultieren; Schlauchsystem prüfen; ggf. absaugen; Beißschutz; Arzt informieren. In VC wird die Inspiration beim Grenzwert abgebrochen → VT zu klein!'],
            ['Niedriger Druck / Diskonnektion', 'Diskonnektion, große Leckage, Cuffleck, Dislokation des Tubus', 'Sofort Patient und Verbindungen prüfen, wieder konnektieren; bei Unklarheit manuell mit Beatmungsbeutel und O~2~ beatmen'],
            ['Niedriges MV / VTe', 'Leckage, Diskonnektion, sinkende Compliance (in PC), nachlassende Spontanatmung', 'Leckage suchen, Cuffdruck prüfen, Patientenzustand beurteilen, Arzt informieren'],
            ['Hohes MV', 'Tachypnoe (Schmerz, Angst, Fieber, Azidose), Autotriggerung', 'Ursache beim Patienten suchen; Trigger und Kondenswasser prüfen'],
            ['Apnoe', 'keine Atemzüge in der eingestellten Zeit (z. B. Sedierung im Spontanmodus), Diskonnektion', 'Patient prüfen; Apnoe-Backup-Beatmung kontrollieren; ggf. mandatorische Beatmung nach Anordnung'],
            ['F~I~O~2~ hoch/niedrig', 'Störung der Gasversorgung, Mischerfehler, O~2~-Sensor verbraucht oder unkalibriert', 'SpO~2~ prüfen, Gasversorgung kontrollieren, Sensor kalibrieren/tauschen; bei Unklarheit manuelle Beatmung mit O~2~'],
            ['Leckage', 'Cuff undicht, Schlauchsystem undicht, NIV-Maske', 'Cuffdruck messen, Verbindungen prüfen, VTi/VTe vergleichen'],
            ['Gasversorgung', 'Ausfall O~2~ oder Druckluft, Schlauch nicht konnektiert', 'Anschlüsse prüfen, auf O~2~-Flasche umstellen, Technik/Haustechnik informieren'],
            ['Stromausfall / Akku', 'Netzstecker gezogen, Netzausfall, Akku schwach', 'Netzverbindung herstellen; verbleibende Akkulaufzeit beachten; rechtzeitig Ersatzgerät und Beatmungsbeutel bereitstellen'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Alarme niemals dauerhaft abschalten',
          md: `Das **Stummschalten** eines Alarms ist nur für wenige Minuten gedacht, während die Ursache behoben wird. Das **Deaktivieren** von Alarmen oder das Setzen unsinnig weiter Grenzen gefährdet den Patienten unmittelbar.`,
        },
        {
          type: 'heading',
          text: 'DOPES – strukturierte Abklärung bei akuter Verschlechterung',
        },
        {
          type: 'text',
          md: `Verschlechtert sich ein beatmeter Patient plötzlich (SpO~2~-Abfall, Druckalarm, Kreislaufinstabilität), hilft die Merkhilfe **DOPES**:`,
        },
        {
          type: 'table',
          head: ['Buchstabe', 'Bedeutung', 'Prüfen / Maßnahmen'],
          rows: [
            ['**D** – Dislokation', 'Tubus verrutscht (Extubation, Lage im Hauptbronchus oder Ösophagus)', 'Tubuslage/Markierung, Kapnografie (etCO~2~-Kurve), seitengleiche Belüftung'],
            ['**O** – Obstruktion', 'Verlegung durch Sekret, Blut, Abknicken, Beißen', 'Absaugkatheter einführen und absaugen, Schlauchsystem prüfen'],
            ['**P** – Pneumothorax', 'Luft im Pleuraraum, ggf. Spannungspneumothorax', 'Auskultation, Thoraxbewegung, Kreislauf; ärztliche Sofortdiagnostik und Entlastung'],
            ['**E** – Equipment', 'Gerätefehler, Gasversorgung, Schlauchsystem, Filter', 'Patient vom Gerät nehmen und manuell mit Beatmungsbeutel und O~2~ beatmen – bessert sich der Zustand, liegt das Problem wahrscheinlich am Equipment'],
            ['**S** – Stacking', 'Breath Stacking / Auto-PEEP durch unvollständige Exspiration', 'Kurzzeitige Diskonnektion lässt eingeschlossenes Gas entweichen (nach Anordnung/SOP); anschließend Exspirationszeit verlängern'],
          ],
        },
        {
          type: 'callout',
          variant: 'clinical',
          title: 'Praxis',
          md: `Die manuelle Beatmung mit dem Beutel ist gleichzeitig **Therapie und Diagnostik**: Lässt sich der Patient leicht beatmen und bessert sich die Sättigung, liegt das Problem eher im Gerät oder Schlauchsystem. Ist die Beutelbeatmung schwer, spricht das für Obstruktion, Pneumothorax oder Bronchospasmus.`,
        },
        {
          type: 'quiz',
          title: 'Kurzcheck: Alarme',
          questions: [
            {
              id: 'vent-l4-dopes-s',
              kind: 'single',
              prompt: 'Wofür steht das „S“ im DOPES-Schema?',
              options: ['Sedierung', 'Stacking (Breath Stacking/Auto-PEEP)', 'Sauerstoffsättigung', 'Sekret'],
              correct: 1,
              explanation:
                'DOPES: Dislokation, Obstruktion, Pneumothorax, Equipment, **Stacking**. Gemeint ist die Überblähung durch unvollständige Exspiration (Auto-PEEP). Sekret gehört zum „O“ (Obstruktion).',
              topic: 'Alarme',
              difficulty: 1,
            },
            {
              id: 'vent-l4-low-pressure',
              kind: 'single',
              prompt:
                'Es ertönt gleichzeitig der Alarm „Niedriger Druck“ und „Niedriges MV“, etCO~2~ fällt auf nahe null. Was ist der erste Schritt?',
              options: [
                'Alarmgrenzen erweitern',
                'Patient und Verbindungen auf Diskonnektion prüfen, ggf. manuell beatmen',
                'F~I~O~2~ auf 1,0 erhöhen und abwarten',
                'Gerät neu starten',
              ],
              correct: 1,
              explanation:
                'Diese Kombination ist typisch für eine **Diskonnektion** oder **Dislokation**. Sofort Patient und System prüfen, wieder konnektieren und bei Unklarheit mit Beatmungsbeutel und O~2~ beatmen. Ein Neustart würde den Patienten zusätzlich ohne Beatmung lassen.',
              topic: 'Alarme',
              difficulty: 1,
            },
            {
              id: 'vent-l4-high-pressure-vc',
              kind: 'truefalse',
              prompt:
                'Bei volumenkontrollierter Beatmung wird die Inspiration beim Erreichen der oberen Druckalarmgrenze abgebrochen, sodass das eingestellte VT nicht mehr vollständig verabreicht wird.',
              correct: true,
              explanation:
                'Die obere Druckgrenze ist eine Sicherheitsfunktion: Bei Erreichen schaltet das Gerät auf Exspiration um. Das schützt die Lunge, führt aber zu einem zu kleinen VT – die Ursache des Druckanstiegs muss behoben werden.',
              topic: 'Alarme',
              difficulty: 2,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'risiken',
      title: 'Risiken & Hygiene',
      blocks: [
        {
          type: 'text',
          md: `Beatmung rettet Leben – sie kann aber auch schaden. Ziel ist daher immer „so viel wie nötig, so wenig wie möglich“ und eine Entwöhnung (Weaning), sobald es der Zustand erlaubt.`,
        },
        {
          type: 'heading',
          text: 'Beatmungsassoziierte Lungenschädigung (VILI)',
        },
        {
          type: 'table',
          head: ['Mechanismus', 'Beschreibung', 'Prävention'],
          rows: [
            ['Volutrauma', 'Überdehnung der Alveolen durch zu große Volumina', 'VT ca. 6 ml/kg PBW, Driving Pressure begrenzen'],
            ['Barotrauma', 'Schaden durch hohe Drücke bis hin zu Pneumothorax, Mediastinalemphysem', 'Pplat ≤ 30 cmH~2~O, Auto-PEEP vermeiden'],
            ['Atelektrauma', 'Scherkräfte durch zyklisches Öffnen und Kollabieren von Alveolen', 'angemessener PEEP, Rekrutierung nach ärztlicher Indikation'],
            ['Biotrauma', 'Freisetzung von Entzündungsmediatoren durch mechanischen Stress, systemische Wirkung', 'konsequent lungenprotektive Beatmung'],
          ],
        },
        {
          type: 'text',
          md: `**Weitere Risiken:**

- **O~2~-Toxizität:** Hohe F~I~O~2~ über längere Zeit kann das Lungengewebe schädigen und Resorptionsatelektasen begünstigen. Daher F~I~O~2~ so niedrig wie möglich titrieren – Hypoxie muss aber immer vermieden werden.
- **Hämodynamik:** Überdruckbeatmung erhöht den intrathorakalen Druck, vermindert den venösen Rückstrom und kann – besonders bei Volumenmangel und hohem PEEP/Pmean – den Blutdruck senken.
- **Ventilator-assoziierte Pneumonie (VAP):** Der Tubus umgeht die natürlichen Abwehrmechanismen; Sekret aus dem Rachen kann am Cuff vorbei in die Lunge gelangen.
- **Selbstextubation und Diskonnektion:** Unruhe, Delir oder unzureichende Fixierung können zu ungeplanter Extubation führen – ein lebensbedrohliches Ereignis.
- **Patient-Ventilator-Dyssynchronie, Muskelatrophie des Zwerchfells** bei langer kontrollierter Beatmung und **Druckschäden** durch Tubus und Fixierung.`,
        },
        {
          type: 'steps',
          title: 'Maßnahmen zur VAP-Prävention (Auswahl)',
          steps: [
            { title: 'Oberkörperhochlage', md: `Oberkörper **30–45°** hochlagern, sofern keine Kontraindikation besteht – reduziert Aspiration.` },
            { title: 'Händehygiene', md: `Konsequente Händedesinfektion vor und nach jedem Kontakt mit Patient und Beatmungssystem.` },
            { title: 'Cuffdruck kontrollieren', md: `Cuffdruck regelmäßig messen (häufig empfohlen: ca. 20–30 cmH~2~O) – zu niedrig fördert Aspiration, zu hoch schädigt die Trachealschleimhaut.` },
            { title: 'Mundpflege & subglottische Absaugung', md: `Regelmäßige Mundpflege nach Hygieneplan; Tuben mit subglottischer Absaugung, wo vorgesehen.` },
            { title: 'Sedierung & Weaning', md: `Sedierung so flach wie möglich, tägliche Prüfung der Entwöhnungsbereitschaft (Spontanatmungsversuch) – jeder Beatmungstag weniger senkt das Risiko.` },
            { title: 'Schlauchsystem', md: `Kondenswasser nie zum Patienten zurücklaufen lassen; Wasserfallen korrekt positionieren. Systemwechsel nach Herstellerangabe und Hygieneplan, bei Verschmutzung oder Defekt sofort.` },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'HME und aktiver Befeuchter nie kombinieren',
          md: `Ein Wärme-Feuchtigkeits-Austauscher (HME) im System mit gleichzeitig aktivem Befeuchter saugt sich mit Wasser voll. Der Widerstand steigt stark an – bis zur kompletten Verlegung. Es wird **entweder** aktiv befeuchtet **oder** ein HME verwendet.`,
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Hygiene am Gerät',
          md: `Bakterien-/Virenfilter schützen Gerät und Umgebung. Oberflächen werden nach Hygieneplan mit freigegebenen Desinfektionsmitteln wischdesinfiziert; Einweg-Schlauchsysteme werden nicht wiederaufbereitet. Aufbereitung wiederverwendbarer Teile (z. B. Exspirationsventil, Flowsensor) ausschließlich nach Herstellerangabe.`,
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'praxischeck',
      title: 'Praxischeck: Fehler finden',
      blocks: [
        {
          type: 'text',
          md: `Jetzt sind Sie dran: Prüfen Sie die Situation am Bettplatz und markieren Sie alle Einstellungen bzw. Befunde, die **nicht** korrekt sind.`,
        },
        {
          type: 'faultFinder',
          game: {
            id: 'vent-fault-settings',
            title: 'Fehlersuche am Beatmungsplatz',
            scenario:
              'Ein 58-jähriger Patient (175 cm, 92 kg, PBW ≈ 70,6 kg) wird nach einer Pneumonie auf der Intensivstation volumenkontrolliert beatmet (VC-CMV). Sie übernehmen den Bettplatz und prüfen Einstellungen und Umgebung. Welche Punkte sind fehlerhaft?',
            items: [
              {
                id: 'vt',
                label: 'Tidalvolumen (VT)',
                value: '900 ml',
                isFault: true,
                explanation:
                  '900 ml entsprechen ca. 12,7 ml/kg PBW – fast das Doppelte des lungenprotektiven Ziels von ca. 6 ml/kg (≈ 423 ml). Offenbar wurde das tatsächliche Gewicht zugrunde gelegt. Risiko: Volutrauma.',
              },
              {
                id: 'freq',
                label: 'Atemfrequenz',
                value: '16/min',
                isFault: false,
                explanation: 'Eine Frequenz von 16/min liegt im üblichen Bereich; die Anpassung erfolgt nach Blutgasanalyse.',
              },
              {
                id: 'peep',
                label: 'PEEP',
                value: '8 cmH₂O',
                isFault: false,
                explanation: 'Ein PEEP von 8 cmH₂O ist bei Pneumonie plausibel und hält Alveolen offen.',
              },
              {
                id: 'fio2',
                label: 'FiO₂ / SpO₂',
                value: '0,5 / 95 %',
                isFault: false,
                explanation: 'Die Sättigung liegt im üblichen Zielbereich; die FiO₂ kann im Verlauf nach Anordnung reduziert werden.',
              },
              {
                id: 'alarms',
                label: 'Alarmgrenzen MV und Atemwegsdruck',
                value: 'deaktiviert („Aus“)',
                isFault: true,
                explanation:
                  'Ohne MV- und Druckalarme bleiben Diskonnektion, Leckage oder Druckanstieg unbemerkt. Alarmgrenzen müssen aktiv und patientenbezogen eingestellt sein.',
              },
              {
                id: 'humid',
                label: 'Befeuchtung',
                value: 'HME am Y-Stück + aktiver Befeuchter in Betrieb',
                isFault: true,
                explanation:
                  'Doppelte Befeuchtung ist kontraindiziert: Der HME saugt sich mit Wasser voll, der Widerstand steigt bis zur Verlegung. Entweder aktiv befeuchten oder HME verwenden.',
              },
              {
                id: 'pplat',
                label: 'Gemessener Plateaudruck',
                value: '34 cmH₂O',
                isFault: true,
                explanation:
                  'Pplat > 30 cmH₂O überschreitet die lungenprotektive Grenze; der Driving Pressure beträgt 34 − 8 = 26 cmH₂O (Ziel ≤ 15). Ursache ist hier vor allem das zu große VT – sofort ärztlich abklären.',
              },
              {
                id: 'position',
                label: 'Lagerung',
                value: 'Oberkörperhochlage 30°',
                isFault: false,
                explanation: 'Korrekt – die Oberkörperhochlage von 30–45° ist eine zentrale Maßnahme der VAP-Prävention.',
              },
              {
                id: 'bag',
                label: 'Notfallausrüstung',
                value: 'Beatmungsbeutel mit Maske und PEEP-Ventil am O₂-Anschluss bereit',
                isFault: false,
                explanation: 'Korrekt – bei Gerätestörung muss sofort manuell beatmet werden können.',
              },
            ],
          },
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'zusammenfassung',
      title: 'Begriffe & Quellen',
      blocks: [
        {
          type: 'keyTerms',
          terms: [
            { term: 'PBW', definition: 'Predicted Body Weight – Sollgewicht aus Größe und Geschlecht; Bezugsgröße für das Tidalvolumen.' },
            { term: 'VTe / MVe', definition: 'Exspiratorisch gemessenes Tidal- bzw. Minutenvolumen – Grundlage für Volumenmonitoring und Leckerkennung.' },
            { term: 'Pmean', definition: 'Mittlerer Atemwegsdruck über den Atemzyklus; wichtig für Oxygenierung und Hämodynamik.' },
            { term: 'etCO₂', definition: 'Endtidaler CO₂-Partialdruck; bestätigt Tubuslage und Ventilation.' },
            { term: 'DOPES', definition: 'Dislokation, Obstruktion, Pneumothorax, Equipment, Stacking – Merkhilfe bei akuter Verschlechterung.' },
            { term: 'VILI', definition: 'Ventilator-induzierte Lungenschädigung: Volutrauma, Barotrauma, Atelektrauma, Biotrauma.' },
            { term: 'VAP', definition: 'Ventilator-assoziierte Pneumonie; Prävention u. a. durch Oberkörperhochlage 30–45°, Cuffdruckkontrolle, Händehygiene.' },
            { term: 'Alarmmüdigkeit', definition: 'Abstumpfung durch häufige Fehlalarme – Gegenmittel sind sinnvoll gesetzte Grenzen.' },
          ],
        },
        {
          type: 'sources',
          ids: ['rathgeber', 'larsen', 'ardsnet', 'amato', 's3-beatmung', 'iso80601-2-12', 'iec60601-1-8', 'mpbetreibv'],
        },
      ],
    },
  ],
};
