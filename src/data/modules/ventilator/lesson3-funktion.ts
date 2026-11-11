import type { Lesson } from '@/types/content';

/**
 * Lektion 3 – Funktionsweise: Physik eines Atemzugs, Bewegungsgleichung,
 * Zeitkonstante, Atemphasen, Steuergrößen, Beatmungsformen, Gasaustausch.
 */
export const lessonFunktion: Lesson = {
  id: 'funktion',
  number: 3,
  kind: 'funktion',
  title: 'Funktionsweise',
  subtitle: 'Physik eines Atemzugs – von Druck und Flow bis zum Gasaustausch',
  durationMin: 25,
  xp: 70,
  objectives: [
    'Druck, Flow und Volumen physikalisch erklären und ihren Zusammenhang beschreiben',
    'Compliance und Resistance berechnen und klinisch einordnen',
    'Die Bewegungsgleichung der Atmung anwenden und Spitzen- von Plateaudruck unterscheiden',
    'Die Zeitkonstante τ = R · C nutzen, um Exspirationszeit und Auto-PEEP zu beurteilen',
    'Die Phasen eines maschinellen Atemzugs (Trigger, Inspiration, Umschaltung, Exspiration) benennen',
    'Volumen- und druckkontrollierte Beatmung vergleichen und gängige Beatmungsformen einordnen',
    'Erklären, welche Einstellgrößen Oxygenierung und CO~2~-Elimination beeinflussen',
  ],
  sections: [
    /* ------------------------------------------------------------ */
    {
      id: 'physik',
      title: 'Druck, Flow und Volumen',
      blocks: [
        {
          type: 'text',
          md: `Ein Beatmungsgerät macht im Kern etwas sehr Einfaches: Es erzeugt einen **Druckunterschied**. Gas strömt immer vom Ort höheren Drucks zum Ort niedrigeren Drucks. Bei der Spontanatmung senkt die Atemmuskulatur den Druck in den Alveolen unter den Umgebungsdruck (Unterdruckatmung). Bei der maschinellen Beatmung hebt das Gerät den Druck am Atemwegseingang über den Alveolardruck an – man spricht von **Überdruckbeatmung**.

Drei Messgrößen beschreiben jeden Atemzug:

- **Druck (P)** – gemessen in cmH~2~O (1 mbar ≈ 1,02 cmH~2~O, praktisch gleichwertig). Bezugspunkt ist der Umgebungsdruck.
- **Flow (V̇)** – die Gasmenge pro Zeit, meist in L/min angezeigt, physikalisch oft in L/s gerechnet (60 L/min = 1 L/s).
- **Volumen (V)** – die bewegte Gasmenge in ml oder L.`,
        },
        {
          type: 'formula',
          expression: 'V = ∫ V̇ dt',
          explanation:
            'Das Volumen ist das zeitliche Integral des Flows – anschaulich die Fläche unter der Flow-Zeit-Kurve. Beatmungsgeräte messen den Flow und berechnen daraus das Volumen. Bei konstantem Flow gilt einfach V = V̇ · t.',
          variables: [
            { symbol: 'V', meaning: 'Volumen', unit: 'L bzw. ml' },
            { symbol: 'V̇', meaning: 'Flow (Volumenstrom)', unit: 'L/s' },
            { symbol: 't', meaning: 'Zeit', unit: 's' },
          ],
        },
        {
          type: 'callout',
          variant: 'remember',
          title: 'Merksatz',
          md: `Ohne Druckgradient kein Flow – ohne Flow keine Volumenänderung. Ist der Flow null, sind Druck am Y-Stück und Alveolardruck (im Modell) gleich.`,
        },
        {
          type: 'heading',
          text: 'Compliance – die Dehnbarkeit',
        },
        {
          type: 'formula',
          expression: 'C = ΔV / ΔP',
          explanation:
            'Die Compliance gibt an, wie viel Volumen pro Druckänderung in das respiratorische System passt. Klinisch wird meist die statische Compliance des respiratorischen Systems berechnet: C_stat = VT / (Pplat − PEEP). Die dynamische Compliance verwendet statt des Plateaudrucks den Spitzendruck (VT / (Ppeak − PEEP)) und enthält daher auch resistive Anteile – sie ist immer kleiner oder gleich der statischen.',
          variables: [
            { symbol: 'C', meaning: 'Compliance', unit: 'ml/cmH₂O' },
            { symbol: 'ΔV', meaning: 'Volumenänderung (z. B. Tidalvolumen VT)', unit: 'ml' },
            { symbol: 'ΔP', meaning: 'zugehörige Druckänderung', unit: 'cmH₂O' },
          ],
        },
        {
          type: 'text',
          md: `Beim beatmeten Erwachsenen mit gesunder Lunge liegt die Compliance des respiratorischen Systems typischerweise bei etwa **50–100 ml/cmH~2~O** (häufig um 60). Beim **ARDS** ist sie oft deutlich erniedrigt (häufig < 40 ml/cmH~2~O) – die Lunge ist „steif“, weil viele Alveolen kollabiert oder geflutet sind und nur ein kleiner Teil („Baby Lung“) belüftet wird. Auch Lungenfibrose, Pleuraerguss, Adipositas oder ein erhöhter intraabdomineller Druck senken die Compliance.`,
        },
        {
          type: 'heading',
          text: 'Resistance – der Atemwegswiderstand',
        },
        {
          type: 'formula',
          expression: 'R = ΔP / V̇',
          explanation:
            'Die Resistance beschreibt, wie viel Druck nötig ist, um einen bestimmten Flow durch Tubus und Atemwege zu treiben. Am Gerät lässt sie sich aus der Differenz von Spitzen- und Plateaudruck bei konstantem Inspirationsflow abschätzen: R ≈ (Ppeak − Pplat) / V̇.',
          variables: [
            { symbol: 'R', meaning: 'Resistance', unit: 'cmH₂O/(L/s)' },
            { symbol: 'ΔP', meaning: 'Druckabfall über dem Widerstand', unit: 'cmH₂O' },
            { symbol: 'V̇', meaning: 'Flow', unit: 'L/s' },
          ],
        },
        {
          type: 'text',
          md: `Für laminare Strömung durch ein Rohr gilt das **Hagen-Poiseuille-Gesetz**: R = 8 · η · l / (π · r^4^). Der Widerstand ist umgekehrt proportional zur **vierten Potenz des Radius**. Halbiert sich der Radius, steigt der Widerstand auf das 16-Fache.

Deshalb ist der **Endotrachealtubus** oft der größte Einzelwiderstand: Ein Wechsel von 8,0 auf 7,0 mm Innendurchmesser erhöht den Widerstand rechnerisch bereits um etwa 70 % ((8/7)^4^ ≈ 1,7). Sekret, Abknicken oder ein Beißen auf den Tubus wirken genauso. Typische Werte beim intubierten Erwachsenen liegen bei etwa **5–10 cmH~2~O/(L/s)**, bei obstruktiven Erkrankungen (Asthma, COPD) deutlich höher, z. B. **20 cmH~2~O/(L/s) und mehr**.`,
        },
        {
          type: 'callout',
          variant: 'model',
          title: 'Modell vs. Realität',
          md: `Hagen-Poiseuille gilt streng nur für laminare Strömung in starren, geraden Rohren. In Tubus und großen Atemwegen ist die Strömung bei hohen Flows teilweise **turbulent** – dann steigt der Druckabfall überproportional mit dem Flow, die Resistance ist also nicht konstant. Die Grundaussage „kleiner Durchmesser → stark steigender Widerstand“ bleibt aber richtig.`,
        },
        {
          type: 'quiz',
          title: 'Kurzcheck: Physik',
          questions: [
            {
              id: 'vent-l3-compliance-calc',
              kind: 'numeric',
              prompt:
                'Ein Patient erhält ein Tidalvolumen von 500 ml. Der Plateaudruck beträgt 20 cmH~2~O, der PEEP 8 cmH~2~O. Wie groß ist die statische Compliance (gerundet)?',
              answer: 41.7,
              tolerance: 1,
              unit: 'ml/cmH₂O',
              explanation:
                'C_stat = VT / (Pplat − PEEP) = 500 ml / (20 − 8) cmH~2~O = 500 / 12 ≈ 41,7 ml/cmH~2~O. Das liegt unter dem Normbereich und spricht für eine eingeschränkte Dehnbarkeit.',
              topic: 'Physik',
              difficulty: 2,
            },
            {
              id: 'vent-l3-tube-radius',
              kind: 'single',
              prompt:
                'Der Radius einer Engstelle im Atemweg halbiert sich (z. B. durch Sekret). Wie verändert sich der Widerstand bei laminarer Strömung näherungsweise?',
              options: ['Er verdoppelt sich', 'Er vervierfacht sich', 'Er steigt auf das 16-Fache', 'Er halbiert sich'],
              correct: 2,
              explanation:
                'Nach Hagen-Poiseuille gilt R ∝ 1/r^4^. Halber Radius bedeutet 2^4^ = 16-fachen Widerstand. Darum haben Tubusgröße, Sekret und Abknicken so große Wirkung.',
              topic: 'Physik',
              difficulty: 1,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'bewegungsgleichung',
      title: 'Bewegungsgleichung & Zeitkonstante',
      blocks: [
        {
          type: 'text',
          md: `Wie viel Druck braucht das Gerät für einen Atemzug? Die Antwort liefert die **Bewegungsgleichung des respiratorischen Systems** (equation of motion). Sie betrachtet die Lunge vereinfacht als **einen** elastischen Ballon (Compliance C) hinter **einem** Rohr (Resistance R).`,
        },
        {
          type: 'formula',
          expression: 'P_aw = PEEP + V / C + R · V̇',
          explanation:
            'Der Atemwegsdruck setzt sich zu jedem Zeitpunkt aus drei Anteilen zusammen: dem endexspiratorischen Ausgangsdruck, dem elastischen Anteil (Druck, um das bereits eingeströmte Volumen gegen die Rückstellkraft zu halten) und dem resistiven Anteil (Druck, um den aktuellen Flow durch die Atemwege zu treiben). Bei aktiver Atemanstrengung des Patienten kommt zusätzlich der Muskeldruck hinzu (P_aw + P_mus = …).',
          variables: [
            { symbol: 'P_aw', meaning: 'Atemwegsdruck (am Y-Stück)', unit: 'cmH₂O' },
            { symbol: 'PEEP', meaning: 'positiver endexspiratorischer Druck (Ausgangsdruck)', unit: 'cmH₂O' },
            { symbol: 'V', meaning: 'seit Inspirationsbeginn eingeströmtes Volumen', unit: 'L' },
            { symbol: 'C', meaning: 'Compliance des respiratorischen Systems', unit: 'L/cmH₂O' },
            { symbol: 'R', meaning: 'Resistance (Tubus + Atemwege)', unit: 'cmH₂O/(L/s)' },
            { symbol: 'V̇', meaning: 'aktueller Flow', unit: 'L/s' },
          ],
        },
        {
          type: 'widget',
          widget: 'vent-equation',
          caption:
            'Verändern Sie Compliance, Resistance, Flow und PEEP und beobachten Sie, wie sich elastischer und resistiver Druckanteil verschieben.',
        },
        {
          type: 'heading',
          text: 'Spitzendruck und Plateaudruck',
        },
        {
          type: 'text',
          md: `Bei volumenkontrollierter Beatmung mit konstantem Flow lässt sich die Gleichung direkt „sichtbar machen“: Am Ende der Inspiration erreicht der Druck den **Spitzendruck (Ppeak)**. Wird nun eine **endinspiratorische Pause** (Inspiratory Hold, ca. 0,5–2 s) durchgeführt, fällt der Flow auf null – der resistive Anteil R · V̇ verschwindet. Der Druck sinkt auf den **Plateaudruck (Pplat)**, der (im Modell) dem Alveolardruck entspricht.

- **Ppeak − Pplat** ≈ resistiver Anteil → steigt bei Obstruktion, Sekret, Tubusproblem
- **Pplat − PEEP** ≈ elastischer Anteil = **Driving Pressure ΔP** → steigt bei sinkender Compliance oder zu großem VT
- **Pplat** ≤ 30 cmH~2~O und **ΔP** ≤ 15 cmH~2~O gelten als Zielgrößen lungenprotektiver Beatmung`,
        },
        {
          type: 'formula',
          expression: 'ΔP = Pplat − PEEP = VT / C',
          explanation:
            'Der Driving Pressure beschreibt, wie stark die Lunge pro Atemzug gedehnt wird – bezogen auf die tatsächlich belüftbare Lunge. In einer großen Sekundäranalyse (Amato 2015) war ein höherer Driving Pressure bei ARDS-Patient:innen mit einer höheren Sterblichkeit assoziiert.',
          variables: [
            { symbol: 'ΔP', meaning: 'Driving Pressure (Atemwegs-Druckdifferenz)', unit: 'cmH₂O' },
            { symbol: 'VT', meaning: 'Tidalvolumen', unit: 'ml' },
            { symbol: 'C', meaning: 'statische Compliance', unit: 'ml/cmH₂O' },
          ],
        },
        {
          type: 'callout',
          variant: 'clinical',
          title: 'Praxis: Was ist gestiegen?',
          md: `Der Spitzendruck steigt plötzlich von 25 auf 38 cmH~2~O. Bleibt der Plateaudruck gleich, liegt das Problem im **Widerstand** (Sekret, Abknicken, Bronchospasmus, Beißen). Steigen Spitzen- **und** Plateaudruck gemeinsam, hat sich die **Compliance** verschlechtert (z. B. Pneumothorax, Atelektase, Intubation in einen Hauptbronchus, Lungenödem).`,
        },
        {
          type: 'heading',
          text: 'Die Zeitkonstante τ',
        },
        {
          type: 'formula',
          expression: 'τ = R · C',
          explanation:
            'Die Zeitkonstante bestimmt, wie schnell sich die Lunge passiv füllt oder entleert. Nach einer Zeitkonstante sind rund 63 % des Volumens ausgeatmet, nach drei etwa 95 %. Beispiel: R = 10 cmH₂O/(L/s) und C = 0,05 L/cmH₂O ergeben τ = 0,5 s.',
          variables: [
            { symbol: 'τ', meaning: 'Zeitkonstante', unit: 's' },
            { symbol: 'R', meaning: 'Resistance', unit: 'cmH₂O/(L/s)' },
            { symbol: 'C', meaning: 'Compliance', unit: 'L/cmH₂O' },
          ],
        },
        {
          type: 'table',
          caption: 'Passive Entleerung in Vielfachen der Zeitkonstante (exponentieller Verlauf)',
          head: ['Zeit', 'Ausgeatmeter Anteil', 'Verbleibender Anteil'],
          rows: [
            ['1 τ', '≈ 63 %', '≈ 37 %'],
            ['2 τ', '≈ 86 %', '≈ 14 %'],
            ['3 τ', '≈ 95 %', '≈ 5 %'],
            ['5 τ', '≈ 99 %', '≈ 1 %'],
          ],
        },
        {
          type: 'text',
          md: `Als Faustregel sollte die **Exspirationszeit mindestens etwa 3 τ** betragen. Bei gesunder Lunge (τ ≈ 0,5 s) reichen dafür ca. 1,5 s. Bei einer **obstruktiven** Erkrankung (z. B. R = 25 cmH~2~O/(L/s), C = 0,06 L/cmH~2~O → τ = 1,5 s) wären bereits rund **4,5 s** nötig.

Ist die Exspirationszeit zu kurz, beginnt der nächste Atemzug, bevor die Lunge entleert ist. Das Restvolumen summiert sich auf (**Air Trapping**, „Breath Stacking“), und in den Alveolen bleibt ein Druck über dem eingestellten PEEP: der **intrinsische PEEP (PEEPi, Auto-PEEP)**. Er lässt sich mit einem **endexspiratorischen Hold** messen (Gesamt-PEEP − eingestellter PEEP). Folgen: Überblähung, steigende Plateaudrücke, Kreislaufdepression und erschwertes Triggern.`,
        },
        {
          type: 'callout',
          variant: 'clinical',
          title: 'Woran erkennt man Auto-PEEP?',
          md: `Auf der **Flow-Zeit-Kurve** erreicht der exspiratorische Flow vor dem nächsten Atemzug nicht die Nulllinie. Gegenmaßnahmen (ärztlich angeordnet): Exspirationszeit verlängern – z. B. Atemfrequenz senken, Inspirationszeit verkürzen, VT reduzieren – und die Obstruktion behandeln.`,
        },
        {
          type: 'quiz',
          title: 'Kurzcheck: Bewegungsgleichung',
          questions: [
            {
              id: 'vent-l3-resistance-calc',
              kind: 'numeric',
              prompt:
                'Volumenkontrollierte Beatmung mit konstantem Flow von 60 L/min. Ppeak = 28 cmH~2~O, Pplat = 20 cmH~2~O. Wie groß ist die Resistance in cmH~2~O/(L/s)?',
              answer: 8,
              tolerance: 0.5,
              unit: 'cmH₂O/(L/s)',
              explanation:
                '60 L/min = 1 L/s. R ≈ (Ppeak − Pplat) / V̇ = (28 − 20) cmH~2~O / 1 L/s = 8 cmH~2~O/(L/s) – ein typischer Wert beim intubierten Erwachsenen.',
              topic: 'Physik',
              difficulty: 2,
            },
            {
              id: 'vent-l3-peak-vs-plateau',
              kind: 'single',
              prompt:
                'Der Spitzendruck ist deutlich gestiegen, der Plateaudruck aber unverändert. Was ist am wahrscheinlichsten?',
              options: [
                'Pneumothorax',
                'Zunehmende Atelektasen',
                'Sekretverlegung des Tubus',
                'Lungenödem',
              ],
              correct: 2,
              explanation:
                'Steigt nur Ppeak − Pplat, hat der resistive Anteil zugenommen – typisch für Sekret, Abknicken, Beißen oder Bronchospasmus. Pneumothorax, Atelektasen und Lungenödem senken die Compliance und erhöhen damit auch den Plateaudruck.',
              topic: 'Physik',
              difficulty: 2,
            },
            {
              id: 'vent-l3-tau',
              kind: 'truefalse',
              prompt: 'Nach drei Zeitkonstanten ist die Lunge bei passiver Exspiration zu etwa 95 % entleert.',
              correct: true,
              explanation:
                'Die passive Entleerung folgt einer Exponentialfunktion: nach 1 τ ≈ 63 %, nach 2 τ ≈ 86 %, nach 3 τ ≈ 95 %, nach 5 τ ≈ 99 %.',
              topic: 'Physik',
              difficulty: 1,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'atemzyklus',
      title: 'Ein Atemzug Schritt für Schritt',
      blocks: [
        {
          type: 'text',
          md: `Jeder maschinelle Atemzug lässt sich in vier Phasen gliedern. Die Fachsprache unterscheidet dabei, **wodurch** eine Phase beginnt (Trigger), **was** während der Inspiration begrenzt oder angestrebt wird (Limit/Target) und **wodurch** auf Exspiration umgeschaltet wird (Cycling).`,
        },
        {
          type: 'widget',
          widget: 'vent-breath-cycle',
          caption:
            'Verfolgen Sie, wie Inspirations- und Exspirationsventil zusammenspielen und wie sich Druck, Flow und Volumen in jeder Phase verändern.',
        },
        {
          type: 'steps',
          title: 'Die vier Phasen eines Atemzugs',
          steps: [
            {
              title: '1. Trigger – der Start',
              md: `Die Inspiration beginnt entweder **zeitgesteuert** durch das Gerät (aus der eingestellten Frequenz) oder **patientengetriggert**:

- **Drucktrigger:** Der Patient erzeugt einen kleinen Unterdruck unter das PEEP-Niveau (z. B. 1–2 cmH~2~O); das Gerät erkennt den Druckabfall.
- **Flowtrigger:** Durch das System strömt ein kleiner Basisflow; atmet der Patient ein, fehlt ein Teil davon am exspiratorischen Flowsensor – überschreitet diese Differenz die Schwelle (wenige L/min), wird ausgelöst.

Zu empfindlich eingestellt → **Autotriggerung** (z. B. durch Leckage, Kondenswasser, Herzaktionen). Zu unempfindlich → frustrane Atemanstrengungen und erhöhte Atemarbeit.`,
            },
            {
              title: '2. Inspiration – Limit und Target',
              md: `Das Inspirationsventil öffnet, das Exspirationsventil schließt. Die Steuereinheit regelt in einem geschlossenen Regelkreis entweder den **Flow** (volumenkontrolliert: vorgegebener Flow bis zum Zielvolumen) oder den **Druck** (druckkontrolliert: vorgegebener Inspirationsdruck, der Flow ergibt sich). Ein **Limit** ist ein Wert, der nicht überschritten wird, aber die Inspiration nicht beendet (z. B. Druckbegrenzung).`,
            },
            {
              title: '3. Umschaltung – das Cycling',
              md: `Das Ende der Inspiration wird durch ein **Umschaltkriterium** ausgelöst:

- **Zeit** – nach Ablauf der eingestellten Inspirationszeit (typisch bei PC-CMV und VC mit Pause)
- **Flow** – wenn der Flow auf einen Bruchteil des Spitzenflows abgefallen ist (typisch bei Druckunterstützung/ASB, oft ca. 25 %, meist einstellbar)
- **Volumen** – nach Abgabe des Zielvolumens (VC ohne Pause)
- **Druck** – bei Erreichen eines Druckwertes; heute vor allem als Sicherheitsabbruch bei Erreichen der oberen Druckalarmgrenze`,
            },
            {
              title: '4. Exspiration – passiv',
              md: `Das Inspirationsventil schließt, das Exspirationsventil öffnet. Die Ausatmung ist **passiv**: Die elastischen Rückstellkräfte von Lunge und Thoraxwand treiben das Gas hinaus. Das Exspirationsventil hält dabei den eingestellten **PEEP** aufrecht, damit die Alveolen am Ende der Exspiration nicht kollabieren. Der exspiratorische Flowsensor misst das **exspirierte Volumen (VTe)** – Grundlage für Volumenmonitoring und Leckerkennung.`,
            },
          ],
        },
        {
          type: 'callout',
          variant: 'remember',
          title: 'Merksatz',
          md: `**Trigger** startet, **Target/Limit** formt, **Cycling** beendet die Inspiration – die Exspiration ist passiv, der PEEP wird vom Exspirationsventil gehalten.`,
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'steuerung',
      title: 'Volumen- vs. druckkontrollierte Beatmung',
      blocks: [
        {
          type: 'text',
          md: `Ein Beatmungsgerät kann zu einem Zeitpunkt nur **eine** Größe direkt vorgeben – die **Steuergröße** (Control Variable). Die jeweils andere Größe ergibt sich aus der Bewegungsgleichung, also aus Compliance und Resistance des Patienten.

- **Volumenkontrolle (VC):** Das Gerät gibt Volumen bzw. Flow vor – meist als **konstanter Flow** (Rechteckflow). Der **Druck ist das Ergebnis**.
- **Druckkontrolle (PC):** Das Gerät gibt den Inspirationsdruck vor. Der Flow ist anfangs hoch und fällt ab (**dezelerierender Flow**), da der Druckgradient mit zunehmender Füllung abnimmt. Das **Volumen ist das Ergebnis**.`,
        },
        {
          type: 'table',
          caption: 'Vergleich der Steuergrößen',
          head: ['Merkmal', 'Volumenkontrolliert (VC)', 'Druckkontrolliert (PC)'],
          rows: [
            ['Vorgegeben', 'Tidalvolumen, Flow(form)', 'Inspirationsdruck, Inspirationszeit'],
            ['Ergebnis', 'Atemwegsdrücke (Ppeak, Pplat)', 'Tidalvolumen, Flowverlauf'],
            ['Typische Flowform', 'konstant (Rechteck)', 'dezelerierend'],
            ['Vorteile', 'garantiertes VT und Minutenvolumen; Pplat und Resistance einfach messbar', 'Spitzendruck begrenzt; dezelerierender Flow verteilt Gas gleichmäßiger; Leckagen werden teilweise kompensiert; oft bessere Synchronisation'],
            ['Nachteile', 'Drücke können bei sinkender Compliance unbemerkt steigen; fester Flow kann Patientenbedarf nicht folgen', 'VT schwankt mit Compliance, Resistance und Eigenatmung; Hypo-/Hyperventilation möglich'],
            ['Wichtigste Alarme', 'oberer Druckalarm', 'VTe-/MV-Alarme (unten und oben)'],
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Hybride Verfahren',
          md: `Viele Geräte bieten **adaptive bzw. volumengarantierte Druckkontrolle** (Herstellernamen z. B. PRVC, AutoFlow, VC+): Das Gerät beatmet druckkontrolliert, passt den Inspirationsdruck aber Atemzug für Atemzug an, um ein Zielvolumen zu erreichen. Nach der Taxonomie von Chatburn ist die Steuergröße hier Druck, das Volumen ist ein adaptives Ziel.`,
        },
        {
          type: 'heading',
          text: 'Beatmungsformen im Überblick',
        },
        {
          type: 'text',
          md: `Nach der Taxonomie von Chatburn wird eine Beatmungsform durch **Steuergröße** (Volumen oder Druck), **Atemsequenz** (CMV = alle Atemzüge mandatorisch, IMV = mandatorische und spontane Atemzüge, CSV = nur spontane Atemzüge) und **Zielschema** beschrieben. Herstellernamen unterscheiden sich stark – gleiche Bezeichnungen können verschiedene Dinge bedeuten und umgekehrt.`,
        },
        {
          type: 'table',
          caption: 'Gängige Beatmungsformen (vereinfacht)',
          head: ['Bezeichnung', 'Einordnung', 'Kurzbeschreibung'],
          rows: [
            ['VC-CMV', 'Volumen, kontinuierlich mandatorisch', 'Jeder Atemzug hat das eingestellte VT; Auslösung zeit- oder patientengetriggert (assistiert-kontrolliert).'],
            ['PC-CMV', 'Druck, kontinuierlich mandatorisch', 'Jeder Atemzug mit eingestelltem Inspirationsdruck und Inspirationszeit.'],
            ['SIMV', 'Volumen oder Druck, IMV', 'Eine Mindestzahl mandatorischer Atemzüge, synchronisiert mit dem Patienten; dazwischen Spontanatmung, meist mit Druckunterstützung.'],
            ['PSV / ASB', 'Druck, CSV', 'Jeder Atemzug wird vom Patienten getriggert und mit eingestelltem Druck unterstützt; flowgesteuertes Umschalten.'],
            ['CPAP', 'CSV ohne Druckunterstützung', 'Spontanatmung auf erhöhtem Druckniveau; häufig mit ASB kombiniert (CPAP/ASB).'],
            ['BIPAP / BiLevel / APRV', 'Druck, IMV', 'Wechsel zwischen zwei Druckniveaus; Spontanatmung ist auf beiden Niveaus möglich. „BIPAP“ bezeichnet hier ein invasives Verfahren und ist nicht mit dem nichtinvasiven Gerätenamen „BiPAP“ zu verwechseln.'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Herstellerbezeichnungen beachten',
          md: `Gleich klingende Modi verhalten sich je nach Gerät unterschiedlich (z. B. Triggerlogik, Umschaltkriterien, Rampen). Maßgeblich sind immer die **Gebrauchsanweisung des Herstellers** und die Einweisung am konkreten Gerät.`,
        },
        {
          type: 'quiz',
          title: 'Kurzcheck: Steuergrößen',
          questions: [
            {
              id: 'vent-l3-pc-result',
              kind: 'single',
              prompt:
                'Unter druckkontrollierter Beatmung (PC-CMV) verschlechtert sich die Compliance des Patienten. Was passiert bei unveränderten Einstellungen?',
              options: [
                'Der Spitzendruck steigt deutlich an',
                'Das Tidalvolumen sinkt',
                'Der PEEP steigt automatisch',
                'Der Flow bleibt während der ganzen Inspiration konstant',
              ],
              correct: 1,
              explanation:
                'Bei Druckkontrolle ist der Druck vorgegeben, das Volumen ist das Ergebnis: VT ≈ C · ΔP (bei ausreichender Inspirationszeit). Sinkt C, sinkt VT – deshalb sind VTe- und MV-Alarme hier besonders wichtig.',
              topic: 'Beatmungsformen',
              difficulty: 2,
            },
            {
              id: 'vent-l3-cycling-asb',
              kind: 'single',
              prompt: 'Wodurch wird bei Druckunterstützung (PSV/ASB) typischerweise auf Exspiration umgeschaltet?',
              options: [
                'Nach Ablauf einer festen Inspirationszeit',
                'Wenn der Flow auf einen Anteil des Spitzenflows abgefallen ist',
                'Wenn das eingestellte Volumen erreicht ist',
                'Wenn der Patient hustet',
              ],
              correct: 1,
              explanation:
                'PSV/ASB ist flowgesteuert: Fällt der inspiratorische Flow auf einen (oft einstellbaren) Prozentsatz des Spitzenflows, endet die Unterstützung. So bestimmt der Patient Inspirationszeit und Volumen mit.',
              topic: 'Beatmungsformen',
              difficulty: 2,
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'gasaustausch',
      title: 'Gasaustausch: Oxygenierung und CO₂-Elimination',
      blocks: [
        {
          type: 'text',
          md: `Beatmung verfolgt zwei weitgehend getrennt steuerbare Ziele:

- **Oxygenierung** (O~2~-Aufnahme) hängt vor allem von der **inspiratorischen O~2~-Fraktion (F~I~O~2~)** und vom **mittleren Atemwegsdruck** ab. PEEP und Rekrutierung öffnen kollabierte Alveolen, vergrößern die Gasaustauschfläche und verringern den intrapulmonalen Shunt.
- **CO~2~-Elimination** (Ventilation) hängt von der **alveolären Ventilation** ab, also von Tidalvolumen und Atemfrequenz abzüglich Totraum.`,
        },
        {
          type: 'formula',
          expression: 'MV = VT · f',
          explanation:
            'Das Atemminutenvolumen ist das Produkt aus Tidalvolumen und Atemfrequenz. Beispiel: 0,45 L · 16/min = 7,2 L/min.',
          variables: [
            { symbol: 'MV', meaning: 'Atemminutenvolumen', unit: 'L/min' },
            { symbol: 'VT', meaning: 'Tidalvolumen', unit: 'L' },
            { symbol: 'f', meaning: 'Atemfrequenz', unit: '1/min' },
          ],
        },
        {
          type: 'formula',
          expression: 'V̇A = (VT − VD) · f      PaCO₂ ∝ V̇CO₂ / V̇A',
          explanation:
            'Nur der Teil des Atemzugs, der die Alveolen erreicht, nimmt am Gasaustausch teil. Bei gleicher CO₂-Produktion ist der arterielle CO₂-Partialdruck umgekehrt proportional zur alveolären Ventilation: Verdoppelt sich V̇A, halbiert sich PaCO₂ näherungsweise.',
          variables: [
            { symbol: 'V̇A', meaning: 'alveoläre Ventilation', unit: 'L/min' },
            { symbol: 'VD', meaning: 'Totraumvolumen (anatomisch + apparativ + alveolär)', unit: 'L' },
            { symbol: 'PaCO₂', meaning: 'arterieller CO₂-Partialdruck', unit: 'mmHg' },
            { symbol: 'V̇CO₂', meaning: 'CO₂-Produktion des Körpers', unit: 'ml/min' },
          ],
        },
        {
          type: 'text',
          md: `**Warum der Totraum wichtig ist:** Der anatomische Totraum eines Erwachsenen liegt grob bei 150 ml. Zusätzlich zählt alles **zwischen Y-Stück und Patient** zum apparativen Totraum (z. B. HME-Filter, Gänsegurgel, Kapnometrie-Adapter).

Vergleich bei VD = 150 ml:

- VT 500 ml × f 12/min → MV 6,0 L/min, V̇A = 350 ml × 12 = **4,2 L/min**
- VT 300 ml × f 20/min → MV 6,0 L/min, V̇A = 150 ml × 20 = **3,0 L/min**

Trotz gleichen Minutenvolumens ist die alveoläre Ventilation im zweiten Fall deutlich geringer – der PaCO~2~ steigt. Bei lungenprotektiver Beatmung mit kleinem VT wird daher die Frequenz erhöht und apparativer Totraum möglichst klein gehalten.`,
        },
        {
          type: 'facts',
          items: [
            { value: 'F~I~O~2~ + P̄aw', label: 'Haupthebel der Oxygenierung' },
            { value: 'VT · f', label: 'Haupthebel der CO₂-Elimination' },
            { value: '≈ 150 ml', label: 'anatomischer Totraum Erwachsener (grob)' },
          ],
        },
        {
          type: 'callout',
          variant: 'model',
          title: 'Grenzen des Ein-Kompartiment-Modells',
          md: `Bewegungsgleichung, Zeitkonstante und Driving Pressure beruhen auf einem stark **vereinfachten Modell**: eine Lunge mit einer Compliance und einer Resistance. In der Realität gilt:

- Die Lunge ist **inhomogen** – gesunde, kollabierte und überblähte Areale liegen nebeneinander, mit unterschiedlichen Zeitkonstanten (Pendelluft, ungleiche Belüftung).
- Die Compliance ist **nichtlinear**: Bei niedrigen Volumina (Rekrutierung) und hohen Volumina (Überdehnung) flacht die Druck-Volumen-Kurve ab.
- **Spontane Atemanstrengung** (P~mus~) verändert die gemessenen Drücke; Pplat und Compliance sind nur bei passivem Patienten verlässlich bestimmbar.
- Die Thoraxwand trägt zur Gesamtcompliance bei – der Atemwegsdruck ist nicht gleich dem transpulmonalen Druck, der die Lunge tatsächlich dehnt.

Das Modell ist dennoch hervorragend geeignet, um Zusammenhänge zu verstehen und Trends am Gerät zu interpretieren.`,
        },
        {
          type: 'quiz',
          title: 'Kurzcheck: Gasaustausch',
          questions: [
            {
              id: 'vent-l3-mv-calc',
              kind: 'numeric',
              prompt: 'Eingestellt sind VT = 450 ml und f = 16/min. Wie groß ist das Atemminutenvolumen in L/min?',
              answer: 7.2,
              tolerance: 0.1,
              unit: 'L/min',
              explanation: 'MV = VT · f = 0,45 L · 16/min = 7,2 L/min.',
              topic: 'Gasaustausch',
              difficulty: 1,
            },
            {
              id: 'vent-l3-va-calc',
              kind: 'numeric',
              prompt:
                'VT = 400 ml, f = 18/min, Totraum VD = 150 ml. Wie groß ist die alveoläre Ventilation in L/min?',
              answer: 4.5,
              tolerance: 0.1,
              unit: 'L/min',
              explanation: 'V̇A = (VT − VD) · f = (0,40 − 0,15) L · 18/min = 0,25 L · 18/min = 4,5 L/min.',
              topic: 'Gasaustausch',
              difficulty: 2,
            },
            {
              id: 'vent-l3-co2-lever',
              kind: 'multiple',
              prompt: 'Der PaCO~2~ ist zu hoch. Welche Maßnahmen erhöhen (bei sonst gleichen Bedingungen) die CO~2~-Elimination?',
              options: [
                'Atemfrequenz erhöhen',
                'F~I~O~2~ erhöhen',
                'Apparativen Totraum verringern',
                'PEEP erhöhen',
              ],
              correct: [0, 2],
              explanation:
                'Die CO~2~-Elimination hängt von der alveolären Ventilation (VT − VD) · f ab. Eine höhere Frequenz und weniger Totraum steigern sie. F~I~O~2~ und PEEP wirken primär auf die Oxygenierung. (Achtung: Eine höhere Frequenz verkürzt die Exspirationszeit – Auto-PEEP beachten.)',
              topic: 'Gasaustausch',
              difficulty: 2,
            },
          ],
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
            { term: 'Compliance (C)', definition: 'Dehnbarkeit des respiratorischen Systems, C = ΔV/ΔP; statisch: VT/(Pplat − PEEP).' },
            { term: 'Resistance (R)', definition: 'Strömungswiderstand von Tubus und Atemwegen, R = ΔP/V̇; stark abhängig vom Radius (∝ 1/r⁴).' },
            { term: 'Bewegungsgleichung', definition: 'P_aw = PEEP + V/C + R · V̇ – Druck als Summe aus Ausgangsdruck, elastischem und resistivem Anteil.' },
            { term: 'Plateaudruck (Pplat)', definition: 'Druck bei Nullflow während einer endinspiratorischen Pause; Näherung für den Alveolardruck.' },
            { term: 'Driving Pressure (ΔP)', definition: 'Pplat − PEEP; Maß für die zyklische Dehnung der Lunge, Ziel ≤ 15 cmH₂O.' },
            { term: 'Zeitkonstante (τ)', definition: 'τ = R · C; nach 3 τ ist die Lunge zu etwa 95 % entleert.' },
            { term: 'Auto-PEEP (PEEPi)', definition: 'Intrinsischer PEEP durch unvollständige Exspiration (Air Trapping).' },
            { term: 'Trigger / Cycling', definition: 'Kriterium für den Beginn bzw. das Ende der Inspiration.' },
            { term: 'Alveoläre Ventilation (V̇A)', definition: '(VT − VD) · f; bestimmt die CO₂-Elimination.' },
          ],
        },
        {
          type: 'sources',
          ids: ['rathgeber', 'oczenski', 'tobin', 'west', 'chatburn', 'amato', 's3-beatmung'],
        },
      ],
    },
  ],
};
