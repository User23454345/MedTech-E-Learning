/**
 * Bewegungsgleichung interaktiv ('vent-equation'):
 *   P_aw = PEEP + V/C + R · V̇
 * Gestapelter Balken der drei Druckanteile + statische P-t-Kurve (VC, konstanter Flow).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon } from '@/components/ui';
import { ControlSlider } from './ControlSlider';
import { fmt } from './model';
import s from './EquationOfMotion.module.css';

interface Values {
  peep: number; // cmH₂O
  vt: number; // ml
  c: number; // ml/cmH₂O
  r: number; // cmH₂O/(L/s)
  flow: number; // L/min
}
type Key = keyof Values;

const START: Values = { peep: 5, vt: 500, c: 50, r: 10, flow: 60 };

const NAMES: Record<Key, string> = { peep: 'PEEP', vt: 'das Tidalvolumen', c: 'die Compliance', r: 'die Resistance', flow: 'den Flow' };
const UNITS: Record<Key, string> = { peep: 'cmH₂O', vt: 'ml', c: 'ml/cmH₂O', r: 'cmH₂O/(L/s)', flow: 'L/min' };

function parts(v: Values) {
  const flowLs = v.flow / 60; // L/min → L/s
  const elastic = v.vt / v.c; // ml / (ml/cmH₂O) = cmH₂O
  const resistive = v.r * flowLs; // cmH₂O/(L/s) · L/s = cmH₂O
  return { flowLs, elastic, resistive, ppeak: v.peep + elastic + resistive, pplat: v.peep + elastic, ti: v.vt / 1000 / flowLs, tau: (v.r * v.c) / 1000 };
}

function changeSentence(key: Key, from: number, to: number, a: ReturnType<typeof parts>, b: ReturnType<typeof parts>): string {
  const dir = to > from ? 'erhöht' : 'verringert';
  const ratio = to / from;
  const head = `Du hast ${NAMES[key]} von ${fmt(from)} auf ${fmt(to)} ${UNITS[key]} ${dir}`;
  switch (key) {
    case 'peep':
      return `${head}: Die gesamte Kurve verschiebt sich um ${fmt(to - from)} cmH₂O. Ppeak und Pplat ändern sich um denselben Betrag, elastischer und resistiver Anteil bleiben gleich.`;
    case 'vt':
      return `${head} (× ${fmt(ratio, 2)}): Der elastische Anteil V/C ändert sich proportional (${fmt(a.elastic, 1)} → ${fmt(b.elastic, 1)} cmH₂O) – Plateau und Spitzendruck verschieben sich gemeinsam. Bei gleichem Flow dauert die Inspiration jetzt ${fmt(b.ti, 2)} s.`;
    case 'c':
      return `${head} (× ${fmt(ratio, 2)}): Der elastische Anteil ändert sich umgekehrt proportional (× ${fmt(1 / ratio, 2)}: ${fmt(a.elastic, 1)} → ${fmt(b.elastic, 1)} cmH₂O). Steife Lunge → Ppeak UND Pplat steigen.`;
    case 'r':
      return `${head} (× ${fmt(ratio, 2)}): Nur der resistive Anteil ändert sich (${fmt(a.resistive, 1)} → ${fmt(b.resistive, 1)} cmH₂O). Ppeak ändert sich, Pplat bleibt gleich – die Differenz Ppeak − Pplat wächst bzw. schrumpft.`;
    case 'flow':
      return `${head} (× ${fmt(ratio, 2)}): Der resistive Anteil R · V̇ ändert sich proportional (${fmt(a.resistive, 1)} → ${fmt(b.resistive, 1)} cmH₂O); das Plateau bleibt gleich. Die Inspirationszeit beträgt jetzt ${fmt(b.ti, 2)} s.`;
  }
}

/* ---------- Gestapelter Balken ---------- */
function StackedBar({ v, p, top }: { v: Values; p: ReturnType<typeof parts>; top: number }) {
  const H = 260;
  const padT = 24;
  const padB = 22;
  const h = H - padT - padB;
  const y = (val: number) => padT + h - (val / top) * h;
  const barX = 46;
  const barW = 64;
  const ticks: number[] = [];
  for (let t = 0; t <= top; t += top > 60 ? 20 : 10) ticks.push(t);
  // y-Positionen der rechten Markierungstexte (Mittellinie)
  const peakLabelY = y(p.ppeak);
  const platLabelY = Math.max(y(p.pplat), y(p.ppeak) + 14);
  const peepLabelY = Math.min(y(v.peep / 2), H - padB - 6);
  const candidates = [y(30) - 7, y(30) + 9]; // Mittellinie über / unter der Grenzlinie
  const limitLabelY = (() => {
    for (const c of candidates) {
      if ([peakLabelY, platLabelY, peepLabelY].every((m) => Math.abs(m - c) >= 12) && c > padT - 10) return c + 3.5;
    }
    return null;
  })();
  const segs = [
    { key: 'peep', from: 0, to: v.peep, cls: s.segPeep, label: 'PEEP' },
    { key: 'el', from: v.peep, to: p.pplat, cls: s.segElastic, label: 'V/C' },
    { key: 'res', from: p.pplat, to: p.ppeak, cls: s.segResistive, label: 'R · V̇' },
  ];
  return (
    <svg viewBox={`0 0 240 ${H}`} className={s.barSvg} role="img" aria-label={`Druckanteile: PEEP ${fmt(v.peep)}, elastisch ${fmt(p.elastic, 1)}, resistiv ${fmt(p.resistive, 1)}, Summe Ppeak ${fmt(p.ppeak, 1)} cmH₂O`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={barX - 6} x2={232} y1={y(t)} y2={y(t)} className={s.gridLine} />
          <text x={barX - 10} y={y(t)} className={s.axisText} textAnchor="end" dominantBaseline="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={6} y={10} className={s.axisText}>
        cmH₂O
      </text>
      {/* Grenze 30 cmH₂O (Plateau) – Beschriftung so platzieren, dass sie die Markierungen nicht überdeckt */}
      {top >= 30 && (
        <g>
          <line x1={barX - 6} x2={232} y1={y(30)} y2={y(30)} className={s.limitLine} />
          {limitLabelY !== null && (
            <text x={232} y={limitLabelY} className={s.limitText} textAnchor="end">
              Pplat-Ziel ≤ 30
            </text>
          )}
        </g>
      )}
      {segs.map((sg) =>
        sg.to - sg.from > 0.01 ? (
          <g key={sg.key}>
            <rect x={barX} width={barW} y={y(sg.to)} height={Math.max(0, y(sg.from) - y(sg.to))} className={`${s.seg} ${sg.cls}`} rx={3} />
            {y(sg.from) - y(sg.to) > 14 && (
              <text x={barX + barW / 2} y={(y(sg.from) + y(sg.to)) / 2} className={s.segText} textAnchor="middle" dominantBaseline="middle">
                {fmt(sg.to - sg.from, 1)}
              </text>
            )}
          </g>
        ) : null,
      )}
      {/* Beschriftung rechts */}
      <g className={s.sideLabels}>
        <line x1={barX + barW} x2={barX + barW + 14} y1={y(p.ppeak)} y2={y(p.ppeak)} className={s.markLine} />
        <text x={barX + barW + 18} y={peakLabelY} dominantBaseline="middle" className={s.markText}>
          Ppeak {fmt(p.ppeak, 1)}
        </text>
        <line x1={barX + barW} x2={barX + barW + 14} y1={y(p.pplat)} y2={y(p.pplat)} className={s.markLine} />
        <text x={barX + barW + 18} y={platLabelY} dominantBaseline="middle" className={s.markText}>
          Pplat {fmt(p.pplat, 1)}
        </text>
        <text x={barX + barW + 18} y={peepLabelY} dominantBaseline="middle" className={s.markTextMuted}>
          PEEP {fmt(v.peep)}
        </text>
      </g>
      <text x={barX + barW / 2} y={H - 6} textAnchor="middle" className={s.axisText}>
        P<tspan dy="3" fontSize="8">aw</tspan>
      </text>
    </svg>
  );
}

/* ---------- Statische P-t-Kurve ---------- */
/** Breite des Containers in px – damit die SVG-Schrift 1:1 (nicht verkleinert) dargestellt wird */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const cw = Math.round(entries[0]?.contentRect.width ?? 0);
      if (cw > 0) setW(cw);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function PressureTime({ v, p, top, width }: { v: Values; p: ReturnType<typeof parts>; top: number; width: number }) {
  const W = Math.max(300, Math.min(900, width));
  const H = 210;
  const padL = 36;
  const padR = 12;
  const padT = 24;
  const padB = 26;
  const pause = 0.4;
  const expDur = Math.min(6, Math.max(1.5, 3 * p.tau + 0.4));
  const total = p.ti + pause + expDur;
  const x = (t: number) => padL + (t / total) * (W - padL - padR);
  const y = (val: number) => padT + (H - padT - padB) - (val / top) * (H - padT - padB);

  // Atemwegsdruck
  const tEnd = p.ti + pause;
  const paw = `M${x(0)},${y(v.peep)} L${x(0)},${y(v.peep + p.resistive)} L${x(p.ti)},${y(p.ppeak)} L${x(p.ti)},${y(p.pplat)} L${x(tEnd)},${y(p.pplat)} L${x(tEnd)},${y(v.peep)} L${x(total)},${y(v.peep)}`;
  // Alveolardruck: linear, Plateau, exponentiell
  let palv = `M${x(0)},${y(v.peep)} L${x(p.ti)},${y(p.pplat)} L${x(tEnd)},${y(p.pplat)}`;
  const n = 60;
  for (let i = 1; i <= n; i++) {
    const t = (i / n) * expDur;
    palv += ` L${x(tEnd + t)},${y(v.peep + p.elastic * Math.exp(-t / Math.max(0.01, p.tau)))}`;
  }
  const ticksT: number[] = [];
  const tStep = total > 5 || W < 420 ? 1 : 0.5;
  for (let t = 0; t <= total; t += tStep) ticksT.push(t);
  const ticksP: number[] = [];
  for (let t = 0; t <= top; t += top > 60 ? 20 : 10) ticksP.push(t);
  // Annotationsklammern neutral und mit Abstand zur Druckkurve
  const braceX = x(p.ti) + 9;
  const cap = 4;
  const resTop = y(p.ppeak);
  const resBot = y(p.pplat);
  const elTop = y(p.pplat);
  const elBot = y(v.peep);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.ptSvg} role="img" aria-label={`Druck-Zeit-Kurve: Spitzendruck ${fmt(p.ppeak, 1)}, Plateaudruck ${fmt(p.pplat, 1)}, PEEP ${fmt(v.peep)} cmH₂O`}>
      <rect x={0} y={0} width={W} height={H} className={s.ptBg} rx={10} />
      {ticksP.map((t) => (
        <g key={`p${t}`}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} className={s.ptGrid} />
          <text x={padL - 6} y={y(t)} className={s.ptAxis} textAnchor="end" dominantBaseline="middle">
            {t}
          </text>
        </g>
      ))}
      {ticksT.map((t) => (
        <text key={`t${t}`} x={x(t)} y={H - 8} className={s.ptAxis} textAnchor="middle">
          {fmt(t, t % 1 ? 1 : 0)}
        </text>
      ))}
      <text x={padL} y={10} className={s.ptAxis}>
        cmH₂O
      </text>
      <text x={W - padR} y={padT + 2} className={s.ptAxis} textAnchor="end">
        t [s]
      </text>
      {/* Phasen */}
      <rect x={x(0)} y={padT} width={x(p.ti) - x(0)} height={H - padT - padB} className={s.phaseInsp} />
      <rect x={x(p.ti)} y={padT} width={x(tEnd) - x(p.ti)} height={H - padT - padB} className={s.phasePause} />
      <path d={palv} className={s.palv} />
      <path d={paw} className={s.paw} />
      {/* Klammern */}
      {resBot - resTop > 3 && (
        <path d={`M${braceX - cap},${resTop + 1} H${braceX} V${resBot - 1} H${braceX - cap}`} className={s.brace} />
      )}
      {elBot - elTop > 3 && (
        <path d={`M${braceX + cap},${elTop + 1} H${braceX + 2} V${elBot - 1} H${braceX + cap}`} className={s.brace} />
      )}
      <text x={braceX + 7} y={(resTop + resBot) / 2} className={s.braceTextRes} dominantBaseline="middle">
        R·V̇
      </text>
      <text x={braceX + 7} y={(elTop + elBot) / 2} className={s.braceTextEl} dominantBaseline="middle">
        V/C
      </text>
      <circle cx={x(p.ti)} cy={y(p.ppeak)} r={3.5} className={s.dotPeak} />
      <text x={x(p.ti) - 6} y={y(p.ppeak) - 8} className={s.ptLabel} textAnchor="end">
        Ppeak
      </text>
      <text x={x(tEnd) + 4} y={y(p.pplat) - 6} className={s.ptLabel}>
        Pplat
      </text>
    </svg>
  );
}

