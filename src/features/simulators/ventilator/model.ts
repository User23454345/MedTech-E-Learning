/**
 * Beatmungsphysik – Ein-Kompartiment-Modell (didaktisch vereinfacht).
 *
 * Grundlage ist die Bewegungsgleichung des respiratorischen Systems:
 *
 *   P_aw(t) = PEEP + V(t)/C + R · V̇(t)
 *
 *   P_aw  Atemwegsdruck [cmH₂O]
 *   V     Volumen oberhalb des endexspiratorischen Ruhevolumens bei PEEP [ml]
 *   C     Compliance des respiratorischen Systems [ml/cmH₂O]
 *   R     Resistance (Atemwege + Tubus) [cmH₂O/(L/s)]
 *   V̇     Flow [L/s] (Anzeige in L/min)
 *
 * Zeitkonstante τ = R · C  (R in cmH₂O/(L/s), C in L/cmH₂O → τ in s).
 * Passive Exspiration: V(t) = V_start · e^(−t/τ); nach 3 τ sind ≈ 95 % entleert.
 *
 * Vereinfachungen (bewusst!): lineare, volumenunabhängige Compliance, gleiche
 * Resistance für In- und Exspiration, keine Rekrutierung/Überdehnung, keine
 * Kompressionsvolumina des Schlauchsystems, idealer Flow-/Druckgenerator.
 * Die PaCO₂- und Oxygenierungs-Angaben sind didaktische Schätzungen und
 * KEINE klinischen Vorhersagen.
 *
 * Alle Funktionen sind rein (keine Seiteneffekte) und damit testbar.
 */

/* ------------------------------------------------------------------ */
/* Typen                                                               */
/* ------------------------------------------------------------------ */

export type VentMode = 'VC' | 'PC';

export interface VentSettings {
  mode: VentMode;
  /** Tidalvolumen (nur VC) [ml] */
  vt_ml: number;
  /** Atemfrequenz [1/min] */
  rr_per_min: number;
  /** eingestellter PEEP [cmH₂O] */
  peep_cmH2O: number;
  /** inspiratorische Sauerstofffraktion 0,21 … 1,0 */
  fio2: number;
  /** Inspirationszeit inkl. Pause [s] */
  ti_s: number;
  /** Inspirationsdruck über PEEP (nur PC) [cmH₂O] */
  pinsp_above_peep_cmH2O: number;
  /** Flowform (VC) – im Modell nur konstanter Flow */
  flowPattern: 'square';
  /** endinspiratorische Pause (VC), Teil von Ti [s] */
  pause_s: number;
  /** obere Druckalarmgrenze / Druckbegrenzung Pmax [cmH₂O] */
  pmax_cmH2O: number;
}

export interface PatientParams {
  /** Compliance [ml/cmH₂O] */
  compliance_ml_per_cmH2O: number;
  /** Resistance [cmH₂O/(L/s)] */
  resistance_cmH2O_per_L_s: number;
  /** Idealgewicht (predicted body weight) [kg] */
  pbw_kg: number;
  /** (physiologischer) Totraum [ml] */
  deadspace_ml: number;
  /** Anteil des inspiratorischen Volumens, der über ein Leck verloren geht (0 … 0,6) */
  leak_fraction?: number;
  /** Triggeranstrengung des Patienten (negativer Druckausschlag) [cmH₂O]; 0 = passiv */
  effort_cmH2O?: number;
  /**
   * Gasaustauschstörung 0 … 1 (0 = lungengesund, ~0,8 = schweres ARDS).
   * Nur für die qualitative Oxygenierungs-Tendenz.
   */
  oxygenation_impairment?: number;
}

export interface AlarmLimits {
  /** = settings.pmax_cmH2O (Druckbegrenzung) */
  pmax_cmH2O: number;
  mvLow_L_min: number;
  mvHigh_L_min: number;
  vteLow_ml: number;
}

