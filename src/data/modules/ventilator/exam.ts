import type { Exam, Question } from '@/types/content';

/**
 * Prüfungs- und Übungsfragen zum Modul Beatmungsgerät.
 *
 * - `examPool`: Abschlusstest (ids "vent-x-…"), Themen exakt aus EXAM_TOPICS.
 * - `blitzPool`: zusätzliche kurze Fragen für die 60-Sekunden-Blitzrunde (ids "vent-p-…").
 */

export const EXAM_TOPICS = [
  'Grundlagen',
  'Aufbau',
  'Physik',
  'Beatmungsformen',
  'Parameter',
  'Kurven & Monitoring',
  'Alarme & Sicherheit',
  'Klinik',
] as const;

const examPool: Question[] = [
  /* ---------------------------------------------------------------- */
  /* Grundlagen                                                         */
  /* ---------------------------------------------------------------- */
  {
    id: 'vent-x-gl-ueberdruck',
    kind: 'single',
    prompt: 'Worin unterscheidet sich die maschinelle (konventionelle) Beatmung grundsätzlich von der Spontanatmung?',
    options: [
      'Die Lunge wird durch Überdruck am Atemwegseingang gefüllt statt durch Unterdruck im Thorax',
      'Das Gerät saugt das Gas aktiv aus der Lunge ab',
      'Es gibt keinen Unterschied – beide Formen arbeiten mit Unterdruck',
      'Die Exspiration erfolgt maschinell aktiv, die Inspiration passiv',
    ],
    correct: 0,
    explanation:
      'Bei der Spontanatmung erzeugt die Atemmuskulatur einen Unterdruck im Thorax, der Luft einströmen lässt. Das Beatmungsgerät hebt dagegen den Druck am Atemwegseingang an (Überdruckbeatmung). Die Exspiration bleibt in beiden Fällen passiv – das Gerät saugt nicht ab.',
    topic: 'Grundlagen',
    difficulty: 1,
  },
  {
    id: 'vent-x-gl-hyperkapnie',
    kind: 'single',
    prompt: 'Welcher Befund kennzeichnet ein hyperkapnisches (ventilatorisches) Atemversagen?',
    options: [
      'Erniedrigter P~a~O~2~ bei normalem P~a~CO~2~',
      'Erhöhter P~a~CO~2~ mit respiratorischer Azidose',
      'Erniedrigter P~a~CO~2~ mit Alkalose',
      'Isoliert erniedrigtes Hämoglobin',
    ],
    correct: 1,
    explanation:
      'Beim hyperkapnischen Versagen reicht die Ventilation (Atempumpe) nicht aus, um CO~2~ zu eliminieren: P~a~CO~2~ steigt, der pH fällt. Ein isoliert erniedrigter P~a~O~2~ beschreibt dagegen das hypoxämische (Oxygenierungs-)Versagen.',
    topic: 'Grundlagen',
    difficulty: 1,
  },
  {
    id: 'vent-x-gl-vili',
    kind: 'multiple',
    prompt: 'Welche Mechanismen tragen zum beatmungsassoziierten Lungenschaden (VILI) bei? (Mehrere Antworten richtig)',
    options: [
      'Volutrauma durch Überdehnung bei zu großen Tidalvolumina',
      'Barotrauma durch hohe Drücke',
      'Atelektrauma durch wiederholtes Öffnen und Kollabieren von Alveolen',
      'Ein PEEP von 5 cmH~2~O bei lungengesunden Patient:innen',
    ],
    correct: [0, 1, 2],
    explanation:
      'Volutrauma, Barotrauma und Atelektrauma (plus die daraus folgende Entzündungsreaktion, „Biotrauma“) sind die Kernmechanismen des VILI. Ein moderater PEEP von 5 cmH~2~O ist dagegen Standard und wirkt dem Atelektrauma eher entgegen.',
    topic: 'Grundlagen',
    difficulty: 2,
  },
  {
    id: 'vent-x-gl-kreislauf',
    kind: 'truefalse',
    prompt: 'Die Überdruckbeatmung kann den venösen Rückstrom zum Herzen vermindern und so den Blutdruck senken.',
    correct: true,
    explanation:
      'Richtig. Der positive intrathorakale Druck erschwert den venösen Rückstrom zum rechten Herzen. Besonders bei Volumenmangel, hohem PEEP oder Auto-PEEP kann das Herzzeitvolumen sinken – deshalb wird der Kreislauf bei Einstellungsänderungen engmaschig beobachtet.',
    topic: 'Grundlagen',
    difficulty: 1,
  },
  {
    id: 'vent-x-gl-totraum',
    kind: 'single',
    prompt: 'Was versteht man unter dem anatomischen Totraum?',
    options: [
      'Nicht durchblutete, aber belüftete Alveolen',
      'Das Volumen der leitenden Atemwege, das am Gasaustausch nicht teilnimmt',
      'Das Restvolumen nach maximaler Ausatmung',
      'Das Volumen des Beatmungsschlauchs',
    ],
    correct: 1,
    explanation:
      'Der anatomische Totraum umfasst Nase/Mund, Trachea und Bronchien bis zu den Bronchiolen – beim Erwachsenen grob etwa 2 ml/kg (≈ 150 ml). Belüftete, aber nicht durchblutete Alveolen zählen zum alveolären Totraum; das Residualvolumen ist etwas ganz anderes.',
    topic: 'Grundlagen',
    difficulty: 1,
  },
  {
    id: 'vent-x-gl-ziele',
    kind: 'single',
    prompt: 'Welche Aussage beschreibt das Ziel einer maschinellen Beatmung am besten?',
    options: [
      'Normwerte für alle Blutgase um jeden Preis erreichen',
      'Ausreichenden Gasaustausch sichern und Atemarbeit entlasten – bei möglichst geringer Schädigung der Lunge',
      'Die Grunderkrankung der Lunge heilen',
      'Möglichst hohe Tidalvolumina verabreichen, um Atelektasen zu vermeiden',
    ],
    correct: 1,
    explanation:
      'Beatmung verschafft Zeit: Sie sichert Oxygenierung und CO~2~-Elimination und entlastet die Atemmuskulatur. Normwerte „um jeden Preis“ würden oft schädliche Drücke erfordern; lungenprotektive Strategien tolerieren daher z. B. moderate Hyperkapnie. Die Grunderkrankung muss gesondert behandelt werden.',
    topic: 'Grundlagen',
    difficulty: 1,
  },

  /* ---------------------------------------------------------------- */
  /* Aufbau                                                             */
  /* ---------------------------------------------------------------- */
  {
    id: 'vent-x-auf-expventil',
    kind: 'single',
    prompt: 'Welche Komponente hält am Ende der Exspiration den eingestellten PEEP aufrecht?',
    options: ['Inspirationsventil', 'Exspirationsventil', 'Sicherheitsventil', 'Gasmischer (Blender)'],
    correct: 1,
    explanation:
      'Das Exspirationsventil öffnet in der Exspiration nur so weit, dass der Druck nicht unter den eingestellten PEEP fällt. Das Inspirationsventil steuert den Flow in der Inspiration, das Sicherheitsventil begrenzt Überdruck, der Blender stellt die F~I~O~2~ ein.',
    topic: 'Aufbau',
    difficulty: 1,
  },
  {
    id: 'vent-x-auf-notatmung',
    kind: 'single',
    prompt: 'Welche Aufgabe hat das Notatmungsventil eines Intensivbeatmungsgeräts?',
    options: [
      'Es erhöht bei Alarm automatisch die F~I~O~2~ auf 100 %',
      'Es ermöglicht bei Geräteausfall die Spontanatmung von Raumluft',
      'Es hält den PEEP bei Stromausfall',
      'Es filtert Bakterien aus dem Atemgas',
    ],
    correct: 1,
    explanation:
      'Fällt das Gerät aus (z. B. Strom- oder Gasversorgung), öffnet das Notatmungsventil, damit ein spontan atmender Patient Raumluft einatmen kann und nicht gegen ein geschlossenes System atmet. Es ersetzt aber keine Beatmung – ein apnoischer Patient muss sofort manuell beatmet werden.',
    topic: 'Aufbau',
    difficulty: 2,
  },
  {
    id: 'vent-x-auf-expflow',
    kind: 'single',
    prompt: 'Wozu dient vor allem der exspiratorische Flowsensor?',
    options: [
      'Zur Messung des exspirierten Volumens und zur Erkennung von Leckagen',
      'Zur Steuerung der F~I~O~2~',
      'Zur Messung der Körpertemperatur',
      'Zur Erzeugung des PEEP',
    ],
    correct: 0,
    explanation:
      'Der exspiratorische Flowsensor misst das tatsächlich ausgeatmete Volumen (V~Te~). Ist V~Te~ deutlich kleiner als das inspiratorische Volumen, deutet das auf eine Leckage hin (z. B. Cuff, Schlauchsystem). Den PEEP erzeugt das Exspirationsventil.',
    topic: 'Aufbau',
    difficulty: 1,
  },
  {
    id: 'vent-x-auf-o2sensor',
    kind: 'truefalse',
    prompt: 'Galvanische O~2~-Sensoren verbrauchen sich mit der Zeit und müssen regelmäßig ersetzt werden.',
    correct: true,
    explanation:
      'Richtig. In einer galvanischen Zelle reagiert Sauerstoff chemisch; die Zelle verbraucht sich dabei und hat eine begrenzte Lebensdauer. Paramagnetische Sensoren arbeiten dagegen physikalisch und verschleißen nicht auf diese Weise.',
    topic: 'Aufbau',
    difficulty: 2,
  },
  {
    id: 'vent-x-auf-hme',
    kind: 'single',
    prompt: 'Warum darf ein HME-Filter (künstliche Nase) nicht gleichzeitig mit einem aktiven Befeuchter verwendet werden?',
    options: [
      'Weil sich die Geräte elektrisch stören',
      'Weil der HME durch die zusätzliche Feuchtigkeit durchnässen kann – Widerstand steigt bis hin zur Verlegung',
      'Weil das Atemgas dann zu trocken wird',
      'Weil der HME dann die F~I~O~2~ verfälscht',
    ],
    correct: 1,
    explanation:
      'Ein HME speichert Wärme und Feuchtigkeit der Ausatemluft. Kommt zusätzlich aktiv befeuchtetes Gas hinzu, kann er sich mit Wasser vollsaugen; der Strömungswiderstand steigt deutlich und eine Verlegung ist möglich. Das Gas wird dadurch nicht trockener – im Gegenteil.',
    topic: 'Aufbau',
    difficulty: 2,
  },
  {
    id: 'vent-x-auf-regelkreis',
    kind: 'single',
    prompt: 'Wie stellt die Steuereinheit bei VC sicher, dass der eingestellte Flow tatsächlich abgegeben wird?',
    options: [
      'Durch einen geschlossenen Regelkreis: Der Flowsensor misst den Ist-Wert, das Proportionalventil wird laufend nachgeregelt',
      'Durch ein fest eingestelltes mechanisches Ventil ohne Messung',
      'Durch den Gasversorgungsdruck von 5 bar allein',
      'Durch den O~2~-Sensor',
    ],
    correct: 0,
    explanation:
      'Moderne Respiratoren arbeiten mit geschlossenen Regelkreisen: Der inspiratorische Flowsensor liefert den Ist-Wert, der Mikroprozessor vergleicht mit dem Soll-Wert und steuert das Inspirationsventil nach. Der Versorgungsdruck wird zuvor durch Druckminderer reduziert und ist nicht die Regelgröße.',
    topic: 'Aufbau',
    difficulty: 2,
  },
  {
    id: 'vent-x-auf-reihenfolge',
    kind: 'multiple',
    prompt: 'Welche Komponenten liegen im Gasweg auf der Inspirationsseite, also VOR dem Patienten? (Mehrere Antworten richtig)',
    options: ['Gasmischer (Blender)', 'Inspirationsventil', 'Exspirationsventil', 'Befeuchter'],
    correct: [0, 1, 3],
    explanation:
      'Das Atemgas durchläuft Gasanschlüsse, Blender, Inspirationsventil, Sensoren, Filter, Befeuchter und Inspirationsschenkel bis zum Y-Stück. Das Exspirationsventil sitzt auf der Ausatemseite hinter dem Exspirationsschenkel und regelt dort den PEEP.',
    topic: 'Aufbau',
    difficulty: 2,
  },

  /* ---------------------------------------------------------------- */
  /* Physik                                                             */
  /* ---------------------------------------------------------------- */
  {
    id: 'vent-x-phy-bewegung',
    kind: 'single',
    prompt: 'Wie lautet die Bewegungsgleichung der Atmung im Ein-Kompartiment-Modell?',
    options: [
      'P~aw~ = PEEP + V/C + R · V̇',
      'P~aw~ = PEEP + C · V + V̇/R',
      'P~aw~ = V · f',
      'P~aw~ = R · C',
    ],
    correct: 0,
    explanation:
      'Der Atemwegsdruck setzt sich aus PEEP, elastischem Anteil (V/C) und resistivem Anteil (R · V̇) zusammen. Eine höhere Compliance senkt den elastischen Druck – deshalb steht C im Nenner. R · C ist die Zeitkonstante, V · f das Minutenvolumen.',
    topic: 'Physik',
    difficulty: 1,
  },
  {
    id: 'vent-x-phy-compliance',
    kind: 'numeric',
    prompt:
      'V~T~ 500 ml, P~plat~ 25 cmH~2~O, PEEP 5 cmH~2~O. Berechne die statische Compliance des respiratorischen Systems.',
    answer: 25,
    tolerance: 1,
    unit: 'ml/cmH₂O',
    explanation:
      'C = V~T~ / (P~plat~ − PEEP) = 500 ml / 20 cmH~2~O = 25 ml/cmH~2~O. Das ist deutlich erniedrigt (normal beim beatmeten Erwachsenen etwa 50–100 ml/cmH~2~O), wie bei ARDS. Ein häufiger Fehler ist, P~peak~ statt P~plat~ oder den PEEP nicht abzuziehen.',
    topic: 'Physik',
    difficulty: 2,
  },
  {
    id: 'vent-x-phy-resistance',
    kind: 'numeric',
    prompt:
      'Bei VC mit konstantem Flow von 60 L/min misst du P~peak~ 30 cmH~2~O und P~plat~ 22 cmH~2~O. Berechne die Resistance.',
    answer: 8,
    tolerance: 0.5,
    unit: 'cmH₂O/(L/s)',
    explanation:
      'R = (P~peak~ − P~plat~) / V̇. 60 L/min = 1 L/s, also R = 8 cmH~2~O / 1 L/s = 8 cmH~2~O/(L/s). Wer mit 60 L/min statt 1 L/s rechnet, erhält einen 60-fach zu kleinen Wert – Einheiten beachten!',
    topic: 'Physik',
    difficulty: 2,
  },
  {
    id: 'vent-x-phy-tau',
    kind: 'numeric',
    prompt: 'R = 10 cmH~2~O/(L/s), C = 50 ml/cmH~2~O. Berechne die Zeitkonstante τ.',
    answer: 0.5,
    tolerance: 0.05,
    unit: 's',
    explanation:
      'τ = R · C = 10 cmH~2~O/(L/s) · 0,05 L/cmH~2~O = 0,5 s. Nach 3 τ (1,5 s) ist die Lunge zu etwa 95 % entleert. Vergisst man die Umrechnung von ml in L, erhält man fälschlich 500 s.',
    topic: 'Physik',
    difficulty: 2,
  },
  {
    id: 'vent-x-phy-3tau',
    kind: 'single',
    prompt: 'Zu wie viel Prozent ist eine Lungeneinheit nach drei Zeitkonstanten (3 τ) passiv entleert?',
    options: ['ca. 63 %', 'ca. 86 %', 'ca. 95 %', '100 %'],
    correct: 2,
    explanation:
      'Die passive Exspiration folgt einer Exponentialfunktion: nach 1 τ ≈ 63 %, nach 2 τ ≈ 86 %, nach 3 τ ≈ 95 %, nach 5 τ ≈ 99 %. 100 % werden mathematisch nie ganz erreicht – deshalb plant man mindestens 3 τ Exspirationszeit ein.',
    topic: 'Physik',
    difficulty: 1,
  },
  {
    id: 'vent-x-phy-radius',
    kind: 'single',
    prompt:
      'Um welchen Faktor steigt der Strömungswiderstand eines Tubus bei laminarer Strömung ungefähr, wenn sich sein Innenradius halbiert?',
    options: ['Faktor 2', 'Faktor 4', 'Faktor 8', 'Faktor 16'],
    correct: 3,
    explanation:
      'Nach Hagen-Poiseuille ist der Widerstand umgekehrt proportional zur vierten Potenz des Radius: (1/0,5)^4^ = 16. Deshalb haben schon kleine Einengungen durch Sekret oder Abknicken große Auswirkungen. Bei turbulenter Strömung ist der Zusammenhang noch ungünstiger.',
    topic: 'Physik',
    difficulty: 2,
  },
  {
    id: 'vent-x-phy-plateau',
    kind: 'truefalse',
    prompt: 'Während einer inspiratorischen Pause ohne Flow entspricht der gemessene Druck (P~plat~) näherungsweise dem endinspiratorischen Alveolardruck.',
    correct: true,
    explanation:
      'Richtig. Ohne Flow entfällt der resistive Druckanteil (R · V̇ = 0); der Druck gleicht sich zwischen Atemweg und Alveolen aus. P~plat~ spiegelt daher den elastischen Druck plus PEEP wider – eine Näherung, da echte Lungen inhomogen sind.',
    topic: 'Physik',
    difficulty: 1,
  },

  /* ---------------------------------------------------------------- */
  /* Beatmungsformen                                                    */
  /* ---------------------------------------------------------------- */
  {
    id: 'vent-x-bf-vc-pc',
    kind: 'single',
    prompt: 'Was ist bei druckkontrollierter Beatmung (PC) die abhängige Größe?',
    options: ['Der Inspirationsdruck', 'Das Tidalvolumen', 'Die Inspirationszeit', 'Der PEEP'],
    correct: 1,
    explanation:
      'Bei PC werden Inspirationsdruck und -zeit vorgegeben; das resultierende Tidalvolumen hängt von Compliance, Resistance und Patientenanstrengung ab. Bei VC ist es umgekehrt: Das Volumen ist vorgegeben, der Druck ergibt sich.',
    topic: 'Beatmungsformen',
    difficulty: 1,
  },
  {
    id: 'vent-x-bf-flowform',
    kind: 'single',
    prompt: 'Welches Flowmuster ist typisch für die druckkontrollierte Beatmung?',
    options: [
      'Konstanter (rechteckiger) Flow',
      'Dezelerierender Flow – hoch zu Beginn, dann abnehmend',
      'Sinusförmiger Flow mit Nulldurchgang in der Mitte der Inspiration',
      'Akzelerierender Flow, der bis zum Ende zunimmt',
    ],
    correct: 1,
    explanation:
      'Bei PC ist der Druckgradient zu Beginn am größten, daher ist der Flow anfangs hoch. Mit zunehmender Füllung steigt der Alveolardruck, der Gradient und damit der Flow nehmen ab. Ein konstanter Rechteckflow ist typisch für VC.',
    topic: 'Beatmungsformen',
    difficulty: 1,
  },
  {
    id: 'vent-x-bf-cpap',
    kind: 'single',
    prompt: 'Was kennzeichnet CPAP?',
    options: [
      'Kontrollierte Beatmung mit fester Frequenz',
      'Spontanatmung auf einem kontinuierlich erhöhten Druckniveau ohne maschinelle Atemhübe',
      'Wechsel zwischen zwei Druckniveaus mit fester Frequenz',
      'Volumenkontrollierte Beatmung mit PEEP',
    ],
    correct: 1,
    explanation:
      'CPAP (Continuous Positive Airway Pressure) setzt eine erhaltene Spontanatmung voraus. Das Gerät hält nur einen kontinuierlich positiven Druck aufrecht; es gibt keine mandatorischen Atemhübe. Deshalb sind Apnoealarm und -ventilation hier besonders wichtig.',
    topic: 'Beatmungsformen',
    difficulty: 1,
  },
  {
    id: 'vent-x-bf-psv',
    kind: 'single',
    prompt: 'Wodurch wird bei Druckunterstützung (ASB/PSV) die Inspiration typischerweise beendet?',
    options: [
      'Nach einer fest eingestellten Inspirationszeit',
      'Wenn ein eingestelltes Volumen erreicht ist',
      'Wenn der inspiratorische Flow auf einen eingestellten Anteil des Spitzenflows abgefallen ist',
      'Durch den O~2~-Sensor',
    ],
    correct: 2,
    explanation:
      'ASB/PSV ist flowgesteuert: Der Patient triggert, das Gerät unterstützt mit einem Druck, und die Inspiration endet, wenn der Flow auf einen einstellbaren Prozentsatz des Spitzenflows (häufig um 25 %) gefallen ist. So bestimmt der Patient die Inspirationsdauer mit.',
    topic: 'Beatmungsformen',
    difficulty: 2,
  },
  {
    id: 'vent-x-bf-trigger',
    kind: 'multiple',
    prompt: 'Welche Situationen können zu einer Autotriggerung (Fehltriggerung ohne Patientenanstrengung) führen? (Mehrere Antworten richtig)',
    options: [
      'Leckage im Schlauchsystem bei sehr empfindlichem Flowtrigger',
      'Kondenswasser, das im Schlauch hin- und herschwappt',
      'Kardiale Oszillationen bei sehr empfindlicher Triggerschwelle',
      'Eine korrekt eingestellte, wenig empfindliche Triggerschwelle',
    ],
    correct: [0, 1, 2],
    explanation:
      'Leckagen, Wasser im Schlauch und Herzaktionen können Flow- oder Druckschwankungen erzeugen, die das Gerät als Einatembemühung interpretiert – besonders bei zu empfindlicher Triggerschwelle. Eine angemessen eingestellte Triggerschwelle verringert das Risiko.',
    topic: 'Beatmungsformen',
    difficulty: 3,
  },
  {
    id: 'vent-x-bf-simv',
    kind: 'truefalse',
    prompt: 'Bei SIMV kann der Patient zwischen den mandatorischen Atemhüben spontan atmen.',
    correct: true,
    explanation:
      'Richtig. SIMV (synchronisierte intermittierende mandatorische Ventilation) gibt eine festgelegte Anzahl maschineller Atemhübe ab, die mit der Patientenatmung synchronisiert werden. Dazwischen sind Spontanatemzüge möglich, oft mit Druckunterstützung.',
    topic: 'Beatmungsformen',
    difficulty: 1,
  },
  {
    id: 'vent-x-bf-pc-resistance',
    kind: 'single',
    prompt:
      'Bei PC verlegt Sekret teilweise den Tubus (Resistance steigt). Was passiert bei unveränderter Einstellung am ehesten?',
    options: [
      'Der Spitzendruck steigt stark an',
      'Der Flow wird langsamer, das Tidalvolumen kann sinken – besonders bei kurzer Inspirationszeit',
      'Das Tidalvolumen steigt',
      'Nichts – PC kompensiert Widerstände vollständig',
    ],
    correct: 1,
    explanation:
      'Bei PC ist der Druck begrenzt, er steigt also nicht stark an. Durch den höheren Widerstand fließt das Gas langsamer; reicht die Inspirationszeit nicht für einen Druckausgleich, sinkt das Volumen. Ein deutlicher Druckanstieg wäre das typische Zeichen bei VC.',
    topic: 'Beatmungsformen',
    difficulty: 3,
  },

  /* ---------------------------------------------------------------- */
  /* Parameter                                                          */
  /* ---------------------------------------------------------------- */
  {
    id: 'vent-x-par-pbw-mann',
    kind: 'numeric',
    prompt: 'Berechne das Sollgewicht (PBW) eines Mannes mit 175 cm Körpergröße (eine Nachkommastelle).',
    answer: 70.6,
    tolerance: 1,
    unit: 'kg',
    explanation:
      'PBW (Mann) = 50 + 0,91 · (175 − 152,4) = 50 + 0,91 · 22,6 ≈ 70,6 kg. Das PBW bildet die Lungengröße ab und hängt nur von Größe und Geschlecht ab – nicht vom aktuellen Körpergewicht.',
    topic: 'Parameter',
    difficulty: 2,
  },
  {
    id: 'vent-x-par-pbw-frau',
    kind: 'numeric',
    prompt:
      'Eine Patientin ist 165 cm groß. Berechne das Tidalvolumen bei 6 ml/kg PBW (auf ganze ml gerundet).',
    answer: 342,
    tolerance: 10,
    unit: 'ml',
    explanation:
      'PBW (Frau) = 45,5 + 0,91 · (165 − 152,4) = 45,5 + 11,5 ≈ 57,0 kg. V~T~ = 6 ml/kg · 57,0 kg ≈ 342 ml. Wer versehentlich die Männerformel (Basis 50 kg) nutzt, kommt auf etwa 369 ml – ein typischer Fehler.',
    topic: 'Parameter',
    difficulty: 2,
  },
  {
    id: 'vent-x-par-mv',
    kind: 'numeric',
    prompt: 'V~T~ 500 ml, f 14/min. Berechne das Minutenvolumen.',
    answer: 7,
    tolerance: 0.1,
    unit: 'L/min',
    explanation:
      'MV = V~T~ · f = 0,5 L · 14/min = 7,0 L/min. Achtung: Das Minutenvolumen sagt nichts über den Totraumanteil aus – für die CO~2~-Elimination zählt die alveoläre Ventilation.',
    topic: 'Parameter',
    difficulty: 1,
  },
  {
    id: 'vent-x-par-drivingp',
    kind: 'numeric',
    prompt: 'P~plat~ 28 cmH~2~O, PEEP 12 cmH~2~O. Wie hoch ist der Driving Pressure?',
    answer: 16,
    tolerance: 0,
    unit: 'cmH₂O',
    explanation:
      'ΔP = P~plat~ − PEEP = 28 − 12 = 16 cmH~2~O. Das liegt knapp über dem häufig genannten Zielwert von ≤ 15 cmH~2~O (Amato et al. 2015) – obwohl der Plateaudruck unter 30 cmH~2~O liegt. Beide Grenzen sollten beachtet werden.',
    topic: 'Parameter',
    difficulty: 1,
  },
  {
    id: 'vent-x-par-te',
    kind: 'numeric',
    prompt: 'f 15/min, I:E 1:2. Wie lang ist die Exspirationszeit (zwei Nachkommastellen)?',
    answer: 2.67,
    tolerance: 0.05,
    unit: 's',
    explanation:
      'Zyklusdauer = 60 s / 15 = 4 s. Bei I:E 1:2 entfallen 1/3 auf die Inspiration (1,33 s) und 2/3 auf die Exspiration (2,67 s). Häufiger Fehler: die Zyklusdauer einfach halbieren (2 s).',
    topic: 'Parameter',
    difficulty: 2,
  },
  {
    id: 'vent-x-par-peep',
    kind: 'multiple',
    prompt: 'Welche Wirkungen hat ein PEEP? (Mehrere Antworten richtig)',
    options: [
      'Er hält Alveolen am Ende der Exspiration offen',
      'Er erhöht die funktionelle Residualkapazität',
      'Er kann den venösen Rückstrom und den Blutdruck senken',
      'Er ist der wichtigste Parameter zur Senkung des P~a~CO~2~',
    ],
    correct: [0, 1, 2],
    explanation:
      'PEEP verhindert den endexspiratorischen Alveolarkollaps, erhöht die FRC und verbessert so meist die Oxygenierung. Als Nebenwirkung kann er durch erhöhten intrathorakalen Druck den Kreislauf belasten. Das P~a~CO~2~ wird dagegen hauptsächlich über die alveoläre Ventilation (V~T~ und f) gesteuert.',
    topic: 'Parameter',
    difficulty: 2,
  },
  {
    id: 'vent-x-par-fio2',
    kind: 'single',
    prompt: 'Welche F~I~O~2~ entspricht Raumluft?',
    options: ['0,16', '0,21', '0,35', '0,50'],
    correct: 1,
    explanation:
      'Raumluft enthält etwa 21 % Sauerstoff, also F~I~O~2~ 0,21. Ein Beatmungsgerät kann zwischen 0,21 und 1,0 einstellen. 0,16 entspricht etwa dem O~2~-Anteil der Ausatemluft.',
    topic: 'Parameter',
    difficulty: 1,
  },
  {
    id: 'vent-x-par-ie',
    kind: 'single',
    prompt: 'Was ist ein typisches I:E-Verhältnis bei kontrollierter Beatmung lungengesunder Erwachsener?',
    options: ['2:1', '1:1', '1:2', '1:6'],
    correct: 2,
    explanation:
      'Ein I:E von etwa 1:2 entspricht der physiologischen Atmung und lässt genug Zeit für die passive Exspiration. Inverse Verhältnisse (2:1) sind Sonderfälle mit hohem Air-Trapping-Risiko; sehr lange Exspirationszeiten nutzt man gezielt bei Obstruktion.',
    topic: 'Parameter',
    difficulty: 1,
  },

  /* ---------------------------------------------------------------- */
  /* Kurven & Monitoring                                                */
  /* ---------------------------------------------------------------- */
  {
    id: 'vent-x-kur-airtrapping',
    kind: 'single',
    prompt: 'Woran erkennst du Air Trapping in der Flow-Zeit-Kurve?',
    options: [
      'Der exspiratorische Flow erreicht vor dem nächsten Atemzug nicht die Nulllinie',
      'Die Volumenkurve kehrt nicht zur Nulllinie zurück',
      'Der inspiratorische Flow ist rechteckig',
      'Die Druckkurve zeigt ein Plateau',
    ],
    correct: 0,
    explanation:
      'Fließt beim Beginn des nächsten Atemzugs noch exspiratorisch Gas, ist die Lunge nicht vollständig entleert – es entsteht Auto-PEEP. Eine Volumenkurve, die nicht zur Nulllinie zurückkehrt, spricht dagegen für eine Leckage; ein Rechteckflow ist normal bei VC.',
    topic: 'Kurven & Monitoring',
    difficulty: 1,
  },
  {
    id: 'vent-x-kur-leck',
    kind: 'single',
    prompt: 'V~Ti~ 500 ml, V~Te~ 380 ml, die Volumenkurve fällt nicht auf null zurück. Was ist die wahrscheinlichste Ursache?',
    options: [
      'Leckage, z. B. am Cuff oder im Schlauchsystem',
      'Erhöhte Resistance durch Sekret',
      'Zu hoher PEEP',
      'Zu niedrige F~I~O~2~',
    ],
    correct: 0,
    explanation:
      'Kommt weniger Volumen zurück, als hineingegangen ist, entweicht Gas außerhalb des Messwegs – typisch bei Cuffleck, Diskonnektion oder Undichtigkeit. Sekret erhöht den Druck, verändert aber nicht die Volumenbilanz.',
    topic: 'Kurven & Monitoring',
    difficulty: 1,
  },
  {
    id: 'vent-x-kur-compliance',
    kind: 'single',
    prompt: 'Bei VC steigen P~peak~ und P~plat~ gleichermaßen um 10 cmH~2~O an. Woran solltest du zuerst denken?',
    options: [
      'Abgeknickter Tubus',
      'Verminderte Compliance, z. B. Pneumothorax, einseitige Intubation oder Atelektase',
      'Leckage am Cuff',
      'Zu hohe Atemfrequenz-Alarmgrenze',
    ],
    correct: 1,
    explanation:
      'Steigt das Plateau mit, ist der elastische Druckanteil gestiegen – die Compliance ist gesunken. Ein abgeknickter Tubus erhöht nur den resistiven Anteil und damit vor allem P~peak~. Bei plötzlichem Anstieg ist ein Pneumothorax auszuschließen.',
    topic: 'Kurven & Monitoring',
    difficulty: 2,
  },
  {
    id: 'vent-x-kur-kapno',
    kind: 'single',
    prompt: 'Die Kapnografiekurve verschwindet plötzlich vollständig. Was kommt NICHT als Ursache in Frage?',
    options: [
      'Diskonnektion oder Extubation',
      'Komplette Tubusverlegung',
      'Kreislaufstillstand',
      'Leichte Erhöhung des PEEP um 2 cmH~2~O',
    ],
    correct: 3,
    explanation:
      'Ein plötzlicher Verlust des CO~2~-Signals bedeutet: Es kommt kein CO~2~ mehr am Sensor an – durch Diskonnektion, Fehllage/Extubation, komplette Verlegung oder fehlenden Lungenkreislauf (Kreislaufstillstand). Eine geringe PEEP-Änderung lässt die Kurve nicht verschwinden.',
    topic: 'Kurven & Monitoring',
    difficulty: 2,
  },
  {
    id: 'vent-x-kur-autopeep-mess',
    kind: 'single',
    prompt: 'Wie misst man den intrinsischen PEEP (Auto-PEEP) am Beatmungsgerät?',
    options: [
      'Mit einer endexspiratorischen Pause (Expiratory Hold)',
      'Mit einer inspiratorischen Pause (Inspiratory Hold)',
      'Am O~2~-Sensor',
      'Über die Kapnografie',
    ],
    correct: 0,
    explanation:
      'Während einer endexspiratorischen Pause sind beide Ventile geschlossen; der Druck gleicht sich mit dem Alveolardruck aus. Der Anstieg über den eingestellten PEEP ist der Auto-PEEP. Mit der inspiratorischen Pause misst man dagegen den Plateaudruck.',
    topic: 'Kurven & Monitoring',
    difficulty: 2,
  },
  {
    id: 'vent-x-kur-sekret',
    kind: 'truefalse',
    prompt: 'Sägezahnartige Oszillationen in der Flowkurve können ein Hinweis auf Sekret in den Atemwegen oder Wasser im Schlauchsystem sein.',
    correct: true,
    explanation:
      'Richtig. Sekret oder Kondenswasser erzeugen Turbulenzen und Schwingungen, die sich als „Sägezahnmuster“ in Flow- und Druckkurve zeigen. Das ist ein Anlass, abzusaugen bzw. das Schlauchsystem zu entwässern.',
    topic: 'Kurven & Monitoring',
    difficulty: 1,
  },

  /* ---------------------------------------------------------------- */
  /* Alarme & Sicherheit                                                */
  /* ---------------------------------------------------------------- */
  {
    id: 'vent-x-al-unklar',
    kind: 'single',
    prompt:
      'Ein beatmeter Patient entsättigt plötzlich, das Gerät alarmiert, die Ursache ist unklar. Was ist der sicherste erste Schritt?',
    options: [
      'Alarm stummschalten und Gerät beobachten',
      'Hilfe rufen, vom Gerät trennen und manuell mit 100 % O~2~ beatmen',
      'Alarmgrenzen erweitern',
      'Gerät aus- und wieder einschalten',
    ],
    correct: 1,
    explanation:
      'Die manuelle Beatmung mit 100 % O~2~ schließt das Gerät als Fehlerquelle sofort aus und sichert die Oxygenierung. Danach folgt die systematische Ursachensuche (DOPES). Neustart, Stummschalten oder Grenzen verschieben lösen das Problem nicht und verlieren wertvolle Zeit.',
    topic: 'Alarme & Sicherheit',
    difficulty: 1,
  },
  {
    id: 'vent-x-al-dopes',
    kind: 'single',
    prompt: 'Wofür steht das „P“ im DOPES-Schema?',
    options: ['PEEP', 'Pneumothorax', 'Plateaudruck', 'Patientenbewegung'],
    correct: 1,
    explanation:
      'DOPES: Dislokation (Displacement), Obstruktion (Obstruction), **Pneumothorax**, Equipment, Stacking (Stacked Breaths, Auto-PEEP). Ein (Spannungs-)Pneumothorax ist eine lebensbedrohliche Ursache plötzlich steigender Drücke und Entsättigung beim beatmeten Patienten.',
    topic: 'Alarme & Sicherheit',
    difficulty: 1,
  },
  {
    id: 'vent-x-al-hochdruck-vc',
    kind: 'single',
    prompt: 'Was geschieht bei VC typischerweise, wenn der Atemwegsdruck die obere Druckalarmgrenze erreicht?',
    options: [
      'Das Gerät gibt das Volumen trotzdem vollständig ab',
      'Die Inspiration wird abgebrochen und das Gerät schaltet auf Exspiration um',
      'Das Gerät erhöht automatisch den PEEP',
      'Das Gerät schaltet sich ab',
    ],
    correct: 1,
    explanation:
      'Die obere Druckgrenze schützt vor Barotrauma: Erreicht der Druck die Grenze, bricht das Gerät die Inspiration ab. Folge: Der Patient bekommt weniger Volumen als eingestellt – daher ist jeder Hochdruckalarm ernst zu nehmen. Details sind geräteabhängig (Gebrauchsanweisung).',
    topic: 'Alarme & Sicherheit',
    difficulty: 2,
  },
  {
    id: 'vent-x-al-prioritaet',
    kind: 'single',
    prompt: 'Wie wird nach IEC 60601-1-8 ein Alarm hoher Priorität optisch signalisiert?',
    options: ['Gelb, dauerhaft leuchtend', 'Rot, blinkend', 'Grün, blinkend', 'Blau, dauerhaft leuchtend'],
    correct: 1,
    explanation:
      'Die Norm sieht für hohe Priorität ein rot blinkendes Signal vor, für mittlere Priorität gelb blinkend und für niedrige Priorität gelb oder cyan dauerhaft. Grün ist keine Alarmfarbe. Die einheitliche Kodierung hilft, Dringlichkeit geräteübergreifend schnell zu erkennen.',
    topic: 'Alarme & Sicherheit',
    difficulty: 2,
  },
  {
    id: 'vent-x-al-einweisung',
    kind: 'truefalse',
    prompt: 'Nach der MPBetreibV darf ein Beatmungsgerät nur von Personen angewendet werden, die in das Gerät eingewiesen wurden.',
    correct: true,
    explanation:
      'Richtig. Die Medizinprodukte-Betreiberverordnung verlangt, dass Anwender:innen über die erforderliche Ausbildung verfügen und in die Handhabung des Geräts eingewiesen sind; für Beatmungsgeräte ist die Einweisung zu dokumentieren. Allgemeines Wissen ersetzt die gerätespezifische Einweisung nicht.',
    topic: 'Alarme & Sicherheit',
    difficulty: 1,
  },
  {
    id: 'vent-x-al-grenzen',
    kind: 'multiple',
    prompt: 'Welche Aussagen zu Alarmgrenzen sind richtig? (Mehrere Antworten richtig)',
    options: [
      'Sie werden patientenbezogen und nach jeder relevanten Einstellungsänderung überprüft',
      'Zu eng gesetzte Grenzen fördern Fehlalarme und Alarmmüdigkeit',
      'Zu weit gesetzte Grenzen können gefährliche Situationen unentdeckt lassen',
      'Werkseinstellungen passen grundsätzlich für alle Patient:innen',
    ],
    correct: [0, 1, 2],
    explanation:
      'Alarmgrenzen müssen zum Patienten und zur aktuellen Einstellung passen. Zu eng → ständige Fehlalarme, die zur „Alarm Fatigue“ führen; zu weit → echte Probleme bleiben unbemerkt. Werkseinstellungen sind nur ein Ausgangspunkt.',
    topic: 'Alarme & Sicherheit',
    difficulty: 2,
  },
  {
    id: 'vent-x-al-beutel',
    kind: 'truefalse',
    prompt: 'An jedem Beatmungsplatz muss ein funktionsfähiger Beatmungsbeutel mit Maske griffbereit sein.',
    correct: true,
    explanation:
      'Richtig. Bei Gerätefehlern, Strom- oder Gasausfall oder unklarer Verschlechterung muss sofort manuell beatmet werden können. Der Beutel (idealerweise mit Reservoir und O~2~-Anschluss) gehört deshalb zur Standardausstattung und wird bei der Platzkontrolle geprüft.',
    topic: 'Alarme & Sicherheit',
    difficulty: 1,
  },

  /* ---------------------------------------------------------------- */
  /* Klinik                                                             */
  /* ---------------------------------------------------------------- */
  {
    id: 'vent-x-kl-ards-vt',
    kind: 'single',
    prompt: 'Welches Tidalvolumen empfiehlt die lungenprotektive Beatmung bei ARDS als Ausgangspunkt?',
    options: [
      'ca. 6 ml/kg Sollgewicht (PBW)',
      'ca. 6 ml/kg tatsächliches Körpergewicht',
      'ca. 10–12 ml/kg PBW',
      'Immer genau 500 ml',
    ],
    correct: 0,
    explanation:
      'Die ARDSNet-Studie (2000) zeigte unter 6 ml/kg PBW gegenüber 12 ml/kg PBW eine geringere Sterblichkeit. Bezugsgröße ist das PBW, weil die Lungengröße von Körpergröße und Geschlecht abhängt – das tatsächliche Gewicht würde bei Übergewicht zu großen Volumina führen.',
    topic: 'Klinik',
    difficulty: 1,
  },
  {
    id: 'vent-x-kl-pplat',
    kind: 'single',
    prompt: 'Welcher Plateaudruck gilt bei lungenprotektiver Beatmung als Obergrenze?',
    options: ['≤ 20 cmH~2~O', '≤ 30 cmH~2~O', '≤ 40 cmH~2~O', '≤ 50 cmH~2~O'],
    correct: 1,
    explanation:
      'Ein P~plat~ ≤ 30 cmH~2~O ist das etablierte Ziel (ARDSNet, S3-Leitlinie). Zusätzlich sollte der Driving Pressure möglichst ≤ 15 cmH~2~O liegen. Ein Wert von 20 cmH~2~O ist wünschenswert, aber bei schwerem ARDS oft nicht erreichbar – er ist keine Obergrenze.',
    topic: 'Klinik',
    difficulty: 1,
  },
  {
    id: 'vent-x-kl-copd',
    kind: 'single',
    prompt: 'Ein Patient mit COPD entwickelt unter Beatmung Auto-PEEP und Hypotonie. Welche Änderung ist am sinnvollsten?',
    options: [
      'Atemfrequenz erhöhen',
      'Atemfrequenz senken und die Exspirationszeit verlängern',
      'Inspiratorische Pause verlängern',
      'Tidalvolumen erhöhen',
    ],
    correct: 1,
    explanation:
      'Bei Obstruktion ist die Zeitkonstante verlängert; die Lunge braucht mehr Zeit zur Entleerung. Eine niedrigere Frequenz und ein längeres T~E~ (z. B. I:E 1:3) reduzieren Air Trapping. Eine höhere Frequenz würde T~E~ verkürzen und das Problem verschärfen – trotz der intuitiven Idee, so mehr CO~2~ abzuatmen.',
    topic: 'Klinik',
    difficulty: 2,
  },
  {
    id: 'vent-x-kl-co2',
    kind: 'single',
    prompt: 'Der P~a~CO~2~ eines beatmeten Patienten ist zu hoch. Welche Einstellgrößen beeinflussen ihn am direktesten?',
    options: [
      'F~I~O~2~ und PEEP',
      'Tidalvolumen und Atemfrequenz',
      'Triggerempfindlichkeit und Alarmgrenzen',
      'Befeuchtertemperatur',
    ],
    correct: 1,
    explanation:
      'Der P~a~CO~2~ ist umgekehrt proportional zur alveolären Ventilation V̇~A~ = (V~T~ − V~D~) · f. F~I~O~2~ und PEEP sind die Hauptstellgrößen der Oxygenierung, nicht der CO~2~-Elimination.',
    topic: 'Klinik',
    difficulty: 1,
  },
  {
    id: 'vent-x-kl-va',
    kind: 'numeric',
    prompt: 'V~T~ 450 ml, Totraum V~D~ 150 ml, f 16/min. Berechne die alveoläre Ventilation.',
    answer: 4.8,
    tolerance: 0.1,
    unit: 'L/min',
    explanation:
      'V̇~A~ = (V~T~ − V~D~) · f = (0,45 − 0,15) L · 16/min = 4,8 L/min. Das Minutenvolumen beträgt 7,2 L/min, aber nur 4,8 L/min erreichen die Alveolen. Deshalb verbessert bei gleichem MV ein größeres V~T~ mit niedrigerer Frequenz die alveoläre Ventilation – und umgekehrt.',
    topic: 'Klinik',
    difficulty: 2,
  },
  {
    id: 'vent-x-kl-paco2-calc',
    kind: 'numeric',
    prompt:
      'Bei einer alveolären Ventilation von 4 L/min beträgt der P~a~CO~2~ 52 mmHg. Welche alveoläre Ventilation ist bei gleicher CO~2~-Produktion für 40 mmHg nötig?',
    answer: 5.2,
    tolerance: 0.1,
    unit: 'L/min',
    explanation:
      'P~a~CO~2~ ist umgekehrt proportional zu V̇~A~: V̇~A,neu~ = 4 L/min · 52/40 = 5,2 L/min. Das ist eine Vereinfachung, die eine konstante CO~2~-Produktion voraussetzt; in der Praxis wird die Wirkung mit einer BGA überprüft.',
    topic: 'Klinik',
    difficulty: 3,
  },
  {
    id: 'vent-x-kl-hyperkapnie',
    kind: 'truefalse',
    prompt: 'Bei lungenprotektiver Beatmung kann ein moderat erhöhter P~a~CO~2~ toleriert werden (permissive Hyperkapnie).',
    correct: true,
    explanation:
      'Richtig. Kleinere Tidalvolumina senken oft die alveoläre Ventilation. Ein moderater CO~2~-Anstieg wird zugunsten der Lungenprotektion akzeptiert, solange der pH vertretbar bleibt und keine Kontraindikationen (z. B. erhöhter Hirndruck) bestehen.',
    topic: 'Klinik',
    difficulty: 2,
  },
  {
    id: 'vent-x-kl-oxygenierung',
    kind: 'multiple',
    prompt: 'Mit welchen Einstellgrößen lässt sich die Oxygenierung in erster Linie verbessern? (Mehrere Antworten richtig)',
    options: ['F~I~O~2~ erhöhen', 'PEEP anpassen (Recruitment offener Alveolen)', 'Atemfrequenz erhöhen', 'Alarmgrenze für SpO~2~ senken'],
    correct: [0, 1],
    explanation:
      'Die Oxygenierung hängt vor allem von F~I~O~2~ und mittlerem Atemwegsdruck (wesentlich durch PEEP) ab. Die Atemfrequenz beeinflusst überwiegend die CO~2~-Elimination; eine gesenkte Alarmgrenze verbessert gar nichts, sondern blendet nur das Problem aus.',
    topic: 'Klinik',
    difficulty: 2,
  },
];

