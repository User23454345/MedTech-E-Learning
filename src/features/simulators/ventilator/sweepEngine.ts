/**
 * Echtzeit-Engine für den Monitor: erzeugt Atemzug für Atemzug Samples aus
 * dem Modell und schreibt sie in Ringpuffer (Sweep-Darstellung).
 * Einstellungen werden – wie am echten Gerät – erst mit dem nächsten
 * Atemzug übernommen.
 */
import { DT_S, simulateBreath, steadyStartVolume_ml, type BreathMetrics, type BreathResult, type PatientParams, type VentSettings } from './model';

export interface EngineInputs {
  settings: VentSettings;
  patient: PatientParams;
}

export interface BreathEndInfo {
  metrics: BreathMetrics;
  settings: VentSettings;
  patient: PatientParams;
  held: boolean;
}

/** Dauer des inspiratorischen Holds [s] */
export const INSP_HOLD_S = 1.5;

export class SweepEngine {
  readonly windowS: number;
  readonly n: number;
  readonly p: Float32Array;
  readonly flow: Float32Array;
  readonly vol: Float32Array;
  cursor = 0;
  /** Lücke vor dem Cursor (Samples) */
  readonly gapN: number;

  getInputs: () => EngineInputs;
  onBreathStart: (() => void) | null = null;
  onBreathEnd: ((info: BreathEndInfo) => void) | null = null;
  holdNext = false;

  private breath: BreathResult | null = null;
  private breathInputs: EngineInputs | null = null;
  private breathHeld = false;
  private idx = 0;
  private lungVolume = 0;
  private acc = 0;
  private writeIdx = -1;

  constructor(getInputs: () => EngineInputs, windowS = 10) {
    this.getInputs = getInputs;
    this.windowS = windowS;
    this.n = Math.round(windowS / DT_S);
    this.p = new Float32Array(this.n).fill(NaN);
    this.flow = new Float32Array(this.n).fill(NaN);
    this.vol = new Float32Array(this.n).fill(NaN);
    this.gapN = Math.round(0.35 / DT_S);
  }

  private startBreath() {
    const inputs = this.getInputs();
    const held = this.holdNext;
    this.holdNext = false;
    this.breathInputs = inputs;
    this.breathHeld = held;
    this.breath = simulateBreath(inputs.settings, inputs.patient, this.lungVolume, { inspHold_s: held ? INSP_HOLD_S : 0 });
    this.idx = 0;
    this.onBreathStart?.();
  }

  private step() {
    if (!this.breath || this.idx >= this.breath.samples.length - 1) {
      if (this.breath && this.breathInputs) {
        this.lungVolume = this.breath.endLungVolume_ml;
        this.onBreathEnd?.({ metrics: this.breath.metrics, settings: this.breathInputs.settings, patient: this.breathInputs.patient, held: this.breathHeld });
      }
      this.startBreath();
    }
    const b = this.breath;
    if (!b) return;
    const sm = b.samples[this.idx++];
    this.writeIdx = (this.writeIdx + 1) % this.n;
    this.p[this.writeIdx] = sm.p;
    this.flow[this.writeIdx] = sm.flow;
    this.vol[this.writeIdx] = sm.vol;
    this.cursor = this.writeIdx;
  }

  /** Simulationszeit um `seconds` vorrücken (Echtzeit) */
  advance(seconds: number) {
    this.acc += Math.min(0.25, Math.max(0, seconds));
    while (this.acc >= DT_S) {
      this.acc -= DT_S;
      this.step();
    }
  }

  /**
   * Neustart: Puffer leeren, im eingeschwungenen Zustand beginnen und ein
   * fast volles Fenster vorberechnen (sinnvolles Standbild bei Pause).
   * Gibt die Kennwerte des letzten vollständigen Atemzugs zurück.
   */
  prefill(): BreathEndInfo | null {
    const { settings, patient } = this.getInputs();
    this.p.fill(NaN);
    this.flow.fill(NaN);
    this.vol.fill(NaN);
    this.writeIdx = -1;
    this.cursor = 0;
    this.acc = 0;
    this.breath = null;
    this.breathInputs = null;
    this.holdNext = false;
    this.lungVolume = steadyStartVolume_ml(settings, patient);
    const box: { last: BreathEndInfo | null } = { last: null };
    const cb = this.onBreathEnd;
    const cbStart = this.onBreathStart;
    this.onBreathEnd = (info) => {
      box.last = info;
    };
    this.onBreathStart = null;
    const steps = Math.round(this.n * 0.97);
    for (let i = 0; i < steps; i++) this.step();
    this.onBreathEnd = cb;
    this.onBreathStart = cbStart;
    // step() hat breath/breathInputs gesetzt (TS kennt diese Mutation nicht)
    const b = this.breath as BreathResult | null;
    const bi = this.breathInputs as EngineInputs | null;
    if (!box.last && b && bi) {
      box.last = { metrics: b.metrics, settings: bi.settings, patient: bi.patient, held: false };
    }
    return box.last;
  }
}
