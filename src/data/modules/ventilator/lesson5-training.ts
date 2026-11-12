import type { Lesson } from '@/types/content';

/**
 * Lektion 5 – Interaktives Training: Trainingsstationen mit Reihenfolge-,
 * Zuordnungs- und Fehlersuch-Spielen, Simulator-Missionen, Kurvendetektiv,
 * klinischen Fällen und einem Abschlussquiz.
 */
export const lessonTraining: Lesson = {
  id: 'training',
  number: 5,
  kind: 'training',
  title: 'Interaktives Training',
  subtitle: 'Acht Trainingsstationen – vom Atemzyklus bis zum Notfall am Bett',
  durationMin: 30,
  xp: 80,
  objectives: [
    'Den Ablauf eines volumenkontrollierten Atemzugs sicher in der richtigen Reihenfolge beschreiben',
    'Einen sicheren Ablauf für die Inbetriebnahme eines Beatmungsgeräts anwenden',
    'Abkürzungen und Beatmungsparameter zuverlässig zuordnen',
    'Im Simulator gezielt Einstellungen verändern und deren Wirkung vorhersagen',
    'Typische Kurvenmuster und Ursachen eines Hochdruckalarms erkennen',
    'In klinischen Fallszenarien strukturiert und lungenprotektiv entscheiden',
  ],
  sections: [
    /* ------------------------------------------------------------ */
    {
      id: 'station-atemzug',
      title: 'Station 1: Ablauf eines Atemzugs',
      blocks: [
        {
          type: 'text',
          md: `Willkommen im Trainingsbereich! In dieser Lektion wendest du an, was du in den Lektionen 1–4 gelernt hast. Jede Station ist in sich abgeschlossen – du kannst sie in beliebiger Reihenfolge bearbeiten und beliebig oft wiederholen.

Zum Aufwärmen: Was passiert im Gerät während **eines einzigen volumenkontrollierten Pflichtatemzugs**? Bringe die Ereignisse in die richtige Reihenfolge – vom Trigger bis zum erneuten Erreichen des PEEP-Niveaus.`,
        },
        {
          type: 'ordering',
          game: {
            id: 'vent-order-breath',
            title: 'Ein volumenkontrollierter Atemzug',
            instructions:
              'Ordne die Ereignisse eines mandatorischen, volumenkontrollierten Atemzugs (VC, konstanter Flow) in der zeitlich richtigen Reihenfolge.',
            steps: [
              {
                id: 'trigger',
                text: 'Auslösung (Trigger): Die eingestellte Atemfrequenz (Zeittrigger) oder eine Einatembemühung des Patienten (Druck-/Flowtrigger) startet den Atemzug.',
              },
              {
                id: 'exp-close',
                text: 'Das Exspirationsventil schließt, das Inspirationsventil öffnet und gibt den eingestellten Flow frei.',
              },
              {
                id: 'flow',
                text: 'Gas strömt mit konstantem Flow in die Lunge; der Atemwegsdruck steigt an und erreicht den Spitzendruck (P~peak~).',
              },
              {
                id: 'volume',
                text: 'Das eingestellte Tidalvolumen ist abgegeben – der Flow stoppt; während einer inspiratorischen Pause stellt sich der Plateaudruck (P~plat~) ein.',
              },
              {
                id: 'cycle',
                text: 'Umschaltung auf Exspiration: Das Inspirationsventil schließt, das Exspirationsventil öffnet.',
              },
              {
                id: 'exhale',
                text: 'Passive Ausatmung durch die elastischen Rückstellkräfte von Lunge und Thorax; der exspiratorische Flowsensor misst das Exspirationsvolumen.',
              },
              {
                id: 'peep',
                text: 'Der Druck fällt auf das PEEP-Niveau ab; das Exspirationsventil hält den PEEP bis zum nächsten Trigger.',
              },
            ],
            explanation: `Ein Atemzug gliedert sich in **Trigger → Inspiration → Umschaltung (Cycling) → Exspiration**. Bei VC bestimmt das Gerät Flow und Volumen; der Druck ergibt sich aus der Lungenmechanik (Bewegungsgleichung). Die Ausatmung ist bei der konventionellen Beatmung immer **passiv** – das Gerät „saugt“ nicht. Das Exspirationsventil öffnet nur so weit, dass der eingestellte PEEP am Ende der Exspiration erhalten bleibt.`,
          },
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'station-inbetriebnahme',
      title: 'Station 2: Sichere Inbetriebnahme',
      blocks: [
        {
          type: 'text',
          md: `Fehler bei der Vorbereitung sind eine vermeidbare Ursache für kritische Ereignisse. Ein fester, immer gleicher Ablauf schützt – besonders in hektischen Situationen. Bringe die Schritte einer sicheren Inbetriebnahme in eine sinnvolle Reihenfolge.`,
        },
        {
          type: 'ordering',
          game: {
            id: 'vent-order-setup',
            title: 'Inbetriebnahme eines Intensivbeatmungsgeräts',
            instructions:
              'Ordne die Schritte von der Vorbereitung bis zur Kontrolle nach Anschluss an den Patienten.',
            steps: [
              {
                id: 'sicht',
                text: 'Sichtprüfung: Gerät, Netz- und Gasanschlüsse (O~2~/Druckluft), Prüfplakette bzw. Prüffristen, Zubehör vollständig und unbeschädigt.',
              },
              {
                id: 'schlauch',
                text: 'Patientenschlauchsystem mit Filter und Befeuchtung (aktiver Befeuchter ODER HME) nach Herstellerangabe aufbauen.',
              },
              {
                id: 'selbsttest',
                text: 'Gerät einschalten und Selbsttest/Gerätecheck gemäß Gebrauchsanweisung durchführen (Sensoren, Alarme, Dichtheit und Compliance des Schlauchsystems).',
              },
              {
                id: 'pbw',
                text: 'Patientendaten eingeben: Geschlecht und Körpergröße zur Berechnung des Sollgewichts (PBW).',
              },
              {
                id: 'parameter',
                text: 'Beatmungsform und Parameter nach ärztlicher Anordnung einstellen (z. B. V~T~ ≈ 6 ml/kg PBW, f, PEEP, F~I~O~2~, I:E).',
              },
              {
                id: 'alarme',
                text: 'Alarmgrenzen patientenbezogen setzen und prüfen (z. B. Druck, Minutenvolumen, Atemfrequenz, Apnoe).',
              },
              {
                id: 'anschluss',
                text: 'Gerät an den Patienten anschließen (Beatmungsbeutel griffbereit, Absaugung funktionsbereit).',
              },
              {
                id: 'kontrolle',
                text: 'Kontrolle: Thoraxexkursion, Auskultation, Messwerte (V~Te~, Drücke, Kapnografie), SpO~2~ und Blutgasanalyse nach etwa 20–30 Minuten.',
              },
            ],
            explanation: `Die Reihenfolge folgt einem einfachen Prinzip: **erst das Gerät, dann das System, dann der Patient**. Das Schlauchsystem wird vor dem Selbsttest aufgebaut, und der Selbsttest inklusive Schlauchsystem-Test muss vor dem Anschluss erfolgen – nur so kann das Gerät Leckagen erkennen und die Schlauchcompliance kompensieren. Die Körpergröße wird vor der Parametereinstellung erfasst, weil sich das Tidalvolumen am **Sollgewicht** orientiert. Alarmgrenzen werden vor dem Anschluss gesetzt – ein Gerät, das „stumm“ beatmet, ist ein Sicherheitsrisiko. Die genaue Reihenfolge (z. B. wann Patientendaten eingegeben werden) ist geräteabhängig: Maßgeblich sind Gebrauchsanweisung und lokale SOPs.`,
          },
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Ohne Einweisung keine Anwendung',
          md: 'Nach der Medizinprodukte-Betreiberverordnung darf ein Beatmungsgerät nur von Personen angewendet werden, die in das konkrete Gerät eingewiesen sind. Die Trainingsstationen hier ersetzen keine gerätespezifische Einweisung.',
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'station-parameter',
      title: 'Station 3: Parameter-Memory',
      blocks: [
        {
          type: 'text',
          md: `Am Beatmungsgerät begegnen dir viele Abkürzungen. Wer sie sicher zuordnet, liest den Bildschirm schneller und kommuniziert präziser im Team. Ordne jedem Parameter die passende Bedeutung zu.`,
        },
        {
          type: 'matching',
          game: {
            id: 'vent-match-params',
            title: 'Parameter und ihre Bedeutung',
            instructions: 'Ordne jeder Abkürzung links die richtige Beschreibung rechts zu.',
            pairs: [
              {
                id: 'peep',
                left: 'PEEP',
                right: 'Positiver Druck am Ende der Exspiration; hält Alveolen offen und verbessert die Oxygenierung',
              },
              { id: 'vt', left: 'V~T~', right: 'Tidalvolumen – das Volumen eines einzelnen Atemzugs' },
              { id: 'f', left: 'f', right: 'Atemfrequenz – Anzahl der Atemzüge pro Minute' },
              { id: 'fio2', left: 'F~I~O~2~', right: 'Inspiratorische Sauerstofffraktion (0,21–1,0)' },
              {
                id: 'pplat',
                left: 'P~plat~',
                right: 'Druck bei Flow null am Inspirationsende – Näherung für den endinspiratorischen Alveolardruck',
              },
              { id: 'ie', left: 'I:E', right: 'Verhältnis von Inspirations- zu Exspirationszeit, typisch 1:2' },
              { id: 'mv', left: 'MV', right: 'Minutenvolumen = V~T~ · f' },
              {
                id: 'dp',
                left: 'ΔP',
                right: 'Driving Pressure = P~plat~ − PEEP; Ziel ≤ 15 cmH~2~O',
              },
            ],
          },
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'station-simulator',
      title: 'Station 4: Simulator-Missionen',
      blocks: [
        {
          type: 'text',
          md: `Jetzt wird es praktisch: Im Simulator steuerst du ein Beatmungsgerät an einem Modellpatienten. Jede Mission stellt dir eine konkrete Aufgabe – etwa ein lungenprotektives Tidalvolumen einzustellen oder Air Trapping zu beseitigen. Überlege vor jeder Änderung, **was** sich an den Kurven ändern wird, und überprüfe dann deine Vorhersage.`,
        },
        {
          type: 'widget',
          widget: 'vent-simulator',
          props: { missions: true },
          caption: 'Simulator-Missionen: Löse die Aufgaben durch gezielte Einstellungen.',
        },
        {
          type: 'callout',
          variant: 'model',
          title: 'Modell und Wirklichkeit',
          md: 'Der Simulator beruht auf dem Ein-Kompartiment-Modell (P~aw~ = PEEP + V/C + R · V̇) mit konstanter Compliance und Resistance. Echte Lungen sind inhomogen, die Compliance ändert sich mit dem Volumen, und Spontanatmung, Leckagen oder Sekret verändern die Kurven zusätzlich.',
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'station-kurven',
      title: 'Station 5: Kurvendetektiv',
      blocks: [
        {
          type: 'text',
          md: `Beatmungskurven verraten viel über den Zustand von Patient und Gerät – wenn man weiß, worauf man achten muss. Analysiere die gezeigten Kurven und finde das Problem: Leckage, Air Trapping, erhöhte Resistance oder verminderte Compliance?`,
        },
        {
          type: 'widget',
          widget: 'vent-curve-detective',
          caption: 'Erkenne typische Muster in Druck-, Flow- und Volumenkurven.',
        },
        {
          type: 'callout',
          variant: 'remember',
          title: 'Systematisch lesen',
          md: `- **Druck:** Steigt nur P~peak~ (Resistance) oder auch P~plat~ (Compliance)?
- **Flow:** Erreicht der exspiratorische Flow vor dem nächsten Atemzug die Nulllinie? Wenn nicht: Air Trapping.
- **Volumen:** Kehrt die Kurve zur Nulllinie zurück? Wenn nicht: Leckage.`,
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'station-fehlersuche',
      title: 'Station 6: Fehlersuche Hochdruckalarm',
      blocks: [
        {
          type: 'text',
          md: `Der Alarm „Atemwegsdruck hoch“ gehört zu den häufigsten Alarmen auf der Intensivstation. Bei volumenkontrollierter Beatmung bedeutet er, dass das Gerät für das eingestellte Volumen mehr Druck benötigt – meist wegen einer erhöhten Resistance, seltener wegen einer plötzlich verminderten Compliance. Erreicht der Druck die obere Alarmgrenze, bricht das Gerät die Inspiration ab: Der Patient erhält dann weniger Volumen als eingestellt.`,
        },
        {
          type: 'faultFinder',
          game: {
            id: 'vent-fault-alarm',
            title: 'Hochdruckalarm am Bett 4',
            scenario:
              'Ein 58-jähriger Patient wird volumenkontrolliert beatmet (V~T~ 450 ml, f 16/min, PEEP 8 cmH~2~O, F~I~O~2~ 0,4). Seit wenigen Minuten meldet das Gerät wiederholt „Atemwegsdruck hoch“. Markiere alle Befunde, die als Ursache des Alarms plausibel sind bzw. auf ein Problem hinweisen.',
            items: [
              {
                id: 'ppeak',
                label: 'Spitzendruck / Plateaudruck',
                value: 'P~peak~ 40 cmH~2~O (vorher 26), P~plat~ 21 cmH~2~O (unverändert)',
                isFault: true,
                explanation:
                  'Auffällig: Nur der Spitzendruck ist gestiegen, das Plateau ist gleich geblieben. Die Differenz P~peak~ − P~plat~ spiegelt den resistiven Druckanteil wider – es liegt also ein Strömungshindernis vor (Tubus, Sekret, Bronchospasmus), keine verschlechterte Compliance.',
              },
              {
                id: 'knick',
                label: 'Tubus und Schlauchsystem',
                value: 'Tubus im Mundwinkel abgeknickt, Patient beißt zeitweise auf den Tubus',
                isFault: true,
                explanation:
                  'Plausible Ursache: Ein Abknicken oder Zubeißen verkleinert den Tubusquerschnitt drastisch. Da der Strömungswiderstand bei laminarer Strömung mit der vierten Potenz des Radius zunimmt, steigt der Spitzendruck stark. Abhilfe: Lage korrigieren, ggf. Beißschutz, Sedierung prüfen.',
              },
              {
                id: 'sekret',
                label: 'Auskultation',
                value: 'Grobblasige Rasselgeräusche, sägezahnartige Oszillationen in der Flowkurve',
                isFault: true,
                explanation:
                  'Plausible Ursache: Sekret in Tubus oder Bronchien erhöht den Atemwegswiderstand. Die typischen Oszillationen in der Flowkurve sind ein Hinweis darauf. Eine Absaugung ist indiziert.',
              },
              {
                id: 'husten',
                label: 'Patientenverhalten',
                value: 'Patient hustet, presst gegen die Inspiration, wirkt unruhig',
                isFault: true,
                explanation:
                  'Plausible Ursache: Husten oder Pressen gegen das Gerät erzeugt kurzzeitig sehr hohe Drücke. Mögliche Gründe sind Sekret, Schmerz, Angst, unzureichende Sedierung oder eine Asynchronie zwischen Patient und Gerät.',
              },
              {
                id: 'wasser',
                label: 'Schlauchsystem',
                value: 'Deutliche Wasseransammlung im Exspirationsschenkel',
                isFault: true,
                explanation:
                  'Weist auf ein Problem hin: Kondenswasser im Exspirationsschenkel behindert die Ausatmung, erzeugt Flow-Oszillationen und kann Autotriggerung (und damit Pressen/Asynchronie) auslösen. Den inspiratorischen Spitzendruck erhöht es direkt kaum. Wasser entfernen – niemals in Richtung Patient laufen lassen.',
              },
              {
                id: 'peep',
                label: 'PEEP',
                value: '8 cmH~2~O, wie ärztlich angeordnet',
                isFault: false,
                explanation:
                  'Unauffällig: Ein PEEP von 8 cmH~2~O entspricht der Anordnung und hat sich nicht verändert. Er erklärt keinen plötzlichen Anstieg des Spitzendrucks.',
              },
              {
                id: 'fio2',
                label: 'F~I~O~2~',
                value: '0,4',
                isFault: false,
                explanation:
                  'Unauffällig: Die Sauerstofffraktion beeinflusst die Oxygenierung, aber nicht den Atemwegsdruck. Sie ist hier keine Alarmursache.',
              },
              {
                id: 'cuff',
                label: 'Cuffdruck',
                value: '25 cmH~2~O',
                isFault: false,
                explanation:
                  'Unauffällig: Ein Cuffdruck im üblichen Bereich von etwa 20–30 cmH~2~O dichtet die Trachea ab und schont die Schleimhaut. Er führt nicht zum Hochdruckalarm.',
              },
              {
                id: 'gas',
                label: 'Gasversorgung',
                value: 'O~2~ und Druckluft je ca. 5 bar, keine Gasversorgungsalarme',
                isFault: false,
                explanation:
                  'Unauffällig: Der Versorgungsdruck aus der zentralen Gasversorgung liegt im normalen Bereich. Der Druckminderer im Gerät reduziert ihn; der Versorgungsdruck hat nichts mit dem Atemwegsdruck zu tun.',
              },
            ],
          },
        },
        {
          type: 'callout',
          variant: 'clinical',
          title: 'Praxistipp',
          md: 'Eine kurze inspiratorische Pause (Inspiratory Hold) trennt Resistance- von Complianceproblemen: Steigt nur P~peak~, liegt das Problem meist im Tubus oder in den Atemwegen. Steigen P~peak~ und P~plat~ gemeinsam, an Pneumothorax, Atelektase, einseitige Intubation oder Überblähung denken.',
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'station-faelle',
      title: 'Station 7: Fälle von der Intensivstation',
      blocks: [
        {
          type: 'text',
          md: `In den folgenden drei Fällen triffst du Entscheidungen wie im Stationsalltag. Jede Entscheidung bekommt eine Rückmeldung – auch die falschen sind lehrreich. Die Fälle sind vereinfacht und dienen dem Verständnis; Therapieentscheidungen trifft immer das ärztliche Team gemäß Leitlinien, Gerätevorgaben und lokalen SOPs.`,
        },
        {
          type: 'case',
          case: {
            id: 'vent-case-ards',
            title: 'Fall 1: ARDS – zu viel Volumen?',
            setting: 'Interdisziplinäre Intensivstation, Spätdienst',
            presentation: `Herr K., 52 Jahre, **180 cm**, 98 kg, wird seit gestern wegen eines **ARDS bei Pneumonie** volumenkontrolliert beatmet. Die Einstellung stammt aus dem Notfall: V~T~ 600 ml, f 18/min, PEEP 10 cmH~2~O, F~I~O~2~ 0,6. Bei der inspiratorischen Pause misst du einen **Plateaudruck von 33 cmH~2~O**.

Sein Sollgewicht beträgt 50 + 0,91 · (180 − 152,4) ≈ **75 kg**. Das eingestellte Volumen entspricht also etwa 8 ml/kg PBW.`,
            vitals: [
              { label: 'SpO~2~', value: '90 %', status: 'warn' },
              { label: 'P~plat~', value: '33 cmH~2~O', status: 'alarm' },
              { label: 'ΔP', value: '23 cmH~2~O', status: 'alarm' },
              { label: 'V~T~', value: '600 ml (8 ml/kg PBW)', status: 'warn' },
              { label: 'P~a~CO~2~', value: '44 mmHg', status: 'ok' },
              { label: 'pH', value: '7,38', status: 'ok' },
              { label: 'RR', value: '118/68 mmHg', status: 'ok' },
            ],
            steps: [
              {
                prompt: 'Welche Änderung hat jetzt Priorität?',
                options: [
                  {
                    text: 'Tidalvolumen auf ca. 6 ml/kg PBW (≈ 450 ml) reduzieren',
                    correct: true,
                    feedback:
                      'Richtig. Plateaudruck > 30 cmH~2~O und V~T~ 8 ml/kg PBW überschreiten die lungenprotektiven Ziele. Die Reduktion auf etwa 6 ml/kg PBW entspricht dem ARDSNet-Konzept und senkt Plateau- und Driving Pressure.',
                  },
                  {
                    text: 'Tidalvolumen nach dem tatsächlichen Gewicht (98 kg × 6 ml = 590 ml) beibehalten',
                    correct: false,
                    feedback:
                      'Nicht korrekt. Die Lungengröße hängt von Körpergröße und Geschlecht ab, nicht vom Körpergewicht. Ein Bezug auf das tatsächliche Gewicht führt bei übergewichtigen Patient:innen zu zu großen Volumina.',
                  },
                  {
                    text: 'PEEP auf 5 cmH~2~O senken, um den Plateaudruck zu reduzieren',
                    correct: false,
                    feedback:
                      'Nicht sinnvoll. Ein niedrigerer PEEP senkt zwar das absolute Druckniveau, ändert aber den Driving Pressure nicht und gefährdet bei ARDS die Oxygenierung durch Derecruitment. Das Problem ist das zu große Volumen.',
                  },
                  {
                    text: 'F~I~O~2~ auf 1,0 erhöhen und sonst nichts ändern',
                    correct: false,
                    feedback:
                      'Nicht ausreichend. Mehr Sauerstoff behandelt nicht die Überdehnung der Lunge. Dauerhaft hohe F~I~O~2~ birgt zudem eigene Risiken.',
                  },
                ],
              },
              {
                prompt:
                  'Nach der Umstellung auf 450 ml sinkt das Minutenvolumen von 10,8 auf 8,1 L/min. Wie gehst du mit der CO~2~-Elimination um?',
                options: [
                  {
                    text: 'Atemfrequenz moderat erhöhen (z. B. auf 22–24/min) und auf Air Trapping achten',
                    correct: true,
                    feedback:
                      'Richtig. Mit 24/min ist das Minutenvolumen wiederhergestellt (450 ml · 24/min ≈ 10,8 L/min). Wegen des gleichbleibenden Totraums bleibt die alveoläre Ventilation trotzdem etwas geringer als vorher – ein leichter P~a~CO~2~-Anstieg ist möglich. Dabei die Flowkurve beobachten: Der exspiratorische Flow muss weiterhin die Nulllinie erreichen.',
                  },
                  {
                    text: 'Das Tidalvolumen sofort wieder auf 600 ml erhöhen',
                    correct: false,
                    feedback:
                      'Nicht korrekt. Damit wäre der lungenprotektive Effekt wieder aufgehoben. Ein moderater P~a~CO~2~-Anstieg wird im Rahmen der permissiven Hyperkapnie toleriert, solange der pH vertretbar bleibt.',
                  },
                  {
                    text: 'Nichts tun – CO~2~ spielt bei ARDS keine Rolle',
                    correct: false,
                    feedback:
                      'Nicht korrekt. Die Hyperkapnie wird zwar in gewissem Maß toleriert, muss aber überwacht werden. Eine ausgeprägte respiratorische Azidose kann den Kreislauf und den Hirndruck beeinträchtigen.',
                  },
                ],
              },
              {
                prompt: 'Wie überprüfst du, ob die Umstellung erfolgreich war?',
                options: [
                  {
                    text: 'Erneut P~plat~ messen, ΔP berechnen und nach ca. 20–30 min eine Blutgasanalyse durchführen',
                    correct: true,
                    feedback:
                      'Richtig. Ziel: P~plat~ ≤ 30 cmH~2~O, ΔP möglichst ≤ 15 cmH~2~O. Die BGA zeigt, ob pH und P~a~CO~2~ im Zielbereich liegen. Bei einer Compliance von ca. 26 ml/cmH~2~O ergibt sich für 450 ml ein ΔP von etwa 17 cmH~2~O – das Ergebnis also genau prüfen und weitere Schritte im Team besprechen.',
                  },
                  {
                    text: 'Nur die SpO~2~ beobachten – wenn sie stabil ist, ist alles gut',
                    correct: false,
                    feedback:
                      'Nicht ausreichend. Die SpO~2~ sagt nichts über Plateaudruck, Driving Pressure oder CO~2~ aus. Lungenprotektion muss gemessen werden.',
                  },
                ],
              },
            ],
            debrief: `**Take-home-Message:** Bei ARDS orientiert sich das Tidalvolumen am **Sollgewicht** (≈ 6 ml/kg PBW). Ziele sind P~plat~ ≤ 30 cmH~2~O und ein möglichst niedriger Driving Pressure (≤ 15 cmH~2~O). Ein sinkendes Minutenvolumen wird über die Frequenz ausgeglichen; eine moderate Hyperkapnie kann toleriert werden. Grundlage sind die ARDSNet-Studie (2000), die Analyse von Amato et al. (2015) und die S3-Leitlinie „Invasive Beatmung“.`,
          },
        },
        {
          type: 'case',
          case: {
            id: 'vent-case-copd',
            title: 'Fall 2: COPD-Exazerbation – die Luft kommt nicht mehr raus',
            setting: 'Internistische Intensivstation, Nachtdienst',
            presentation: `Frau M., 67 Jahre, mit bekannter schwerer COPD, wird nach einer Exazerbation volumenkontrolliert beatmet: V~T~ 420 ml, **f 24/min, I:E 1:2**, PEEP 5 cmH~2~O. Der Blutdruck fällt seit einer Stunde langsam ab. In der Flowkurve fällt dir auf: **Der exspiratorische Flow erreicht vor dem nächsten Atemzug nicht die Nulllinie.**

Bei einer Resistance von ca. 25 cmH~2~O/(L/s) und einer Compliance von ca. 50 ml/cmH~2~O beträgt die Zeitkonstante τ = R · C ≈ 1,25 s.

*Modellhinweis:* Das Ein-Kompartiment-Modell würde bei diesen Werten nur einen Auto-PEEP von etwa 3 cmH~2~O vorhersagen. Real liegt der Auto-PEEP bei COPD durch exspiratorische Flusslimitierung (Kollaps kleiner Atemwege) und inhomogene Zeitkonstanten oft deutlich höher, als das Ein-Kompartiment-Modell vorhersagt.`,
            vitals: [
              { label: 'RR', value: '88/50 mmHg', status: 'warn' },
              { label: 'HF', value: '118/min', status: 'warn' },
              { label: 'P~peak~', value: '38 cmH~2~O', status: 'warn' },
              { label: 'PEEP~i~ (Auto-PEEP)', value: '9 cmH~2~O', status: 'alarm' },
              { label: 'SpO~2~', value: '92 %', status: 'ok' },
              { label: 'P~a~CO~2~', value: '62 mmHg', status: 'warn' },
            ],
            steps: [
              {
                prompt: 'Was ist die wahrscheinlichste Erklärung für Flowkurve und Blutdruckabfall?',
                options: [
                  {
                    text: 'Dynamische Überblähung (Air Trapping) mit Auto-PEEP, die den venösen Rückstrom behindert',
                    correct: true,
                    feedback:
                      'Richtig. Die Exspirationszeit reicht nicht aus, um die Lunge zu entleeren. Das gefangene Volumen erhöht den intrathorakalen Druck, vermindert den venösen Rückstrom und senkt so den Blutdruck.',
                  },
                  {
                    text: 'Eine Leckage im Schlauchsystem',
                    correct: false,
                    feedback:
                      'Nicht korrekt. Eine Leckage zeigt sich typischerweise in einer Volumenkurve, die nicht zur Nulllinie zurückkehrt, und in V~Te~ < V~Ti~. Ein exspiratorischer Flow, der vor dem nächsten Atemzug noch fließt, spricht für Air Trapping.',
                  },
                  {
                    text: 'Ein zu niedriger PEEP',
                    correct: false,
                    feedback:
                      'Nicht korrekt. Der Gesamt-PEEP ist durch den Auto-PEEP bereits deutlich höher als eingestellt. Ein noch höherer PEEP würde das Problem bei dieser Konstellation eher nicht lösen.',
                  },
                ],
              },
              {
                prompt: 'Welche Änderung verlängert die Exspirationszeit am wirksamsten?',
                options: [
                  {
                    text: 'Atemfrequenz senken (z. B. auf 12/min) und das I:E-Verhältnis Richtung 1:3 verschieben',
                    correct: true,
                    feedback:
                      'Richtig. Bei f 24 und I:E 1:2 dauert ein Zyklus 2,5 s, die Exspiration nur ≈ 1,7 s – das sind nicht einmal 1,5 τ. Bei f 12 und I:E 1:3 beträgt T~E~ 3,75 s ≈ 3 τ; die Lunge kann sich zu etwa 95 % entleeren.',
                  },
                  {
                    text: 'Atemfrequenz erhöhen, um den hohen P~a~CO~2~ zu senken',
                    correct: false,
                    feedback:
                      'Gefährlich. Eine höhere Frequenz verkürzt die Exspirationszeit weiter und verstärkt Air Trapping und Hypotonie. Paradox, aber typisch: Bei Obstruktion verbessert eine niedrigere Frequenz oft sogar die Ventilation.',
                  },
                  {
                    text: 'Inspiratorische Pause verlängern',
                    correct: false,
                    feedback:
                      'Nicht korrekt. Eine längere Inspiration verkürzt bei gleicher Frequenz die verbleibende Exspirationszeit und verschärft das Problem.',
                  },
                ],
              },
              {
                prompt: 'Der Blutdruck fällt plötzlich auf 70/40 mmHg. Was ist eine sinnvolle Sofortmaßnahme?',
                options: [
                  {
                    text: 'Patientin kurz vom Gerät diskonnektieren, damit das gefangene Volumen entweichen kann – parallel Hilfe rufen und ärztliches Team informieren',
                    correct: true,
                    feedback:
                      'Richtig. Eine kurze Diskonnektion (wenige Sekunden) lässt die Lunge vollständig ausatmen und entlastet den Kreislauf meist rasch. Danach mit angepasster Einstellung (niedrige Frequenz, lange Exspiration) weiterbeatmen. Auch an einen Pneumothorax denken.',
                  },
                  {
                    text: 'Tidalvolumen erhöhen, um die Oxygenierung zu verbessern',
                    correct: false,
                    feedback:
                      'Nicht korrekt. Mehr Volumen verstärkt die Überblähung und verschlechtert den Kreislauf zusätzlich.',
                  },
                ],
              },
            ],
            debrief: `**Take-home-Message:** Erreicht der exspiratorische Flow die Nulllinie nicht, besteht Air Trapping. Bei obstruktiven Erkrankungen ist die Zeitkonstante verlängert – die Lunge braucht **mehr Zeit zum Ausatmen**. Gegenmaßnahmen: Frequenz senken, Inspirationszeit verkürzen (I:E 1:3 oder länger), bronchodilatatorische Therapie und ggf. eine höhere CO~2~-Toleranz. Den Auto-PEEP misst man mit einer endexspiratorischen Pause (Expiratory Hold).`,
          },
        },
        {
          type: 'case',
          case: {
            id: 'vent-case-dopes',
            title: 'Fall 3: Plötzliche Entsättigung',
            setting: 'Chirurgische Intensivstation, Frühdienst',
            presentation: `Herr S., 45 Jahre, ist nach einer Bauchoperation intubiert und wird volumenkontrolliert beatmet (V~T~ 480 ml). Beim Umlagern fällt die SpO~2~ innerhalb einer Minute von 96 % auf **82 %**. Das Gerät meldet **„Atemwegsdruck hoch“** und **„Tidalvolumen niedrig“**. Die Kapnografiekurve ist deutlich abgeflacht.`,
            vitals: [
              { label: 'SpO~2~', value: '82 %', status: 'alarm' },
              { label: 'V~Te~', value: '180 ml (eingestellt 480 ml)', status: 'alarm' },
              { label: 'etCO~2~', value: 'deutlich abgeflacht', status: 'alarm' },
              { label: 'HF', value: '124/min', status: 'warn' },
              { label: 'RR', value: '135/80 mmHg', status: 'ok' },
            ],
            steps: [
              {
                prompt: 'Die Ursache ist zunächst unklar. Was ist der erste Schritt?',
                options: [
                  {
                    text: 'Hilfe rufen, Patient vom Gerät trennen und mit dem Beatmungsbeutel mit 100 % O~2~ manuell beatmen',
                    correct: true,
                    feedback:
                      'Richtig. Ist die Ursache unklar und der Patient gefährdet, trennt man ihn vom Gerät und beatmet manuell mit 100 % Sauerstoff (Beutel mit Reservoir, ggf. PEEP-Ventil). Damit sind alle Gerätefehler sofort ausgeschlossen – und man „fühlt“ die Lunge.',
                  },
                  {
                    text: 'Zuerst die Alarmgrenzen erweitern, damit der Alarm verstummt',
                    correct: false,
                    feedback:
                      'Gefährlich. Alarmgrenzen anzupassen behebt nicht die Ursache. Der Alarm weist auf ein reales Problem hin, das sofort geklärt werden muss.',
                  },
                  {
                    text: 'Gerät neu starten und den Selbsttest durchführen',
                    correct: false,
                    feedback:
                      'Nicht korrekt. Ein Selbsttest dauert zu lang und der Patient bliebe währenddessen unversorgt. Bei einem akuten Notfall hat die Sicherstellung von Oxygenierung und Ventilation Vorrang.',
                  },
                ],
              },
              {
                prompt:
                  'Die Beutelbeatmung ist sehr schwergängig. Ein Absaugkatheter lässt sich nur wenige Zentimeter in den Tubus vorschieben. Woran denkst du nach dem DOPES-Schema zuerst?',
                options: [
                  {
                    text: 'O – Obstruktion: Tubusverlegung durch Sekret oder Abknicken',
                    correct: true,
                    feedback:
                      'Richtig. Ein nicht passierbarer Absaugkatheter spricht für eine Verlegung des Tubus (Sekretpfropf, Blutkoagel, Abknicken). Maßnahmen: Lage und Knick prüfen, absaugen; gelingt das nicht, ist ein rascher Tubuswechsel durch ein erfahrenes Team erforderlich.',
                  },
                  {
                    text: 'E – Equipment: Fehler im Beatmungsgerät',
                    correct: false,
                    feedback:
                      'Unwahrscheinlich. Der Patient ist bereits vom Gerät getrennt, und auch die Beutelbeatmung ist schwergängig. Das Problem liegt also zwischen Beutel und Lunge – im Tubus, in der Lunge oder in noch angeschlossenem Zubehör (z. B. durchnässter HME/Filter, der deshalb mit entfernt werden sollte).',
                  },
                  {
                    text: 'S – Stacking (Stacked Breaths, Auto-PEEP)',
                    correct: false,
                    feedback:
                      'Weniger wahrscheinlich. Air Trapping entwickelt sich meist über mehrere Atemzüge und erklärt keinen Absaugkatheter, der sich nicht vorschieben lässt.',
                  },
                ],
              },
              {
                prompt: 'Nach dem Absaugen eines großen Sekretpfropfs ist die Beutelbeatmung leichtgängig, die SpO~2~ steigt. Wie geht es weiter?',
                options: [
                  {
                    text: 'Erneut an das Gerät anschließen, Messwerte und Kurven kontrollieren, Auskultation, BGA und Ursachenanalyse (Befeuchtung prüfen)',
                    correct: true,
                    feedback:
                      'Richtig. Nach der Stabilisierung wird die Beatmung am Gerät fortgesetzt und die Situation systematisch überprüft. Zähes Sekret kann auf eine unzureichende Atemgasbefeuchtung hinweisen.',
                  },
                  {
                    text: 'Dauerhaft mit dem Beutel weiterbeatmen',
                    correct: false,
                    feedback:
                      'Nicht sinnvoll. Die manuelle Beatmung ist eine Notfallmaßnahme. Sie ist weder in Volumen noch in Druck präzise kontrolliert und ohne Alarmüberwachung.',
                  },
                ],
              },
            ],
            debrief: `**Take-home-Message:** Bei plötzlicher Verschlechterung eines beatmeten Patienten hilft das **DOPES**-Schema:

- **D** – Dislokation (Displacement): Tubusdislokation (z. B. Extubation, einseitige Intubation)
- **O** – Obstruktion (Obstruction): Verlegung von Tubus oder Atemwegen (Sekret, Knick, Bronchospasmus)
- **P** – Pneumothorax: v. a. Spannungspneumothorax
- **E** – Equipment: Gerät, Schlauchsystem, Gasversorgung, Filter/HME
- **S** – Stacking (Stacked Breaths): Air Trapping / Auto-PEEP

Bei unklarer Ursache gilt: **Patient vom Gerät trennen und manuell mit 100 % O~2~ beatmen.** Ein Beatmungsbeutel mit Maske gehört deshalb an jeden Beatmungsplatz.`,
          },
        },
      ],
    },

    /* ------------------------------------------------------------ */
    {
      id: 'station-quiz',
      title: 'Station 8: Abschlussquiz Training',
      blocks: [
        {
          type: 'text',
          md: `Zum Abschluss der Trainingsrunde: Acht gemischte Fragen, die das Gelernte miteinander verknüpfen. Lies die Erklärungen auch dann, wenn du richtig liegst – sie enthalten oft einen zusätzlichen Praxisbezug.`,
        },
        {
          type: 'quiz',
          title: 'Abschlussquiz Training',
          questions: [
            {
              id: 'vent-l5-vc-resistance',
              kind: 'single',
              prompt:
                'Bei volumenkontrollierter Beatmung steigt P~peak~ von 24 auf 36 cmH~2~O, P~plat~ bleibt bei 20 cmH~2~O. Was ist die wahrscheinlichste Ursache?',
              options: [
                'Erhöhte Resistance, z. B. Sekret oder abgeknickter Tubus',
                'Verminderte Compliance, z. B. Pneumothorax',
                'Leckage am Cuff',
                'Zu niedrig eingestellter PEEP',
              ],
              correct: 0,
              explanation:
                'Steigt nur der Spitzendruck bei unverändertem Plateau, ist der resistive Druckanteil (R · V̇) gestiegen. Bei einer Complianceverschlechterung (z. B. Pneumothorax) würden P~peak~ **und** P~plat~ steigen. Eine Leckage führt eher zu niedrigeren Drücken.',
              topic: 'Kurven & Monitoring',
              difficulty: 2,
            },
            {
              id: 'vent-l5-pc-compliance',
              kind: 'single',
              prompt:
                'Ein Patient wird druckkontrolliert beatmet. Durch ein zunehmendes Lungenödem sinkt die Compliance. Was beobachtest du?',
              options: [
                'Der Spitzendruck steigt stark an',
                'Das Tidalvolumen sinkt bei gleichem Inspirationsdruck',
                'Das Tidalvolumen bleibt gleich, nur die Frequenz sinkt',
                'Der PEEP steigt automatisch an',
              ],
              correct: 1,
              explanation:
                'Bei PC ist der Druck vorgegeben; das Volumen ergibt sich aus V = C · ΔP. Sinkt die Compliance, sinkt bei gleichem Druck das Volumen. Ein Druckanstieg wäre typisch für VC – deshalb sind bei PC die Volumen- bzw. MV-Alarme besonders wichtig.',
              topic: 'Beatmungsformen',
              difficulty: 2,
            },
            {
              id: 'vent-l5-pbw',
              kind: 'numeric',
              prompt:
                'Berechne das lungenprotektive Tidalvolumen (6 ml/kg PBW) für einen Mann mit 172 cm Körpergröße. Runde auf ganze ml.',
              answer: 407,
              tolerance: 10,
              unit: 'ml',
              explanation:
                'PBW (Mann) = 50 + 0,91 · (172 − 152,4) = 50 + 17,8 ≈ 67,8 kg. 6 ml/kg · 67,8 kg ≈ 407 ml. Das tatsächliche Körpergewicht spielt keine Rolle, weil die Lungengröße von Körpergröße und Geschlecht abhängt.',
              topic: 'Parameter',
              difficulty: 2,
            },
            {
              id: 'vent-l5-autopeep',
              kind: 'truefalse',
              prompt:
                'Bei Air Trapping kann eine Erhöhung der Atemfrequenz die CO~2~-Elimination verschlechtern.',
              correct: true,
              explanation:
                'Richtig. Eine höhere Frequenz verkürzt die Exspirationszeit. Bei langer Zeitkonstante (obstruktive Lunge) bleibt dann noch mehr Volumen in der Lunge, der Auto-PEEP steigt, das effektive Tidalvolumen und die alveoläre Ventilation können sinken.',
              topic: 'Klinik',
              difficulty: 2,
            },
            {
              id: 'vent-l5-dopes',
              kind: 'multiple',
              prompt: 'Wofür stehen Buchstaben des DOPES-Schemas? (Mehrere Antworten richtig)',
              options: [
                'D – Dislokation (Displacement) des Tubus',
                'O – Obstruktion (Obstruction), z. B. Verlegung durch Sekret',
                'P – PEEP zu niedrig',
                'E – Equipment (Gerät/Material)',
              ],
              correct: [0, 1, 3],
              explanation:
                'DOPES steht für Dislokation (Displacement), Obstruktion (Obstruction), Pneumothorax, Equipment und Stacking (Stacked Breaths, Auto-PEEP). „P“ steht für **Pneumothorax** – ein Spannungspneumothorax ist eine lebensbedrohliche Ursache plötzlicher Verschlechterung, ein zu niedriger PEEP dagegen nicht.',
              topic: 'Alarme & Sicherheit',
              difficulty: 1,
            },
            {
              id: 'vent-l5-unklar',
              kind: 'single',
              prompt:
                'Ein beatmeter Patient entsättigt plötzlich, die Ursache ist unklar. Was ist die sicherste erste Maßnahme?',
              options: [
                'Alarm stummschalten und abwarten',
                'PEEP schrittweise erhöhen',
                'Vom Gerät trennen und manuell mit 100 % O~2~ beatmen, Hilfe rufen',
                'Tidalvolumen verdoppeln',
              ],
              correct: 2,
              explanation:
                'Die manuelle Beatmung mit 100 % O~2~ schließt das Gerät als Fehlerquelle aus und sichert die Oxygenierung. Gleichzeitig lässt sich am Beutel spüren, ob die Lunge schwer zu beatmen ist. PEEP- oder Volumenänderungen ohne Diagnose können schaden; Stummschalten ohne Handeln ist gefährlich.',
              topic: 'Alarme & Sicherheit',
              difficulty: 1,
            },
            {
              id: 'vent-l5-setup-order',
              kind: 'single',
              prompt: 'Warum wird der Schlauchsystem-Test vor dem Anschluss an den Patienten durchgeführt?',
              options: [
                'Weil er das Gerät aufwärmt',
                'Weil das Gerät dabei Dichtheit und Schlauchcompliance ermittelt, um Leckagen zu erkennen und Volumina korrekt zu kompensieren',
                'Weil er die F~I~O~2~ einstellt',
                'Er ist nur bei Kindern erforderlich',
              ],
              correct: 1,
              explanation:
                'Beim Schlauchsystem-Test prüft das Gerät die Dichtheit und misst die Compliance des Schlauchsystems. Ein Teil des abgegebenen Volumens dehnt sonst nur die Schläuche, statt die Lunge zu erreichen. Der Test ist bei allen Patientengruppen relevant und erfolgt gemäß Gebrauchsanweisung.',
              topic: 'Alarme & Sicherheit',
              difficulty: 2,
            },
            {
              id: 'vent-l5-tau',
              kind: 'numeric',
              prompt:
                'Ein Patient hat eine Resistance von 20 cmH~2~O/(L/s) und eine Compliance von 50 ml/cmH~2~O. Wie viele Sekunden Exspirationszeit braucht er mindestens für eine Entleerung zu etwa 95 % (3 τ)?',
              answer: 3,
              tolerance: 0.1,
              unit: 's',
              explanation:
                'τ = R · C = 20 cmH~2~O/(L/s) · 0,05 L/cmH~2~O = 1,0 s. Für etwa 95 % Entleerung braucht es 3 τ = 3 s. Achtung: Compliance vorher von ml in L umrechnen, sonst ergibt sich ein um den Faktor 1000 falscher Wert.',
              topic: 'Physik',
              difficulty: 3,
            },
          ],
        },
        {
          type: 'callout',
          variant: 'remember',
          title: 'Bereit für die Prüfung?',
          md: 'Wenn du die Stationen sicher gelöst hast, bist du gut vorbereitet. In Lektion 6 wartet der Abschlusstest – mit Auswertung nach Themen und Empfehlungen, welche Lektion du ggf. wiederholen solltest.',
        },
        {
          type: 'sources',
          ids: ['ardsnet', 'amato', 's3-beatmung', 'oczenski', 'larsen', 'tobin', 'mpbetreibv'],
        },
      ],
    },
  ],
};