export interface Sample {
  /** Zeit [s] */
  t: number;
  /** Atemwegsdruck [cmH₂O] */
  p: number;
  /** Flow am Gerät/Y-Stück [L/min] (+ = inspiratorisch) */
  flow: number;
  /** angezeigtes Volumen (Integral des gemessenen Flows) [ml] */
  vol: number;
}

export type OxygenationLevel = 'unzureichend' | 'grenzwertig' | 'ausreichend' | 'hyperoxie';

export interface OxygenationTendency {
  level: OxygenationLevel;
  /** kurze deutsche Erläuterung */
  text: string;
}

export interface BreathMetrics {
  mode: VentMode;
  ppeak_cmH2O: number;
  /** endinspiratorischer Alveolardruck (Plateaudruck) */
  pplat_cmH2O: number;
  /** true, wenn ein Plateau (Pause/Hold ≥ 0,2 s) tatsächlich gemessen wurde */
  pplatMeasured: boolean;
  pmean_cmH2O: number;
  peepSet_cmH2O: number;
  /** Gesamt-PEEP = PEEP + intrinsischer PEEP (Alveolardruck am Ende der vorangehenden Exspiration) */
  peepTotal_cmH2O: number;
  autoPeep_cmH2O: number;
  /** am Gerät abgegebenes Volumen [ml] */
  vti_ml: number;
  /** exspiratorisch gemessenes Volumen (= Volumen in der Lunge) [ml] */
  vte_ml: number;
  /** exspiratorisches Minutenvolumen VTe · f [L/min] */
  mve_L_min: number;
  rr_per_min: number;
  ti_s: number;
  te_s: number;
  /** I:E als Verhältnis Te/Ti (Anzeige „1:x“) */
  ie_te_per_ti: number;
  tau_s: number;
  /** ΔP = Pplat − Gesamt-PEEP */
  drivingPressure_cmH2O: number;
  vtPerKg_ml_per_kg: number;
  /** alveoläre Ventilation V̇A = (VT − VD) · f [L/min] */
  alveolarVent_L_min: number;
  /** didaktische PaCO₂-Schätzung [mmHg] */
  paco2Est_mmHg: number;
  oxygenation: OxygenationTendency;
  /** Inspiration wurde an Pmax abgebrochen (VC) bzw. Druck begrenzt (PC) */
  pressureLimited: boolean;
  peakInspFlow_L_min: number;
  /** exspiratorischer Flow unmittelbar vor dem nächsten Atemzug [L/min] (≠ 0 → Auto-PEEP) */
  endExpFlow_L_min: number;
  /** Dauer des Atemzyklus [s] (inkl. Insp.-Hold) */
  cycle_s: number;
}

export interface BreathResult {
  /** Zeitreihe ab Atemzugbeginn (t = 0) */
  samples: Sample[];
  metrics: BreathMetrics;
  /** Lungenvolumen über PEEP-Ruhevolumen am Ende der Exspiration [ml] */
  endLungVolume_ml: number;
}

export interface BreathOptions {
  /** Zeitschritt [s], Standard 0,01 */
  dt_s?: number;
  /** zusätzlicher inspiratorischer Hold (Insp. Hold) [s] */
  inspHold_s?: number;
}

/* ------------------------------------------------------------------ */
/* Konstanten & Hilfsfunktionen                                        */
/* ------------------------------------------------------------------ */

export const DT_S = 0.01;

/**
 * Referenz für die PaCO₂-Schätzung: 40 mmHg bei einer alveolären Ventilation von
 * (6 ml/kg − 2,2 ml/kg Totraum) × 14/min = 53,2 ml/kg/min (bezogen auf PBW).
 * Annahme: konstante CO₂-Produktion, Gleichgewichtszustand (real dauert die
 * Einstellung eines neuen PaCO₂ viele Minuten).
 */
export const PACO2_REF_mmHg = 40;
export const VA_REF_ml_per_kg_min = (6 - 2.2) * 14;

