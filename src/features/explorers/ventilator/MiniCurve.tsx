/**
 * Kleine Monitor-Kurve (Druck, Flow oder Volumen über die Zeit) mit Cursor.
 */
import { useId, type ReactNode } from 'react';
import { CYCLE, PHASES, type PhaseId, type Sample } from './breathModel';
import s from './BreathCycle.module.css';

type Key = 'paw' | 'palv' | 'flow' | 'vol';

interface Props {
  samples: Sample[];
  field: Key;
  /** Gestrichelte Zusatzkurve (z. B. Alveolardruck) */
  extraField?: Key;
  min: number;
  max: number;
  ticks: number[];
  color: string;
  label: ReactNode;
  unit: string;
  value: number;
  t: number;
  activePhase: PhaseId;
  decimals?: number;
}

const W = 340;
const H = 92;
const PL = 30;
const PR = 8;
const PT = 8;
const PB = 8;

export function MiniCurve({ samples, field, extraField, min, max, ticks, color, label, unit, value, t, activePhase, decimals = 0 }: Props) {
  const clipId = useId().replace(/:/g, '');
  const x = (tt: number) => PL + (tt / CYCLE) * (W - PL - PR);
  const y = (v: number) => PT + (1 - (v - min) / (max - min)) * (H - PT - PB);
  const path = (k: Key) => samples.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(' ');
  const d = path(field);
  const dExtra = extraField ? path(extraField) : null;
  const cx0 = x(t);

  return (
    <div className={s.curve}>
      <div className={s.curveHead}>
        <span className={s.curveLabel} style={{ color }}>
          {label}
        </span>
        <span className={s.curveValue} style={{ color }}>
          {value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} <small>{unit}</small>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.curveSvg} aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={cx0} height={H} />
          </clipPath>
        </defs>
        {PHASES.map((p) => (
          <rect
            key={p.id}
            x={x(p.start)}
            y={PT}
            width={x(p.end) - x(p.start)}
            height={H - PT - PB}
            className={p.id === activePhase ? s.bandActive : s.band}
          />
        ))}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} className={v === 0 ? s.zeroLine : s.gridLine} />
            <text x={PL - 5} y={y(v) + 3} textAnchor="end" className={s.axisText}>
              {v}
            </text>
          </g>
        ))}
        <path d={d} fill="none" stroke={color} strokeWidth={1.5} opacity={0.25} />
        {dExtra && <path d={dExtra} fill="none" stroke={color} strokeWidth={1.25} strokeDasharray="3 3" opacity={0.2} />}
        <g clipPath={`url(#${clipId})`}>
          <path d={d} fill="none" stroke={color} strokeWidth={2.25} strokeLinejoin="round" />
          {dExtra && <path d={dExtra} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.75} />}
        </g>
        <line x1={cx0} x2={cx0} y1={PT - 4} y2={H - PB + 4} className={s.cursor} />
        <circle cx={cx0} cy={y(Math.max(min, Math.min(max, value)))} r={3.5} fill={color} className={s.cursorDot} />
      </svg>
    </div>
  );
}
