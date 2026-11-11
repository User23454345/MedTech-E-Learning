import type { Lesson } from '@/types/content';

/**
 * Lektion 1 – Grundlagen der maschinellen Beatmung.
 * Was ein Beatmungsgerät ist, wofür es eingesetzt wird, welche Geräteklassen
 * es gibt und welche physiologischen Folgen die Überdruckbeatmung hat.
 */
export const lessonGrundlagen: Lesson = {
  id: 'grundlagen',
  number: 1,
  kind: 'grundlagen',
  title: 'Grundlagen',
  subtitle: 'Was ein Beatmungsgerät ist – und warum es Leben rettet',
  durationMin: 15,
  xp: 50,
  objectives: [
    'Erklären, was ein Intensivbeatmungsgerät leistet und welche Aufgaben es übernimmt',
    'Hypoxämisches (Oxygenierungs-) und hyperkapnisches (Ventilations-)Versagen als Hauptindikationen unterscheiden',
    'Geräteklassen (Intensiv, Anästhesie, Notfall/Transport, Heimbeatmung, Neonatologie) und invasive vs. nicht-invasive Beatmung einordnen',
    'Den Unterschied zwischen Spontanatmung (Unterdruck) und maschineller Überdruckbeatmung sowie deren Folgen für Kreislauf und Lunge beschreiben',
    'Ventilation (CO~2~-Elimination) und Oxygenierung (O~2~-Aufnahme) als getrennte Ziele der Beatmung verstehen',
  ],
  sections: [
    /* ------------------------------------------------------------------ */
    {
      id: 'was-ist',
      title: 'Was ist ein Beatmungsgerät?',
      blocks: [
        {
          type: 'text',
          md: `Ein **Beatmungsgerät** (Ventilator, Respirator) ist ein Medizinprodukt, das die Atemarbeit eines Menschen ganz oder teilweise übernimmt. Es befördert ein Gasgemisch mit einstellbarer Sauerstoffkonzentration in die Lunge und lässt es anschließend wieder entweichen – Atemzug für Atemzug, über Stunden, Tage oder sogar Jahre.

Wichtig ist dabei: Ein Beatmungsgerät **heilt keine Lungenerkrankung**. Es verschafft Zeit. Während das Gerät die Atmung sichert, können Ursache und Grunderkrankung – etwa eine Pneumonie, ein Trauma oder eine Vergiftung – behandelt werden.`,
        },
        {
          type: 'text',
          md: `Ein modernes **Intensivbeatmungsgerät** erfüllt dabei mehrere Aufgaben gleichzeitig:

- **Gas mischen:** Sauerstoff und Druckluft werden zu einer eingestellten inspiratorischen Sauerstoffkonzentration (F~I~O~2~) gemischt – von 0,21 (Raumluft) bis 1,0 (reiner Sauerstoff).
- **Gas dosieren:** Volumen, Fluss (Flow) und Druck jedes Atemzugs werden präzise gesteuert.
- **Messen & überwachen:** Sensoren erfassen kontinuierlich Drücke, Flüsse, Volumina und die O~2~-Konzentration.
- **Alarmieren:** Weichen Messwerte von den eingestellten Grenzen ab, warnt das Gerät akustisch und optisch.
- **Mit dem Patienten interagieren:** Moderne Geräte erkennen eigene Atemanstrengungen (Trigger) und unterstützen sie, statt sie zu unterdrücken.`,
        },
        {
          type: 'facts',
          items: [
            { value: '0,21', label: 'F~I~O~2~ von Raumluft (21 % O~2~)' },
            { value: '≈ 6 ml/kg', label: 'lungenprotektives Tidalvolumen bezogen auf das Sollgewicht (PBW)' },
            { value: '≤ 30 cmH~2~O', label: 'Zielwert für den Plateaudruck bei lungenprotektiver Beatmung' },
            { value: '1952', label: 'Polio-Epidemie in Kopenhagen – Geburtsstunde der modernen Intensivbeatmung' },
          ],
        },
        {
          type: 'callout',
          variant: 'remember',
          title: 'Beatmung ist Überbrückung',
          md: 'Ein Beatmungsgerät ersetzt die Funktion der Atempumpe und unterstützt den Gasaustausch – es behandelt aber nicht die Ursache. Jede Beatmung sollte daher so schonend und so kurz wie möglich, aber so lange wie nötig erfolgen.',
        },
        {
          type: 'keyTerms',
          terms: [
            { term: 'Ventilator / Respirator', definition: 'Synonyme für Beatmungsgerät. „Respirator“ ist im deutschsprachigen Klinikalltag verbreitet.' },
            { term: 'F~I~O~2~', definition: 'Inspiratorische Sauerstofffraktion – Anteil von O~2~ im eingeatmeten Gas (0,21–1,0).' },
            { term: 'Tidalvolumen (V~T~)', definition: 'Atemzugvolumen: das Gasvolumen, das pro Atemzug ein- bzw. ausgeatmet wird, angegeben in ml.' },
            { term: 'Atemfrequenz (f)', definition: 'Anzahl der Atemzüge pro Minute (/min).' },
            { term: 'Atemminutenvolumen (MV)', definition: 'Pro Minute bewegtes Gasvolumen: MV = V~T~ · f, angegeben in L/min.' },
            { term: 'PEEP', definition: 'Positive end-expiratory pressure – positiver Druck, der am Ende der Ausatmung in der Lunge aufrechterhalten wird, in cmH~2~O.' },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'indikationen',
      title: 'Wofür wird beatmet? – Indikationen',
      blocks: [
        {
          type: 'text',
          md: `Die Lunge hat zwei Aufgaben, die man klinisch getrennt betrachtet: Sie muss **Sauerstoff ins Blut bringen** (Oxygenierung) und **Kohlendioxid abatmen** (Ventilation). Entsprechend unterscheidet man zwei Grundformen der akuten respiratorischen Insuffizienz (Atemversagen):`,
        },
        {
          type: 'table',
          caption: 'Die zwei Grundformen des Atemversagens',
          head: ['', 'Hypoxämisches Versagen (Oxygenierungsversagen, „Typ 1“)', 'Hyperkapnisches Versagen (Ventilationsversagen, „Typ 2“)'],
          rows: [
            ['Was ist gestört?', 'Gasaustausch in der Lunge (Lungenparenchym)', 'Atempumpe: Atemantrieb, Nerven, Atemmuskulatur, Thoraxwand'],
            ['Leitbefund Blutgas', 'P~a~O~2~ erniedrigt (Hypoxämie), P~a~CO~2~ normal oder erniedrigt', 'P~a~CO~2~ erhöht (Hyperkapnie) mit respiratorischer Azidose; P~a~O~2~ meist ebenfalls erniedrigt'],
            ['Typische Ursachen', 'Pneumonie, ARDS, Lungenödem, Atelektasen, Lungenembolie', 'COPD-Exazerbation, Opioid-/Sedativa-Überhang, neuromuskuläre Erkrankungen, Erschöpfung der Atemmuskulatur'],
            ['Was hilft das Beatmungsgerät?', 'Höhere F~I~O~2~, PEEP und erhöhter Mitteldruck öffnen Alveolen und verbessern die Oxygenierung', 'Das Gerät übernimmt die Atemarbeit und stellt eine ausreichende alveoläre Ventilation wieder her'],
          ],
        },
        {
          type: 'text',
          md: `Daneben gibt es weitere wichtige Indikationen, die nicht primär auf einer Lungenerkrankung beruhen:

- **Allgemeinanästhesie (Narkose):** Narkosemittel, Opioide und Muskelrelaxanzien schwächen oder beseitigen die Spontanatmung – die Beatmung ist hier ein planbarer Routinevorgang.
- **Schutz der Atemwege:** Bei Bewusstlosigkeit (z. B. schweres Schädel-Hirn-Trauma, Intoxikation) fehlen Schutzreflexe; ein Endotrachealtubus schützt vor Aspiration, und die Beatmung sichert den Gasaustausch.
- **Kreislaufstillstand und Schock:** Reanimation sowie schwere Kreislaufinsuffizienz, bei der die Atemarbeit den Organismus zusätzlich belastet.
- **Erschöpfung der Atempumpe:** Wenn die Atemarbeit dauerhaft größer ist, als die Muskulatur leisten kann.`,
        },
        {
          type: 'callout',
          variant: 'clinical',
          title: 'Warnzeichen am Patientenbett',
          md: 'Ein drohendes Atemversagen zeigt sich oft schon vor dem Blutgasbefund: hohe Atemfrequenz, flache Atmung, Einsatz der Atemhilfsmuskulatur, Unruhe, Schwitzen, Zyanose oder zunehmende Somnolenz (bei CO~2~-Anstieg). Die Entscheidung zur Beatmung ist immer eine ärztliche Gesamtbeurteilung – nicht allein die Reaktion auf einen einzelnen Zahlenwert.',
        },
        {
          type: 'quiz',
          title: 'Kurz geprüft: Indikationen',
          questions: [
            {
              id: 'vent-l1-indikation-typ',
              kind: 'single',
              prompt: 'Eine Patientin mit COPD-Exazerbation hat einen deutlich erhöhten P~a~CO~2~ und einen pH von 7,25. Welche Form des Atemversagens liegt im Vordergrund?',
              options: [
                'Hypoxämisches Versagen (Oxygenierungsversagen)',
                'Hyperkapnisches Versagen (Ventilationsversagen)',
                'Kein Atemversagen, da nur der CO~2~-Wert betroffen ist',
                'Ein reines Kreislaufversagen',
              ],
              correct: 1,
              explanation: 'Erhöhter P~a~CO~2~ mit respiratorischer Azidose (pH erniedrigt) ist das Kennzeichen des hyperkapnischen Versagens: Die Atempumpe schafft es nicht mehr, genug CO~2~ abzuatmen. Bei COPD ist das typisch – die Atemmuskulatur ermüdet gegen den erhöhten Atemwegswiderstand.',
              topic: 'Grundlagen',
              difficulty: 1,
            },
            {
              id: 'vent-l1-indikation-multi',
              kind: 'multiple',
              prompt: 'Welche der folgenden Situationen können eine Indikation für eine maschinelle Beatmung sein? (Mehrere Antworten richtig)',
              options: [
                'Allgemeinanästhesie mit Muskelrelaxierung',
                'Bewusstlosigkeit mit fehlenden Schutzreflexen',
                'Schweres ARDS mit Hypoxämie trotz Sauerstoffgabe',
                'Leichte Erkältung mit Schnupfen',
              ],
              correct: [0, 1, 2],
              explanation: 'Narkose (Ausfall der Spontanatmung), fehlende Schutzreflexe (Atemwegssicherung) und schweres ARDS (Oxygenierungsversagen) sind klassische Indikationen. Eine leichte Erkältung beeinträchtigt den Gasaustausch nicht relevant – eine Beatmung wäre hier mit Risiken ohne Nutzen verbunden.',
              topic: 'Grundlagen',
              difficulty: 1,
            },
            {
              id: 'vent-l1-indikation-tf',
              kind: 'truefalse',
              prompt: 'Ein Beatmungsgerät behandelt die Ursache einer Pneumonie.',
              correct: false,
              explanation: 'Falsch. Die Beatmung sichert den Gasaustausch und entlastet die Atemmuskulatur – sie verschafft Zeit. Die Ursache (z. B. die bakterielle Infektion) muss gezielt behandelt werden, etwa mit Antibiotika.',
              topic: 'Grundlagen',
              difficulty: 1,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'einsatzbereiche',
      title: 'Einsatzbereiche & Geräteklassen',
      blocks: [
        {
          type: 'text',
          md: `„Das“ Beatmungsgerät gibt es nicht. Je nach Einsatzort unterscheiden sich die Anforderungen erheblich – an Präzision, Mobilität, Bedienung, Energieversorgung und Gasversorgung. Für Intensivbeatmungsgeräte legt die Norm **DIN EN ISO 80601-2-12** besondere Sicherheitsanforderungen und wesentliche Leistungsmerkmale fest; für andere Geräteklassen gibt es eigene Teilnormen derselben Normenreihe.`,
        },
        {
          type: 'table',
          caption: 'Geräteklassen im Vergleich (typische Merkmale – Details sind herstellerspezifisch)',
          head: ['Geräteklasse', 'Einsatzort', 'Typische Merkmale', 'Besonderheiten'],
          rows: [
            ['**Intensivbeatmungsgerät**', 'Intensivstation, Intermediate Care', 'Viele Beatmungsmodi, umfangreiches Monitoring, Kurven und Loops, Anschluss an zentrale Gasversorgung (O~2~ und Druckluft)', 'Für Langzeitbeatmung kritisch kranker Patient:innen; höchste Anforderungen an Messgenauigkeit und Alarmierung'],
            ['**Anästhesie-/Narkosegerät**', 'OP, Einleitung, Aufwachraum', 'Rückatemsystem (Kreissystem) mit CO~2~-Absorber, Dosierung volatiler Anästhetika, Gasmonitoring', 'Narkosegas-Absaugung; meist kürzere Beatmungsdauer bei häufig lungengesunden Patient:innen'],
            ['**Notfall-/Transportbeatmungsgerät**', 'Rettungsdienst, Luftrettung, innerklinischer Transport', 'Kompakt, robust, akkubetrieben, oft aus O~2~-Flasche versorgt; reduzierte Modusauswahl', 'Einfache, schnelle Bedienung unter schwierigen Bedingungen; Gasvorrat begrenzt'],
            ['**Heimbeatmungsgerät**', 'Zuhause, Pflegeeinrichtung', 'Meist Turbine/Gebläse mit Raumluft, klein und leise; häufig NIV über Maske, auch invasiv über Trachealkanüle', 'Bedienung durch Angehörige/Pflegedienst; bei beatmungsabhängigen Patient:innen Redundanz (Zweitgerät, Akku) wichtig'],
            ['**Neonatologie-/Kinderbeatmungsgerät**', 'Früh- und Neugeborenen-, Kinderintensivstation', 'Sehr kleine Volumina (wenige ml), hochpräzise proximale Flowmessung, oft druckkontrolliert; teils Hochfrequenzoszillation', 'Kleinste Leckagen und Totraum fallen stark ins Gewicht'],
          ],
        },
        {
          type: 'heading',
          text: 'Invasiv oder nicht-invasiv?',
        },
        {
          type: 'text',
          md: `Die **Schnittstelle zum Patienten** (Interface) bestimmt, ob man von invasiver oder nicht-invasiver Beatmung spricht:

- **Invasive Beatmung:** Über einen **Endotrachealtubus** (durch Mund oder Nase in die Luftröhre) oder eine **Trachealkanüle** (über ein Tracheostoma). Der Atemweg ist gesichert und weitgehend dicht; hohe Drücke und präzise Volumina sind möglich. Nachteile: Die oberen Atemwege werden umgangen (keine natürliche Anfeuchtung), Sedierung ist oft nötig, und es besteht ein Risiko für beatmungsassoziierte Pneumonien.
- **Nicht-invasive Beatmung (NIV):** Über eine **Maske** (Nasen-, Mund-Nasen-, Vollgesichtsmaske) oder einen **Helm**. Patient:innen können oft sprechen, husten und bleiben wach. Voraussetzungen: Sie müssen kooperieren, ihre Atemwege selbst schützen können und dürfen keine relevanten Kontraindikationen haben (z. B. Erbrechen, Bewusstseinsstörung mit Aspirationsgefahr, schwere Kreislaufinstabilität).`,
        },
        {
          type: 'callout',
          variant: 'clinical',
          title: 'NIV hat feste Domänen',
          md: 'Besonders gut belegt ist NIV bei der hyperkapnischen COPD-Exazerbation und beim kardialen Lungenödem. Entscheidend ist eine engmaschige Überwachung: Bessert sich die Situation unter NIV nicht zügig, darf die Intubation nicht verzögert werden.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'unterdruck-ueberdruck',
      title: 'Unterdruck vs. Überdruck – Physiologie & Geschichte',
      blocks: [
        {
          type: 'text',
          md: `**Spontanatmung ist Unterdruckatmung.** Bei der Einatmung kontrahiert das Zwerchfell und senkt sich, die äußere Zwischenrippenmuskulatur hebt den Brustkorb. Der Thorax vergrößert sich, der Druck im Pleuraspalt (intrapleuraler Druck) wird negativer – in Ruhe etwa von −5 auf −8 cmH~2~O. Dadurch dehnt sich die Lunge, der Druck in den Alveolen fällt leicht unter den Umgebungsdruck, und Luft strömt *hinein gesogen* in die Lunge. Die Ausatmung erfolgt in Ruhe passiv durch die elastischen Rückstellkräfte von Lunge und Thorax.

**Maschinelle Beatmung ist (fast immer) Überdruckbeatmung.** Das Gerät *drückt* Gas mit positivem Druck in die Atemwege. Damit kehren sich die Druckverhältnisse im Thorax während der Inspiration um: Statt negativ werden Atemwegs-, Alveolar- und auch intrathorakaler Druck **positiv**.`,
        },
        {
          type: 'table',
          caption: 'Druckverhältnisse während der Inspiration',
          head: ['', 'Spontanatmung', 'Überdruckbeatmung'],
          rows: [
            ['Antrieb', 'Atemmuskulatur (v. a. Zwerchfell)', 'Beatmungsgerät'],
            ['Alveolardruck in der Inspiration', 'leicht negativ', 'positiv'],
            ['Intrathorakaler Druck', 'wird negativer', 'steigt an'],
            ['Venöser Rückstrom zum Herzen', 'wird gefördert („Saugeffekt“)', 'wird behindert'],
          ],
        },
        {
          type: 'heading',
          text: 'Folgen der Überdruckbeatmung',
        },
        {
          type: 'text',
          md: `- **Hämodynamik:** Der erhöhte intrathorakale Druck erschwert den Rückstrom des venösen Blutes zum rechten Herzen (Vorlast sinkt). Besonders bei Volumenmangel kann das Herzzeitvolumen abfallen und der Blutdruck sinken – typisch z. B. direkt nach Intubation und Beginn der Beatmung. Hohe PEEP-Werte verstärken diesen Effekt.
- **Lunge – VILI:** Überdruck kann die Lunge selbst schädigen (*ventilator-induced lung injury*). Man unterscheidet Schäden durch zu hohe Drücke (Barotrauma), Überdehnung durch zu große Volumina (Volutrauma), wiederholtes Öffnen und Kollabieren von Alveolen (Atelektrauma) sowie die daraus folgende Entzündungsreaktion (Biotrauma).
- **Weitere Effekte:** Umgehung der natürlichen Atemwegsbarriere (Infektionsrisiko), Notwendigkeit von Sedierung, Abbau der Atemmuskulatur bei langer kontrollierter Beatmung.`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Lungenprotektiv beatmen',
          md: 'Seit der ARDSNet-Studie (2000) gilt: Ein Tidalvolumen von etwa 6 ml/kg **Sollkörpergewicht** (predicted body weight, PBW – berechnet aus Größe und Geschlecht, nicht aus dem tatsächlichen Gewicht) und ein Plateaudruck ≤ 30 cmH~2~O senken das Risiko einer beatmungsinduzierten Lungenschädigung. Die konkrete Einstellung erfolgt immer ärztlich, nach Leitlinie, Herstellerangaben und lokalen Standards.',
        },
        {
          type: 'heading',
          text: 'Von der eisernen Lunge zur Überdruckbeatmung',
        },
        {
          type: 'text',
          md: `Die ersten breit eingesetzten Beatmungsgeräte imitierten die Spontanatmung: Die **„eiserne Lunge“** (Tankrespirator, ab 1928 nach Philip Drinker) umschloss den Körper bis zum Hals in einer luftdichten Kammer. Eine Pumpe erzeugte rhythmisch Unterdruck um den Thorax, wodurch sich der Brustkorb hob und Luft einströmte.

Während der **Polio-Epidemie in Kopenhagen 1952** wurden so viele Patient:innen mit Atemlähmung eingeliefert, dass die verfügbaren Tankrespiratoren bei Weitem nicht ausreichten, und die Sterblichkeit war sehr hoch. Der Anästhesist **Bjørn Ibsen** schlug vor, die Patient:innen zu tracheotomieren und über einen Beutel mit **Überdruck** zu beatmen – wie in der Narkose. Hunderte Medizinstudierende beatmeten daraufhin rund um die Uhr per Hand. Die Sterblichkeit sank deutlich. Diese Erfahrung gilt als Geburtsstunde der modernen Intensivmedizin und führte zur Entwicklung maschineller Überdruckbeatmungsgeräte.`,
        },
        {
          type: 'text',
          md: `**Warum setzte sich die Überdruckbeatmung durch?**

- Sie ermöglicht über Tubus oder Kanüle einen **gesicherten Atemweg** mit Aspirationsschutz und Absaugmöglichkeit.
- Der Körper bleibt **zugänglich** für Pflege, Diagnostik und Eingriffe.
- Druck, Volumen und F~I~O~2~ lassen sich **präzise steuern und messen**.
- Mit **PEEP** können kollabierte Lungenbereiche offen gehalten werden – mit Unterdruck um den Thorax ist das kaum möglich.`,
        },
        {
          type: 'quiz',
          title: 'Kurz geprüft: Unterdruck & Überdruck',
          questions: [
            {
              id: 'vent-l1-druck-spontan',
              kind: 'single',
              prompt: 'Wie entsteht der inspiratorische Gasfluss bei der Spontanatmung?',
              options: [
                'Durch positiven Druck, den die Atemwege von außen erzeugen',
                'Durch einen negativen intrapleuralen Druck, der die Lunge dehnt und den Alveolardruck unter den Umgebungsdruck senkt',
                'Durch aktive Kontraktion der Alveolen',
                'Durch den Herzschlag, der Luft in die Lunge pumpt',
              ],
              correct: 1,
              explanation: 'Das Zwerchfell vergrößert den Thorax, der intrapleurale Druck wird negativer, die Lunge dehnt sich und der Alveolardruck fällt leicht unter den Umgebungsdruck. Gas strömt immer vom höheren zum niedrigeren Druck – also in die Lunge hinein.',
              topic: 'Physiologie',
              difficulty: 1,
            },
            {
              id: 'vent-l1-druck-haemodynamik',
              kind: 'single',
              prompt: 'Nach Intubation und Beginn der Überdruckbeatmung fällt bei einem Patienten mit Volumenmangel der Blutdruck. Was ist die wahrscheinlichste physiologische Erklärung?',
              options: [
                'Der steigende intrathorakale Druck vermindert den venösen Rückstrom und damit die Vorlast des Herzens',
                'Der Sauerstoff aus dem Beatmungsgerät senkt direkt den Blutdruck',
                'Die Überdruckbeatmung erhöht den venösen Rückstrom zu stark',
                'Der Tubus reizt den Vagusnerv dauerhaft',
              ],
              correct: 0,
              explanation: 'Positiver intrathorakaler Druck komprimiert die großen Venen im Thorax und behindert den Rückstrom zum rechten Herzen. Bei Volumenmangel ist das Herz besonders vorlastabhängig – das Herzzeitvolumen sinkt. Zusätzlich tragen Narkosemedikamente häufig zum Blutdruckabfall bei.',
              topic: 'Physiologie',
              difficulty: 2,
            },
            {
              id: 'vent-l1-druck-polio',
              kind: 'truefalse',
              prompt: 'Während der Polio-Epidemie in Kopenhagen 1952 wurden viele Patient:innen erfolgreich mit manueller Überdruckbeatmung über eine Tracheotomie behandelt.',
              correct: true,
              explanation: 'Richtig. Auf Vorschlag des Anästhesisten Bjørn Ibsen wurden Patient:innen tracheotomiert und von Medizinstudierenden per Hand mit Überdruck beatmet. Die Sterblichkeit sank deutlich – ein Meilenstein für die Intensivmedizin.',
              topic: 'Grundlagen',
              difficulty: 1,
            },
            {
              id: 'vent-l1-druck-vili',
              kind: 'multiple',
              prompt: 'Welche Mechanismen tragen zur beatmungsinduzierten Lungenschädigung (VILI) bei?',
              options: [
                'Überdehnung durch zu große Tidalvolumina (Volutrauma)',
                'Wiederholtes Öffnen und Kollabieren von Alveolen (Atelektrauma)',
                'Entzündungsreaktion durch mechanischen Stress (Biotrauma)',
                'Zu niedrige Atemfrequenz bei normalem Volumen',
              ],
              correct: [0, 1, 2],
              explanation: 'Volutrauma, Atelektrauma und Biotrauma (zusammen mit dem Barotrauma) sind die anerkannten Mechanismen der VILI. Eine niedrige Atemfrequenz an sich schädigt das Lungengewebe nicht – sie kann aber zu einer unzureichenden CO~2~-Elimination führen.',
              topic: 'Physiologie',
              difficulty: 2,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'gasaustausch',
      title: 'Ventilation & Oxygenierung',
      blocks: [
        {
          type: 'text',
          md: `Für das Verständnis jeder Geräteeinstellung ist eine Unterscheidung zentral: **Ventilation** und **Oxygenierung** sind zwei verschiedene Dinge – und werden am Beatmungsgerät über weitgehend unterschiedliche Parameter beeinflusst.

- **Ventilation** bedeutet den Austausch von Gas zwischen Alveolen und Umgebung. Ihr wichtigstes Ergebnis ist die **Elimination von CO~2~**. Maß dafür ist der arterielle CO~2~-Partialdruck (P~a~CO~2~).
- **Oxygenierung** bedeutet die **Aufnahme von O~2~** aus den Alveolen ins Blut. Maß dafür sind der arterielle O~2~-Partialdruck (P~a~O~2~) und die Sauerstoffsättigung (S~p~O~2~ bzw. S~a~O~2~).`,
        },
        {
          type: 'formula',
          expression: 'MV = V~T~ · f',
          explanation: 'Das **Atemminutenvolumen** ist das pro Minute bewegte Gasvolumen. Beispiel: 500 ml · 12/min = 6 L/min.',
          variables: [
            { symbol: 'MV', meaning: 'Atemminutenvolumen', unit: 'L/min' },
            { symbol: 'V~T~', meaning: 'Tidalvolumen (Atemzugvolumen)', unit: 'L' },
            { symbol: 'f', meaning: 'Atemfrequenz', unit: '/min' },
          ],
        },
        {
          type: 'formula',
          expression: 'V̇~A~ = (V~T~ − V~D~) · f',
          explanation: 'Nicht das gesamte Volumen erreicht die Alveolen: Ein Teil verbleibt im **Totraum** (Atemwege, Tubus, Y-Stück, Filter), in dem kein Gasaustausch stattfindet. Für die CO~2~-Elimination zählt die **alveoläre Ventilation** V̇~A~. Der P~a~CO~2~ verhält sich (bei gleicher CO~2~-Produktion) **umgekehrt proportional** zu V̇~A~: Halbiert sich die alveoläre Ventilation, verdoppelt sich etwa der P~a~CO~2~.',
          variables: [
            { symbol: 'V̇~A~', meaning: 'alveoläre Ventilation', unit: 'L/min' },
            { symbol: 'V~D~', meaning: 'Totraumvolumen', unit: 'L' },
          ],
        },
        {
          type: 'callout',
          variant: 'model',
          title: 'Ein vereinfachtes Modell',
          md: 'Die Formel für V̇~A~ behandelt den Totraum als feste Größe. In Wirklichkeit ist er variabel: Neben dem anatomischen Totraum gibt es den **alveolären Totraum** (belüftete, aber nicht durchblutete Alveolen, z. B. bei Lungenembolie). Bei kranken Lungen kann der funktionelle Totraum deutlich größer sein. Die Formel erklärt das Prinzip – das Blutgas zeigt die Realität.',
        },
        {
          type: 'table',
          caption: 'Welche Stellgrößen beeinflussen was? (vereinfachte Zuordnung)',
          head: ['Ziel', 'Hauptsächliche Stellgrößen am Gerät', 'Kontrollwert'],
          rows: [
            ['**Ventilation** (CO~2~ abatmen)', 'Tidalvolumen bzw. Inspirationsdruck, Atemfrequenz → Minutenvolumen', 'P~a~CO~2~, endtidales CO~2~ (etCO~2~)'],
            ['**Oxygenierung** (O~2~ aufnehmen)', 'F~I~O~2~, PEEP bzw. mittlerer Atemwegsdruck', 'P~a~O~2~, S~p~O~2~'],
          ],
        },
        {
          type: 'callout',
          variant: 'remember',
          md: '**CO~2~ ist eine Frage der Ventilation, O~2~ eine Frage von F~I~O~2~ und offenen Alveolen.** Wer zu viel CO~2~ hat, braucht mehr alveoläre Ventilation; wer zu wenig O~2~ hat, braucht oft mehr F~I~O~2~ und/oder PEEP.',
        },
        {
          type: 'quiz',
          title: 'Kurz geprüft: Gasaustausch',
          questions: [
            {
              id: 'vent-l1-gas-mv',
              kind: 'numeric',
              prompt: 'Ein Patient wird mit einem Tidalvolumen von 450 ml und einer Atemfrequenz von 14/min beatmet. Wie groß ist das Atemminutenvolumen?',
              answer: 6.3,
              tolerance: 0.1,
              unit: 'L/min',
              explanation: 'MV = V~T~ · f = 0,45 L · 14/min = 6,3 L/min. Achte auf die Einheiten: ml in L umrechnen (450 ml = 0,45 L).',
              topic: 'Physik',
              difficulty: 1,
            },
            {
              id: 'vent-l1-gas-co2',
              kind: 'single',
              prompt: 'Der P~a~CO~2~ eines beatmeten Patienten ist zu hoch. Welche Maßnahme senkt ihn – rein physiologisch betrachtet – am direktesten?',
              options: [
                'F~I~O~2~ erhöhen',
                'Alveoläre Ventilation erhöhen (z. B. über Atemfrequenz oder Tidalvolumen)',
                'PEEP erhöhen',
                'Totraum durch zusätzliche Schlauchstücke vergrößern',
              ],
              correct: 1,
              explanation: 'Der P~a~CO~2~ ist umgekehrt proportional zur alveolären Ventilation. Mehr V̇~A~ bedeutet mehr CO~2~-Elimination. F~I~O~2~ und PEEP zielen vor allem auf die Oxygenierung; ein größerer Totraum verschlechtert die CO~2~-Elimination sogar.',
              topic: 'Physiologie',
              difficulty: 2,
            },
            {
              id: 'vent-l1-gas-tf',
              kind: 'truefalse',
              prompt: 'Eine Erhöhung der F~I~O~2~ von 0,4 auf 0,8 senkt einen erhöhten P~a~CO~2~ deutlich.',
              correct: false,
              explanation: 'Falsch. Die F~I~O~2~ beeinflusst die Oxygenierung, nicht die CO~2~-Elimination. Für den P~a~CO~2~ ist die alveoläre Ventilation entscheidend.',
              topic: 'Physiologie',
              difficulty: 1,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'warum-wichtig',
      title: 'Warum das für dich wichtig ist',
      blocks: [
        {
          type: 'text',
          md: `Beatmungsgeräte gehören zu den kritischsten Medizinprodukten im Krankenhaus: Fällt ein Gerät aus oder ist es falsch eingestellt, kann das binnen Minuten lebensbedrohlich werden. Deshalb betrifft das Thema alle Berufsgruppen:

- **Pflege und Ärzt:innen** stellen das Gerät ein, interpretieren Messwerte und reagieren auf Alarme.
- **Medizintechniker:innen** sorgen für Wartung, sicherheitstechnische Kontrollen (STK), Fehlerdiagnose und die Einweisung nach Medizinprodukte-Betreiberverordnung.
- **Auszubildende und Studierende** legen hier das Fundament für die Arbeit auf Intensivstation, im OP und im Rettungsdienst.

In den folgenden Lektionen schaust du ins Innere des Geräts (Lektion 2), verstehst die Physik eines Atemzugs (Lektion 3) und lernst die Bedienung und Alarme kennen (Lektion 4).`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Kein Ersatz für Einweisung und Herstellerangaben',
          md: 'Diese Lerninhalte vermitteln Grundlagenwissen. Sie ersetzen weder die gesetzlich vorgeschriebene Einweisung in das konkrete Gerät noch die Gebrauchsanweisung des Herstellers oder die Standards deiner Einrichtung. Konkrete Einstellungen sind immer ärztlich zu verantworten.',
        },
        {
          type: 'keyTerms',
          terms: [
            { term: 'Hypoxämie', definition: 'Erniedrigter Sauerstoffpartialdruck im arteriellen Blut (P~a~O~2~).' },
            { term: 'Hyperkapnie', definition: 'Erhöhter Kohlendioxidpartialdruck im arteriellen Blut (P~a~CO~2~), meist mit respiratorischer Azidose.' },
            { term: 'NIV', definition: 'Nicht-invasive Ventilation – Beatmung über Maske oder Helm ohne Tubus oder Trachealkanüle.' },
            { term: 'Totraum (V~D~)', definition: 'Anteil des Atemzugs, der nicht am Gasaustausch teilnimmt (Atemwege, Schläuche, nicht durchblutete Alveolen).' },
            { term: 'Alveoläre Ventilation (V̇~A~)', definition: 'Pro Minute die Alveolen erreichendes Frischgasvolumen: (V~T~ − V~D~) · f.' },
            { term: 'VILI', definition: 'Ventilator-induced lung injury – durch die Beatmung selbst verursachte Lungenschädigung.' },
            { term: 'PBW', definition: 'Predicted body weight (Sollkörpergewicht) – aus Körpergröße und Geschlecht berechnet; Bezugsgröße für das Tidalvolumen.' },
          ],
        },
        {
          type: 'sources',
          ids: ['rathgeber', 'larsen', 'oczenski', 'west', 'tobin', 'ardsnet', 's3-beatmung', 'iso80601-2-12'],
        },
      ],
    },
  ],
};
