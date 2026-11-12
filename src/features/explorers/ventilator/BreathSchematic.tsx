/**
 * Vereinfachtes Schema für den Atemzyklus: Ventile, Schläuche, Y-Stück,
 * Lunge als Ballon und Manometer für den Atemwegsdruck.
 */
import { cx } from '@/components/ui';
import { MODEL, type PhaseId } from './breathModel';
import { VALVE_LABEL, type ValveState } from './breathPhases';
import s from './BreathCycle.module.css';

interface Props {
  phase: PhaseId;
  inspValve: ValveState;
  expValve: ValveState;
  paw: number;
  palv: number;
  vol: number;
  flow: number;
  /** Kumulierte Volumina [ml] für die Bewegung der Gas-Striche */
  inspOffset: number;
  expOffset: number;
}

const INSP_D = 'M40 80 H300 Q340 80 340 120 V136';
const EXP_D = 'M340 164 V180 Q340 220 300 220 H40';
const GAUGE_MAX = 30;
const G = { cx: 270, cy: 146, r: 42 };

function gaugeAngle(p: number) {
  // −135° … +135° für 0 … 30 cmH2O
  const f = Math.max(0, Math.min(1, p / GAUGE_MAX));
  return -135 + f * 270;
}
function polar(angleDeg: number, r: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [G.cx + r * Math.cos(a), G.cy + r * Math.sin(a)] as const;
}

function Valve({ x, y, state, label, above }: { x: number; y: number; state: ValveState; label: string; above?: boolean }) {
  return (
    <g className={cx(s.valve, s[`valve-${state}`])} transform={`translate(${x} ${y})`}>
      <rect x={-34} y={-24} width={68} height={48} rx={10} className={s.valveBox} />
      <path d="M-18 -12 L0 0 L-18 12 Z M18 -12 L0 0 L18 12 Z" className={s.valveBody} />
      {/* Stößel: geschlossen = Balken quer über dem Durchgang */}
      <path d={state === 'open' ? 'M0 -20 V-14' : 'M0 -20 V0'} className={s.valveStem} />
      <text y={above ? -46 : 40} textAnchor="middle" className={s.valveName}>
        {label}
      </text>
      <text y={above ? -32 : 54} textAnchor="middle" className={s.valveState}>
        {VALVE_LABEL[state]}
      </text>
    </g>
  );
}

