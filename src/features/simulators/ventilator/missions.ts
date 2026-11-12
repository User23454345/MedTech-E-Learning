/**
 * Simulator-Missionen. Jede Mission definiert Patient, Startwerte, eine
 * Erfolgsprüfung auf Basis der Messwerte (muss über ≥ 3 aufeinanderfolgende
 * Atemzüge erfüllt sein), Hinweise und ein Debriefing.
 *
 * `exampleSolution` dient nur den Tests (Nachweis der Lösbarkeit) und wird
 * in der Oberfläche nicht angezeigt.
 */
import { PATIENT_PRESETS, fmt, type BreathMetrics, type PatientParams, type VentSettings, DEFAULT_SETTINGS } from './model';

export interface MissionCriterion {
  label: string;
  ok: boolean;
  /** aktueller Wert als Text */
  value: string;
}

export interface Mission {
  id: string;
  title: string;
  /** kurzer Untertitel für die Liste */
  short: string;
  /** Aufgabenbeschreibung */
  goal: string;
  patientLabel: string;
  patient: PatientParams;
  settings: VentSettings;
  /** Erfolgsprüfung: Kriterienliste; Mission erfüllt, wenn alle ok */
  check: (m: BreathMetrics, s: VentSettings) => MissionCriterion[];
  hints: string[];
  debrief: string;
  exampleSolution: Partial<VentSettings>;
}

/** Anzahl aufeinanderfolgender Atemzüge, über die das Ziel gehalten werden muss */
export const REQUIRED_BREATHS = 3;

const ardsModerate: PatientParams = { ...PATIENT_PRESETS.ards.params, compliance_ml_per_cmH2O: 30 };
const postOp: PatientParams = { ...PATIENT_PRESETS.gesund.params, compliance_ml_per_cmH2O: 50, resistance_cmH2O_per_L_s: 10 };

const crit = (label: string, ok: boolean, value: string): MissionCriterion => ({ label, ok, value });

