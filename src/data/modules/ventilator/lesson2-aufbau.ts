import type { Lesson } from '@/types/content';

/**
 * Lektion 2 – Aufbau & Komponenten eines Intensivbeatmungsgeräts.
 * Die Komponentennamen entsprechen den festen IDs des Explorer-Widgets
 * (gas-supply, blender, insp-valve, o2-sensor, safety-valve, insp-flow-sensor,
 * pressure-sensor, filter, humidifier, insp-limb, y-piece, patient, exp-limb,
 * exp-valve, exp-flow-sensor, control-unit, ui-monitor, power).
 */
export const lessonAufbau: Lesson = {
  id: 'aufbau',
  number: 2,
  kind: 'aufbau',
  title: 'Aufbau & Komponenten',
  subtitle: 'Der Gasweg Schritt für Schritt – vom Wandanschluss bis zur Lunge',
  durationMin: 20,
  xp: 60,
  objectives: [
    'Den Gasweg eines Intensivbeatmungsgeräts von der Gasversorgung bis zum Gasauslass in der richtigen Reihenfolge beschreiben',
    'Messprinzipien von Flow-, Druck- und O~2~-Sensoren erklären und ihre Grenzen benennen',
    'Die Aufgaben von Inspirationsventil, Exspirationsventil (PEEP), Sicherheits- und Notatmungsventil unterscheiden',
    'Den geschlossenen Regelkreis (Sollwert, Istwert, Regler, Stellglied) auf das Beatmungsgerät übertragen',
    'Begründen, warum Atemgas angefeuchtet werden muss und warum HME und aktiver Befeuchter nie kombiniert werden',
  ],
  sections: [
    /* ------------------------------------------------------------------ */
    {
      id: 'ueberblick',
      title: 'Überblick: Das Gerät von innen',
      blocks: [
        {
          type: 'text',
          md: `Von außen sieht man an einem Intensivbeatmungsgerät vor allem einen Bildschirm und ein Schlauchsystem. Im Inneren arbeitet jedoch eine präzise abgestimmte Kette aus **Gasversorgung, Ventilen, Sensoren und Steuerelektronik**. Wer diese Kette versteht, kann Messwerte richtig interpretieren, Alarme einordnen und Fehler systematisch eingrenzen.

Man kann das Gerät gedanklich in drei Bereiche gliedern:

- **Pneumatik:** alles, was Gas führt, mischt und dosiert – vom Gasanschluss bis zum Gasauslass.
- **Sensorik:** Messung von Druck, Flow und O~2~-Konzentration.
- **Elektronik:** Steuer-/Regeleinheit, Bedien- und Anzeigeeinheit mit Alarmsystem sowie die Energieversorgung.`,
        },
        {
          type: 'widget',
          widget: 'vent-explorer',
          caption: 'Klicke oder tippe auf eine Komponente (oder wähle sie per Tastatur aus), um ihre Funktion, ihr Funktionsprinzip und typische Fehlerquellen zu sehen. Verfolge dabei den Weg des Atemgases vom Gasanschluss bis zum Gasauslass.',
        },
        {
          type: 'callout',
          variant: 'model',
          title: 'Ein typisches, kein reales Gerät',
          md: 'Der Explorer zeigt ein **generisches Schema** eines Intensivbeatmungsgeräts. Reale Geräte unterscheiden sich: Manche erzeugen den Flow mit einer **Turbine** aus Raumluft statt aus Druckgas, manche messen den Flow proximal am Y-Stück, andere intern. Maßgeblich für ein konkretes Gerät sind immer die Gebrauchsanweisung und die technischen Unterlagen des Herstellers.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'gasweg',
      title: 'Der Gasweg Schritt für Schritt',
      blocks: [
        {
          type: 'steps',
          title: 'Der Weg eines Atemzugs durch das Gerät',
          steps: [
            {
              title: '1. Gasanschlüsse (gas-supply)',
              md: 'Sauerstoff und Druckluft kommen aus der **zentralen Gasversorgung** der Klinik über farbcodierte, verwechslungssichere Steckkupplungen – mit einem Versorgungsdruck von ca. 5 bar. **Eingangsfilter** halten Partikel zurück, **Druckminderer** reduzieren und stabilisieren den Druck für die nachfolgenden Ventile. Fällt ein Gas aus, alarmiert das Gerät.',
            },
            {
              title: '2. Gasmischer (blender)',
              md: 'Über **Proportionalventile** werden O~2~ und Druckluft im eingestellten Verhältnis gemischt. So entsteht die gewünschte F~I~O~2~ zwischen 0,21 und 1,0. Viele Geräte mischen in einem Reservoir oder direkt im Gasstrom.',
            },
            {
              title: '3. Inspirationsventil (insp-valve)',
              md: 'Das **Flusssteuerventil** ist das zentrale Stellglied: Ein elektromagnetisch angetriebenes **Proportionalventil** öffnet in Millisekunden genau so weit, dass der gewünschte Flow bzw. Druck entsteht. Es formt jeden Atemzug.',
            },
            {
              title: '4. Sensoren & Sicherheit (o2-sensor, insp-flow-sensor, pressure-sensor, safety-valve)',
              md: 'Im Inspirationsweg messen der **O~2~-Sensor** die tatsächliche O~2~-Konzentration, der **inspiratorische Flowsensor** den abgegebenen Fluss und die **Drucksensoren** den Druck. Das **Sicherheitsventil** begrenzt Überdruck und ermöglicht bei Geräteausfall die Notatmung aus der Raumluft.',
            },
            {
              title: '5. Filter & Befeuchtung (filter, humidifier)',
              md: 'Ein **Bakterien-/Virenfilter** schützt Gerät und Patient:in vor Keimen. Danach wird das trockene Gas im **aktiven Befeuchter** erwärmt und angefeuchtet – alternativ übernimmt ein **HME** am Y-Stück diese Aufgabe.',
            },
            {
              title: '6. Inspirationsschenkel & Y-Stück (insp-limb, y-piece)',
              md: 'Der **Inspirationsschenkel** führt das Gas zum Patienten. Am **Y-Stück** treffen Inspirations- und Exspirationsschenkel zusammen; hier sitzt bei manchen Geräten ein **proximaler Flowsensor**, der besonders patientennah misst (wichtig z. B. in der Neonatologie).',
            },
            {
              title: '7. Patient:in (patient)',
              md: 'Über **Endotrachealtubus** oder **Trachealkanüle** gelangt das Gas in die Lunge. Tubus und Atemwege bilden einen Widerstand, die Lunge eine Dehnbarkeit (Compliance) – beides bestimmt, welcher Druck für ein bestimmtes Volumen nötig ist.',
            },
            {
              title: '8. Exspirationsschenkel & exspiratorischer Flowsensor (exp-limb, exp-flow-sensor)',
              md: 'In der Ausatmung strömt das Gas passiv über den **Exspirationsschenkel** zurück zum Gerät. Der **exspiratorische Flowsensor** misst das tatsächlich ausgeatmete Volumen; der Vergleich mit dem inspiratorischen Volumen deckt **Leckagen** auf.',
            },
            {
              title: '9. Exspirationsventil & Gasauslass (exp-valve)',
              md: 'Das **Exspirationsventil** öffnet und hält dabei den eingestellten **PEEP** aufrecht; anschließend verlässt das Gas das Gerät über den Gasauslass in die Raumluft (beim Narkosegerät dagegen in die Narkosegasabsaugung bzw. zurück ins Kreissystem). (Die Lage von Sensor und Ventil zueinander ist herstellerabhängig.)',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'clinical',
          title: 'Leckage erkennen',
          md: 'Liegt das exspiratorisch gemessene Volumen deutlich unter dem inspiratorischen, entweicht Gas auf dem Weg – z. B. über einen undichten Cuff, eine Diskonnektion oder eine Thoraxdrainage mit Fistel. Viele Geräte zeigen dafür einen Leckage-Wert in Prozent an. Ein Unterschied kann aber auch durch einen verschmutzten oder falsch kalibrierten Flowsensor entstehen.',
        },
        {
          type: 'keyTerms',
          terms: [
            { term: 'Zentrale Gasversorgung', definition: 'Leitungsnetz der Klinik für medizinische Gase; Entnahme über genormte, gasartspezifische Wandanschlüsse.' },
            { term: 'Proportionalventil', definition: 'Ventil, dessen Öffnungsweite stufenlos (proportional zu einem elektrischen Steuersignal) verändert werden kann.' },
            { term: 'Inspirationsschenkel', definition: 'Schlauch vom Gerät zum Y-Stück, der das Frischgas zum Patienten führt.' },
            { term: 'Exspirationsschenkel', definition: 'Schlauch vom Y-Stück zurück zum Gerät, über den die Ausatemluft abströmt.' },
            { term: 'Y-Stück', definition: 'Verbindungsstück, an dem Inspirations- und Exspirationsschenkel zusammenlaufen und an den Tubus angeschlossen werden.' },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'sensoren-ventile',
      title: 'Sensoren & Ventile',
      blocks: [
        {
          type: 'heading',
          text: 'Flowmessung – wie misst man einen Gasfluss?',
        },
        {
          type: 'text',
          md: `Der **Flow** (V̇, Gasfluss in L/min oder L/s) ist die wichtigste Messgröße des Beatmungsgeräts: Aus seinem zeitlichen Integral berechnet das Gerät das **Volumen**. Zwei Messprinzipien sind besonders verbreitet:

- **Hitzdraht-Anemometrie:** Ein sehr dünner, elektrisch beheizter Draht (oft aus Platin) liegt im Gasstrom. Strömendes Gas kühlt ihn ab. Die Elektronik regelt den Heizstrom so nach, dass die Drahttemperatur konstant bleibt – der dafür nötige Strom ist ein Maß für den (Massen-)Fluss. Vorteile: schnell, empfindlich, geringer Widerstand. Nachteile: empfindlich gegenüber Verschmutzung, Sekret und Feuchtigkeit; die Gaszusammensetzung muss berücksichtigt werden.
- **Differenzdruckmessung:** Im Gasweg sitzt ein definierter Widerstand (z. B. eine Blende oder eine flexible Klappe). Strömt Gas hindurch, entsteht davor und dahinter ein **Druckunterschied** Δp, der mit steigendem Flow zunimmt. Aus Δp berechnet das Gerät den Flow. Dieses Prinzip ist robust und wird häufig für proximale Sensoren genutzt; Wasser oder Sekret in den Messleitungen verfälschen jedoch das Ergebnis.

Daneben gibt es weitere Verfahren, z. B. Ultraschall-Laufzeitmessung.`,
        },
        {
          type: 'heading',
          text: 'Druckmessung und O~2~-Messung',
        },
        {
          type: 'text',
          md: `**Drucksensoren** arbeiten meist mit einer Membran, deren Verformung elektrisch erfasst wird (z. B. piezoresistiv). Sie messen den Druck inspiratorisch und exspiratorisch; daraus wird der **Atemwegsdruck** (P~aw~) bestimmt. Typisch werden Spitzendruck, Plateaudruck, Mitteldruck und PEEP angezeigt – in cmH~2~O oder mbar (1 mbar ≈ 1,02 cmH~2~O, praktisch gleichwertig).

**O~2~-Sensoren** prüfen, ob die tatsächlich abgegebene F~I~O~2~ der Einstellung entspricht:

- **Galvanische Sensoren (Brennstoffzelle):** Sauerstoff reagiert elektrochemisch an einer Elektrode; der entstehende Strom ist proportional zum O~2~-Partialdruck. Der Sensor **verbraucht sich** dabei und muss regelmäßig getauscht und kalibriert werden.
- **Paramagnetische Sensoren:** Sauerstoff wird – im Gegensatz zu den meisten anderen Gasen – von einem Magnetfeld angezogen. Diese Eigenschaft wird zur Messung genutzt. Paramagnetische Sensoren sprechen schnell an und verbrauchen sich nicht.`,
        },
        {
          type: 'callout',
          variant: 'clinical',
          title: 'Kalibrierung gehört zum Alltag',
          md: 'Flow- und O~2~-Sensoren müssen nach Herstellervorgabe kalibriert werden – typischerweise im Rahmen des **Gerätetests vor Inbetriebnahme** und nach dem Tausch von Sensoren oder Schlauchsystemen. Ein verschmutzter Flowsensor ist eine häufige Ursache für unplausible Volumina und Fehlalarme.',
        },
        {
          type: 'heading',
          text: 'Die Ventile',
        },
        {
          type: 'table',
          caption: 'Ventile im Beatmungsgerät',
          head: ['Ventil', 'Aufgabe', 'Funktionsweise'],
          rows: [
            ['**Inspirationsventil** (insp-valve)', 'Dosiert Flow bzw. Druck jedes Atemzugs', 'Elektromagnetisches Proportionalventil; Öffnung folgt dem Steuersignal der Regeleinheit in Millisekunden'],
            ['**Exspirationsventil** (exp-valve)', 'Schließt in der Inspiration, öffnet in der Exspiration und **hält den PEEP**', 'Aktiv gesteuertes Ventil (z. B. Membran mit elektromagnetischem Antrieb); es lässt Gas nur so lange abströmen, bis der Atemwegsdruck auf den eingestellten PEEP gefallen ist'],
            ['**Sicherheits-/Überdruckventil** (safety-valve)', 'Schutz vor gefährlich hohen Drücken', 'Öffnet bei Überschreiten eines (herstellerspezifischen) Maximaldrucks unabhängig von der Software'],
            ['**Notatmungsventil** (safety-valve)', 'Ermöglicht Spontanatmung bei Geräte- oder Gasausfall', 'Öffnet bei Unterdruck im System, sodass Patient:innen Raumluft einatmen können'],
          ],
        },
        {
          type: 'callout',
          variant: 'deep',
          title: 'Aktives Exspirationsventil',
          md: 'Moderne Geräte regeln das Exspirationsventil auch **während der Inspiration** aktiv nach. Atmet ein Patient bei druckkontrollierter Beatmung plötzlich aus oder hustet, steigt der Druck – das Ventil öffnet kurz und hält den Solldruck. So können Patient:innen in jeder Phase spontan atmen (Prinzip z. B. von BIPAP/APRV).',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Notatmung ist keine Beatmung',
          md: 'Das Notatmungsventil schützt nur Patient:innen, die **selbst atmen können**. Bei Geräteausfall muss sofort manuell mit einem Beatmungsbeutel weiterbeatmet werden – deshalb gehört ein funktionsbereiter Beutel mit Maske und O~2~-Anschluss an jeden Beatmungsplatz.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'regelkreis',
      title: 'Der geschlossene Regelkreis',
      blocks: [
        {
          type: 'text',
          md: `Die **Steuer-/Regeleinheit** (control-unit) ist das „Gehirn“ des Geräts: ein Mikroprozessorsystem, das in sehr kurzen Abständen Messwerte einliest, mit den Einstellungen vergleicht und die Ventile nachstellt. Weil das Messergebnis wieder auf die Stellgröße zurückwirkt, spricht man von einem **geschlossenen Regelkreis** (closed loop).

Der Unterschied zu einer reinen **Steuerung**: Eine Steuerung würde das Ventil einfach auf eine feste Position stellen – egal, was in der Lunge passiert. Eine **Regelung** misst das Ergebnis und korrigiert fortlaufend, z. B. wenn sich der Widerstand durch Sekret oder die Compliance durch Lagerung ändert.`,
        },
        {
          type: 'steps',
          title: 'Regelkreis am Beispiel der druckkontrollierten Inspiration',
          steps: [
            { title: 'Sollwert festlegen', md: 'Das Team stellt z. B. einen Inspirationsdruck von 20 cmH~2~O ein. Das ist der **Sollwert** (Führungsgröße).' },
            { title: 'Istwert messen', md: 'Die Drucksensoren messen laufend den tatsächlichen Atemwegsdruck – den **Istwert** (Regelgröße).' },
            { title: 'Regelabweichung berechnen', md: 'Der **Regler** (Software in der Steuereinheit) vergleicht beide Werte: Regelabweichung = Sollwert − Istwert. Ist der Druck noch zu niedrig, ist die Abweichung positiv.' },
            { title: 'Stellglied ansteuern', md: 'Der Regler berechnet daraus ein Steuersignal für das **Stellglied** – das Inspirationsventil. Es öffnet weiter (mehr Flow) oder schließt (weniger Flow).' },
            { title: 'Wirkung auf die Regelstrecke', md: 'Schlauchsystem, Tubus und Lunge bilden die **Regelstrecke**. Der veränderte Flow ändert dort den Druck – der neue Istwert wird sofort wieder gemessen. Der Kreis schließt sich, viele Male pro Atemzug.' },
          ],
        },
        {
          type: 'callout',
          variant: 'model',
          title: 'Regelungstechnik in der Praxis',
          md: 'Das Schema Sollwert → Regler → Stellglied → Regelstrecke → Istwert ist eine Vereinfachung. Reale Geräte nutzen mehrere ineinander verschachtelte Regelkreise (z. B. für Gasmischung, Flow, Druck und PEEP) und zusätzliche Algorithmen, etwa zur Kompensation der Schlauchdehnbarkeit oder zur Triggererkennung. Das Grundprinzip bleibt aber dasselbe.',
        },
        {
          type: 'heading',
          text: 'Bedienung, Alarme und Energieversorgung',
        },
        {
          type: 'text',
          md: `Die **Bedien- und Anzeigeeinheit** (ui-monitor) zeigt Einstellungen, Messwerte und Kurven (Druck, Flow, Volumen über die Zeit). Über sie werden Modus, Parameter und **Alarmgrenzen** eingestellt. Das **Alarmsystem** folgt der Norm IEC 60601-1-8: Alarme werden nach Dringlichkeit in **hohe, mittlere und niedrige Priorität** eingeteilt und durch unterschiedliche Farben und Tonfolgen gekennzeichnet.

Die **Energieversorgung** (power) besteht aus einem **Netzteil** und einem **internen Akku**, der bei Netzausfall unterbrechungsfrei übernimmt. Die Überbrückungszeit ist geräte- und zustandsabhängig. Ein Netzausfall und ein niedriger Akkustand werden alarmiert.`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Akku ist kein Dauerbetrieb',
          md: 'Gealterte Akkus halten oft deutlich kürzer als angegeben. Beatmungsgeräte gehören daher immer ans (gekennzeichnete, ggf. notstromversorgte) Netz, wenn kein Transport stattfindet. Akkuprüfung und -tausch sind Teil der Instandhaltung nach Herstellervorgabe und MPBetreibV.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'befeuchtung',
      title: 'Atemgasklimatisierung: Wärme & Feuchte',
      blocks: [
        {
          type: 'text',
          md: `Normalerweise erwärmen und befeuchten Nase, Rachen und Luftröhre die eingeatmete Luft, bevor sie die Lunge erreicht. Ein **Endotrachealtubus umgeht diese Strukturen**. Gleichzeitig sind medizinische Gase aus der Wand **kalt und nahezu trocken**. Ohne Klimatisierung drohen:

- Austrocknung der Schleimhaut und Schädigung der Flimmerhärchen (mukoziliäre Clearance),
- zähes Sekret bis hin zur **Verlegung des Tubus**,
- Wärme- und Flüssigkeitsverlust über die Atemwege.`,
        },
        {
          type: 'table',
          caption: 'HME vs. aktiver Befeuchter',
          head: ['', 'HME („künstliche Nase“)', 'Aktiver Befeuchter'],
          rows: [
            ['Prinzip', 'Passiv: speichert Wärme und Feuchte der Ausatemluft und gibt sie bei der nächsten Einatmung wieder ab (Heat and Moisture Exchanger)', 'Aktiv: beheizte Wasserkammer erwärmt und befeuchtet das Gas; meist mit beheiztem Schlauch gegen Kondensation'],
            ['Position', 'Zwischen Y-Stück und Tubus', 'Im Inspirationsschenkel, gerätenah'],
            ['Vorteile', 'Einfach, günstig, kein Wasser, kein Strom; als HMEF auch mit Filterfunktion', 'Hohe, gut einstellbare Befeuchtungsleistung; kein zusätzlicher Totraum am Y-Stück'],
            ['Nachteile', 'Zusätzlicher **Totraum** und **Widerstand**; begrenzte Leistung; ungeeignet bei viel oder blutigem Sekret und großen Leckagen', 'Aufwendiger; Kondenswasser im Schlauch („Rainout“); Überwachung der Temperatur nötig'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Niemals HME und aktiven Befeuchter kombinieren',
          md: 'Wird ein HME zusätzlich zu einem aktiven Befeuchter eingesetzt, sättigt er sich mit Wasser. Sein **Widerstand steigt stark an** – bis hin zur vollständigen Verlegung des Atemwegs. Ebenso können Filter im Inspirationsweg durchfeuchten. Deshalb: **entweder HME oder aktive Befeuchtung**, nie beides.',
        },
        {
          type: 'callout',
          variant: 'remember',
          md: 'Der **Bakterien-/Virenfilter** (filter) schützt Gerät, Umgebung und Patient:in vor Keimübertragung. Ein Filter am Exspirationsausgang schützt zusätzlich Flowsensor und Exspirationsventil vor Kontamination. Wechselintervalle richten sich nach Herstellerangabe und Hygieneplan.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'ueben',
      title: 'Üben: Komponenten & Funktionen',
      blocks: [
        {
          type: 'matching',
          game: {
            id: 'vent-match-components',
            title: 'Komponente → Funktion',
            instructions: 'Ordne jeder Komponente des Beatmungsgeräts ihre Hauptfunktion zu.',
            pairs: [
              { id: 'blender', left: 'Gasmischer', right: 'Mischt O~2~ und Druckluft zur eingestellten F~I~O~2~' },
              { id: 'insp-valve', left: 'Inspirationsventil', right: 'Dosiert als Proportionalventil Flow und Druck jedes Atemzugs' },
              { id: 'exp-valve', left: 'Exspirationsventil', right: 'Hält am Ende der Ausatmung den eingestellten PEEP aufrecht' },
              { id: 'exp-flow-sensor', left: 'Exspiratorischer Flowsensor', right: 'Misst das ausgeatmete Volumen und hilft, Leckagen zu erkennen' },
              { id: 'safety-valve', left: 'Sicherheits-/Notatmungsventil', right: 'Begrenzt Überdruck und ermöglicht bei Ausfall die Atmung von Raumluft' },
              { id: 'humidifier', left: 'Aktiver Befeuchter', right: 'Erwärmt und befeuchtet das trockene Atemgas' },
              { id: 'control-unit', left: 'Steuer-/Regeleinheit', right: 'Vergleicht Soll- und Istwerte und steuert die Ventile im Regelkreis' },
              { id: 'o2-sensor', left: 'O~2~-Sensor', right: 'Überwacht die tatsächlich abgegebene Sauerstoffkonzentration' },
            ],
          },
        },
        {
          type: 'quiz',
          title: 'Kurz geprüft: Aufbau',
          questions: [
            {
              id: 'vent-l2-peep-ventil',
              kind: 'single',
              prompt: 'Welche Komponente ist dafür verantwortlich, dass am Ende der Ausatmung der eingestellte PEEP erhalten bleibt?',
              options: ['Inspirationsventil', 'Exspirationsventil', 'Gasmischer', 'Bakterienfilter'],
              correct: 1,
              explanation: 'Das Exspirationsventil lässt Gas nur so lange abströmen, bis der Atemwegsdruck auf den eingestellten PEEP gesunken ist, und schließt dann so weit, dass dieser Druck gehalten wird.',
              topic: 'Aufbau',
              difficulty: 1,
            },
            {
              id: 'vent-l2-hitzdraht',
              kind: 'single',
              prompt: 'Nach welchem Prinzip arbeitet ein Hitzdraht-Anemometer?',
              options: [
                'Gasfluss kühlt einen beheizten Draht; der Heizstrom, der die Temperatur konstant hält, ist ein Maß für den Flow',
                'Gas wird von einem Magnetfeld angezogen',
                'Eine elektrochemische Reaktion erzeugt einen Strom proportional zum Flow',
                'Die Schallgeschwindigkeit im Gas ändert sich mit der Temperatur des Patienten',
              ],
              correct: 0,
              explanation: 'Beim Hitzdraht-Anemometer kühlt strömendes Gas einen dünnen, beheizten Draht. Je höher der Flow, desto mehr Heizstrom ist nötig, um die Temperatur konstant zu halten. Magnetische Anziehung (Paramagnetismus) und elektrochemische Reaktionen sind Prinzipien der O~2~-Messung.',
              topic: 'Aufbau',
              difficulty: 2,
            },
            {
              id: 'vent-l2-hme-kombi',
              kind: 'truefalse',
              prompt: 'Zur besseren Befeuchtung kann ein HME zusätzlich zu einem aktiven Befeuchter verwendet werden.',
              correct: false,
              explanation: 'Falsch – und gefährlich. Der HME sättigt sich mit Wasser, sein Widerstand steigt stark an und er kann den Atemweg vollständig verlegen. Es gilt: entweder HME oder aktive Befeuchtung.',
              topic: 'Aufbau',
              difficulty: 1,
            },
            {
              id: 'vent-l2-regelkreis',
              kind: 'multiple',
              prompt: 'Welche Aussagen zum Regelkreis des Beatmungsgeräts stimmen?',
              options: [
                'Der eingestellte Inspirationsdruck ist der Sollwert',
                'Der von den Drucksensoren gemessene Druck ist der Istwert',
                'Das Inspirationsventil ist das Stellglied',
                'Die Bedien- und Anzeigeeinheit ist die Regelstrecke',
              ],
              correct: [0, 1, 2],
              explanation: 'Sollwert = Einstellung, Istwert = Messwert, Stellglied = Inspirationsventil. Die Regelstrecke ist der Teil, auf den das Stellglied wirkt – Schlauchsystem, Tubus und Lunge –, nicht die Bedienoberfläche.',
              topic: 'Aufbau',
              difficulty: 2,
            },
          ],
        },
        {
          type: 'sources',
          ids: ['rathgeber', 'oczenski', 'larsen', 'tobin', 'chatburn', 'iso80601-2-12', 'iec60601-1-8', 'mpbetreibv'],
        },
      ],
    },
  ],
};