export function BreathSchematic({ phase, inspValve, expValve, paw, palv, vol, flow, inspOffset, expOffset }: Props) {
  const fill = vol / MODEL.vtMl; // 0 … 1
  // Endexspiratorisch (PEEP) bleibt die Lunge teilweise gebläht: Grundradius > entspannt
  const rBase = 40;
  const rx = rBase + 22 * fill;
  const ry = rBase + 26 * fill;
  const ang = gaugeAngle(paw);
  const [nx, ny] = polar(ang, G.r - 8);
  const inspActive = flow > 0.5;
  const expActive = flow < -0.5;
  const ticks = [0, 5, 10, 15, 20, 25, 30];

  return (
    <svg className={s.schematic} viewBox="0 0 560 300" role="img" aria-label={`Schema: Inspirationsventil ${VALVE_LABEL[inspValve]}, Exspirationsventil ${VALVE_LABEL[expValve]}, Atemwegsdruck ${paw.toFixed(0)} cmH₂O, Volumen ${Math.round(vol)} ml`}>
      <defs>
        <radialGradient id="bc-lung" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="var(--c-surface)" />
          <stop offset="55%" stopColor="var(--c-danger-bg)" />
          <stop offset="100%" stopColor="var(--c-primary-200)" />
        </radialGradient>
        <linearGradient id="bc-dev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-surface)" />
          <stop offset="100%" stopColor="var(--c-surface-3)" />
        </linearGradient>
      </defs>

      {/* Gerät */}
      <rect x={14} y={24} width={196} height={252} rx={18} fill="url(#bc-dev)" stroke="var(--c-border-strong)" strokeWidth={1.5} />
      <text x={28} y={46} className={s.devLabel}>
        Beatmungsgerät
      </text>
      <text x={28} y={70} className={s.smallLabel}>
        Frischgas
      </text>
      <text x={28} y={262} className={s.smallLabel}>
        Abluft
      </text>

      {/* Schläuche */}
      <path d={INSP_D} className={s.tube} />
      <path d={EXP_D} className={s.tube} />
      <path d={INSP_D} className={s.tubeInner} />
      <path d={EXP_D} className={s.tubeInner} />
      <path
        d={INSP_D}
        className={cx(s.gas, s.gasInsp, inspActive && s.gasOn)}
        style={{ strokeDashoffset: -inspOffset * 0.12 }}
      />
      <path d={EXP_D} className={cx(s.gas, s.gasExp, expActive && s.gasOn)} style={{ strokeDashoffset: -expOffset * 0.12 }} />
      <path d="M40 220 L22 220 M30 212 L22 220 L30 228" className={s.arrowOut} />

      {/* Y-Stück & Tubus */}
      <path d="M340 136 V164 M340 150 H420" className={s.yPiece} />
      <path d="M340 136 V164 M340 150 H420" className={s.yPieceInner} />
      <text x={352} y={176} className={s.smallLabel}>
        Y-Stück
      </text>

      {/* Manometer am Y-Stück */}
      <path d={`M${G.cx + G.r} ${G.cy} H340`} className={s.senseLine} />
      <g className={s.gauge}>
        <circle cx={G.cx} cy={G.cy} r={G.r + 4} className={s.gaugeRim} />
        <circle cx={G.cx} cy={G.cy} r={G.r} className={s.gaugeFace} />
        {ticks.map((p) => {
          const a = gaugeAngle(p);
          const [x1, y1] = polar(a, G.r - 2);
          const [x2, y2] = polar(a, G.r - 7);
          const [tx, ty] = polar(a, G.r - 16);
          return (
            <g key={p}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className={s.gaugeTick} />
              {(p === 10 || p === 20) && (
                <text x={tx} y={ty + 3} textAnchor="middle" className={s.gaugeNum}>
                  {p}
                </text>
              )}
            </g>
          );
        })}
        {/* PEEP-Marke */}
        {(() => {
          const [x1, y1] = polar(gaugeAngle(MODEL.peep), G.r);
          const [x2, y2] = polar(gaugeAngle(MODEL.peep), G.r + 6);
          return <line x1={x1} y1={y1} x2={x2} y2={y2} className={s.gaugePeep} />;
        })()}
        <line x1={G.cx} y1={G.cy} x2={nx} y2={ny} className={s.gaugeNeedle} />
        <circle cx={G.cx} cy={G.cy} r={3.5} className={s.gaugeHub} />
        <text x={G.cx} y={G.cy + 22} textAnchor="middle" className={s.gaugeVal}>
          {paw.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </text>
        <text x={G.cx} y={G.cy + 32} textAnchor="middle" className={s.gaugeUnit}>
          cmH₂O
        </text>
        <text x={G.cx} y={G.cy + G.r + 16} textAnchor="middle" className={s.smallLabel}>
          P<tspan dy={3} fontSize={8}>aw</tspan>
        </text>
      </g>

      {/* Lunge */}
      <g className={s.lungGroup}>
        <ellipse cx={482} cy={150} rx={74} ry={96} className={s.thorax} />
        <path d="M420 150 H440" className={s.trachea} />
        <ellipse cx={482} cy={150} rx={rx} ry={ry} className={cx(s.lung, phase === 'trigger' && s.lungTrigger)} fill="url(#bc-lung)" />
        <ellipse cx={482} cy={150} rx={rBase} ry={rBase} className={s.lungRest} />
        <path d="M440 150 H462 M462 150 L480 136 L498 130 M480 136 L492 146 M462 150 L480 164 L498 170 M480 164 L492 154" className={s.bronchi} />
        <text x={482} y={268} textAnchor="middle" className={s.smallLabel}>
          V {Math.round(vol)} ml
        </text>
        <text x={482} y={284} textAnchor="middle" className={s.smallLabel}>
          P<tspan dy={3} fontSize={8}>alv</tspan>
          <tspan dy={-3}> {palv.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} cmH₂O</tspan>
        </text>
        {phase === 'trigger' && (
          <g className={s.triggerMark}>
            <circle cx={482} cy={150} r={rBase + 8} />
          </g>
        )}
      </g>

      {/* Ventile */}
      <Valve x={130} y={80} state={inspValve} label="Insp.-Ventil" />
      <Valve x={130} y={220} state={expValve} label="Exsp.-Ventil" above />
    </svg>
  );
}
