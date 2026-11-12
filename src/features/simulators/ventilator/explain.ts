/**
 * „Erklär mir das“: erzeugt deutsche Erklärsätze zu einer Einstellungsänderung,
 * gestützt auf die Kennwerte vorher/nachher (eingeschwungener Zustand).
 */
import { fmt, fmtIE, type BreathMetrics, type PatientParams, type VentSettings } from './model';

export interface Explanation {
  /** Überschrift, z. B. „PEEP ↑ 5 → 8 cmH₂O“ */
  title: string;
  points: string[];
}

const arrow = (a: number, b: number) => (b > a ? '↑' : '↓');
const chg = (label: string, a: number, b: number, unit: string, d = 0) => `${label} ${fmt(a, d)} → ${fmt(b, d)} ${unit}`;

export function explainChange(
  prevS: VentSettings,
  nextS: VentSettings,
  prevP: PatientParams,
  nextP: PatientParams,
  a: BreathMetrics,
  b: BreathMetrics,
): Explanation | null {
  const pts: string[] = [];
  let title = '';
  const vc = nextS.mode === 'VC';
  const autoPeepNote = () => {
    if (b.autoPeep_cmH2O >= 1 && a.autoPeep_cmH2O < 1)
      pts.push(`Achtung: Te (${fmt(b.te_s, 1)} s) ist jetzt kürzer als ≈ 3 τ (${fmt(3 * b.tau_s, 1)} s). Die Lunge entleert sich nicht vollständig – intrinsischer PEEP ≈ ${fmt(b.autoPeep_cmH2O, 1)} cmH₂O.`);
    else if (b.autoPeep_cmH2O < 1 && a.autoPeep_cmH2O >= 1) pts.push('Die Exspirationszeit reicht jetzt für eine nahezu vollständige Entleerung – das Air Trapping verschwindet.');
  };

  if (prevS.mode !== nextS.mode) {
    title = `Modus ${prevS.mode} → ${nextS.mode}`;
    pts.push(
      vc
        ? 'Volumenkontrolle: Das Gerät liefert das eingestellte VT mit konstantem Flow. Der Druck ist die Folge – er steigt, wenn Compliance sinkt oder Resistance steigt.'
        : 'Druckkontrolle: Das Gerät hält den Druck konstant (PEEP + Pinsp). Der Flow ist dezelerierend, das VT ist die Folge von Druck, Ti und Lungenmechanik.',
    );
    pts.push(`${chg('VTe', a.vte_ml, b.vte_ml, 'ml')}, ${chg('Ppeak', a.ppeak_cmH2O, b.ppeak_cmH2O, 'cmH₂O', 1)}.`);
  } else if (prevS.peep_cmH2O !== nextS.peep_cmH2O) {
    title = `PEEP ${arrow(prevS.peep_cmH2O, nextS.peep_cmH2O)} ${fmt(prevS.peep_cmH2O)} → ${fmt(nextS.peep_cmH2O)} cmH₂O`;
    if (vc) pts.push(`Im VC-Modus verschiebt der PEEP die gesamte Druckkurve: Ppeak und Pplat ändern sich um denselben Betrag (${chg('Pplat', a.pplat_cmH2O, b.pplat_cmH2O, 'cmH₂O', 1)}). ΔP = VT/C bleibt gleich.`);
    else pts.push(`Im PC-Modus ist Pinsp über PEEP eingestellt: Der Spitzendruck steigt mit (${chg('Ppeak', a.ppeak_cmH2O, b.ppeak_cmH2O, 'cmH₂O', 1)}), das VT bleibt praktisch gleich.`);
    pts.push(`Der mittlere Atemwegsdruck ändert sich (${chg('Pmean', a.pmean_cmH2O, b.pmean_cmH2O, 'cmH₂O', 1)}) – ein wichtiger Faktor für die Oxygenierung. Tendenz: ${b.oxygenation.level}.`);
    if (b.pplat_cmH2O > 30) pts.push('Pplat liegt über 30 cmH₂O – lungenprotektive Grenze beachten.');
  } else if (prevS.vt_ml !== nextS.vt_ml && vc) {
    title = `VT ${arrow(prevS.vt_ml, nextS.vt_ml)} ${fmt(prevS.vt_ml)} → ${fmt(nextS.vt_ml)} ml`;
    pts.push(`Elastischer Anteil VT/C: ${fmt(prevS.vt_ml / nextP.compliance_ml_per_cmH2O, 1)} → ${fmt(nextS.vt_ml / nextP.compliance_ml_per_cmH2O, 1)} cmH₂O – Pplat und ΔP ändern sich entsprechend (${chg('ΔP', a.drivingPressure_cmH2O, b.drivingPressure_cmH2O, 'cmH₂O', 1)}).`);
    pts.push(`Bei gleicher Ti ändert sich auch der Flow (VT/Ti) und damit der resistive Anteil – ${chg('Ppeak', a.ppeak_cmH2O, b.ppeak_cmH2O, 'cmH₂O', 1)}.`);
    pts.push(`${chg('MVe', a.mve_L_min, b.mve_L_min, 'L/min', 1)}; die alveoläre Ventilation ändert sich überproportional, weil der Totraum gleich bleibt → ${chg('PaCO₂-Schätzung', a.paco2Est_mmHg, b.paco2Est_mmHg, 'mmHg')}.`);
    pts.push(`Bezogen auf das Sollgewicht: ${fmt(b.vtPerKg_ml_per_kg, 1)} ml/kg PBW (lungenprotektives Ziel ≈ 6 ml/kg, Obergrenze meist 8 ml/kg).`);
  } else if (prevS.pinsp_above_peep_cmH2O !== nextS.pinsp_above_peep_cmH2O && !vc) {
    title = `Pinsp ${arrow(prevS.pinsp_above_peep_cmH2O, nextS.pinsp_above_peep_cmH2O)} ${fmt(prevS.pinsp_above_peep_cmH2O)} → ${fmt(nextS.pinsp_above_peep_cmH2O)} cmH₂O`;
    pts.push(`Höhere Druckdifferenz → höherer Initialflow und mehr Volumen: VT ≈ C · ΔP · (1 − e^(−Ti/τ)). ${chg('VTe', a.vte_ml, b.vte_ml, 'ml')}.`);
    pts.push(`${chg('MVe', a.mve_L_min, b.mve_L_min, 'L/min', 1)}, ${chg('PaCO₂-Schätzung', a.paco2Est_mmHg, b.paco2Est_mmHg, 'mmHg')}.`);
  } else if (prevS.rr_per_min !== nextS.rr_per_min) {
    title = `Frequenz ${arrow(prevS.rr_per_min, nextS.rr_per_min)} ${fmt(prevS.rr_per_min)} → ${fmt(nextS.rr_per_min)} /min`;
    pts.push(`${chg('MVe', a.mve_L_min, b.mve_L_min, 'L/min', 1)} (MV = VT · f) → ${chg('PaCO₂-Schätzung', a.paco2Est_mmHg, b.paco2Est_mmHg, 'mmHg')}.`);
    pts.push(`Bei gleicher Ti ändert sich die Exspirationszeit: ${chg('Te', a.te_s, b.te_s, 's', 1)}, I:E jetzt ${fmtIE(b.ie_te_per_ti)}.`);
    autoPeepNote();
  } else if (prevS.ti_s !== nextS.ti_s) {
    title = `Ti ${arrow(prevS.ti_s, nextS.ti_s)} ${fmt(prevS.ti_s, 1)} → ${fmt(nextS.ti_s, 1)} s`;
    if (vc) pts.push(`Im VC-Modus muss das gleiche VT in ${nextS.ti_s > prevS.ti_s ? 'längerer' : 'kürzerer'} Zeit fließen: ${chg('Spitzenflow', a.peakInspFlow_L_min, b.peakInspFlow_L_min, 'L/min')}. Der resistive Druckanteil R · V̇ ändert sich → ${chg('Ppeak', a.ppeak_cmH2O, b.ppeak_cmH2O, 'cmH₂O', 1)}; Pplat bleibt gleich.`);
    else pts.push(`Im PC-Modus hat der Druck ${nextS.ti_s > prevS.ti_s ? 'mehr' : 'weniger'} Zeit, die Lunge zu füllen: ${chg('VTe', a.vte_ml, b.vte_ml, 'ml')}. Ab etwa 3 τ (${fmt(3 * b.tau_s, 1)} s) bringt eine längere Ti kaum noch Volumen.`);
    pts.push(`${chg('Te', a.te_s, b.te_s, 's', 1)}, I:E jetzt ${fmtIE(b.ie_te_per_ti)}; der mittlere Atemwegsdruck ändert sich (${chg('Pmean', a.pmean_cmH2O, b.pmean_cmH2O, 'cmH₂O', 1)}).`);
    autoPeepNote();
  } else if (prevS.pause_s !== nextS.pause_s) {
    const longer = nextS.pause_s > prevS.pause_s;
    title = `Insp. Pause ${arrow(prevS.pause_s, nextS.pause_s)} ${fmt(prevS.pause_s, 1)} → ${fmt(nextS.pause_s, 1)} s`;
    pts.push('Während der Pause fließt kein Gas: Der Druck fällt vom Spitzendruck auf den Plateaudruck (= Alveolardruck). Die Differenz Ppeak − Pplat ist der resistive Anteil R · V̇.');
    pts.push(`Die Pause ist Teil von Ti: Das VT muss in ${longer ? 'kürzerer' : 'längerer'} Flowzeit geliefert werden, der Flow ${longer ? 'steigt' : 'sinkt'} – ${chg('Ppeak', a.ppeak_cmH2O, b.ppeak_cmH2O, 'cmH₂O', 1)}.`);
  } else if (prevS.fio2 !== nextS.fio2) {
    title = `FiO₂ ${arrow(prevS.fio2, nextS.fio2)} ${fmt(prevS.fio2, 2)} → ${fmt(nextS.fio2, 2)}`;
    pts.push('Die Sauerstofffraktion beeinflusst die Oxygenierung, nicht die Atemmechanik: Drücke, Volumen und CO₂-Elimination bleiben unverändert.');
    pts.push(`Oxygenierungs-Tendenz: ${b.oxygenation.text}`);
  } else if (prevS.pmax_cmH2O !== nextS.pmax_cmH2O) {
    title = `Pmax ${fmt(prevS.pmax_cmH2O)} → ${fmt(nextS.pmax_cmH2O)} cmH₂O`;
    pts.push('Pmax ist eine Alarm- und Sicherheitsgrenze. Solange sie nicht erreicht wird, ändert sie an der Beatmung nichts.');
    pts.push(b.pressureLimited ? 'Die Grenze wird erreicht: Im VC-Modus endet die Inspiration vorzeitig, das VT sinkt.' : `Abstand Ppeak → Pmax: ${fmt(nextS.pmax_cmH2O - b.ppeak_cmH2O, 1)} cmH₂O. Üblich ist ein Abstand von einigen cmH₂O über dem aktuellen Spitzendruck.`);
  } else if (prevP.compliance_ml_per_cmH2O !== nextP.compliance_ml_per_cmH2O || prevP.resistance_cmH2O_per_L_s !== nextP.resistance_cmH2O_per_L_s) {
    const dC = prevP.compliance_ml_per_cmH2O !== nextP.compliance_ml_per_cmH2O;
    title = dC
      ? `Compliance ${fmt(prevP.compliance_ml_per_cmH2O)} → ${fmt(nextP.compliance_ml_per_cmH2O)} ml/cmH₂O`
      : `Resistance ${fmt(prevP.resistance_cmH2O_per_L_s)} → ${fmt(nextP.resistance_cmH2O_per_L_s)} cmH₂O/(L/s)`;
    if (dC) {
      pts.push(vc ? `Im VC-Modus steigt bei sinkender Compliance der elastische Druck VT/C: Ppeak UND Pplat verändern sich (${chg('Pplat', a.pplat_cmH2O, b.pplat_cmH2O, 'cmH₂O', 1)}).` : `Im PC-Modus bleibt der Druck gleich – stattdessen ändert sich das Volumen: ${chg('VTe', a.vte_ml, b.vte_ml, 'ml')}.`);
    } else {
      pts.push(vc ? `Im VC-Modus ändert eine veränderte Resistance nur den resistiven Anteil R · V̇: Ppeak ändert sich (${chg('Ppeak', a.ppeak_cmH2O, b.ppeak_cmH2O, 'cmH₂O', 1)}), Pplat bleibt gleich.` : `Im PC-Modus füllt sich die Lunge ${nextP.resistance_cmH2O_per_L_s > prevP.resistance_cmH2O_per_L_s ? 'langsamer' : 'schneller'} – bei kurzer Ti ändert sich das VT (${chg('VTe', a.vte_ml, b.vte_ml, 'ml')}).`);
    }
    pts.push(`Zeitkonstante τ = R · C: ${fmt(a.tau_s, 2)} → ${fmt(b.tau_s, 2)} s.`);
    autoPeepNote();
  } else {
    return null;
  }
  return { title, points: pts };
}
