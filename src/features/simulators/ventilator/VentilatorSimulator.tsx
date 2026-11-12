/**
 * Beatmungssimulator ('vent-simulator'): Monitor mit Echtzeitkurven,
 * Messwerten, Alarmen, Bedienfeld, „Erklär mir das“ und optional Missionen.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Chip, Icon, Segmented, cx } from '@/components/ui';
import { useProgress } from '@/state/progress';
import {
  DEFAULT_SETTINGS,
  PATIENT_PRESETS,
  cycleTime_s,
  defaultAlarmLimits,
  evaluateAlarms,
  fmt,
  fmtIE,
  pbwFromHeight,
  steadyState,
  type BreathMetrics,
  type PatientParams,
  type PatientPresetId,
  type VentMode,
  type VentSettings,
} from './model';
import { SweepEngine, type BreathEndInfo } from './sweepEngine';
import { WaveformMonitor, type MonitorScales, type WaveformMonitorHandle } from './WaveformMonitor';
import { niceCeil } from './waveDraw';
import { ControlSlider } from './ControlSlider';
import { AlarmBar, MeasuredValues } from './MonitorParts';
import { MissionPanel } from './MissionPanel';
import { MISSIONS, REQUIRED_BREATHS, isMissionMet, type Mission } from './missions';
import { explainChange, type Explanation } from './explain';
import s from './VentilatorSimulator.module.css';

export interface VentilatorSimulatorProps {
  missions?: boolean;
  initialPatient?: PatientPresetId;
  initialMode?: VentMode;
}

type PatientChoice = PatientPresetId | 'custom';

interface PatientState {
  choice: PatientChoice;
  params: PatientParams;
  height_cm: number;
  sex: 'm' | 'w';
}

const PRESET_OPTIONS: { value: PatientChoice; label: string }[] = [
  { value: 'gesund', label: 'Gesund' },
  { value: 'ards', label: 'ARDS' },
  { value: 'obstruktiv', label: 'Obstruktiv' },
];

function presetPatient(id: PatientPresetId): PatientState {
  // 70 kg PBW ≈ Mann, 174 cm
  return { choice: id, params: { ...PATIENT_PRESETS[id].params }, height_cm: 174, sex: 'm' };
}

function computeScales(m: BreathMetrics, st: VentSettings, p: PatientParams): MonitorScales {
  const pTop = niceCeil(Math.max(st.pmax_cmH2O, m.ppeak_cmH2O) + 3, 10);
  const expPeak = (Math.max(0, m.pplat_cmH2O - st.peep_cmH2O) / p.resistance_cmH2O_per_L_s) * 60;
  const fRaw = Math.max(m.peakInspFlow_L_min, expPeak, 30) * 1.1;
  const fStep = fRaw > 90 ? 60 : 30;
  const fMax = niceCeil(fRaw, fStep);
  const vRaw = Math.max(m.vti_ml, st.mode === 'VC' ? st.vt_ml : 0) * 1.2;
  const vStep = vRaw > 500 ? 200 : 100;
  const vTop = niceCeil(vRaw, vStep);
  return {
    p: { min: 0, max: pTop, step: pTop > 40 ? 10 : 5 },
    flow: { min: -fMax, max: fMax, step: fStep },
    vol: { min: 0, max: vTop, step: vStep },
  };
}

function initialSettings(p: PatientPresetId, mode: VentMode): VentSettings {
  const base: VentSettings = { ...DEFAULT_SETTINGS, mode };
  if (p === 'ards') return { ...base, vt_ml: 420, rr_per_min: 20, peep_cmH2O: 10, ti_s: 1.0, fio2: 0.6, pinsp_above_peep_cmH2O: 14 };
  if (p === 'obstruktiv') return { ...base, rr_per_min: 12, ti_s: 1.0 };
  return base;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function VentilatorSimulator({ missions = false, initialPatient = 'gesund', initialMode = 'VC' }: VentilatorSimulatorProps) {
  const { state, solveSimChallenge } = useProgress();
  const solvedIds = state.simulator.challengesSolved;

  const firstMission: Mission | null = missions ? MISSIONS.find((m) => !solvedIds.includes(m.id)) ?? MISSIONS[0] : null;
  const [missionId, setMissionId] = useState<string | null>(firstMission?.id ?? null);
  const mission = missionId ? MISSIONS.find((m) => m.id === missionId) ?? null : null;

  const [settings, setSettings] = useState<VentSettings>(() =>
    firstMission ? { ...firstMission.settings } : initialSettings(initialPatient, initialMode),
  );
  const [patient, setPatient] = useState<PatientState>(() =>
    firstMission ? { choice: 'custom', params: { ...firstMission.patient }, height_cm: 174, sex: 'm' } : presetPatient(initialPatient),
  );
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [pending, setPending] = useState(false);
  const [measured, setMeasured] = useState<BreathEndInfo | null>(null);
  const [holdState, setHoldState] = useState<'idle' | 'armed' | 'done'>('idle');
  const [holdResult, setHoldResult] = useState<BreathMetrics | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [explainOpen, setExplainOpen] = useState(true);
  const [missionStreak, setMissionStreak] = useState(0);
  const [missionSuccess, setMissionSuccess] = useState(false);

  // Refs für die Animationsschleife
  const inputsRef = useRef({ settings, patient: patient.params });
  inputsRef.current = { settings, patient: patient.params };
  const missionRef = useRef<Mission | null>(mission);
  missionRef.current = mission;
  const successRef = useRef(false);
  successRef.current = missionSuccess;
  const streakRef = useRef(0);

  const engine = useMemo(() => new SweepEngine(() => inputsRef.current, 10), []);
  const monitorRef = useRef<WaveformMonitorHandle>(null);

  /* ----- Atemzug-Callbacks ----- */
  const handleBreathEnd = useCallback(
    (info: BreathEndInfo) => {
      setMeasured(info);
      if (info.held) {
        setHoldResult(info.metrics);
        setHoldState('done');
      }
      const ms = missionRef.current;
      if (ms && !successRef.current) {
        const ok = isMissionMet(info.metrics, info.settings, ms);
        const next = ok ? streakRef.current + 1 : 0;
        streakRef.current = next;
        setMissionStreak(next);
        if (next >= REQUIRED_BREATHS) {
          successRef.current = true;
          setMissionSuccess(true);
          solveSimChallenge(ms.id, ms.title);
        }
      }
    },
    [solveSimChallenge],
  );
  engine.onBreathEnd = handleBreathEnd;
  engine.onBreathStart = () => setPending(false);

  /* ----- Vorberechnung (Start, Pause, Missionswechsel) ----- */
  const prefill = useCallback(() => {
    const last = engine.prefill();
    if (last) setMeasured(last);
    setPending(false);
    monitorRef.current?.draw();
  }, [engine]);

  useEffect(() => {
    prefill();
  }, [prefill]);

  /* ----- Animationsschleife ----- */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      engine.advance((now - last) / 1000);
      last = now;
      monitorRef.current?.draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, engine]);

  // Bei Pause wirken Änderungen sofort (Standbild neu berechnen)
  useEffect(() => {
    if (!playing) prefill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, patient.params]);

  /* ----- Änderungen + Erklärung ----- */
  const explainBase = useRef<{ s: VentSettings; p: PatientParams; key: string; at: number } | null>(null);

  const applyChange = (key: string, nextS: VentSettings, nextP: PatientParams) => {
    const now = Date.now();
    const base = explainBase.current;
    if (!base || base.key !== key || now - base.at > 2000) {
      explainBase.current = { s: settings, p: patient.params, key, at: now };
    } else base.at = now;
    const b0 = explainBase.current!;
    try {
      const a = steadyState(b0.s, b0.p);
      const b = steadyState(nextS, nextP);
      setExplanation(explainChange(b0.s, nextS, b0.p, nextP, a, b));
    } catch {
      setExplanation(null);
    }
    if (playing) setPending(true);
  };

  const updateSetting = <K extends keyof VentSettings>(key: K, value: VentSettings[K]) => {
    const next = { ...settings, [key]: value };
    applyChange(key, next, patient.params);
    setSettings(next);
  };

  const updatePatient = (next: PatientState, key: string) => {
    applyChange(key, settings, next.params);
    setPatient(next);
  };

  const choosePreset = (id: PatientChoice) => {
    if (id === 'custom') return;
    const next = presetPatient(id);
    setExplanation({ title: `Patient: ${PATIENT_PRESETS[id].label}`, points: [PATIENT_PRESETS[id].description, `Compliance ${fmt(next.params.compliance_ml_per_cmH2O)} ml/cmH₂O, Resistance ${fmt(next.params.resistance_cmH2O_per_L_s)} cmH₂O/(L/s) → τ = ${fmt((next.params.compliance_ml_per_cmH2O * next.params.resistance_cmH2O_per_L_s) / 1000, 2)} s.`] });
    explainBase.current = null;
    setPatient(next);
    if (playing) setPending(true);
  };

  const setHeight = (height_cm: number, sex: 'm' | 'w') => {
    const pbw = Math.round(pbwFromHeight(height_cm, sex) * 10) / 10;
    const ratio = patient.params.deadspace_ml / Math.max(1, patient.params.pbw_kg);
    updatePatient({ ...patient, choice: 'custom', height_cm, sex, params: { ...patient.params, pbw_kg: pbw, deadspace_ml: Math.round(ratio * pbw) } }, 'pbw');
  };

  /* ----- Missionen ----- */
  const startMission = (id: string) => {
    const m = MISSIONS.find((x) => x.id === id);
    if (!m) return;
    setMissionId(id);
    setSettings({ ...m.settings });
    setPatient({ choice: 'custom', params: { ...m.patient }, height_cm: 174, sex: 'm' });
    setMissionStreak(0);
    streakRef.current = 0;
    setMissionSuccess(false);
    successRef.current = false;
    setExplanation(null);
    setHoldState('idle');
    explainBase.current = null;
    inputsRef.current = { settings: m.settings, patient: m.patient };
    prefill();
  };

  /* ----- Abgeleitete Anzeige ----- */
  const shown = measured?.metrics ?? null;
  const shownSettings = measured?.settings ?? settings;
  const alarms = useMemo(
    () => (shown ? evaluateAlarms(shown, defaultAlarmLimits(shownSettings, measured?.patient ?? patient.params)) : []),
    [shown, shownSettings, measured, patient.params],
  );
  const scales = useMemo(() => (shown ? computeScales(shown, settings, patient.params) : computeScales(steadyState(settings, patient.params), settings, patient.params)), [shown, settings, patient.params]);
  const criteria = mission && shown ? mission.check(shown, shownSettings) : [];

  const cycle = cycleTime_s(settings.rr_per_min);
  const te = cycle - settings.ti_s;
  const tiTooLong = te < 0.3;
  const vc = settings.mode === 'VC';
  const vcFlow = vc ? (settings.vt_ml / 1000 / Math.max(0.1, settings.ti_s - settings.pause_s)) * 60 : 0;
  const locked = !!mission;
  const tau = (patient.params.compliance_ml_per_cmH2O * patient.params.resistance_cmH2O_per_L_s) / 1000;

  const togglePlay = () => setPlaying((p) => !p);
  const requestHold = () => {
    engine.holdNext = true;
    setHoldState('armed');
  };

  return (
    <div className={s.sim}>
      {missions && missionId && (
        <MissionPanel
          missions={MISSIONS}
          activeId={missionId}
          solvedIds={solvedIds}
          criteria={criteria}
          streak={missionStreak}
          success={missionSuccess}
          onSelect={startMission}
          onRestart={() => startMission(missionId)}
        />
      )}

      <div className={s.device}>
        {/* Kopfzeile wie am Gerät */}
        <div className={s.topbar}>
          <div className={s.topInfo}>
            <span className={s.modeBadge}>{vc ? 'VC-CMV' : 'PC-CMV'}</span>
            <span className={s.topPatient}>
              <Icon name="user" size={14} />
              {mission ? mission.patientLabel : `${patient.choice === 'custom' ? 'Individuell' : PATIENT_PRESETS[patient.choice].label} · ${fmt(patient.params.pbw_kg)} kg PBW`}
            </span>
          </div>
          <div className={s.topActions}>
            <button type="button" className={s.monBtn} onClick={togglePlay} aria-pressed={playing} aria-label={playing ? 'Kurven anhalten' : 'Kurven abspielen'}>
              <Icon name={playing ? 'pause' : 'play'} size={16} />
              <span>{playing ? 'Pause' : 'Start'}</span>
            </button>
            <button
              type="button"
              className={cx(s.monBtn, holdState === 'armed' && s.monBtnActive)}
              onClick={requestHold}
              disabled={!playing || holdState === 'armed'}
              title={playing ? 'Inspiratorischer Hold beim nächsten Atemzug (1,5 s)' : 'Zum Messen bitte Kurven abspielen'}
            >
              <Icon name="hand" size={16} />
              <span>Insp. Hold</span>
            </button>
          </div>
        </div>

        <div className={s.screen}>
          <WaveformMonitor
            ref={monitorRef}
            engine={engine}
            scales={scales}
            ariaLabel={
              shown
                ? `Beatmungskurven: Spitzendruck ${fmt(shown.ppeak_cmH2O, 1)} cmH₂O, PEEP ${fmt(shown.peepTotal_cmH2O, 1)} cmH₂O, Tidalvolumen ${fmt(shown.vte_ml)} ml, Spitzenflow ${fmt(shown.peakInspFlow_L_min)} L/min.`
                : 'Beatmungskurven'
            }
          />
          {shown && <MeasuredValues m={shown} fio2={shownSettings.fio2} />}
        </div>

        <AlarmBar alarms={alarms} />

        <div className={s.statusRow} aria-live="polite">
          {pending && (
            <span className={s.pending}>
              <Icon name="clock" size={14} /> Änderung wird mit dem nächsten Atemzug wirksam – wie am echten Gerät.
            </span>
          )}
          {holdState === 'armed' && (
            <span className={s.pending}>
              <Icon name="hand" size={14} /> Insp. Hold beim nächsten Atemzug …
            </span>
          )}
          {holdState === 'done' && holdResult && (
            <span className={s.holdResult}>
              <Icon name="gauge" size={14} />
              Insp. Hold: P<sub>plat</sub> = <strong>{fmt(holdResult.pplat_cmH2O, 1)} cmH₂O</strong>
              {holdResult.mode === 'VC' && (
                <>
                  {' '}
                  · P<sub>peak</sub> − P<sub>plat</sub> = {fmt(holdResult.ppeak_cmH2O - holdResult.pplat_cmH2O, 1)} cmH₂O (resistiver Anteil R · V̇)
                </>
              )}{' '}
              · ΔP = {fmt(holdResult.drivingPressure_cmH2O, 1)} cmH₂O
              <button type="button" className={s.linkBtn} onClick={() => setHoldState('idle')} aria-label="Hold-Ergebnis schließen">
                <Icon name="x" size={14} />
              </button>
            </span>
          )}
        </div>

        {/* Bedienfeld */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <h3 className={s.h3}>
              <Icon name="sliders" size={18} /> Einstellungen
            </h3>
            <Segmented<VentMode>
              label="Beatmungsmodus"
              value={settings.mode}
              onChange={(v) => updateSetting('mode', v)}
              options={[
                { value: 'VC', label: 'VC – volumenkontrolliert' },
                { value: 'PC', label: 'PC – druckkontrolliert' },
              ]}
            />
          </div>
          <div className={s.controls}>
            {vc ? (
              <ControlSlider
                short="VT"
                label="Tidalvolumen"
                value={settings.vt_ml}
                min={200}
                max={800}
                step={10}
                unit="ml"
                onChange={(v) => updateSetting('vt_ml', v)}
                hint={`${fmt(settings.vt_ml / patient.params.pbw_kg, 1)} ml/kg PBW · Flow ${fmt(vcFlow)} L/min`}
              />
            ) : (
              <ControlSlider
                short={<>P<sub>insp</sub></>}
                label="über PEEP"
                value={settings.pinsp_above_peep_cmH2O}
                min={4}
                max={35}
                step={1}
                unit="cmH₂O"
                onChange={(v) => updateSetting('pinsp_above_peep_cmH2O', v)}
                hint={`Atemwegsdruck in der Inspiration: ${fmt(settings.peep_cmH2O + settings.pinsp_above_peep_cmH2O)} cmH₂O`}
              />
            )}
            <ControlSlider short="f" label="Frequenz" value={settings.rr_per_min} min={6} max={35} step={1} unit="/min" onChange={(v) => updateSetting('rr_per_min', v)} hint={`Zyklus ${fmt(cycle, 1)} s`} />
            <ControlSlider short="PEEP" label="endexspiratorischer Druck" value={settings.peep_cmH2O} min={0} max={20} step={1} unit="cmH₂O" onChange={(v) => updateSetting('peep_cmH2O', v)} />
            <ControlSlider short={<>F<sub>I</sub>O<sub>2</sub></>} label="Sauerstoffanteil" value={settings.fio2} min={0.21} max={1} step={0.01} digits={2} onChange={(v) => updateSetting('fio2', v)} hint={`${fmt(settings.fio2 * 100)} % O₂`} />
            <ControlSlider
              short="Ti"
              label="Inspirationszeit"
              value={settings.ti_s}
              min={0.4}
              max={3}
              step={0.1}
              digits={1}
              unit="s"
              onChange={(v) => updateSetting('ti_s', v)}
              tone={tiTooLong ? 'warning' : 'default'}
              hint={tiTooLong ? 'Ti zu lang für die Frequenz – wird begrenzt.' : `Te ${fmt(te, 1)} s · I:E ${fmtIE(te / settings.ti_s)} · 3 τ = ${fmt(3 * tau, 1)} s`}
            />
            {vc && (
              <ControlSlider
                short="Pause"
                label="endinspiratorisch"
                value={settings.pause_s}
                min={0}
                max={Math.max(0, Math.round((settings.ti_s - 0.2) * 10) / 10)}
                step={0.1}
                digits={1}
                unit="s"
                onChange={(v) => updateSetting('pause_s', v)}
                hint="Teil von Ti – ermöglicht die Plateaumessung"
              />
            )}
            <ControlSlider short={<>P<sub>max</sub></>} label="Alarmgrenze" value={settings.pmax_cmH2O} min={15} max={60} step={1} unit="cmH₂O" onChange={(v) => updateSetting('pmax_cmH2O', v)} hint="Druckbegrenzung: Inspiration endet bei Erreichen" />
          </div>

          {/* Patient */}
          <div className={s.patientRow}>
            <div className={s.patientHead}>
              <span className={s.subLabel}>
                <Icon name="lungs" size={16} /> Patientenprofil
              </span>
              {locked ? (
                <Chip tone="primary" icon="lock">
                  durch Mission festgelegt
                </Chip>
              ) : (
                <Segmented<PatientChoice>
                  label="Patientenprofil"
                  value={patient.choice}
                  onChange={choosePreset}
                  options={patient.choice === 'custom' ? [...PRESET_OPTIONS, { value: 'custom', label: 'Individuell' }] : PRESET_OPTIONS}
                />
              )}
            </div>
            <details className={s.expander}>
              <summary>
                <Icon name="chevronDown" size={16} className={s.expChevron} /> Patient anpassen
                <span className={s.muted}>
                  C {fmt(patient.params.compliance_ml_per_cmH2O)} ml/cmH₂O · R {fmt(patient.params.resistance_cmH2O_per_L_s)} cmH₂O/(L/s) · τ {fmt(tau, 2)} s
                </span>
              </summary>
              <div className={s.controls}>
                <ControlSlider
                  short="C"
                  label="Compliance"
                  value={patient.params.compliance_ml_per_cmH2O}
                  min={10}
                  max={120}
                  step={1}
                  unit="ml/cmH₂O"
                  disabled={locked}
                  onChange={(v) => updatePatient({ ...patient, choice: 'custom', params: { ...patient.params, compliance_ml_per_cmH2O: v } }, 'C')}
                  hint="Normal beatmet ≈ 50–100, ARDS oft < 40"
                />
                <ControlSlider
                  short="R"
                  label="Resistance"
                  value={patient.params.resistance_cmH2O_per_L_s}
                  min={2}
                  max={50}
                  step={1}
                  unit="cmH₂O/(L/s)"
                  disabled={locked}
                  onChange={(v) => updatePatient({ ...patient, choice: 'custom', params: { ...patient.params, resistance_cmH2O_per_L_s: v } }, 'R')}
                  hint="Intubiert ≈ 5–10, obstruktiv deutlich höher"
                />
                <ControlSlider
                  short="Größe"
                  label={patient.sex === 'm' ? '(männlich)' : '(weiblich)'}
                  value={patient.height_cm}
                  min={145}
                  max={205}
                  step={1}
                  unit="cm"
                  disabled={locked}
                  onChange={(v) => setHeight(v, patient.sex)}
                  hint={`Idealgewicht (PBW): ${fmt(patient.params.pbw_kg, 1)} kg`}
                />
                <div className={s.sexPick}>
                  <span className={s.subLabel}>Geschlecht (für PBW)</span>
                  <Segmented<'m' | 'w'>
                    label="Geschlecht für Idealgewicht"
                    value={patient.sex}
                    onChange={(v) => !locked && setHeight(patient.height_cm, v)}
                    options={[
                      { value: 'm', label: 'männlich' },
                      { value: 'w', label: 'weiblich' },
                    ]}
                  />
                  <span className={s.muted}>PBW = {patient.sex === 'm' ? '50' : '45,5'} + 0,91 · (Größe − 152,4)</span>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Erklär mir das */}
      <section className={s.explain} aria-label="Erklär mir das">
        <button type="button" className={s.explainToggle} aria-expanded={explainOpen} onClick={() => setExplainOpen((o) => !o)}>
          <Icon name="lightbulb" size={18} />
          <span>Erklär mir das</span>
          <Icon name="chevronDown" size={16} className={cx(s.expChevron, explainOpen && s.rot)} />
        </button>
        {explainOpen && (
          <div className={s.explainBody} aria-live="polite">
            {explanation ? (
              <>
                <div className={s.explainTitle}>{explanation.title}</div>
                <ul>
                  {explanation.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className={s.muted}>
                Ändere eine Einstellung – hier erscheint, was sich verändert und warum. Grundlage ist die Bewegungsgleichung P<sub>aw</sub> = PEEP + V/C + R · V̇.
              </p>
            )}
            <p className={s.modelNote}>
              <Icon name="info" size={14} /> Vereinfachtes Ein-Kompartiment-Modell (lineare Compliance, konstante Resistance). Keine Therapieempfehlung – Einstellungen am Gerät immer nach
              Gebrauchsanweisung und lokalen SOPs.
            </p>
          </div>
        )}
      </section>

      {!missions && (
        <div className={s.resetRow}>
          <Button
            variant="ghost"
            size="sm"
            icon="reset"
            onClick={() => {
              const st = initialSettings(initialPatient, initialMode);
              setSettings(st);
              setPatient(presetPatient(initialPatient));
              setExplanation(null);
              explainBase.current = null;
              inputsRef.current = { settings: st, patient: PATIENT_PRESETS[initialPatient].params };
              prefill();
            }}
          >
            Auf Standardwerte zurücksetzen
          </Button>
        </div>
      )}
    </div>
  );
}