/** Mindestdauer der Exspiration [s] – kürzere Ti werden begrenzt */
export const MIN_TE_S = 0.3;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Idealgewicht (PBW, ARDSNet): Männer 50 + 0,91·(Größe − 152,4), Frauen 45,5 + 0,91·(Größe − 152,4) */
export function pbwFromHeight(height_cm: number, sex: 'm' | 'w'): number {
  const base = sex === 'm' ? 50 : 45.5;
  return Math.max(0, base + 0.91 * (height_cm - 152.4));
}

/** τ = R · C [s] */
export function timeConstant_s(p: Pick<PatientParams, 'compliance_ml_per_cmH2O' | 'resistance_cmH2O_per_L_s'>): number {
  return p.resistance_cmH2O_per_L_s * (p.compliance_ml_per_cmH2O / 1000);
}

/** Zyklusdauer 60/f [s] */
export function cycleTime_s(rr_per_min: number): number {
  return 60 / Math.max(1, rr_per_min);
}

/** Effektive Ti (begrenzt, damit mindestens MIN_TE_S Exspiration bleibt) */
export function effectiveTi_s(s: Pick<VentSettings, 'ti_s' | 'rr_per_min'>): number {
  return clamp(s.ti_s, 0.2, cycleTime_s(s.rr_per_min) - MIN_TE_S);
}

/** Konstanter inspiratorischer Flow im VC-Modus [L/s] = VT / (Ti − Pause) */
export function vcFlow_L_s(s: Pick<VentSettings, 'vt_ml' | 'ti_s' | 'pause_s' | 'rr_per_min'>): number {
  const ti = effectiveTi_s(s);
  const tFlow = Math.max(0.1, ti - clamp(s.pause_s, 0, ti - 0.1));
  return s.vt_ml / 1000 / tFlow;
}

/** Spitzendruck VC, rechteckiger Flow, ohne Auto-PEEP: PEEP + VT/C + R·V̇ */
export function vcPeakPressure_cmH2O(s: VentSettings, p: PatientParams, autoPeep_cmH2O = 0): number {
  return s.peep_cmH2O + autoPeep_cmH2O + s.vt_ml / p.compliance_ml_per_cmH2O + p.resistance_cmH2O_per_L_s * vcFlow_L_s(s);
}

/** PC: VT = C · (Pinsp − PEEPi) · (1 − e^(−Ti/τ)) [ml] */
export function pcTidalVolume_ml(s: VentSettings, p: PatientParams, autoPeep_cmH2O = 0): number {
  const tau = timeConstant_s(p);
  const ti = effectiveTi_s(s);
  return p.compliance_ml_per_cmH2O * Math.max(0, s.pinsp_above_peep_cmH2O - autoPeep_cmH2O) * (1 - Math.exp(-ti / tau));
}

/** Didaktische PaCO₂-Schätzung: PaCO₂ = 40 mmHg · V̇A_ref / V̇A */
export function estimatePaCO2_mmHg(alveolarVent_L_min: number, pbw_kg: number): number {
  const vaRef_L_min = (VA_REF_ml_per_kg_min * pbw_kg) / 1000;
  if (alveolarVent_L_min <= 0.05) return 150;
  return clamp((PACO2_REF_mmHg * vaRef_L_min) / alveolarVent_L_min, 10, 150);
}

/**
 * Qualitative Oxygenierungs-Tendenz (rein didaktisch!).
 * Benötigte F_IO₂ steigt mit der Gasaustauschstörung; PEEP kann bei
 * rekrutierbarer Lunge den Bedarf senken (bis PEEP ≈ 15 cmH₂O berücksichtigt).
 */