export const MISSIONS: Mission[] = [
  {
    id: 'sim-1',
    title: 'Lungenprotektiv beatmen',
    short: 'ARDS · VT 6 ml/kg, Pplat ≤ 30, ΔP ≤ 15',
    goal: 'Patient:in mit ARDS (Compliance 30 ml/cmH₂O, 70 kg Idealgewicht) wird mit zu großem Tidalvolumen beatmet. Stelle eine lungenprotektive Beatmung ein: VT 6 ml/kg PBW (± 0,5), Plateaudruck ≤ 30 cmH₂O und Driving Pressure ≤ 15 cmH₂O.',
    patientLabel: 'ARDS, C 30 · R 10 · 70 kg PBW',
    patient: ardsModerate,
    settings: { ...DEFAULT_SETTINGS, mode: 'VC', vt_ml: 600, rr_per_min: 16, peep_cmH2O: 12, fio2: 0.6, ti_s: 1.0, pause_s: 0.3, pmax_cmH2O: 45 },
    check: (m) => [
      crit('VT 5,5–6,5 ml/kg PBW', m.vtPerKg_ml_per_kg >= 5.5 && m.vtPerKg_ml_per_kg <= 6.5, `${fmt(m.vtPerKg_ml_per_kg, 1)} ml/kg`),
      crit('Pplat ≤ 30 cmH₂O', m.pplat_cmH2O <= 30, `${fmt(m.pplat_cmH2O, 1)} cmH₂O`),
      crit('ΔP ≤ 15 cmH₂O', m.drivingPressure_cmH2O <= 15, `${fmt(m.drivingPressure_cmH2O, 1)} cmH₂O`),
    ],
    hints: [
      'Das Idealgewicht beträgt 70 kg – 6 ml/kg entsprechen also 420 ml.',
      'Im VC-Modus gilt: ΔP = VT / C. Bei C = 30 ml/cmH₂O ergibt VT 420 ml einen ΔP von 14 cmH₂O.',
      'Der PEEP darf bleiben – Pplat = PEEP + ΔP muss dann ≤ 30 cmH₂O sein.',
      'Mit kleinerem VT sinkt das Minutenvolumen. Eine moderat höhere Frequenz kann das ausgleichen (Auto-PEEP im Blick behalten).',
    ],
    debrief:
      'Bei ARDS ist nur ein Teil der Lunge belüftet („Baby Lung“). Ein am Idealgewicht orientiertes VT von ≈ 6 ml/kg begrenzt die Dehnung dieser Restlunge (ARDSNet 2000). Der Driving Pressure ΔP = VT/C setzt das Volumen ins Verhältnis zur verfügbaren Lunge – niedrige ΔP-Werte waren in Analysen mit besserem Überleben assoziiert (Amato 2015). Um das Minutenvolumen zu halten, wird die Frequenz meist erhöht; eine moderate Hyperkapnie wird oft toleriert.',
    exampleSolution: { vt_ml: 420, rr_per_min: 20 },
  },
  {
    id: 'sim-2',
    title: 'CO₂ senken',
    short: 'PaCO₂-Schätzung 35–45 mmHg, VT ≤ 8 ml/kg',
    goal: 'Nach einer Operation ist die Ventilation zu gering: Die PaCO₂-Schätzung liegt deutlich über 45 mmHg. Bringe sie in den Bereich 35–45 mmHg, ohne 8 ml/kg PBW zu überschreiten und ohne Auto-PEEP zu erzeugen.',
    patientLabel: 'Lungengesund, C 60 · R 8 · 70 kg PBW',
    patient: PATIENT_PRESETS.gesund.params,
    settings: { ...DEFAULT_SETTINGS, mode: 'VC', vt_ml: 400, rr_per_min: 10, peep_cmH2O: 5, fio2: 0.3, ti_s: 1.5 },
    check: (m) => [
      crit('PaCO₂-Schätzung 35–45 mmHg', m.paco2Est_mmHg >= 35 && m.paco2Est_mmHg <= 45, `${fmt(m.paco2Est_mmHg)} mmHg`),
      crit('VT ≤ 8 ml/kg PBW', m.vtPerKg_ml_per_kg <= 8.0, `${fmt(m.vtPerKg_ml_per_kg, 1)} ml/kg`),
      crit('intrinsischer PEEP < 1 cmH₂O', m.autoPeep_cmH2O < 1, `${fmt(m.autoPeep_cmH2O, 1)} cmH₂O`),
    ],
    hints: [
      'PaCO₂ verhält sich umgekehrt proportional zur alveolären Ventilation V̇A = (VT − VD) · f.',
      'Du kannst f oder VT erhöhen. Bei 70 kg PBW liegt 8 ml/kg bei 560 ml.',
      'Faustregel: Verdoppelt sich V̇A, halbiert sich PaCO₂ (bei konstanter CO₂-Produktion).',
    ],
    debrief:
      'Das Minutenvolumen MV = VT · f enthält auch die Totraumventilation. Für den CO₂-Abtransport zählt nur die alveoläre Ventilation V̇A = (VT − VD) · f. Eine VT-Erhöhung wirkt deshalb pro Milliliter „effizienter“, wird aber durch lungenprotektive Grenzen beschränkt; eine Frequenzerhöhung verkürzt die Exspirationszeit. Im Körper stellt sich ein neuer PaCO₂ erst über viele Minuten ein – die Blutgasanalyse bleibt die Referenz.',
    exampleSolution: { rr_per_min: 13, vt_ml: 450 },
  },
  {
    id: 'sim-3',
    title: 'Auto-PEEP beseitigen',
    short: 'Obstruktion · PEEPi < 1 cmH₂O, MV ≥ 5 L/min',
    goal: 'Bei einer Patientin mit schwerer Obstruktion (R 25 cmH₂O/(L/s)) erreicht der exspiratorische Flow vor dem nächsten Atemzug nicht die Nulllinie – es entsteht Air Trapping. Senke den intrinsischen PEEP unter 1 cmH₂O, ohne dass das Minutenvolumen unter 5 L/min fällt (VT ≥ 400 ml).',
    patientLabel: 'Obstruktiv, C 60 · R 25 · τ 1,5 s',
    patient: PATIENT_PRESETS.obstruktiv.params,
    settings: { ...DEFAULT_SETTINGS, mode: 'VC', vt_ml: 480, rr_per_min: 20, peep_cmH2O: 5, fio2: 0.35, ti_s: 1.0, pmax_cmH2O: 45 },
    check: (m) => [
      crit('intrinsischer PEEP < 1 cmH₂O', m.autoPeep_cmH2O < 1, `${fmt(m.autoPeep_cmH2O, 1)} cmH₂O`),
      crit('MVe ≥ 5 L/min', m.mve_L_min >= 5, `${fmt(m.mve_L_min, 1)} L/min`),
      crit('VT ≥ 400 ml', m.vte_ml >= 400, `${fmt(m.vte_ml)} ml`),
    ],
    hints: [
      'Die Zeitkonstante τ = R · C beträgt hier 25 · 0,06 = 1,5 s. Für eine nahezu vollständige Exspiration braucht es ≈ 3 τ.',
      'Die Exspirationszeit Te = 60/f − Ti. Sie lässt sich über eine niedrigere Frequenz oder eine kürzere Ti verlängern.',
      'Ein höherer externer PEEP beseitigt das Air Trapping in diesem Modell nicht – die Exspiration braucht Zeit.',
    ],
    debrief:
      'Bei erhöhter Resistance verlängert sich τ = R · C. Reicht die Exspirationszeit nicht für ≈ 3 τ, verbleibt Volumen in der Lunge (dynamische Überblähung): Der endexspiratorische Alveolardruck liegt über dem eingestellten PEEP (intrinsischer PEEP). Das erhöht Plateaudruck und Atemarbeit und kann den Kreislauf beeinträchtigen. Abhilfe: Te verlängern (f senken, Ti verkürzen) und – klinisch – die Obstruktion behandeln. Ein intrinsischer PEEP ist nur mit einem exspiratorischen Hold messbar.',
    exampleSolution: { rr_per_min: 12, ti_s: 1.0 },
  },
  {
    id: 'sim-4',
    title: 'Druckkontrolliert zum Zielvolumen',
    short: 'PC · VT 420–480 ml',
    goal: 'Im druckkontrollierten Modus (PC) ist das Tidalvolumen die Folge von Druck, Zeit und Lungenmechanik. Erreiche ein VT zwischen 420 und 480 ml, ohne P_insp über 20 cmH₂O (über PEEP) einzustellen.',
    patientLabel: 'Postoperativ, C 50 · R 10 · τ 0,5 s',
    patient: postOp,
    settings: { ...DEFAULT_SETTINGS, mode: 'PC', pinsp_above_peep_cmH2O: 10, ti_s: 0.5, rr_per_min: 14, peep_cmH2O: 5, fio2: 0.35 },
    check: (m, s) => [
      crit('Modus PC', s.mode === 'PC', s.mode),
      crit('VTe 420–480 ml', m.vte_ml >= 420 && m.vte_ml <= 480, `${fmt(m.vte_ml)} ml`),
      crit('P_insp ≤ 20 cmH₂O über PEEP', s.pinsp_above_peep_cmH2O <= 20, `${fmt(s.pinsp_above_peep_cmH2O)} cmH₂O`),
    ],
    hints: [
      'Im PC-Modus gilt: VT = C · ΔP · (1 − e^(−Ti/τ)).',
      'Schau auf die Flowkurve: Fällt der Inspirationsflow vor Ende der Ti nicht auf null, wurde der Druckausgleich nicht erreicht.',
      'Eine längere Ti (≈ 2–3 τ) lässt das Volumen bei gleichem Druck steigen; alternativ P_insp erhöhen.',
    ],
    debrief:
      'Im PC-Modus regelt das Gerät den Druck; der Flow ist dezelerierend und hängt von der Druckdifferenz zwischen Atemweg und Alveole ab. Das Volumen nähert sich exponentiell C · ΔP an – nach 1 τ ≈ 63 %, nach 3 τ ≈ 95 %. Ändern sich Compliance oder Resistance, ändert sich das VT: Deshalb sind Volumenalarme (VTe, MVe) im PC-Modus besonders wichtig.',
    exampleSolution: { ti_s: 1.0 },
  },
  {
    id: 'sim-5',
    title: 'Druckbegrenzung verstehen',
    short: 'Pmax-Alarm richtig beheben',
    goal: 'Bei einem Patienten mit Bronchospasmus löst jeder Atemzug den Alarm „Atemwegsdruck hoch“ aus: Die Inspiration wird an P_max abgebrochen, das Volumen nicht vollständig appliziert. Behebe die Ursache: VTe ≥ 450 ml ohne Druckbegrenzung, P_max nicht über 35 cmH₂O und mindestens 3 cmH₂O Abstand zwischen Ppeak und P_max.',
    patientLabel: 'Obstruktiv, C 60 · R 25',
    patient: PATIENT_PRESETS.obstruktiv.params,
    settings: { ...DEFAULT_SETTINGS, mode: 'VC', vt_ml: 500, rr_per_min: 12, peep_cmH2O: 5, fio2: 0.4, ti_s: 0.6, pmax_cmH2O: 30 },
    check: (m, s) => [
      crit('keine Druckbegrenzung', !m.pressureLimited, m.pressureLimited ? 'begrenzt' : 'frei'),
      crit('VTe ≥ 450 ml', m.vte_ml >= 450, `${fmt(m.vte_ml)} ml`),
      crit('P_max ≤ 35 cmH₂O', s.pmax_cmH2O <= 35, `${fmt(s.pmax_cmH2O)} cmH₂O`),
      crit('Ppeak ≤ P_max − 3', m.ppeak_cmH2O <= s.pmax_cmH2O - 3, `${fmt(m.ppeak_cmH2O, 1)} cmH₂O`),
    ],
    hints: [
      'Zerlege den Spitzendruck: PEEP + VT/C + R · V̇. Welcher Anteil ist hier ungewöhnlich groß?',
      'Der Flow im VC-Modus ergibt sich aus VT / Ti. Mit Ti = 0,6 s sind das 50 L/min – bei R = 25 entstehen über 20 cmH₂O resistiver Druck.',
      'Eine längere Inspirationszeit senkt den Flow und damit den resistiven Druckanteil. Die Exspirationszeit nicht zu sehr verkürzen (Auto-PEEP)!',
    ],
    debrief:
      'P_max ist eine Sicherheitsgrenze, kein Regler. Wird sie erreicht, beendet das Gerät im VC-Modus die Inspiration – das Volumen fehlt. Wer die Grenze einfach anhebt, akzeptiert hohe Drücke, ohne die Ursache zu kennen. Hier war der resistive Anteil (R · V̇) dominierend: Ein niedrigerer Flow (längere Ti) senkt Ppeak, ohne den Plateaudruck zu verändern. Klinisch gehören dazu die Suche nach Sekret, Tubusknick oder Bronchospasmus und dessen Behandlung.',
    exampleSolution: { ti_s: 1.2 },
  },
  {
    id: 'sim-6',
    title: 'Oxygenierung mit PEEP',
    short: 'ARDS · Oxygenierung ausreichend, F_IO₂ ≤ 0,6',
    goal: 'Bei ARDS ist die Oxygenierung trotz F_IO₂ 0,6 nur grenzwertig. Erreiche eine „ausreichende“ Oxygenierungs-Tendenz mit F_IO₂ ≤ 0,6, ohne die lungenprotektiven Grenzen zu verletzen (Pplat ≤ 30, ΔP ≤ 15 cmH₂O).',
    patientLabel: 'ARDS, C 30 · R 10 · 70 kg PBW',
    patient: ardsModerate,
    settings: { ...DEFAULT_SETTINGS, mode: 'VC', vt_ml: 420, rr_per_min: 20, peep_cmH2O: 5, fio2: 0.6, ti_s: 1.0, pmax_cmH2O: 40 },
    check: (m, s) => [
      crit('Oxygenierung ausreichend', m.oxygenation.level === 'ausreichend', m.oxygenation.level),
      crit('F_IO₂ ≤ 0,6', s.fio2 <= 0.6 + 1e-9, fmt(s.fio2, 2)),
      crit('Pplat ≤ 30 cmH₂O', m.pplat_cmH2O <= 30, `${fmt(m.pplat_cmH2O, 1)} cmH₂O`),
      crit('ΔP ≤ 15 cmH₂O', m.drivingPressure_cmH2O <= 15, `${fmt(m.drivingPressure_cmH2O, 1)} cmH₂O`),
    ],
    hints: [
      'Beim ARDS sind Alveolen kollabiert. PEEP kann sie offenhalten und so den Shunt verringern.',
      'Erhöhe den PEEP schrittweise und beobachte Pplat: Im VC-Modus steigt Pplat um denselben Betrag wie der PEEP.',
      'Mit VT 420 ml liegt ΔP bei 14 cmH₂O – der PEEP darf also bis 16 cmH₂O betragen.',
    ],
    debrief:
      'Oxygenierung wird vor allem über F_IO₂ und den mittleren Atemwegsdruck (PEEP) beeinflusst – die CO₂-Elimination dagegen über die alveoläre Ventilation. Bei rekrutierbarer Lunge verbessert ein höherer PEEP die Belüftung; dabei muss der Plateaudruck begrenzt bleiben. In diesem Modell bleibt die Compliance konstant – in Wirklichkeit kann sie sich durch Rekrutierung verbessern oder durch Überdehnung verschlechtern. Die PEEP-Wahl erfolgt klinisch z. B. anhand von PEEP/F_IO₂-Tabellen und individueller Messung.',
    exampleSolution: { peep_cmH2O: 12 },
  },
];

export function isMissionMet(m: BreathMetrics, s: VentSettings, mission: Mission): boolean {
  return mission.check(m, s).every((c) => c.ok);
}
