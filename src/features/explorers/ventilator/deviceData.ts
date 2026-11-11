/**
 * Inhalte des Geräte-Explorers „Intensivrespirator“.
 * Texte nutzen Mini-Markdown (z. B. F~I~O~2~, cmH~2~O, **fett**).
 * Gerätespezifische Werte immer gemäß Gebrauchsanweisung des Herstellers.
 */
import type { IconName } from '@/components/ui';

export type VentCategory = 'gas' | 'pneumatik' | 'sensorik' | 'patient' | 'steuerung';

export type VentComponentId =
  | 'gas-supply'
  | 'blender'
  | 'insp-valve'
  | 'o2-sensor'
  | 'safety-valve'
  | 'insp-flow-sensor'
  | 'pressure-sensor'
  | 'filter'
  | 'humidifier'
  | 'insp-limb'
  | 'y-piece'
  | 'patient'
  | 'exp-limb'
  | 'exp-valve'
  | 'exp-flow-sensor'
  | 'control-unit'
  | 'ui-monitor'
  | 'power';

export interface CategoryInfo {
  id: VentCategory;
  label: string;
  /** CSS-Variable (Design-Token) für die Gruppenfarbe */
  color: string;
  icon: IconName;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'gas', label: 'Gasversorgung', color: 'var(--c-primary-600)', icon: 'wind' },
  { id: 'pneumatik', label: 'Pneumatik', color: 'var(--c-accent-500)', icon: 'valve' },
  { id: 'sensorik', label: 'Sensorik', color: 'var(--c-xp)', icon: 'gauge' },
  { id: 'patient', label: 'Patientensystem', color: 'var(--c-success)', icon: 'lungs' },
  { id: 'steuerung', label: 'Steuerung & Sicherheit', color: 'var(--c-warning)', icon: 'cpu' },
];

export const CATEGORY_BY_ID: Record<VentCategory, CategoryInfo> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<VentCategory, CategoryInfo>;

export interface VentComponent {
  id: VentComponentId;
  /** Vollständiger Name (Mini-Markdown erlaubt) */
  name: string;
  /** Kurzlabel für die Grafik (reiner Text, Unicode) */
  short: string;
  category: VentCategory;
  icon: IconName;
  /** Was macht es? */
  what: string;
  /** Wie funktioniert es? */
  how: string;
  /** Warum wichtig? */
  why: string;
  /** Typischer Fehler & Alarm */
  failure: string;
  /** Fachbegriff(e) */
  term: string;
}