export function oxygenationTendency(fio2: number, peep_cmH2O: number, impairment = 0): OxygenationTendency {
  const imp = clamp(impairment, 0, 1);
  const peepBenefit = imp * 0.3 * clamp((peep_cmH2O - 5) / 10, 0, 1);
  const required = 0.21 + imp * 0.6 - peepBenefit;
  if (fio2 + 1e-9 < required - 0.1)
    return { level: 'unzureichend', text: 'Oxygenierung voraussichtlich unzureichend – F_IO₂ und/oder PEEP prüfen.' };
  if (fio2 + 1e-9 < required)
    return { level: 'grenzwertig', text: 'Oxygenierung grenzwertig – bei Gasaustauschstörung helfen F_IO₂ und PEEP.' };
  if (fio2 >= 0.6 && fio2 > required + 0.25)
    return { level: 'hyperoxie', text: 'Mehr Sauerstoff als nötig – Hyperoxie vermeiden, F_IO₂ reduzieren.' };
  return { level: 'ausreichend', text: 'Oxygenierung voraussichtlich ausreichend.' };
}

/* ------------------------------------------------------------------ */
/* Atemzug-Simulation                                                  */
/* ------------------------------------------------------------------ */

/** Dauer der Triggerphase am Ende der Exspiration [s] (nur bei effort > 0) */
const TRIGGER_S = 0.25;

/**
 * Simuliert einen einzelnen Atemzyklus (Inspiration + Exspiration).
 *
 * @param startVolume_ml Lungenvolumen über dem PEEP-Ruhevolumen zu Beginn
 *   (= Endvolumen der vorangehenden Exspiration; > 0 bedeutet Air Trapping).
 */
