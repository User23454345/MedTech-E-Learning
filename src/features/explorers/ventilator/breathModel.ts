/**
 * Einkompartimentmodell eines volumenkontrollierten Atemhubs (konstanter Flow).
 *
 *   P_aw = PEEP + V/C + R · V̇
 *
 * Einheiten intern: Volumen in L, Flow in L/s, Druck in cmH2O, Zeit in s,
 * R in cmH2O/(L/s), C in L/cmH2O. Ausgabe: Volumen in ml, Flow in L/min.
 */

export const MODEL = {
  /** Tidalvolumen [ml] */
  vtMl: 500,
  /** Inspiratorischer Flow [L/min] */
  flowLmin: 30,
  /** Resistance [cmH2O/(L/s)] */
  r: 10,
  /** Compliance [ml/cmH2O] */
  cMl: 50,
  /** PEEP [cmH2O] */
  peep: 5,
  /** Inspiratorische Pause [s] */
  pause: 0.3,
  /** Dauer der dargestellten Triggerphase [s] */
  trigger: 0.2,
  /** Atemfrequenz [1/min] */
  rate: 15,
} as const;

const VT = MODEL.vtMl / 1000; // L
const FLOW = MODEL.flowLmin / 60; // L/s
const C = MODEL.cMl / 1000; // L/cmH2O
export const TAU = MODEL.r * C; // s  (10 · 0,05 = 0,5 s)
export const T_INSP_FLOW = VT / FLOW; // s  (1,0 s)
export const CYCLE = 60 / MODEL.rate; // s  (4,0 s)

export const P_PEAK = MODEL.peep + VT / C + MODEL.r * FLOW; // 20 cmH2O
export const P_PLAT = MODEL.peep + VT / C; // 15 cmH2O
export const DRIVING_P = P_PLAT - MODEL.peep; // 10 cmH2O
export const EXP_PEAK_FLOW_LMIN = (-(P_PLAT - MODEL.peep) / MODEL.r) * 60; // −60 L/min

export type PhaseId = 'trigger' | 'insp' | 'pause' | 'exp' | 'peep';

export interface PhaseDef {
  id: PhaseId;
  num: number;
  title: string;
  short: string;
  start: number;
  end: number;
  /** Repräsentativer Zeitpunkt für den Schrittmodus */
  snapshot: number;
}

const T0 = MODEL.trigger;
const T1 = T0 + T_INSP_FLOW;
const T2 = T1 + MODEL.pause;
/** Aktive Exspiration bis 3 τ (≈ 95 % entleert), danach PEEP-Phase */
const T3 = T2 + 3 * TAU;

export const PHASES: PhaseDef[] = [
  { id: 'trigger', num: 1, title: 'Trigger', short: 'Trigger', start: 0, end: T0, snapshot: 0.1 },
  { id: 'insp', num: 2, title: 'Inspiration', short: 'Inspiration', start: T0, end: T1, snapshot: T0 + 0.8 * T_INSP_FLOW },
  { id: 'pause', num: 3, title: 'Inspiratorische Pause (Plateau)', short: 'Plateau', start: T1, end: T2, snapshot: T1 + MODEL.pause / 2 },
  { id: 'exp', num: 4, title: 'Exspiration', short: 'Exspiration', start: T2, end: T3, snapshot: T2 + 0.6 * TAU },
  { id: 'peep', num: 5, title: 'Endexspiration – PEEP', short: 'PEEP', start: T3, end: CYCLE, snapshot: T3 + (CYCLE - T3) / 2 },
];

export interface ModelState {
  /** Atemwegsdruck am Y-Stück [cmH2O] */
  paw: number;
  /** Alveolardruck (Modell) [cmH2O] */
  palv: number;
  /** Flow [L/min], positiv = zur Patient:in */
  flow: number;
  /** Volumen über endexspiratorischem Volumen [ml] */
  vol: number;
}

/** Zustand zum Zeitpunkt t (0 ≤ t < CYCLE) */
export function stateAt(tRaw: number): ModelState {
  const t = ((tRaw % CYCLE) + CYCLE) % CYCLE;
  const peep = MODEL.peep;
  if (t < T0) {
    // Ende der vorherigen Exspiration: Restfluss vernachlässigbar (e^−5 < 1 %)
    return { paw: peep, palv: peep, flow: 0, vol: 0 };
  }
  if (t < T1) {
    const v = FLOW * (t - T0); // L
    return { paw: peep + v / C + MODEL.r * FLOW, palv: peep + v / C, flow: FLOW * 60, vol: v * 1000 };
  }
  if (t < T2) {
    return { paw: P_PLAT, palv: P_PLAT, flow: 0, vol: MODEL.vtMl };
  }
  // Passive Exspiration: V(t) = VT · e^(−t/τ), V̇ = −(Pplat − PEEP)/R · e^(−t/τ)
  const te = t - T2;
  const k = Math.exp(-te / TAU);
  const v = VT * k;
  const flow = (-(P_PLAT - peep) / MODEL.r) * k; // L/s
  // Ideales Exspirationsventil: Atemwegsdruck = PEEP (P_aw = PEEP + V/C + R·V̇ = PEEP)
  return { paw: peep + v / C + MODEL.r * flow, palv: peep + v / C, flow: flow * 60, vol: v * 1000 };
}

export const BOUNDARIES = [T0, T1, T2];

export interface Sample extends ModelState {
  t: number;
}

/** Abtastung inkl. Sprungstellen (für SVG-Kurven) */
export function sampleCycle(dt = 0.01): Sample[] {
  const ts: number[] = [];
  for (let t = 0; t <= CYCLE + 1e-9; t += dt) ts.push(Math.min(t, CYCLE - 1e-6));
  for (const b of BOUNDARIES) ts.push(b - 1e-6, b);
  ts.sort((a, b) => a - b);
  return ts.map((t) => ({ t, ...stateAt(t) }));
}

export function phaseAt(t: number): PhaseDef {
  const tt = ((t % CYCLE) + CYCLE) % CYCLE;
  return PHASES.find((p) => tt >= p.start && tt < p.end) ?? PHASES[PHASES.length - 1];
}