export const VENT_COMPONENTS: VentComponent[] = [
  {
    id: 'gas-supply',
    name: 'Gasanschlüsse O~2~ / Druckluft',
    short: 'Gasanschlüsse',
    category: 'gas',
    icon: 'plug',
    what:
      'Versorgen das Beatmungsgerät mit medizinischem Sauerstoff und medizinischer Druckluft – in der Regel aus der zentralen Gasversorgung über Wandentnahmestellen, alternativ aus Druckgasflaschen. Manche Geräte erzeugen die Druckluft mit einer internen Turbine selbst.',
    how:
      'Die Schläuche werden über **gasartspezifische, unverwechselbare Kupplungen** angeschlossen und sind farblich gekennzeichnet (nach ISO 32: O~2~ weiß, Druckluft schwarz/weiß). Der Versorgungsdruck liegt typischerweise bei **ca. 5 bar**. Im Gerät halten Eingangsfilter Partikel zurück, Rückschlagventile verhindern ein Rückströmen von einer Gasart in die andere, und Druckminderer stellen einen konstanten internen Arbeitsdruck her.',
    why:
      'Ohne stabile Gasversorgung kann das Gerät weder Volumen abgeben noch die eingestellte Sauerstoffkonzentration mischen. Verwechslungssichere Anschlüsse verhindern lebensgefährliche Fehlkonnektionen.',
    failure:
      'Druckabfall oder Ausfall einer Gasart löst einen Alarm wie „O~2~-Versorgungsdruck niedrig“ oder „Druckluftversorgung ausgefallen“ aus. Viele Geräte beatmen dann mit dem verbliebenen Gas weiter (z. B. mit 100 % O~2~ bei Druckluftausfall). Für den Notfall: Beatmungsbeutel und O~2~-Flasche griffbereit halten.',
    term: '**Zentrale Gasversorgung (ZGV)**, gasartspezifische Steckkupplung, Druckminderer',
  },
  {
    id: 'blender',
    name: 'Gasmischer (Blender)',
    short: 'Gasmischer',
    category: 'gas',
    icon: 'sliders',
    what:
      'Mischt Sauerstoff und Druckluft so, dass die eingestellte inspiratorische Sauerstofffraktion F~I~O~2~ (0,21 bis 1,0) erreicht wird.',
    how:
      'In modernen Intensivrespiratoren dosieren **zwei elektronisch angesteuerte Proportionalventile** – eines je Gasart – die Teilflüsse. Die Steuereinheit berechnet das Verhältnis: F~I~O~2~ = (V̇~O2~ · 1,0 + V̇~Luft~ · 0,21) / (V̇~O2~ + V̇~Luft~). Bei vielen Geräten übernehmen diese Mischventile zugleich die Flussdosierung. Ältere oder einfache Geräte nutzen mechanische Mischer.',
    why:
      'Eine zu niedrige F~I~O~2~ führt zur Hypoxämie, eine unnötig hohe F~I~O~2~ fördert Resorptionsatelektasen und oxidativen Stress. Die Mischung muss daher präzise und stabil sein.',
    failure:
      'Abweichungen erkennt der unabhängig messende O~2~-Sensor: Alarm „F~I~O~2~ hoch“ bzw. „F~I~O~2~ niedrig“. Ursachen können ein defektes Mischventil, eine Versorgungsstörung oder ein verbrauchter O~2~-Sensor sein.',
    term: '**F~I~O~2~** (inspiratorische Sauerstofffraktion), Proportionalventil',
  },
  {
    id: 'insp-valve',
    name: 'Inspirationsventil (Flusssteuerventil)',
    short: 'Insp.-Ventil',
    category: 'pneumatik',
    icon: 'valve',
    what:
      'Gibt den Inspirationsfluss frei und dosiert ihn: Es bestimmt Höhe und Form des Flusses (z. B. konstant oder dezelerierend) bzw. regelt den Fluss so, dass ein vorgegebener Druck erreicht wird.',
    how:
      'Ein **Proportionalventil** (meist elektromagnetisch betätigt) kann seinen Öffnungsquerschnitt innerhalb von Millisekunden verändern. In einem **geschlossenen Regelkreis** vergleicht die Steuereinheit den Sollwert (Flow bzw. Druck) mit den Messwerten der Flow- und Drucksensoren und passt die Ventilstellung laufend an. In der Exspiration ist es geschlossen bzw. liefert nur einen kleinen Basisflow für die Flow-Triggerung.',
    why:
      'Es ist das zentrale Stellglied der Gasdosierung: Im volumenkontrollierten Modus erzeugt es den eingestellten konstanten Flow, im druckkontrollierten Modus genau so viel Flow, dass der Zieldruck gehalten wird.',
    failure:
      'Ein klemmendes oder falsch regelndes Ventil führt zu zu geringem oder zu hohem Volumen. Typische Alarme: „Minutenvolumen niedrig“, „Atemwegsdruck niedrig“ oder ein technischer Alarm. Das Gerät führt vor Inbetriebnahme einen Selbsttest durch.',
    term: '**Proportionalventil**, Flowregelung, Regelkreis (Closed Loop)',
  },
  {
    id: 'o2-sensor',
    name: 'O~2~-Sensor',
    short: 'O₂-Sensor',
    category: 'sensorik',
    icon: 'activity',
    what:
      'Misst kontinuierlich die Sauerstoffkonzentration im Inspirationsgas und überwacht damit unabhängig vom Gasmischer die tatsächlich verabreichte F~I~O~2~.',
    how:
      '**Galvanische (elektrochemische) Zelle:** Sauerstoff wird an der Kathode reduziert; der entstehende Strom ist proportional zum O~2~-Partialdruck. Die Zelle verbraucht sich und muss regelmäßig getauscht werden. **Paramagnetischer Sensor:** Nutzt die Eigenschaft von O~2~, von einem Magnetfeld angezogen zu werden – schnell und nicht verbrauchend. Beide Verfahren erfordern eine regelmäßige Kalibrierung (z. B. mit 21 % und 100 % O~2~).',
    why:
      'Die Gerätenorm für Intensivbeatmungsgeräte sieht eine Überwachung der O~2~-Konzentration mit Alarm vor. Nur eine unabhängige Messung erkennt Fehler der Gasmischung oder der Gasversorgung zuverlässig.',
    failure:
      'Eine verbrauchte galvanische Zelle liefert driftende oder zu niedrige Werte. Alarme: „O~2~-Sensor kalibrieren“, „O~2~-Sensor defekt“ oder „F~I~O~2~ hoch/niedrig“. Ein deaktiviertes O~2~-Monitoring ist ein Sicherheitsrisiko.',
    term: '**Galvanische Zelle**, Paramagnetismus, Kalibrierung',
  },
  {
    id: 'safety-valve',
    name: 'Sicherheits-/Überdruckventil & Notatmungsventil',
    short: 'Sicherheitsventil',
    category: 'steuerung',
    icon: 'alert',
    what:
      'Begrenzt den Druck im Beatmungssystem unabhängig von der Software und ermöglicht der Patientin bzw. dem Patienten bei einem Geräteausfall, Raumluft ein- und auszuatmen.',
    how:
      'Das **Überdruckventil** öffnet mechanisch, sobald ein fester, gerätespezifischer Maximaldruck überschritten wird – deutlich oberhalb der einstellbaren Druckalarmgrenze. Das **Notatmungsventil** (Anti-Suffokationsventil) öffnet bei Unterdruck, wenn die Patientin oder der Patient einatmet, das Gerät aber kein Gas liefert. Bei einem schweren Gerätefehler wird das System zur Umgebung hin geöffnet („Ambient-Zustand“).',
    why:
      'Es ist die letzte, rein mechanische Schutzbarriere gegen Barotrauma durch Überdruck und gegen Ersticken bei Totalausfall – also genau dann, wenn die Elektronik nicht mehr zuverlässig arbeitet.',
    failure:
      'Öffnet das Sicherheitsventil wegen eines Gerätefehlers, meldet das Gerät einen technischen Alarm hoher Priorität (z. B. „Gerät außer Betrieb“). Dann sofort manuell mit dem Beatmungsbeutel weiterbeatmen. Ein undichtes Sicherheitsventil zeigt sich im Selbsttest als Leckage.',
    term: '**Überdruckventil**, Anti-Suffokationsventil, Ambient-Ventil',
  },
  {
    id: 'insp-flow-sensor',
    name: 'Inspiratorischer Flowsensor',
    short: 'Flowsensor insp.',
    category: 'sensorik',
    icon: 'wind',
    what:
      'Misst den Gasfluss (Flow, V̇), den das Gerät in Richtung Patient:in abgibt. Daraus werden das inspiratorische Tidalvolumen und die Regelgröße für das Inspirationsventil gewonnen.',
    how:
      'Häufig nach dem Prinzip der **Hitzdraht-Anemometrie**: Ein beheizter Draht wird vom vorbeiströmenden Gas gekühlt; die zum Halten der Temperatur nötige Heizleistung ist ein Maß für den Massenfluss. Alternativ **Differenzdruckverfahren**: Ein definierter Strömungswiderstand erzeugt einen Druckabfall, der vom Flow abhängt. Das Volumen ergibt sich als Integral des Flows über die Zeit (V = ∫V̇ dt).',
    why:
      'Ohne genaue Flowmessung keine präzise Volumenabgabe. Der Vergleich mit dem exspiratorischen Flowsensor zeigt zudem Leckagen im System an.',
    failure:
      'Verschmutzung, Feuchtigkeit oder ein defekter Sensor führen zu Fehlmessungen. Alarme: „Flowsensor kalibrieren“, „Flowmessung gestört“ oder unplausible Volumina.',
    term: '**Flow (V̇)** in L/min, Hitzdraht-Anemometer, Pneumotachograf',
  },
  {
    id: 'pressure-sensor',
    name: 'Drucksensoren (Atemwegsdruck)',
    short: 'Drucksensoren',
    category: 'sensorik',
    icon: 'gauge',
    what:
      'Messen kontinuierlich den Atemwegsdruck P~aw~ – daraus werden Spitzendruck, Plateaudruck, PEEP und Mitteldruck bestimmt. Drucksignale dienen außerdem der Triggerung und der Druckbegrenzung.',
    how:
      'Meist **piezoresistive Membransensoren**: Der Druck verformt eine dünne Membran, deren Widerstandsänderung in einer Messbrücke ausgewertet wird. Üblich sind redundante Sensoren im Inspirations- und Exspirationszweig; manche Geräte messen zusätzlich proximal am Y-Stück. Ein regelmäßiger Nullabgleich gegen Umgebungsdruck sichert die Genauigkeit.',
    why:
      'Der Druck ist die zentrale Sicherheitsgröße: Bei druckkontrollierter Beatmung ist er Regelgröße, bei Volumenkontrolle zeigt er Veränderungen von Resistance und Compliance an. Ziel der lungenprotektiven Beatmung: Plateaudruck ≤ 30 cmH~2~O.',
    failure:
      'Alarm „Atemwegsdruck hoch“ (z. B. Husten, Sekret, abgeknickter Tubus) führt zum sofortigen Abbruch der Inspiration. „Atemwegsdruck niedrig“ deutet auf Diskonnektion oder Leckage hin. Ein Sensordefekt erzeugt einen technischen Alarm.',
    term: '**Atemwegsdruck P~aw~**, Spitzendruck P~peak~, Plateaudruck P~plat~',
  },
  {
    id: 'filter',
    name: 'Bakterien-/Virenfilter',
    short: 'Filter',
    category: 'patient',
    icon: 'filter',
    what:
      'Hält Bakterien, Viren und Partikel zurück und schützt so Patient:in und Gerät vor Kreuzkontamination.',
    how:
      'Mechanisch wirkende (hydrophobe Membran) oder elektrostatisch geladene Filtermedien fangen Mikroorganismen ab. Filter sitzen typischerweise am Inspirationsausgang und vor dem Exspirationseingang des Geräts. Als **HMEF** kombiniert man Filter und passiven Wärme-Feuchte-Austauscher patientennah.',
    why:
      'Hygiene ist auf der Intensivstation essenziell. Der exspiratorische Filter schützt zudem Exspirationsventil und Flowsensor vor Sekret und Feuchtigkeit.',
    failure:
      'Ein durchfeuchteter oder mit Sekret bzw. Aerosol belegter Filter erhöht den Strömungswiderstand deutlich: Die Ausatmung wird behindert, es drohen Air-Trapping und ein unbeabsichtigter intrinsischer PEEP. Alarm meist „Atemwegsdruck hoch“. Filter nach Herstellerangabe wechseln.',
    term: '**HMEF** (Heat and Moisture Exchanging Filter), Strömungswiderstand',
  },
  {
    id: 'humidifier',
    name: 'Atemgasbefeuchter (aktiv) bzw. HME',
    short: 'Befeuchter',
    category: 'patient',
    icon: 'droplet',
    what:
      'Erwärmt und befeuchtet das trockene, kalte Gas aus der Gasversorgung – denn Tubus oder Trachealkanüle umgehen Nase und Rachen, die das Atemgas normalerweise klimatisieren.',
    how:
      '**Aktiver Befeuchter:** Das Gas strömt über eine beheizte Wasserkammer und nimmt Wasserdampf auf; beheizte Schläuche verhindern Kondensation. Angestrebt wird nahe der Körpertemperatur bei voller Sättigung. **Passiver HME** („künstliche Nase“): speichert Wärme und Feuchte der Ausatemluft und gibt sie bei der nächsten Einatmung zurück – erhöht aber Totraum und Widerstand.',
    why:
      'Unzureichend klimatisiertes Gas schädigt die Schleimhaut, beeinträchtigt die mukoziliäre Clearance und dickt Sekret ein – bis hin zur Verlegung des Tubus.',
    failure:
      'Wassermangel oder Temperaturfehler lösen Befeuchter-Alarme aus. Kondenswasser im Schlauch kann Autotriggerung und Flow-Artefakte verursachen. **Nie** einen HME gleichzeitig mit einem aktiven Befeuchter verwenden – der durchnässte HME kann den Atemweg massiv verlegen.',
    term: '**Absolute Feuchte** (mg/l), HME (Heat and Moisture Exchanger)',
  },
  {
    id: 'insp-limb',
    name: 'Inspirationsschenkel',
    short: 'Insp.-Schenkel',
    category: 'patient',
    icon: 'arrowRight',
    what: 'Führt das klimatisierte Frischgas vom Gerät bzw. Befeuchter zum Y-Stück.',
    how:
      'Flexibler Faltenschlauch (Einweg oder aufbereitbar), oft mit integriertem Heizdraht und Temperatursonde nahe dem Y-Stück. Unter Druck dehnt sich der Schlauch etwas: Ein kleiner Teil des abgegebenen Volumens bleibt im Schlauchsystem (**Schlauchcompliance**). Viele Geräte bestimmen diese im Selbsttest und kompensieren sie.',
    why:
      'Nur ein dichtes, korrekt konnektiertes und richtig ausgewähltes Schlauchsystem (Erwachsene, Kinder, Neonaten) gewährleistet, dass das eingestellte Volumen tatsächlich die Lunge erreicht.',
    failure:
      'Diskonnektion oder Leckage: Alarme „Diskonnektion“, „Atemwegsdruck niedrig“, „Minutenvolumen niedrig“. Nach jedem Systemwechsel den Geräteselbsttest durchführen.',
    term: '**Schlauchcompliance** (compressible volume), Faltenschlauch',
  },
  {
    id: 'y-piece',
    name: 'Y-Stück (ggf. mit proximalem Flowsensor)',
    short: 'Y-Stück',
    category: 'patient',
    icon: 'shuffle',
    what:
      'Verbindet Inspirations- und Exspirationsschenkel mit dem Patientenanschluss (Tubus bzw. Trachealkanüle).',
    how:
      'Y-förmiges Verbindungsstück mit genormten Konen (15/22 mm). Zwischen Y-Stück und Tubus kann ein **proximaler Flowsensor** sitzen, der patientennah misst – besonders wichtig in Pädiatrie und Neonatologie. Alles zwischen Y-Stück und Patient:in (Sensor, Filter, Winkelstück) ist **apparativer Totraum**: Dieses Gas wird bei jedem Atemzug hin- und herbewegt.',
    why:
      'Apparativer Totraum vermindert die alveoläre Ventilation V̇~A~ = (V~T~ − V~D~) · f und begünstigt einen CO~2~-Anstieg – gerade bei kleinen Tidalvolumina. Zubehör am Y-Stück daher bewusst minimieren.',
    failure:
      'Häufigste Stelle für Diskonnektionen (Lagerung, Transport): Alarm „Diskonnektion“ bzw. „Atemwegsdruck niedrig“. Ein verschmutzter proximaler Flowsensor liefert falsche Volumina.',
    term: '**Apparativer Totraum**, proximaler Flowsensor, Konus 15/22 mm',
  },
  {
    id: 'patient',
    name: 'Endotrachealtubus/Trachealkanüle & Lunge',
    short: 'Patient:in',
    category: 'patient',
    icon: 'lungs',
    what:
      'Der künstliche Atemweg verbindet das Beatmungssystem dicht mit der Lunge – dem Zielorgan der Beatmung.',
    how:
      'Die Blockmanschette (**Cuff**) des Tubus dichtet die Trachea ab und ermöglicht Überdruckbeatmung. Vereinfacht verhält sich das respiratorische System wie ein Widerstand R (Atemwege + Tubus) in Reihe mit einer Dehnbarkeit C (Lunge + Thoraxwand): P~aw~ = PEEP + V/C + R · V̇. Beatmete Erwachsene haben typischerweise eine Compliance von ca. 50–100 ml/cmH~2~O, im ARDS oft < 40 ml/cmH~2~O. Der Tubus trägt erheblich zur Resistance bei – je kleiner sein Innendurchmesser, desto höher.',
    why:
      'Lungenprotektive Beatmung: V~T~ ≈ 6 ml/kg Standardkörpergewicht (PBW), Plateaudruck ≤ 30 cmH~2~O, Driving Pressure ΔP = P~plat~ − PEEP möglichst ≤ 15 cmH~2~O. Konkrete Einstellungen immer nach ärztlicher Anordnung und lokalen Standards.',
    failure:
      'Tubusdislokation, Cuff-Leck, Sekretverlegung oder Abknicken: Alarme „Atemwegsdruck hoch“, „Tidalvolumen/Minutenvolumen niedrig“, „Leckage“. Bei unklarer Lage: Patient:in zuerst manuell beatmen und Atemweg prüfen.',
    term: '**Compliance C** (ml/cmH~2~O), **Resistance R** (cmH~2~O/(L/s)), Cuff',
  },
  {
    id: 'exp-limb',
    name: 'Exspirationsschenkel',
    short: 'Exsp.-Schenkel',
    category: 'patient',
    icon: 'arrowLeft',
    what: 'Leitet das Ausatemgas vom Y-Stück zurück zum Gerät – zum exspiratorischen Flowsensor und zum Exspirationsventil.',
    how:
      'Faltenschlauch, je nach System beheizt oder mit Wasserfalle zum Sammeln von Kondensat. Vor dem Gerät sitzt häufig ein exspiratorischer Filter. Weil das Ausatemgas warm und feucht ist, kondensiert hier besonders viel Wasser.',
    why:
      'Erst die Rückführung zum Gerät erlaubt die Messung des exspiratorischen Volumens und die geregelte Druckentlastung auf PEEP-Niveau.',
    failure:
      'Kondenswasser erhöht den Widerstand und erzeugt „zitternde“ Flowkurven bis hin zur Autotriggerung. Diskonnektion: Alarm „Diskonnektion“ bzw. „Minutenvolumen niedrig“. Kondensat stets vom Patienten weg ableiten.',
    term: '**Wasserfalle**, Kondensat, Exspirationsschenkel',
  },
  {
    id: 'exp-valve',
    name: 'Exspirationsventil (PEEP-Ventil)',
    short: 'Exsp.-Ventil',
    category: 'pneumatik',
    icon: 'valve',
    what:
      'Bleibt während der Inspiration geschlossen, öffnet in der Exspiration und hält am Ende der Ausatmung den eingestellten PEEP aufrecht.',
    how:
      'Meist ein **Membranventil** mit elektromagnetischem Antrieb. Die Steuereinheit regelt die Schließkraft so, dass der Druck im System nicht unter den PEEP fällt. **Aktive** Exspirationsventile können auch während der Inspiration fein öffnen: Sie lassen Spontanatmung auf beiden Druckniveaus zu (z. B. BIPAP/APRV) und bauen Überdruck kontrolliert ab.',
    why:
      'Der PEEP hält Alveolen offen und verbessert die Oxygenierung. Fällt das Ventil aus, droht entweder ein PEEP-Verlust (Derekrutierung, Hypoxämie) oder – bei blockiertem Ventil – eine behinderte Ausatmung mit gefährlichem Druckanstieg.',
    failure:
      'Alarme: „PEEP hoch/niedrig“, „Atemwegsdruck hoch“, „Exspirationsventil-Fehler“. Häufige Ursache nach der Aufbereitung: falsch montierte Membran – daher immer den Selbsttest durchführen.',
    term: '**PEEP** (positive end-exspiratory pressure), Membranventil',
  },
  {
    id: 'exp-flow-sensor',
    name: 'Exspiratorischer Flowsensor',
    short: 'Flowsensor exsp.',
    category: 'sensorik',
    icon: 'wind',
    what:
      'Misst den exspiratorischen Flow und daraus das exspiratorische Tidalvolumen V~Te~ – den wichtigsten Volumen-Monitoringwert.',
    how:
      'Gleiche Messprinzipien wie inspiratorisch (z. B. Hitzdraht oder Differenzdruck), angeordnet vor bzw. am Exspirationsventil. Aus dem Vergleich von inspiratorischem und exspiratorischem Volumen (V~Ti~ − V~Te~) berechnet das Gerät die **Leckage**.',
    why:
      'Das exspiratorische Volumen zeigt, was tatsächlich aus der Lunge zurückkam. Es ist Grundlage für den Minutenvolumen-Alarm (MV = V~T~ · f) und erkennt Lecks an Cuff, Schlauchsystem oder Thoraxdrainagen.',
    failure:
      'Sekret, Feuchtigkeit oder Medikamentenaerosol (Vernebler) verfälschen die Messung. Alarme: „Minutenvolumen niedrig“, „Leckage hoch“, „Flowsensor defekt/kalibrieren“.',
    term: '**V~Te~** (exspiratorisches Tidalvolumen), Leckagekompensation',
  },
  {
    id: 'control-unit',
    name: 'Steuer- und Regeleinheit',
    short: 'Steuereinheit',
    category: 'steuerung',
    icon: 'cpu',
    what:
      'Das „Gehirn“ des Respirators: Sie setzt die Einstellungen in Sollwerte um, steuert die Ventile, verarbeitet alle Sensorsignale und überwacht die Beatmung.',
    how:
      'Mikroprozessoren arbeiten in einem **geschlossenen Regelkreis**: messen (Flow, Druck, O~2~) → mit dem Sollwert vergleichen → Stellgröße an Inspirations- und Exspirationsventil ausgeben – im Takt weniger Millisekunden. Sicherheitskritische Geräte nutzen oft getrennte Prozessoren für Steuerung und Überwachung sowie einen Watchdog, der Fehlfunktionen erkennt.',
    why:
      'Nur eine schnelle, präzise Regelung ermöglicht Beatmungsformen wie VC, PC, Triggerung und patientensynchrone Unterstützung.',
    failure:
      'Erkennt die Eigenüberwachung einen Fehler, gibt das Gerät einen technischen Alarm hoher Priorität aus und geht in einen sicheren Zustand: Das Sicherheitsventil öffnet, Spontanatmung aus Raumluft bleibt möglich. Sofort manuell beatmen und Ersatzgerät bereitstellen.',
    term: '**Regelkreis** (Closed Loop Control), Watchdog, Selbsttest',
  },
  {
    id: 'ui-monitor',
    name: 'Bedien- und Anzeigeeinheit inkl. Alarmsystem',
    short: 'Bedien-/Anzeigeeinheit',
    category: 'steuerung',
    icon: 'monitor',
    what:
      'Schnittstelle zwischen Mensch und Gerät: Einstellung von Modus und Parametern, Anzeige von Messwerten und Kurven sowie Management aller Alarme.',
    how:
      'Touchscreen und Drehknopf zum Einstellen und Bestätigen. Kurven von Druck, Flow und Volumen über die Zeit sowie Loops machen die Atemmechanik sichtbar. Das Alarmsystem folgt IEC 60601-1-8 mit drei Prioritäten: **hoch** (rot, blinkend), **mittel** (gelb, blinkend), **niedrig** (gelb oder cyan, dauerhaft). Akustische Alarme lassen sich nur zeitlich begrenzt stummschalten.',
    why:
      'Bedienfehler und falsch gesetzte Alarmgrenzen sind relevante Fehlerquellen. Sinnvoll angepasste Grenzen vermeiden Fehlalarme und damit Alarmmüdigkeit.',
    failure:
      'Ein Display- oder Bedienfehler löst einen technischen Alarm aus; die Beatmung läuft je nach Gerät mit den letzten Einstellungen weiter. Patient:in klinisch überwachen und Gerätetausch organisieren.',
    term: '**Alarmpriorität**, Alarmgrenzen, Alarmmüdigkeit (Alarm Fatigue)',
  },
  {
    id: 'power',
    name: 'Netzteil & Notstromakku',
    short: 'Netzteil/Akku',
    category: 'steuerung',
    icon: 'battery',
    what:
      'Versorgt Elektronik, Ventile und ggf. Turbine mit Energie. Der Akku überbrückt Netzausfälle und ermöglicht den innerklinischen Transport.',
    how:
      'Das Netzteil wandelt die Netzspannung (230 V Wechselspannung) in die benötigten Gleichspannungen. Fällt das Netz aus, übernimmt der interne – teils zusätzlich ein externer, wechselbarer – Akku **unterbrechungsfrei**. Die Laufzeit ist gerätespezifisch und hängt von Ladezustand, Alter und Last ab.',
    why:
      'Beatmung ist lebenserhaltend: Eine Unterbrechung der Energieversorgung darf nicht zum Stillstand führen. Deshalb Gerät stets am Netz betreiben und den Akku geladen halten.',
    failure:
      'Alarme „Netzausfall – Akkubetrieb“ und „Akku schwach“. Gealterte Akkus verlieren Kapazität – Prüfungen nach Herstellervorgaben und im Rahmen der sicherheitstechnischen Kontrollen nach MPBetreibV.',
    term: '**Unterbrechungsfreie Stromversorgung**, Akkulaufzeit',
  },
];

export const COMPONENT_BY_ID: Record<VentComponentId, VentComponent> = Object.fromEntries(
  VENT_COMPONENTS.map((c) => [c.id, c]),
) as Record<VentComponentId, VentComponent>;

/** Reihenfolge der Komponenten entlang des Gasweges */
export const INSP_PATH_IDS: VentComponentId[] = [
  'gas-supply',
  'blender',
  'insp-valve',
  'o2-sensor',
  'insp-flow-sensor',
  'pressure-sensor',
  'filter',
  'humidifier',
  'insp-limb',
  'y-piece',
  'patient',
];

export const EXP_PATH_IDS: VentComponentId[] = ['patient', 'y-piece', 'exp-limb', 'exp-flow-sensor', 'exp-valve'];