export function simulateBreath(s: VentSettings, p: PatientParams, startVolume_ml = 0, opts: BreathOptions = {}): BreathResult {
  const dt = opts.dt_s ?? DT_S;
  const hold = Math.max(0, opts.inspHold_s ?? 0);
  const C = Math.max(1, p.compliance_ml_per_cmH2O); // ml/cmH₂O
  const R = Math.max(0.5, p.resistance_cmH2O_per_L_s); // cmH₂O/(L/s)
  const tau = (R * C) / 1000; // s
  const leak = clamp(p.leak_fraction ?? 0, 0, 0.9);
  const effort = Math.max(0, p.effort_cmH2O ?? 0);
  const peep = s.peep_cmH2O;
  const pmax = s.pmax_cmH2O;

  const cycle = cycleTime_s(s.rr_per_min);
  const ti = effectiveTi_s(s);
  const pause = s.mode === 'VC' ? clamp(s.pause_s, 0, ti - 0.1) : 0;
  const tFlow = ti - pause;
  const flowVC_L_s = s.vt_ml / 1000 / tFlow;
  const inspEnd = ti + hold; // Ende der Inspiration inkl. Hold
  const total = cycle + hold;

  // PC: Zieldruck (begrenzt auf Pmax)
  let pcTarget = peep + s.pinsp_above_peep_cmH2O;
  let pressureLimited = false;
  if (s.mode === 'PC' && pcTarget > pmax) {
    pcTarget = pmax;
    pressureLimited = true;
  }

  const samples: Sample[] = [];
  let V = Math.max(0, startVolume_ml); // Lungenvolumen [ml]
  const V0 = V;
  let dispVol = 0; // angezeigtes Volumen [ml]
  let vti = 0; // am Gerät abgegeben [ml]
  let phase: 'insp' | 'exp' = 'insp';
  let inspTerminatedAt = -1; // Zeitpunkt des Abbruchs bei Pmax
  let ppeak = -Infinity;
  let pSum = 0;
  let nSum = 0;
  let peakFlow = 0;
  let vEndInsp = V;
  let exhaled = 0; // passiv ausgeatmetes Lungenvolumen [ml]
  let lastExpFlow_L_s = 0;

  const nSteps = Math.round(total / dt);
  for (let i = 0; i <= nSteps; i++) {
    const t = i * dt;
    let paw: number;
    let devFlow_L_s: number; // Flow am Gerät (Anzeige)

    const inInsp = phase === 'insp' && t < inspEnd - 1e-9;
    if (inInsp) {
      if (s.mode === 'VC') {
        if (t < tFlow - 1e-9) {
          // konstanter Flow; Lunge erhält (1 − Leck) davon
          const lungFlow = flowVC_L_s * (1 - leak);
          paw = peep + V / C + R * lungFlow;
          if (paw >= pmax) {
            // Druckbegrenzung: Inspiration wird beendet → Exspiration
            pressureLimited = true;
            phase = 'exp';
            inspTerminatedAt = t;
            vEndInsp = V;
            paw = peep + V / C;
            devFlow_L_s = 0;
          } else {
            devFlow_L_s = flowVC_L_s;
            V += lungFlow * 1000 * dt;
            vti += flowVC_L_s * 1000 * dt;
            dispVol += flowVC_L_s * 1000 * dt;
            // Druck am Ende dieses Schritts (für exakten Spitzendruck)
            ppeak = Math.max(ppeak, Math.min(pmax, peep + V / C + R * lungFlow));
          }
        } else {
          // Pause / Hold: kein Flow, Druck = Alveolardruck (Plateau)
          paw = peep + V / C;
          devFlow_L_s = 0;
        }
      } else if (t >= ti - 1e-9) {
        // PC + Insp. Hold: Ventile geschlossen, Druckausgleich → Plateau
        paw = peep + V / C;
        devFlow_L_s = 0;
      } else {
        // PC: konstanter Atemwegsdruck, exakte exponentielle Lösung
        paw = pcTarget;
        const vTarget = C * (pcTarget - peep);
        const lungFlow = (paw - (peep + V / C)) / R; // L/s
        const vNext = vTarget + (V - vTarget) * Math.exp(-dt / tau);
        const dV = Math.max(0, vNext - V);
        devFlow_L_s = Math.max(0, lungFlow) / (1 - leak);
        V += dV;
        vti += dV / (1 - leak);
        dispVol += dV / (1 - leak);
      }
    } else {
      if (phase === 'insp') {
        phase = 'exp';
        vEndInsp = V;
      }
      const inTrigger = effort > 0 && t > total - TRIGGER_S;
      if (inTrigger) {
        // didaktisch: Patient atmet ein → Atemwegsdruck fällt kurz unter PEEP, kleiner Inspirationsflow
        const x = (t - (total - TRIGGER_S)) / TRIGGER_S;
        const dip = effort * Math.sin(Math.PI * Math.min(1, x * 1.15));
        paw = peep - Math.max(0, dip);
        const f = (Math.max(0, dip) / R) * 0.6; // L/s
        devFlow_L_s = f;
        // nur Anzeige: dieses kleine Volumen zählt didaktisch bereits zum nächsten Atemzug
        dispVol += f * 1000 * dt;
      } else {
        // passive Exspiration gegen PEEP: V(t) = V·e^(−dt/τ)
        paw = peep;
        const lungFlow = -(V / C) / R; // L/s (negativ)
        devFlow_L_s = lungFlow;
        const vNext = V * Math.exp(-dt / tau);
        dispVol -= V - vNext; // gemessenes Exspirationsvolumen
        exhaled += V - vNext;
        lastExpFlow_L_s = lungFlow;
        V = vNext;
      }
    }

    ppeak = Math.max(ppeak, paw);
    peakFlow = Math.max(peakFlow, devFlow_L_s);
    pSum += paw;
    nSum++;
    samples.push({ t: round(t, 3), p: paw, flow: devFlow_L_s * 60, vol: dispVol });
  }

  const vEndExp = V;
  const vtLung = Math.max(0, vEndInsp - V0); // Volumenzuwachs der Lunge
  const vte = exhaled; // tatsächlich (passiv) ausgeatmet und exspiratorisch gemessen
  const autoPeep = V0 / C;
  const peepTotal = peep + autoPeep;
  const pplat = peep + vEndInsp / C;
  const plateauTime = (s.mode === 'VC' ? pause : 0) + hold;
  const pplatMeasured = plateauTime >= 0.2 && inspTerminatedAt < 0;
  const actualTi = inspTerminatedAt >= 0 ? inspTerminatedAt : ti;
  const te = cycle - ti;
  // Ventilation: im Gleichgewicht entspricht das eingeatmete dem ausgeatmeten Lungenvolumen
  const vtForVent = vtLung;
  const rr = s.rr_per_min;
  const va = Math.max(0, ((vtForVent - p.deadspace_ml) * rr) / 1000);

  const metrics: BreathMetrics = {
    mode: s.mode,
    ppeak_cmH2O: ppeak,
    pplat_cmH2O: pplat,
    pplatMeasured,
    pmean_cmH2O: pSum / Math.max(1, nSum),
    peepSet_cmH2O: peep,
    peepTotal_cmH2O: peepTotal,
    autoPeep_cmH2O: autoPeep,
    vti_ml: vti,
    vte_ml: vte,
    mve_L_min: (vte * rr) / 1000,
    rr_per_min: rr,
    ti_s: actualTi,
    te_s: te,
    ie_te_per_ti: te / ti,
    tau_s: tau,
    drivingPressure_cmH2O: pplat - peepTotal,
    vtPerKg_ml_per_kg: p.pbw_kg > 0 ? vtLung / p.pbw_kg : 0,
    alveolarVent_L_min: va,
    paco2Est_mmHg: estimatePaCO2_mmHg(va, p.pbw_kg),
    oxygenation: oxygenationTendency(s.fio2, peep, p.oxygenation_impairment ?? 0),
    pressureLimited,
    peakInspFlow_L_min: peakFlow * 60,
    endExpFlow_L_min: lastExpFlow_L_s * 60,
    cycle_s: total,
  };

  return { samples, metrics, endLungVolume_ml: vEndExp };
}