/** Kurze Zusatzfragen für die 60-Sekunden-Blitzrunde. */
const blitzPool: Question[] = [
  {
    id: 'vent-p-peep-abk',
    kind: 'truefalse',
    prompt: 'PEEP bedeutet „positiver endexspiratorischer Druck“.',
    correct: true,
    explanation: 'Richtig: Positive End-Expiratory Pressure – der Druck, der am Ende der Exspiration im System verbleibt.',
    topic: 'Parameter',
    difficulty: 1,
  },
  {
    id: 'vent-p-exp-passiv',
    kind: 'truefalse',
    prompt: 'Die Exspiration erfolgt bei konventioneller Beatmung aktiv durch das Gerät.',
    correct: false,
    explanation: 'Falsch. Die Ausatmung ist passiv – getrieben von den elastischen Rückstellkräften von Lunge und Thorax.',
    topic: 'Grundlagen',
    difficulty: 1,
  },
  {
    id: 'vent-p-mv',
    kind: 'single',
    prompt: 'V~T~ 400 ml, f 20/min – Minutenvolumen?',
    options: ['4 L/min', '8 L/min', '20 L/min', '0,8 L/min'],
    correct: 1,
    explanation: 'MV = 0,4 L · 20/min = 8 L/min.',
    topic: 'Parameter',
    difficulty: 1,
  },
  {
    id: 'vent-p-pplat-ziel',
    kind: 'truefalse',
    prompt: 'Der Plateaudruck sollte bei lungenprotektiver Beatmung 30 cmH~2~O nicht überschreiten.',
    correct: true,
    explanation: 'Richtig. P~plat~ ≤ 30 cmH~2~O ist ein etabliertes Ziel (ARDSNet, S3-Leitlinie).',
    topic: 'Klinik',
    difficulty: 1,
  },
  {
    id: 'vent-p-dp-def',
    kind: 'single',
    prompt: 'Driving Pressure = ?',
    options: ['P~peak~ − PEEP', 'P~plat~ − PEEP', 'P~peak~ − P~plat~', 'PEEP + P~plat~'],
    correct: 1,
    explanation: 'ΔP = P~plat~ − PEEP. P~peak~ − P~plat~ ist dagegen der resistive Druckanteil.',
    topic: 'Parameter',
    difficulty: 1,
  },
  {
    id: 'vent-p-tau',
    kind: 'single',
    prompt: 'Zeitkonstante τ = ?',
    options: ['R · C', 'R / C', 'V / C', 'V~T~ · f'],
    correct: 0,
    explanation: 'τ = R · C. Nach etwa 3 τ ist die Lunge zu ca. 95 % entleert.',
    topic: 'Physik',
    difficulty: 1,
  },
  {
    id: 'vent-p-pbw-groesse',
    kind: 'truefalse',
    prompt: 'Das Sollgewicht (PBW) wird aus Körpergröße und Geschlecht berechnet.',
    correct: true,
    explanation: 'Richtig. Das tatsächliche Körpergewicht spielt keine Rolle, da die Lungengröße nicht mit dem Gewicht wächst.',
    topic: 'Parameter',
    difficulty: 1,
  },
  {
    id: 'vent-p-vc-druck',
    kind: 'truefalse',
    prompt: 'Bei volumenkontrollierter Beatmung ist der Atemwegsdruck die abhängige Größe.',
    correct: true,
    explanation: 'Richtig. Volumen und Flow sind vorgegeben; der Druck ergibt sich aus Compliance und Resistance.',
    topic: 'Beatmungsformen',
    difficulty: 1,
  },
  {
    id: 'vent-p-pc-flow',
    kind: 'truefalse',
    prompt: 'Bei druckkontrollierter Beatmung ist der inspiratorische Flow typischerweise konstant.',
    correct: false,
    explanation: 'Falsch. Bei PC ist der Flow dezelerierend – hoch zu Beginn, dann abnehmend. Konstanter Flow ist typisch für VC.',
    topic: 'Beatmungsformen',
    difficulty: 1,
  },
  {
    id: 'vent-p-leck',
    kind: 'single',
    prompt: 'V~Te~ deutlich kleiner als V~Ti~ – Verdacht?',
    options: ['Leckage', 'Bronchospasmus', 'Zu hoher PEEP', 'Zu hohe F~I~O~2~'],
    correct: 0,
    explanation: 'Fehlt exspiratorisches Volumen, entweicht Gas – z. B. am Cuff oder im Schlauchsystem.',
    topic: 'Kurven & Monitoring',
    difficulty: 1,
  },
  {
    id: 'vent-p-flow-null',
    kind: 'truefalse',
    prompt: 'Erreicht der exspiratorische Flow vor dem nächsten Atemzug nicht die Nulllinie, spricht das für Air Trapping.',
    correct: true,
    explanation: 'Richtig. Die Lunge ist nicht vollständig entleert – es entsteht Auto-PEEP.',
    topic: 'Kurven & Monitoring',
    difficulty: 1,
  },
  {
    id: 'vent-p-exp-ventil',
    kind: 'single',
    prompt: 'Welches Bauteil regelt den PEEP?',
    options: ['Exspirationsventil', 'Inspirationsventil', 'O~2~-Sensor', 'Befeuchter'],
    correct: 0,
    explanation: 'Das Exspirationsventil schließt am Ende der Exspiration so, dass der eingestellte PEEP erhalten bleibt.',
    topic: 'Aufbau',
    difficulty: 1,
  },
  {
    id: 'vent-p-fio2-raumluft',
    kind: 'truefalse',
    prompt: 'Raumluft entspricht einer F~I~O~2~ von 0,21.',
    correct: true,
    explanation: 'Richtig. Luft enthält etwa 21 % Sauerstoff.',
    topic: 'Parameter',
    difficulty: 1,
  },
  {
    id: 'vent-p-alarm-stumm',
    kind: 'truefalse',
    prompt: 'Ein Hochdruckalarm darf stummgeschaltet werden, ohne nach der Ursache zu suchen.',
    correct: false,
    explanation: 'Falsch. Stummschalten verschafft nur kurz Ruhe – die Ursache (z. B. Sekret, Knick, Pneumothorax) muss geklärt werden.',
    topic: 'Alarme & Sicherheit',
    difficulty: 1,
  },
  {
    id: 'vent-p-co2-hebel',
    kind: 'single',
    prompt: 'Hauptstellgröße gegen Hyperkapnie?',
    options: ['F~I~O~2~', 'Alveoläre Ventilation (V~T~, f)', 'PEEP', 'Triggerschwelle'],
    correct: 1,
    explanation: 'P~a~CO~2~ ist umgekehrt proportional zur alveolären Ventilation (V~T~ − V~D~) · f.',
    topic: 'Klinik',
    difficulty: 1,
  },
  {
    id: 'vent-p-cpap-apnoe',
    kind: 'truefalse',
    prompt: 'CPAP setzt eine erhaltene Spontanatmung voraus.',
    correct: true,
    explanation: 'Richtig. CPAP liefert keine maschinellen Atemhübe, nur einen kontinuierlich positiven Druck.',
    topic: 'Beatmungsformen',
    difficulty: 1,
  },
  {
    id: 'vent-p-hme-befeuchter',
    kind: 'truefalse',
    prompt: 'HME-Filter und aktiver Befeuchter sollten gleichzeitig verwendet werden, um das Gas optimal anzufeuchten.',
    correct: false,
    explanation: 'Falsch. Der HME kann durchnässen; Widerstand und Verlegungsrisiko steigen. Entweder HME oder aktive Befeuchtung.',
    topic: 'Aufbau',
    difficulty: 1,
  },
  {
    id: 'vent-p-unklar-beutel',
    kind: 'truefalse',
    prompt: 'Bei unklarer akuter Verschlechterung: vom Gerät trennen und manuell mit 100 % O~2~ beatmen.',
    correct: true,
    explanation: 'Richtig. So wird das Gerät als Ursache ausgeschlossen und die Oxygenierung gesichert.',
    topic: 'Alarme & Sicherheit',
    difficulty: 1,
  },
];

export const ventilatorExam: Exam = {
  questionCount: 20,
  passScore: 0.8,
  pool: examPool,
  xp: 150,
  topicLessons: {
    Grundlagen: 'grundlagen',
    Aufbau: 'aufbau',
    Physik: 'funktion',
    Beatmungsformen: 'funktion',
    Parameter: 'bedienung',
    'Kurven & Monitoring': 'bedienung',
    'Alarme & Sicherheit': 'bedienung',
    Klinik: 'training',
  },
};

export const ventilatorPracticePool: Question[] = [...examPool, ...blitzPool];
