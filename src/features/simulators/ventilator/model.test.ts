import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SETTINGS,
  PATIENT_PRESETS,
  evaluateAlarms,
  defaultAlarmLimits,
  pbwFromHeight,
  pcTidalVolume_ml,
  simulate,
  simulateBreath,
  steadyState,
  timeConstant_s,
  vcFlow_L_s,
  estimatePaCO2_mmHg,
  type VentSettings,
} from './model';
import { MISSIONS, isMissionMet } from './missions';
import { CURVE_CASES } from './curveCases';

const healthy = PATIENT_PRESETS.gesund.params;
const vc: VentSettings = { ...DEFAULT_SETTINGS, mode: 'VC', vt_ml: 500, rr_per_min: 12, peep_cmH2O: 5, ti_s: 1.0, pause_s: 0, pmax_cmH2O: 60 };

describe('Hilfsfunktionen', () => {
  it('PBW nach ARDSNet', () => {
    expect(pbwFromHeight(180, 'm')).toBeCloseTo(50 + 0.91 * 27.6, 5);
    expect(pbwFromHeight(165, 'w')).toBeCloseTo(45.5 + 0.91 * 12.6, 5);
  });
  it('τ = R · C', () => {
    expect(timeConstant_s({ compliance_ml_per_cmH2O: 60, resistance_cmH2O_per_L_s: 8 })).toBeCloseTo(0.48, 6);
  });
  it('PaCO₂-Referenz: 40 mmHg bei 6 ml/kg × 14/min mit 2,2 ml/kg Totraum', () => {
    const va = ((6 - 2.2) * 70 * 14) / 1000;
    expect(estimatePaCO2_mmHg(va, 70)).toBeCloseTo(40, 6);
    expect(estimatePaCO2_mmHg(va * 2, 70)).toBeCloseTo(20, 6);
  });
});

describe('VC mit konstantem Flow', () => {
  it('Ppeak = PEEP + VT/C + R·V̇', () => {
    const m = steadyState(vc, healthy);
    const flow = vcFlow_L_s(vc); // 0,5 L/s
    expect(flow).toBeCloseTo(0.5, 6);
    const expected = 5 + 500 / 60 + 8 * 0.5 + m.autoPeep_cmH2O;
    expect(m.ppeak_cmH2O).toBeCloseTo(expected, 1);
    expect(m.vti_ml).toBeCloseTo(500, 0);
  });
  it('Pplat = PEEP + VT/C, ΔP = VT/C', () => {
    const m = steadyState({ ...vc, pause_s: 0.3 }, healthy);
    expect(m.pplatMeasured).toBe(true);
    expect(m.pplat_cmH2O - m.peepTotal_cmH2O).toBeCloseTo(500 / 60, 1);
    expect(m.drivingPressure_cmH2O).toBeCloseTo(500 / 60, 1);
  });
  it('PEEP ↑ → Ppeak und Pplat steigen um denselben Betrag, ΔP gleich', () => {
    const a = steadyState(vc, healthy);
    const b = steadyState({ ...vc, peep_cmH2O: 10 }, healthy);
    expect(b.ppeak_cmH2O - a.ppeak_cmH2O).toBeCloseTo(5, 1);
    expect(b.pplat_cmH2O - a.pplat_cmH2O).toBeCloseTo(5, 1);
    expect(b.drivingPressure_cmH2O).toBeCloseTo(a.drivingPressure_cmH2O, 1);
  });
  it('MV = VT · f', () => {
    const m = steadyState(vc, healthy);
    expect(m.mve_L_min).toBeCloseTo((m.vte_ml * 12) / 1000, 6);
    expect(m.mve_L_min).toBeCloseTo(6, 1);
  });
  it('Druckbegrenzung: Inspiration endet bei Pmax, VT reduziert, Alarm', () => {
    const s = { ...vc, pmax_cmH2O: 15 };
    const m = steadyState(s, healthy);
    expect(m.pressureLimited).toBe(true);
    expect(m.ppeak_cmH2O).toBeLessThanOrEqual(15 + 1e-6);
    expect(m.vti_ml).toBeLessThan(500);
    const alarms = evaluateAlarms(m, defaultAlarmLimits(s, healthy));
    expect(alarms[0].id).toBe('pmax');
    expect(alarms[0].priority).toBe('high');
  });
});

describe('PC', () => {
  it('VT = C·ΔP·(1 − e^(−Ti/τ))', () => {
    const s: VentSettings = { ...vc, mode: 'PC', pinsp_above_peep_cmH2O: 15, ti_s: 0.6 };
    const r = simulateBreath(s, healthy, 0);
    const expected = 60 * 15 * (1 - Math.exp(-0.6 / 0.48));
    expect(r.metrics.vti_ml).toBeCloseTo(expected, 0);
    expect(pcTidalVolume_ml(s, healthy)).toBeCloseTo(expected, 6);
    expect(r.metrics.ppeak_cmH2O).toBeCloseTo(20, 6);
  });
  it('geringere Compliance → kleineres VT', () => {
    const s: VentSettings = { ...vc, mode: 'PC', pinsp_above_peep_cmH2O: 15, ti_s: 1.2 };
    const a = steadyState(s, healthy);
    const b = steadyState(s, { ...healthy, compliance_ml_per_cmH2O: 30 });
    expect(b.vte_ml).toBeLessThan(a.vte_ml * 0.6);
  });
  it('Auto-PEEP reduziert das VT im PC-Modus', () => {
    const obs = PATIENT_PRESETS.obstruktiv.params;
    const s: VentSettings = { ...vc, mode: 'PC', pinsp_above_peep_cmH2O: 15, ti_s: 1.2, rr_per_min: 24 };
    const m = steadyState(s, obs);
    expect(m.autoPeep_cmH2O).toBeGreaterThan(1);
    expect(m.vti_ml).toBeCloseTo(pcTidalVolume_ml(s, obs, m.autoPeep_cmH2O), -1);
  });
});

