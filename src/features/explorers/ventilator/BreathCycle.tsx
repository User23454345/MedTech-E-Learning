/**
 * Widget „vent-breath-cycle“: ein mandatorischer, volumenkontrollierter
 * Atemhub Schritt für Schritt – Ventile, Gasfluss, Lunge, Druck und
 * synchronisierte Kurven aus dem Einkompartimentmodell.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon, Segmented, cx } from '@/components/ui';
import { Markdown, renderInline } from '@/components/blocks/Markdown';
import {
  CYCLE,
  DRIVING_P,
  EXP_PEAK_FLOW_LMIN,
  MODEL,
  PHASES,
  P_PEAK,
  P_PLAT,
  TAU,
  phaseAt,
  sampleCycle,
  stateAt,
} from './breathModel';
import { PHASE_TEXT, VALVE_LABEL, type ValveState } from './breathPhases';
import { BreathSchematic } from './BreathSchematic';
import { MiniCurve } from './MiniCurve';
import s from './BreathCycle.module.css';

type Speed = '0.5' | '1';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

const fmt = (n: number, d = 0) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });

export default function BreathCycle() {
  const reduced = usePrefersReducedMotion();
  /** Absolute Zeit (über mehrere Zyklen), damit die Gasbewegung stetig bleibt */
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('1');
  const timeRef = useRef(0);
  const samples = useMemo(() => sampleCycle(0.01), []);

  const setT = useCallback((v: number) => {
    timeRef.current = v;
    setTime(v);
  }, []);

  /* Animationsschleife */
  useEffect(() => {
    if (!playing || reduced) return;
    let raf = 0;
    let last: number | null = null;
    const factor = speed === '0.5' ? 0.5 : 1;
    const tick = (now: number) => {
      if (last !== null) {
        const dt = Math.min(0.1, (now - last) / 1000);
        setT(timeRef.current + dt * factor);
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced, speed, setT]);

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  const cycleIndex = Math.floor(time / CYCLE);
  const t = time - cycleIndex * CYCLE;
  const phase = phaseAt(t);
  const st = stateAt(t);
  const text = PHASE_TEXT[phase.id];

  // Kumulierte Volumina (stetig über Zyklen) für die Bewegung der Gas-Striche
  const inspCum = phase.id === 'trigger' ? 0 : phase.id === 'insp' ? st.vol : MODEL.vtMl;
  const expCum = phase.id === 'exp' || phase.id === 'peep' ? MODEL.vtMl - st.vol : 0;
  const inspOffset = cycleIndex * MODEL.vtMl + inspCum;
  const expOffset = cycleIndex * MODEL.vtMl + expCum;

  const goPhase = (idx: number) => {
    const i = (idx + PHASES.length) % PHASES.length;
    const wrap = idx >= PHASES.length ? 1 : idx < 0 ? -1 : 0;
    setPlaying(false);
    setT(Math.max(0, (cycleIndex + wrap) * CYCLE + PHASES[i].snapshot));
  };
  const phaseIdx = PHASES.findIndex((p) => p.id === phase.id);

  const togglePlay = () => {
    if (reduced) {
      goPhase(phaseIdx + 1);
      return;
    }
    setPlaying((p) => !p);
  };

  return (
    <div className={s.root}>
      {/* ---------- Steuerung ---------- */}
      <div className={s.controls}>
        <div className={s.transport}>
          <Button size="sm" variant="secondary" icon="chevronLeft" onClick={() => goPhase(phaseIdx - 1)} aria-label="Schritt zurück">
            <span className={s.hideSm}>Zurück</span>
          </Button>
          <Button size="sm" icon={playing ? 'pause' : 'play'} onClick={togglePlay} aria-label={reduced ? 'Nächste Phase' : playing ? 'Pause' : 'Abspielen'}>
            {reduced ? 'Nächste Phase' : playing ? 'Pause' : 'Abspielen'}
          </Button>
          <Button size="sm" variant="secondary" iconRight="chevronRight" onClick={() => goPhase(phaseIdx + 1)} aria-label="Schritt vor">
            <span className={s.hideSm}>Weiter</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon="reset"
            onClick={() => {
              setPlaying(false);
              setT(0);
            }}
            aria-label="Zurücksetzen"
          />
        </div>
        {!reduced ? (
          <Segmented<Speed>
            label="Geschwindigkeit"
            value={speed}
            onChange={setSpeed}
            options={[
              { value: '0.5', label: '0,5×' },
              { value: '1', label: '1×' },
            ]}
          />
        ) : (
          <span className={s.reducedHint}>
            <Icon name="info" size={14} /> Schrittmodus (reduzierte Bewegung)
          </span>
        )}
      </div>

      {/* ---------- Phasen-Zeitleiste ---------- */}
      <ol className={s.timeline} aria-label="Phasen des Atemzyklus">
        {PHASES.map((p, i) => {
          const active = p.id === phase.id;
          const prog = active ? (t - p.start) / (p.end - p.start) : i < phaseIdx ? 1 : 0;
          return (
            <li key={p.id} style={{ flexGrow: Math.max(p.end - p.start, 0.45) }}>
              <button
                type="button"
                className={cx(s.phaseBtn, active && s.phaseActive, i < phaseIdx && s.phaseDone)}
                aria-current={active ? 'step' : undefined}
                onClick={() => goPhase(i)}
              >
                <span className={s.phaseFill} style={{ transform: `scaleX(${prog})` }} aria-hidden="true" />
                <span className={s.phaseNum}>{p.num}</span>
                <span className={s.phaseName}>{p.short}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* ---------- Schema + Erklärung ---------- */}
      <div className={s.main}>
        <div className={s.schematicCard}>
          <BreathSchematic
            phase={phase.id}
            inspValve={text.inspValve}
            expValve={text.expValve}
            paw={st.paw}
            palv={st.palv}
            vol={st.vol}
            flow={st.flow}
            inspOffset={inspOffset}
            expOffset={expOffset}
          />
        </div>

        <section className={s.explain} aria-live="polite" aria-labelledby="bc-phase-title">
          <header className={s.explainHead}>
            <span className={s.explainNum}>{phase.num}</span>
            <div>
              <span className={s.explainKicker}>Phase {phase.num} von 5</span>
              <h3 id="bc-phase-title" className={s.explainTitle}>
                {phase.title}
              </h3>
            </div>
          </header>
          <dl className={s.facts}>
            <Fact label="Inspirationsventil" state={text.inspValve} />
            <Fact label="Exspirationsventil" state={text.expValve} />
            <div className={s.fact}>
              <dt>Flow</dt>
              <dd>{renderInline(text.flowDir)}</dd>
            </div>
            <div className={s.fact}>
              <dt>Druck</dt>
              <dd>{renderInline(text.pressure)}</dd>
            </div>
          </dl>
          <Markdown md={text.body} className={s.explainBody} />
          {text.note && (
            <p className={s.note}>
              <Icon name="lightbulb" size={15} />
              <span>{renderInline(text.note)}</span>
            </p>
          )}
        </section>
      </div>

      {/* ---------- Kurven ---------- */}
      <div className={s.monitor}>
        <MiniCurve
          samples={samples}
          field="paw"
          extraField="palv"
          min={0}
          max={25}
          ticks={[0, 10, 20]}
          color="var(--c-wave-pressure)"
          label={<>Druck P<sub>aw</sub></>}
          unit="cmH₂O"
          value={st.paw}
          t={t}
          activePhase={phase.id}
          decimals={1}
        />
        <MiniCurve
          samples={samples}
          field="flow"
          min={-70}
          max={45}
          ticks={[-60, 0, 30]}
          color="var(--c-wave-flow)"
          label="Flow V̇"
          unit="L/min"
          value={st.flow}
          t={t}
          activePhase={phase.id}
        />
        <MiniCurve
          samples={samples}
          field="vol"
          min={-30}
          max={560}
          ticks={[0, 250, 500]}
          color="var(--c-wave-volume)"
          label="Volumen V"
          unit="ml"
          value={st.vol}
          t={t}
          activePhase={phase.id}
        />
        <p className={s.monitorLegend}>
          <span>
            Zeit 0–{fmt(CYCLE)} s · gestrichelt: Alveolardruck P<sub>alv</sub> (Modell)
          </span>
        </p>
      </div>

      {/* ---------- Parameter ---------- */}
      <div className={s.params}>
        <div className={s.paramGrid}>
          <Param label="V~T~" value={`${MODEL.vtMl} ml`} />
          <Param label="Flow" value={`${MODEL.flowLmin} L/min`} />
          <Param label="R" value={`${MODEL.r} cmH~2~O/(L/s)`} />
          <Param label="C" value={`${MODEL.cMl} ml/cmH~2~O`} />
          <Param label="PEEP" value={`${MODEL.peep} cmH~2~O`} />
          <Param label="Pause" value={`${fmt(MODEL.pause, 1)} s`} />
          <Param label="P~peak~" value={`${fmt(P_PEAK)} cmH~2~O`} accent />
          <Param label="P~plat~" value={`${fmt(P_PLAT)} cmH~2~O`} accent />
          <Param label="ΔP" value={`${fmt(DRIVING_P)} cmH~2~O`} accent />
          <Param label="τ = R · C" value={`${fmt(TAU, 1)} s`} accent />
          <Param label="V̇~exsp,max~" value={`${fmt(EXP_PEAK_FLOW_LMIN)} L/min`} accent />
          <Param label="f / I:E" value={`${MODEL.rate}/min · 1:${fmt((CYCLE - (PHASES[2].end - PHASES[1].start)) / (PHASES[2].end - PHASES[1].start), 1)}`} accent />
        </div>
        <p className={s.modelNote}>
          <Icon name="info" size={14} />
          <span>
            Vereinfachtes Einkompartimentmodell (P<sub>aw</sub> = PEEP + V/C + R · V̇) mit festen Parametern. Echte Lungen sind inhomogen,
            Resistance und Compliance ändern sich mit Volumen und Flow. Geräteeinstellungen stets nach ärztlicher Anordnung,
            Herstellerangaben und lokalen Standards.
          </span>
        </p>
      </div>
    </div>
  );
}

function Fact({ label, state }: { label: string; state: ValveState }) {
  return (
    <div className={s.fact}>
      <dt>{label}</dt>
      <dd>
        <span className={cx(s.valveBadge, s[`badge-${state}`])}>{VALVE_LABEL[state]}</span>
      </dd>
    </div>
  );
}

function Param({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cx(s.param, accent && s.paramAccent)}>
      <span className={s.paramLabel}>{renderInline(label)}</span>
      <span className={s.paramValue}>{renderInline(value)}</span>
    </div>
  );
}
