/**
 * Fälle für den Kurvendetektiv. Kurven werden zur Laufzeit aus dem Modell
 * erzeugt (Fall vs. Referenz mit lungengesundem Patienten).
 */
import { DEFAULT_SETTINGS, PATIENT_PRESETS, type PatientParams, type VentSettings } from './model';

export interface CurveOption {
  id: string;
  text: string;
  correct?: boolean;
  /** Begründung, warum richtig/falsch */
  why: string;
}

export interface CurveCase {
  id: string;
  /** kurzer Kontext (Modus, Einstellungen) */
  context: string;
  question: string;
  settings: VentSettings;
  patient: PatientParams;
  refSettings: VentSettings;
  refPatient: PatientParams;
  options: CurveOption[];
  /** Merksatz nach Auflösung */
  takeaway: string;
}

const healthy = PATIENT_PRESETS.gesund.params;
const vcBase: VentSettings = { ...DEFAULT_SETTINGS, mode: 'VC', vt_ml: 500, rr_per_min: 12, peep_cmH2O: 5, ti_s: 1.0, pause_s: 0.3, pmax_cmH2O: 60 };
const pcBase: VentSettings = { ...DEFAULT_SETTINGS, mode: 'PC', pinsp_above_peep_cmH2O: 15, rr_per_min: 12, peep_cmH2O: 5, ti_s: 1.0, pause_s: 0, pmax_cmH2O: 60 };