describe('Auto-PEEP / Air Trapping', () => {
  const obs = PATIENT_PRESETS.obstruktiv.params; // τ = 1,5 s
  it('entsteht, wenn Te < 3 τ', () => {
    const s = { ...vc, rr_per_min: 20, ti_s: 1.0 }; // Te = 2 s
    const res = simulate(s, obs, 12);
    expect(res.breaths[0].autoPeep_cmH2O).toBe(0);
    expect(res.last.autoPeep_cmH2O).toBeGreaterThan(2);
    expect(res.last.endExpFlow_L_min).toBeLessThan(-5);
    // analytisch: V_ee = VT·k/(1−k), k = e^(−Te/τ)
    const k = Math.exp(-2 / 1.5);
    expect(res.last.autoPeep_cmH2O).toBeCloseTo((500 * k) / (1 - k) / 60, 1);
  });
  it('verschwindet bei Te ≥ 3 τ', () => {
    const s = { ...vc, rr_per_min: 8, ti_s: 1.0 }; // Te = 6,5 s
    expect(steadyState(s, obs).autoPeep_cmH2O).toBeLessThan(0.5);
  });
});

describe('Leck', () => {
  it('VTe < VTi', () => {
    const m = steadyState(vc, { ...healthy, leak_fraction: 0.3 });
    expect(m.vti_ml).toBeCloseTo(500, 0);
    expect(m.vte_ml).toBeCloseTo(350, 0);
  });
});

describe('Missionen', () => {
  for (const mission of MISSIONS) {
    it(`${mission.id}: Startzustand nicht erfüllt, Beispiellösung erfüllt`, () => {
      const start = steadyState(mission.settings, mission.patient);
      expect(isMissionMet(start, mission.settings, mission)).toBe(false);
      const solved = { ...mission.settings, ...mission.exampleSolution };
      const m = steadyState(solved, mission.patient);
      const failed = mission.check(m, solved).filter((c) => !c.ok);
      expect(failed).toEqual([]);
    });
  }
  it('mindestens 5 Missionen mit eindeutigen IDs sim-1 …', () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(5);
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(MISSIONS.length);
    MISSIONS.forEach((m, i) => expect(m.id).toBe(`sim-${i + 1}`));
  });
});

describe('Kurvendetektiv-Fälle', () => {
  const get = (id: string) => {
    const c = CURVE_CASES.find((x) => x.id === id)!;
    return { m: steadyState(c.settings, c.patient), r: steadyState(c.refSettings, c.refPatient) };
  };
  it('jeder Fall hat genau eine richtige Antwort', () => {
    for (const c of CURVE_CASES) expect(c.options.filter((o) => o.correct).length).toBe(1);
    expect(CURVE_CASES.length).toBeGreaterThanOrEqual(6);
  });
  it('Resistance: Ppeak ↑, Pplat gleich', () => {
    const { m, r } = get('resistance');
    expect(m.ppeak_cmH2O - r.ppeak_cmH2O).toBeGreaterThan(5);
    expect(Math.abs(m.pplat_cmH2O - r.pplat_cmH2O)).toBeLessThan(1.5);
  });
  it('Compliance: Pplat ↑', () => {
    const { m, r } = get('compliance');
    expect(m.pplat_cmH2O - r.pplat_cmH2O).toBeGreaterThan(8);
  });
  it('Auto-PEEP: exspiratorischer Flow endet ≠ 0', () => {
    const { m, r } = get('autopeep');
    expect(m.autoPeep_cmH2O).toBeGreaterThan(2);
    expect(Math.abs(r.endExpFlow_L_min)).toBeLessThan(3);
    expect(Math.abs(m.endExpFlow_L_min)).toBeGreaterThan(10);
  });
  it('Leck: VTe < VTi', () => {
    const { m } = get('leak');
    expect(m.vte_ml).toBeLessThan(m.vti_ml * 0.8);
  });
  it('Trigger: Druck fällt unter PEEP', () => {
    const c = CURVE_CASES.find((x) => x.id === 'trigger')!;
    const minP = Math.min(...simulateBreath(c.settings, c.patient, 0).samples.map((x) => x.p));
    expect(minP).toBeLessThan(c.settings.peep_cmH2O - 1);
  });
  it('PC: niedrige Compliance bzw. hohe Resistance senken VT', () => {
    expect(get('pc-compliance').m.vte_ml).toBeLessThan(get('pc-compliance').r.vte_ml * 0.6);
    expect(get('pc-resistance').m.vte_ml).toBeLessThan(get('pc-resistance').r.vte_ml * 0.7);
  });
  it('Pmax: Fall begrenzt, Referenz nicht', () => {
    const { m, r } = get('pmax');
    expect(m.pressureLimited).toBe(true);
    expect(r.pressureLimited).toBe(false);
  });
});