export default function EquationOfMotion() {
  const [v, setV] = useState<Values>(START);
  const [last, setLast] = useState<{ key: Key; from: number; to: number } | null>(null);
  const baseRef = useRef<{ key: Key; from: number; at: number } | null>(null);
  const p = useMemo(() => parts(v), [v]);
  const top = Math.max(40, Math.ceil((p.ppeak + 4) / 10) * 10);
  const [ptRef, ptWidth] = useWidth<HTMLDivElement>(520);

  const set = (key: Key) => (val: number) => {
    const now = Date.now();
    let b = baseRef.current;
    if (!b || b.key !== key || now - b.at > 1500) b = { key, from: v[key], at: now };
    else b.at = now;
    baseRef.current = b;
    setLast({ key, from: b.from, to: val });
    setV((o) => ({ ...o, [key]: val }));
  };

  const lastSentence = (() => {
    if (!last || last.from === last.to) return null;
    const a = parts({ ...v, [last.key]: last.from });
    return changeSentence(last.key, last.from, last.to, a, p);
  })();

  return (
    <div className={s.wrap}>
      <div className={s.formula} aria-label="Bewegungsgleichung">
        <span className={s.fPeak}>
          P<sub>aw</sub>
        </span>
        <span>=</span>
        <span className={s.fPeep}>PEEP</span>
        <span>+</span>
        <span className={s.fEl}>V / C</span>
        <span>+</span>
        <span className={s.fRes}>R · V̇</span>
      </div>

      <div className={s.grid}>
        <div className={s.controls}>
          <ControlSlider short="PEEP" label="endexspiratorischer Druck" value={v.peep} min={0} max={20} step={1} unit="cmH₂O" onChange={set('peep')} />
          <ControlSlider short="VT" label="Tidalvolumen" value={v.vt} min={200} max={900} step={10} unit="ml" onChange={set('vt')} />
          <ControlSlider short="C" label="Compliance" value={v.c} min={10} max={120} step={1} unit="ml/cmH₂O" onChange={set('c')} hint="Erwachsene, beatmet ≈ 50–100 · ARDS oft < 40" />
          <ControlSlider short="R" label="Resistance" value={v.r} min={2} max={50} step={1} unit="cmH₂O/(L/s)" onChange={set('r')} hint="Intubiert ≈ 5–10 · obstruktiv ≥ 20" />
          <ControlSlider short="V̇" label="Inspirationsflow" value={v.flow} min={10} max={120} step={5} unit="L/min" onChange={set('flow')} hint={`= ${fmt(p.flowLs, 2)} L/s · Ti = VT/V̇ = ${fmt(p.ti, 2)} s`} />
          <Button
            variant="ghost"
            size="sm"
            icon="reset"
            onClick={() => {
              setV(START);
              setLast(null);
              baseRef.current = null;
            }}
          >
            Zurücksetzen
          </Button>
        </div>

        <div className={s.viz}>
          <div className={s.barCard}>
            <StackedBar v={v} p={p} top={top} />
            <ul className={s.legend}>
              <li>
                <span className={`${s.sw} ${s.segPeep}`} /> PEEP <strong>{fmt(v.peep, 1)}</strong>
              </li>
              <li>
                <span className={`${s.sw} ${s.segElastic}`} /> elastisch V/C <strong>{fmt(p.elastic, 1)}</strong>
              </li>
              <li>
                <span className={`${s.sw} ${s.segResistive}`} /> resistiv R·V̇ <strong>{fmt(p.resistive, 1)}</strong>
              </li>
            </ul>
          </div>
          <div className={s.calc} aria-live="polite">
            <div className={s.calcRow}>
              P<sub>peak</sub> = {fmt(v.peep)} + {fmt(v.vt)}/{fmt(v.c)} + {fmt(v.r)} · {fmt(p.flowLs, 2)}
            </div>
            <div className={s.calcRow}>
              = {fmt(v.peep, 1)} + {fmt(p.elastic, 1)} + {fmt(p.resistive, 1)} = <strong>{fmt(p.ppeak, 1)} cmH₂O</strong>
            </div>
            <div className={s.calcNote}>
              Flow in L/s umrechnen: {fmt(v.flow)} L/min ÷ 60 = {fmt(p.flowLs, 2)} L/s
            </div>
          </div>
        </div>
      </div>

      <div className={s.ptCard}>
        <div className={s.ptHead}>
          <strong>Druck-Zeit-Kurve (VC, konstanter Flow, endinspiratorische Pause)</strong>
          <span className={s.ptLegend}>
            <span className={s.lgPaw} /> Atemwegsdruck <span className={s.lgPalv} /> Alveolardruck (Modell)
          </span>
        </div>
        <div ref={ptRef}>
          <PressureTime v={v} p={p} top={top} width={ptWidth} />
        </div>
      </div>

      <div className={s.explain} aria-live="polite">
        {lastSentence && (
          <p className={s.lastChange}>
            <Icon name="sparkles" size={16} /> <span>{lastSentence}</span>
          </p>
        )}
        <ul>
          <li>
            Halbierst du die Compliance (auf {fmt(v.c / 2, 0)} ml/cmH₂O), verdoppelt sich der elastische Druckanteil – von {fmt(p.elastic, 1)} auf {fmt(p.elastic * 2, 1)} cmH₂O.
          </li>
          <li>
            Verdoppelst du den Flow (auf {fmt(v.flow * 2)} L/min), verdoppelt sich der resistive Anteil – von {fmt(p.resistive, 1)} auf {fmt(p.resistive * 2, 1)} cmH₂O. Das Plateau bleibt gleich.
          </li>
          <li>
            Ppeak − Pplat = R · V̇ = {fmt(p.resistive, 1)} cmH₂O, Pplat − PEEP = V/C = ΔP = {fmt(p.elastic, 1)} cmH₂O.
          </li>
          {p.pplat > 30 && <li className={s.warn}>Pplat über 30 cmH₂O – oberhalb der lungenprotektiven Zielgröße.</li>}
          {p.elastic > 15 && <li className={s.warn}>Driving Pressure über 15 cmH₂O – VT im Verhältnis zur Compliance groß.</li>}
        </ul>
        <p className={s.model}>
          <Icon name="info" size={14} /> Ein-Kompartiment-Modell: eine Compliance, eine Resistance, linear. Echte Lungen sind inhomogen; die Compliance ändert sich mit dem Volumen.
        </p>
      </div>
    </div>
  );
}