export const CURVE_CASES: CurveCase[] = [
  {
    id: 'resistance',
    context: 'VC · VT 500 ml · f 12/min · Ti 1,0 s mit Pause 0,3 s',
    question: 'Der Spitzendruck ist deutlich gestiegen. Was ist die wahrscheinlichste Ursache?',
    settings: vcBase,
    patient: { ...healthy, resistance_cmH2O_per_L_s: 25 },
    refSettings: vcBase,
    refPatient: healthy,
    options: [
      { id: 'r', text: 'Erhöhte Resistance (z. B. Sekret, Bronchospasmus, abgeknickter Tubus)', correct: true, why: 'Nur Ppeak steigt, das Plateau bleibt gleich: Die Differenz Ppeak − Pplat (= R · V̇) ist größer geworden.' },
      { id: 'c', text: 'Verminderte Compliance', why: 'Dann wären Ppeak UND Pplat gestiegen. Hier ist das Plateau unverändert.' },
      { id: 'leak', text: 'Leckage im System', why: 'Ein Leck senkt eher die Drücke und das exspiratorische Volumen.' },
      { id: 'peep', text: 'Erhöhter PEEP', why: 'Der PEEP würde die gesamte Kurve inklusive Basislinie anheben – die Basislinie ist unverändert.' },
    ],
    takeaway: 'Ppeak ↑ bei gleichem Pplat → Resistance-Problem. Ppeak ↑ UND Pplat ↑ → Compliance-Problem.',
  },
  {
    id: 'compliance',
    context: 'VC · VT 500 ml · f 12/min · Ti 1,0 s mit Pause 0,3 s',
    question: 'Spitzen- und Plateaudruck sind beide gestiegen, der Abstand zwischen ihnen ist gleich geblieben. Was liegt vor?',
    settings: vcBase,
    patient: { ...healthy, compliance_ml_per_cmH2O: 25 },
    refSettings: vcBase,
    refPatient: healthy,
    options: [
      { id: 'c', text: 'Verminderte Compliance (z. B. ARDS, Pneumothorax, Atelektase, Lagerung)', correct: true, why: 'Der elastische Anteil VT/C ist gewachsen: Plateau und Spitze steigen gemeinsam, R · V̇ bleibt gleich.' },
      { id: 'r', text: 'Erhöhte Resistance', why: 'Dann würde vor allem der Abstand Ppeak − Pplat wachsen, nicht das Plateau.' },
      { id: 'peep', text: 'PEEP wurde erhöht', why: 'Die Basislinie (PEEP) ist unverändert – nur das Plateau liegt höher.' },
      { id: 'leak', text: 'Leckage', why: 'Ein Leck führt nicht zu höheren Drücken.' },
    ],
    takeaway: 'Bei VC zeigt der Plateaudruck die Dehnbarkeit: ΔP = VT / C.',
  },
  {
    id: 'autopeep',
    context: 'VC · VT 500 ml · f 24/min · Ti 1,0 s · obstruktive Lunge',
    question: 'Schau dir die Flowkurve am Ende der Exspiration genau an. Was passiert?',
    settings: { ...vcBase, rr_per_min: 24, pause_s: 0 },
    patient: PATIENT_PRESETS.obstruktiv.params,
    refSettings: { ...vcBase, rr_per_min: 24, pause_s: 0 },
    refPatient: healthy,
    options: [
      { id: 'auto', text: 'Air Trapping mit intrinsischem PEEP (Auto-PEEP)', correct: true, why: 'Der exspiratorische Flow erreicht vor dem nächsten Atemzug nicht null – die Lunge entleert sich nicht vollständig (Te < 3 τ).' },
      { id: 'leak', text: 'Leckage', why: 'Ein Leck zeigt sich vor allem an der Volumenkurve (keine Rückkehr zur Nulllinie) und VTe < VTi.' },
      { id: 'trig', text: 'Spontane Atemanstrengung des Patienten', why: 'Dann sähe man einen negativen Druckausschlag vor dem Atemzug.' },
      { id: 'c', text: 'Erhöhte Compliance', why: 'Eine höhere Compliance würde die Drücke senken; das Muster am Exspirationsende erklärt sie nicht.' },
    ],
    takeaway: 'Exspiratorischer Flow erreicht nicht die Nulllinie → Auto-PEEP. Abhilfe: Te verlängern (f ↓, Ti ↓), Obstruktion behandeln.',
  },
  {
    id: 'leak',
    context: 'VC · VT 500 ml · f 12/min · Ti 1,0 s',
    question: 'Die Volumenkurve fällt nach jedem Atemzug nicht auf die Nulllinie zurück. Was ist die Ursache?',
    settings: { ...vcBase, pause_s: 0 },
    patient: { ...healthy, leak_fraction: 0.3 },
    refSettings: { ...vcBase, pause_s: 0 },
    refPatient: healthy,
    options: [
      { id: 'leak', text: 'Leckage (z. B. Cuff undicht, Diskonnektion, Schlauchsystem)', correct: true, why: 'Ein Teil des inspirierten Volumens kommt nicht über den Exspirationsschenkel zurück: VTe < VTi, die Volumenkurve springt zu Beginn des nächsten Atemzugs auf null.' },
      { id: 'auto', text: 'Auto-PEEP', why: 'Bei Auto-PEEP endet der exspiratorische Flow abrupt vor dem nächsten Atemzug – hier fällt der Flow auf null.' },
      { id: 'r', text: 'Erhöhte Resistance', why: 'Erhöhte Resistance würde den Spitzendruck anheben.' },
      { id: 'c', text: 'Verminderte Compliance', why: 'Dann wären die Drücke gestiegen – sie sind hier eher niedriger.' },
    ],
    takeaway: 'Volumenkurve kehrt nicht zur Nulllinie zurück + VTe < VTi → Leck suchen (Cuffdruck, Verbindungen).',
  },
  {
    id: 'trigger',
    context: 'VC · VT 500 ml · f 12/min · Ti 1,0 s',
    question: 'Vor jedem Atemzug zeigt die Druckkurve einen kleinen Einbruch unter den PEEP. Was bedeutet das?',
    settings: { ...vcBase, pause_s: 0 },
    patient: { ...healthy, effort_cmH2O: 3 },
    refSettings: { ...vcBase, pause_s: 0 },
    refPatient: healthy,
    options: [
      { id: 'trig', text: 'Der Patient triggert – eigene Inspirationsanstrengung löst den Atemzug aus', correct: true, why: 'Die Inspirationsanstrengung senkt den Atemwegsdruck kurz unter PEEP, ein kleiner Inspirationsflow beginnt – das Gerät erkennt den Trigger.' },
      { id: 'leak', text: 'Leckage', why: 'Ein Leck zeigt sich an der Volumenkurve und am PEEP-Verlust, nicht als kurzer Einbruch vor jedem Atemzug.' },
      { id: 'water', text: 'Kondenswasser im Schlauch', why: 'Wasser oder Sekret erzeugen eher sägezahnartige Oszillationen im Flow.' },
      { id: 'auto', text: 'Auto-PEEP', why: 'Auto-PEEP erkennt man am exspiratorischen Flow, der nicht auf null zurückgeht.' },
    ],
    takeaway: 'Negativer Druckausschlag vor dem Atemzug = Patiententrigger. Ein tiefer, langer Einbruch kann auf zu unempfindlichen Trigger oder zu niedrigen Flow hinweisen.',
  },
  {
    id: 'pc-compliance',
    context: 'PC · Pinsp 15 cmH₂O über PEEP · f 12/min · Ti 1,0 s',
    question: 'Im druckkontrollierten Modus ist die Druckkurve unverändert, aber das Volumen ist deutlich kleiner. Warum?',
    settings: pcBase,
    patient: { ...healthy, compliance_ml_per_cmH2O: 25 },
    refSettings: pcBase,
    refPatient: healthy,
    options: [
      { id: 'c', text: 'Die Compliance ist gesunken – gleicher Druck erzeugt weniger Volumen', correct: true, why: 'VT ≈ C · ΔP. Der Flow fällt zudem schneller auf null, weil τ = R · C kleiner ist.' },
      { id: 'r', text: 'Die Resistance ist gestiegen', why: 'Dann wäre der Spitzenflow kleiner und der Flow würde langsamer abfallen.' },
      { id: 'pinsp', text: 'Pinsp wurde reduziert', why: 'Die Druckkurve ist unverändert – der eingestellte Druck ist derselbe.' },
      { id: 'leak', text: 'Leckage', why: 'Bei einem Leck kehrt die Volumenkurve nicht zur Nulllinie zurück.' },
    ],
    takeaway: 'Bei PC ist das VT die Variable: sinkende Compliance → VT ↓. Deshalb VTe- und MV-Alarme sorgfältig einstellen.',
  },
  {
    id: 'pc-resistance',
    context: 'PC · Pinsp 15 cmH₂O über PEEP · f 12/min · Ti 0,8 s',
    question: 'Der inspiratorische Flow ist niedriger und erreicht vor Ende der Inspiration nicht die Nulllinie. Was hat sich verändert?',
    settings: { ...pcBase, ti_s: 0.8 },
    patient: { ...healthy, resistance_cmH2O_per_L_s: 25 },
    refSettings: { ...pcBase, ti_s: 0.8 },
    refPatient: healthy,
    options: [
      { id: 'r', text: 'Erhöhte Resistance – die Lunge füllt sich langsamer', correct: true, why: 'Spitzenflow = ΔP / R ist kleiner, τ = R · C länger: Bis zum Ende von Ti ist der Druckausgleich nicht erreicht, das VT sinkt.' },
      { id: 'c', text: 'Verminderte Compliance', why: 'Dann würde der Flow schneller auf null abfallen (kürzeres τ).' },
      { id: 'peep', text: 'PEEP erhöht', why: 'Die Basislinie ist unverändert.' },
      { id: 'leak', text: 'Leckage', why: 'Ein Leck würde den Flow eher erhöhen (Gerät kompensiert) und die Volumenkurve nicht zur Nulllinie zurückführen.' },
    ],
    takeaway: 'Bei PC: Flow fällt nicht auf null → Ti verlängern oder Resistance-Ursache beheben.',
  },
  {
    id: 'pmax',
    context: 'VC · VT 500 ml · f 12/min · Ti 0,8 s · Pmax 22 cmH₂O',
    question: 'Die Druckkurve wird oben abgeschnitten, der Flow endet abrupt. Was passiert hier?',
    settings: { ...vcBase, ti_s: 0.8, pause_s: 0, pmax_cmH2O: 22 },
    patient: { ...healthy, resistance_cmH2O_per_L_s: 20 },
    refSettings: { ...vcBase, ti_s: 0.8, pause_s: 0, pmax_cmH2O: 22 },
    refPatient: healthy,
    options: [
      { id: 'pmax', text: 'Die Druckgrenze Pmax wird erreicht – die Inspiration wird abgebrochen, das VT ist unvollständig', correct: true, why: 'Bei Pmax beendet das Gerät im VC-Modus die Inspiration (Alarm „Atemwegsdruck hoch“). Das Volumen fehlt – Ursache (hier hohe Resistance) suchen.' },
      { id: 'pc', text: 'Das Gerät arbeitet im PC-Modus', why: 'Im PC-Modus wäre der Druck über die gesamte Ti konstant, und der Flow wäre dezelerierend.' },
      { id: 'leak', text: 'Leckage', why: 'Ein Leck erklärt nicht den abrupt endenden Flow bei Erreichen eines Druckwerts.' },
      { id: 'c', text: 'Erhöhte Compliance', why: 'Eine höhere Compliance würde den Druck senken, nicht begrenzen.' },
    ],
    takeaway: 'Pmax ist eine Sicherheitsgrenze: Wird sie erreicht, fehlt Volumen. Ursache klären, statt die Grenze reflexhaft zu erhöhen.',
  },
];