function round(v: number, d: number) {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

/* ------------------------------------------------------------------ */
/* Mehrere Atemzüge                                                    */
/* ------------------------------------------------------------------ */

export interface SimulationResult {
  /** fortlaufende Zeitreihe aller Atemzüge */
  samples: Sample[];
  breaths: BreathMetrics[];
  last: BreathMetrics;
  endLungVolume_ml: number;
}

/**
 * Simuliert N Atemzüge Atemzug für Atemzug: Jeder Atemzug startet beim
 * endexspiratorischen Volumen des vorherigen (→ Auto-PEEP baut sich auf).
 */
export function simulate(s: VentSettings, p: PatientParams, nBreaths: number, startVolume_ml = 0, opts: BreathOptions = {}): SimulationResult {
  const samples: Sample[] = [];
  const breaths: BreathMetrics[] = [];
  let v = startVolume_ml;
  let t0 = 0;
  for (let b = 0; b < Math.max(1, nBreaths); b++) {
    const r = simulateBreath(s, p, v, opts);
    // letzten Punkt weglassen (= erster Punkt des nächsten Atemzugs)
    const n = r.samples.length - 1;
    for (let i = 0; i < n; i++) {
      const sm = r.samples[i];
      samples.push({ ...sm, t: round(t0 + sm.t, 3) });
    }
    t0 += r.metrics.cycle_s;
    breaths.push(r.metrics);
    v = r.endLungVolume_ml;
  }
  return { samples, breaths, last: breaths[breaths.length - 1], endLungVolume_ml: v };
}

/**
 * Endexspiratorisches Volumen im eingeschwungenen Zustand (Iteration bis zur Konvergenz).
 */
export function steadyStartVolume_ml(s: VentSettings, p: PatientParams, maxBreaths = 60): number {
  let v = 0;
  for (let i = 0; i < maxBreaths; i++) {
    const r = simulateBreath(s, p, v, { dt_s: 0.005 });
    if (Math.abs(r.endLungVolume_ml - v) < 0.05) return r.endLungVolume_ml;
    v = r.endLungVolume_ml;
  }
  return v;
}

/** Kennwerte im eingeschwungenen Zustand */
export function steadyState(s: VentSettings, p: PatientParams): BreathMetrics {
  return simulateBreath(s, p, steadyStartVolume_ml(s, p)).metrics;
}

/**
 * Zeigt n Atemzüge im eingeschwungenen Zustand (z. B. für statische Kurven).
 */
export function simulateSteady(s: VentSettings, p: PatientParams, nShow = 3): SimulationResult {
  return simulate(s, p, nShow, steadyStartVolume_ml(s, p));
}

/* ------------------------------------------------------------------ */
/* Alarme (angelehnt an IEC 60601-1-8 Prioritäten)                     */
/* ------------------------------------------------------------------ */

export type AlarmPriority = 'high' | 'medium' | 'low';

export interface Alarm {
  id: 'pmax' | 'mv-low' | 'mv-high' | 'vte-low' | 'autopeep' | 'pplat' | 'dp' | 'vt-high';
  priority: AlarmPriority;
  title: string;
  explanation: string;
}

export function defaultAlarmLimits(s: Pick<VentSettings, 'pmax_cmH2O'>, p: Pick<PatientParams, 'pbw_kg'>): AlarmLimits {
  return {
    pmax_cmH2O: s.pmax_cmH2O,
    mvLow_L_min: 3,
    mvHigh_L_min: 16,
    // ≈ 4 ml/kg PBW
    vteLow_ml: Math.round((p.pbw_kg * 4) / 10) * 10,
  };
}

/**
 * Leitet Alarme aus den Messwerten ab. Die Priorität orientiert sich an IEC 60601-1-8
 * (hoch = rot, mittel = gelb, niedrig = Hinweis). Die konkreten Alarmgrenzen und
 * -prioritäten sind gerätespezifisch – siehe Gebrauchsanweisung.
 */
export function evaluateAlarms(m: BreathMetrics, lim: AlarmLimits): Alarm[] {
  const a: Alarm[] = [];
  if (m.pressureLimited || m.ppeak_cmH2O >= lim.pmax_cmH2O - 0.05) {
    a.push({
      id: 'pmax',
      priority: 'high',
      title: 'Atemwegsdruck hoch',
      explanation:
        m.mode === 'VC'
          ? `P_max (${fmt(lim.pmax_cmH2O)} cmH₂O) erreicht: Die Inspiration wurde abgebrochen, das Volumen nicht vollständig appliziert. Ursache suchen (Resistance? Compliance? Flow zu hoch?) statt die Grenze einfach zu erhöhen.`
          : `Der Inspirationsdruck wird durch P_max (${fmt(lim.pmax_cmH2O)} cmH₂O) begrenzt.`,
    });
  }
  if (m.mve_L_min < lim.mvLow_L_min)
    a.push({ id: 'mv-low', priority: 'high', title: 'Minutenvolumen niedrig', explanation: `MVe ${fmt(m.mve_L_min, 1)} L/min < ${fmt(lim.mvLow_L_min, 1)} L/min: Gefahr der Hypoventilation. Leckage, Diskonnektion, Druckbegrenzung oder Einstellung prüfen.` });
  if (m.mve_L_min > lim.mvHigh_L_min)
    a.push({ id: 'mv-high', priority: 'medium', title: 'Minutenvolumen hoch', explanation: `MVe ${fmt(m.mve_L_min, 1)} L/min > ${fmt(lim.mvHigh_L_min, 1)} L/min: Hyperventilation möglich (PaCO₂ ↓).` });
  if (m.vte_ml < lim.vteLow_ml)
    a.push({ id: 'vte-low', priority: 'medium', title: 'Tidalvolumen niedrig', explanation: `VTe ${fmt(m.vte_ml)} ml < ${fmt(lim.vteLow_ml)} ml. Mögliche Ursachen: Leck, Druckbegrenzung, sinkende Compliance (im PC-Modus).` });
  if (m.autoPeep_cmH2O >= 1)
    a.push({ id: 'autopeep', priority: 'low', title: 'Intrinsischer PEEP', explanation: `Exspiration unvollständig (Te ${fmt(m.te_s, 1)} s < 3 τ = ${fmt(3 * m.tau_s, 1)} s). Air Trapping: PEEPi ≈ ${fmt(m.autoPeep_cmH2O, 1)} cmH₂O.` });
  if (m.pplat_cmH2O > 30)
    a.push({ id: 'pplat', priority: 'low', title: 'Plateaudruck > 30', explanation: 'Lungenprotektive Zielgröße (Pplat ≤ 30 cmH₂O) überschritten.' });
  if (m.drivingPressure_cmH2O > 15)
    a.push({ id: 'dp', priority: 'low', title: 'Driving Pressure > 15', explanation: 'ΔP = Pplat − PEEP über 15 cmH₂O – VT bezogen auf die Compliance eher zu groß.' });
  if (m.vtPerKg_ml_per_kg > 8.5)
    a.push({ id: 'vt-high', priority: 'low', title: 'VT > 8 ml/kg PBW', explanation: 'Tidalvolumen oberhalb des lungenprotektiven Bereichs (≈ 6–8 ml/kg Idealgewicht).' });
  const order: Record<AlarmPriority, number> = { high: 0, medium: 1, low: 2 };
  return a.sort((x, y) => order[x.priority] - order[y.priority]);
}

/* ------------------------------------------------------------------ */
/* Formatierung                                                        */
/* ------------------------------------------------------------------ */

/** Deutsche Zahlformatierung (Komma) */
export function fmt(v: number, digits = 0): string {
  if (!Number.isFinite(v)) return '–';
  return v.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** I:E als „1:2,0“ */
export function fmtIE(te_per_ti: number): string {
  if (te_per_ti >= 1) return `1:${fmt(te_per_ti, 1)}`;
  return `${fmt(1 / te_per_ti, 1)}:1`;
}

/* ------------------------------------------------------------------ */
/* Patientenprofile & Standardwerte                                    */
/* ------------------------------------------------------------------ */

export type PatientPresetId = 'gesund' | 'ards' | 'obstruktiv';

export interface PatientPreset {
  id: PatientPresetId;
  label: string;
  description: string;
  params: PatientParams;
}

export const PATIENT_PRESETS: Record<PatientPresetId, PatientPreset> = {
  gesund: {
    id: 'gesund',
    label: 'Lungengesund',
    description: 'Erwachsene:r, intubiert, 70 kg PBW. Normale Compliance, Resistance v. a. durch den Tubus.',
    params: { compliance_ml_per_cmH2O: 60, resistance_cmH2O_per_L_s: 8, pbw_kg: 70, deadspace_ml: 154, oxygenation_impairment: 0 },
  },
  ards: {
    id: 'ards',
    label: 'ARDS',
    description: 'Steife, „kleine“ Lunge (Baby Lung): stark verminderte Compliance, kurze Zeitkonstante, Gasaustauschstörung.',
    params: { compliance_ml_per_cmH2O: 25, resistance_cmH2O_per_L_s: 10, pbw_kg: 70, deadspace_ml: 180, oxygenation_impairment: 0.8 },
  },
  obstruktiv: {
    id: 'obstruktiv',
    label: 'Obstruktiv (COPD/Asthma)',
    description: 'Deutlich erhöhte Resistance → lange Zeitkonstante, Gefahr von Air Trapping (Auto-PEEP).',
    params: { compliance_ml_per_cmH2O: 60, resistance_cmH2O_per_L_s: 25, pbw_kg: 70, deadspace_ml: 154, oxygenation_impairment: 0.3 },
  },
};

export const DEFAULT_SETTINGS: VentSettings = {
  mode: 'VC',
  vt_ml: 450,
  rr_per_min: 14,
  peep_cmH2O: 5,
  fio2: 0.4,
  ti_s: 1.2,
  pinsp_above_peep_cmH2O: 12,
  flowPattern: 'square',
  pause_s: 0,
  pmax_cmH2O: 40,
};
