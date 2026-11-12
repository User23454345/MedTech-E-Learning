/**
 * SVG-Schema eines Intensivrespirators mit Patientensystem.
 * Jede Komponente ist ein fokussierbarer Hotspot (role="button").
 */
import { memo, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '@/components/ui';
import { CATEGORY_BY_ID, COMPONENT_BY_ID, type VentComponentId } from './deviceData';
import s from './DeviceDiagram.module.css';

export const VIEW_W = 1000;
export const VIEW_H = 625;

export type GasFlowMode = 'off' | 'insp' | 'exp';
export type QuizMark = 'correct' | 'wrong' | 'reveal';

interface Geo {
  /** Hit-/Ring-Fläche */
  box: [number, number, number, number];
  /** Optional: Ring als Pfad (für Schläuche) */
  ringPath?: string;
  /** Mittelpunkt für Tooltip */
  center: [number, number];
  label: [number, number, 'start' | 'middle' | 'end'];
}

const INSP_LIMB_D = 'M692 260 H730 Q762 260 762 292 V352 Q762 382 792 388';
const EXP_LIMB_D = 'M792 412 Q772 420 748 420 H520';

export const GEO: Record<VentComponentId, Geo> = {
  'gas-supply': { box: [8, 200, 80, 150], center: [48, 275], label: [4, 368, 'start'] },
  blender: { box: [114, 222, 82, 76], center: [155, 260], label: [155, 212, 'middle'] },
  'insp-valve': { box: [206, 228, 66, 64], center: [239, 260], label: [239, 216, 'middle'] },
  'o2-sensor': { box: [280, 236, 44, 48], center: [302, 260], label: [302, 304, 'middle'] },
  'insp-flow-sensor': { box: [330, 240, 56, 40], center: [358, 260], label: [358, 230, 'middle'] },
  'safety-valve': { box: [448, 192, 46, 58], center: [471, 214], label: [471, 186, 'middle'] },
  'pressure-sensor': { box: [384, 314, 52, 52], center: [410, 340], label: [442, 345, 'start'] },
  filter: { box: [530, 238, 60, 44], center: [560, 260], label: [560, 300, 'middle'] },
  humidifier: { box: [598, 204, 96, 136], center: [646, 272], label: [646, 358, 'middle'] },
  'insp-limb': { box: [692, 248, 102, 146], ringPath: INSP_LIMB_D, center: [762, 320], label: [774, 320, 'start'] },
  'y-piece': { box: [790, 374, 66, 52], center: [822, 400], label: [846, 368, 'start'] },
  patient: { box: [814, 432, 182, 172], center: [905, 520], label: [905, 620, 'middle'] },
  'exp-limb': { box: [520, 404, 274, 30], ringPath: EXP_LIMB_D, center: [650, 420], label: [650, 446, 'middle'] },
  'exp-valve': { box: [330, 392, 76, 56], center: [368, 420], label: [368, 466, 'middle'] },
  'exp-flow-sensor': { box: [442, 400, 56, 40], center: [470, 420], label: [470, 392, 'middle'] },
  'control-unit': { box: [112, 470, 160, 70], center: [192, 505], label: [192, 556, 'middle'] },
  'ui-monitor': { box: [108, 44, 396, 130], center: [306, 109], label: [306, 22, 'middle'] },
  power: { box: [398, 472, 104, 66], center: [450, 505], label: [450, 556, 'middle'] },
};

/** Gaswege für die Fluss-Animation */
const INSP_FLOW = [
  'M62 236 H100 V260 H692',
  'M62 306 H100 V260',
  `${INSP_LIMB_D} L822 400 H885 Q905 400 905 420 V478`,
];
const EXP_FLOW = ['M905 478 V420 Q905 400 885 400 H822 L792 412 Q772 420 748 420 H90 H56'];

export interface DeviceDiagramProps {
  selected: VentComponentId | null;
  explored: ReadonlySet<VentComponentId>;
  highlightCategory: string | null;
  flow: GasFlowMode;
  showLabels: boolean;
  /** Im Quiz: Markierungen statt Auswahl */
  marks?: Partial<Record<VentComponentId, QuizMark>>;
  /** Im Quiz: Explored-Häkchen ausblenden */
  quiz?: boolean;
  onSelect: (id: VentComponentId) => void;
  onHover: (id: VentComponentId | null) => void;
}

function DeviceDiagramImpl({ selected, explored, highlightCategory, flow, showLabels, marks, quiz, onSelect, onHover }: DeviceDiagramProps) {
  const hs = (id: VentComponentId, children: ReactNode) => {
    const comp = COMPONENT_BY_ID[id];
    const geo = GEO[id];
    const cat = CATEGORY_BY_ID[comp.category];
    const [x, y, w, h] = geo.box;
    const dim = highlightCategory !== null && comp.category !== highlightCategory;
    const hi = highlightCategory !== null && comp.category === highlightCategory;
    const mark = marks?.[id];
    const onKey = (e: KeyboardEvent<SVGGElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(id);
      }
    };
    return (
      <g
        key={id}
        className={cx(
          s.hotspot,
          selected === id && !quiz && s.selected,
          dim && s.dim,
          hi && s.hi,
          mark === 'correct' && s.correct,
          mark === 'wrong' && s.wrong,
          mark === 'reveal' && s.reveal,
        )}
        style={{ '--cat': cat.color } as CSSProperties}
        role="button"
        tabIndex={0}
        aria-label={quiz ? `Komponente ${Object.keys(GEO).indexOf(id) + 1}` : `${comp.short} – ${cat.label}`}
        aria-pressed={quiz ? undefined : selected === id}
        onClick={() => onSelect(id)}
        onKeyDown={onKey}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(id)}
        onBlur={() => onHover(null)}
      >
        {geo.ringPath ? (
          <>
            <path className={s.ringPath} d={geo.ringPath} />
            <path className={s.hitPath} d={geo.ringPath} />
          </>
        ) : (
          <rect className={s.ring} x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={12} />
        )}
        <g className={s.shape}>{children}</g>
        {!quiz && explored.has(id) && (
          <g className={s.tick} transform={`translate(${x + w - 2} ${y + 2})`} aria-hidden="true">
            <circle r={7} />
            <path d="M-3 0 L-1 2.5 L3.2 -2.2" />
          </g>
        )}
      </g>
    );
  };

  return (
    <svg className={s.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="group" aria-label="Schema eines Intensivbeatmungsgeräts mit Patientensystem">
      <defs>
        <linearGradient id="vx-housing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-surface)" />
          <stop offset="100%" stopColor="var(--c-surface-3)" />
        </linearGradient>
        <linearGradient id="vx-part" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-surface)" />
          <stop offset="100%" stopColor="var(--c-primary-50)" />
        </linearGradient>
        <linearGradient id="vx-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-primary-200)" />
          <stop offset="100%" stopColor="var(--c-primary-400)" />
        </linearGradient>
        <radialGradient id="vx-lung" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="var(--c-danger-bg)" />
          <stop offset="100%" stopColor="var(--c-primary-100)" />
        </radialGradient>
        <filter id="vx-soft" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--c-text)" floodOpacity="0.10" />
        </filter>
      </defs>

      {/* ---------- Gerätegehäuse ---------- */}
      <rect x={90} y={30} width={430} height={536} rx={26} fill="url(#vx-housing)" stroke="var(--c-border-strong)" strokeWidth={2} filter="url(#vx-soft)" />
      <rect x={100} y={200} width={410} height={256} rx={14} className={s.bay} />
      <text x={110} y={447} className={s.bayLabel}>Pneumatikeinheit</text>

      {/* ---------- Leitungen (statisch) ---------- */}
      <g className={s.pipes}>
        <path d="M62 236 H100 V260 H530" />
        <path d="M62 306 H100 V260" />
        <path d="M590 260 H598" />
        <path d="M471 260 V232" />
        <path d="M520 420 H90 H62" />
        <path d="M410 260 V318 M410 362 V420" className={s.sensePipe} />
      </g>
      <g className={s.signals} aria-hidden="true">
        <path d="M160 470 V330 H239 V292" />
        <path d="M232 470 V438 H330" />
        <path d="M252 470 V310 H358 V280" />
      </g>
      <g className={s.tubes}>
        <path d={INSP_LIMB_D} />
        <path d={EXP_LIMB_D} />
        <path d="M822 400 H885 Q905 400 905 420 V446" />
      </g>
      <g className={s.tubesInner}>
        <path d={INSP_LIMB_D} />
        <path d={EXP_LIMB_D} />
      </g>

      {/* ---------- Gasfluss-Animation ---------- */}
      {flow !== 'off' && (
        <g className={cx(s.flow, flow === 'insp' ? s.flowInsp : s.flowExp)} aria-hidden="true">
          {(flow === 'insp' ? INSP_FLOW : EXP_FLOW).map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
      <g className={s.exhaust} aria-hidden="true">
        <path d="M70 420 H48 M56 412 L46 420 L56 428" />
        <text x={46} y={445} textAnchor="middle">Abluft</text>
      </g>

      {/* ---------- Legende ---------- */}
      <g className={s.legend} aria-hidden="true" transform="translate(826 112)">
        <rect x={0} y={0} width={164} height={112} rx={12} />
        <text x={14} y={24} className={s.legendTitle}>Legende</text>
        <path d="M14 44 H44" className={s.legendInsp} />
        <text x={54} y={48}>Inspiration</text>
        <path d="M14 66 H44" className={s.legendExp} />
        <text x={54} y={70}>Exspiration</text>
        <path d="M14 88 H44" className={s.legendSig} />
        <text x={54} y={92}>Steuersignal</text>
      </g>

      {/* ---------- Komponenten ---------- */}
      {hs(
        'ui-monitor',
        <>
          <rect x={108} y={44} width={396} height={130} rx={14} fill="var(--c-text)" />
          <rect x={118} y={54} width={300} height={110} rx={8} fill="var(--c-monitor-bg)" />
          <g fill="none" strokeWidth={2} strokeLinejoin="round">
            <path d="M126 82 H140 L146 68 H176 L180 82 H200 L206 68 H236 L240 82 H260 L266 68 H296 L300 82 H316" stroke="var(--c-wave-pressure)" />
            <path d="M126 112 H140 V100 H176 V112 L180 124 Q190 113 200 112 V100 H236 V112 L240 124 Q250 113 260 112 V100 H296 V112 L300 124 Q306 114 316 112" stroke="var(--c-wave-flow)" />
            <path d="M126 152 H140 L176 138 L180 138 Q190 150 200 152 L236 138 L240 138 Q250 150 260 152 L296 138 L300 138 Q306 150 316 152" stroke="var(--c-wave-volume)" />
          </g>
          <g className={s.screenText}>
            <text x={330} y={74} fill="var(--c-wave-pressure)">P<tspan dy={3} fontSize={7}>peak</tspan></text>
            <text x={404} y={76} textAnchor="end" className={s.screenVal} fill="var(--c-wave-pressure)">20</text>
            <text x={330} y={106} fill="var(--c-wave-flow)">PEEP</text>
            <text x={404} y={108} textAnchor="end" className={s.screenVal} fill="var(--c-wave-flow)">5</text>
            <text x={330} y={140} fill="var(--c-wave-volume)">V<tspan dy={3} fontSize={7}>Te</tspan></text>
            <text x={404} y={146} textAnchor="end" className={s.screenVal} fill="var(--c-wave-volume)">500</text>
          </g>
          <rect x={430} y={56} width={64} height={10} rx={5} fill="var(--c-warning)" opacity={0.9} />
          <circle cx={462} cy={112} r={20} fill="var(--c-text-2)" stroke="var(--c-text-3)" strokeWidth={2} />
          <circle cx={462} cy={112} r={12} fill="var(--c-text-3)" />
          <path d="M462 100 V108" stroke="var(--c-surface)" strokeWidth={2.5} strokeLinecap="round" />
          <rect x={436} y={144} width={52} height={14} rx={7} fill="var(--c-text-2)" />
        </>,
      )}

      {hs(
        'gas-supply',
        <>
          <rect x={8} y={200} width={44} height={150} rx={8} fill="var(--c-surface-3)" stroke="var(--c-border-strong)" strokeWidth={1.5} />
          <circle cx={30} cy={236} r={15} fill="var(--c-surface)" stroke="var(--c-text-2)" strokeWidth={2} />
          <text x={30} y={240} className={s.tiny} textAnchor="middle">O₂</text>
          <circle cx={30} cy={306} r={15} fill="var(--c-surface)" stroke="var(--c-text)" strokeWidth={2} />
          <path d="M30 291 A15 15 0 0 1 30 321 Z" fill="var(--c-text)" />
          <text x={30} y={286} className={s.tiny} textAnchor="middle">Air</text>
          <rect x={52} y={230} width={12} height={12} rx={2} className={s.part} />
          <rect x={52} y={300} width={12} height={12} rx={2} className={s.part} />
          <text x={30} y={340} className={s.micro} textAnchor="middle">5 bar</text>
        </>,
      )}

      {hs(
        'blender',
        <>
          <rect x={114} y={222} width={82} height={76} rx={12} className={s.part} />
          <path d="M126 240 l10 8 v-16 z M146 240 l-10 8 v-16 z" className={s.sym} transform="translate(0 0)" />
          <path d="M126 280 l10 8 v-16 z M146 280 l-10 8 v-16 z" className={s.sym} />
          <path d="M152 240 H166 V260 H184 M152 280 H166 V260" className={s.symLine} />
          <text x={176} y={252} className={s.micro} textAnchor="middle">F</text>
          <text x={176} y={290} className={s.micro} textAnchor="middle">FiO₂</text>
        </>,
      )}

      {hs(
        'insp-valve',
        <>
          <rect x={206} y={228} width={66} height={64} rx={12} className={s.part} />
          <path d="M220 248 L239 260 L220 272 Z M258 248 L239 260 L258 272 Z" className={s.valve} />
          <path d="M239 260 V240 M231 240 H247" className={s.symLine} />
        </>,
      )}

      {hs(
        'o2-sensor',
        <>
          <circle cx={302} cy={260} r={18} className={s.part} />
          <circle cx={302} cy={260} r={11} fill="var(--c-accent-50)" stroke="var(--c-accent-500)" strokeWidth={1.5} />
          <text x={302} y={264} className={s.tiny} textAnchor="middle">O₂</text>
        </>,
      )}

      {hs(
        'insp-flow-sensor',
        <>
          <rect x={330} y={246} width={56} height={28} rx={8} className={s.part} />
          <path d="M342 250 V270 M350 250 V270 M358 250 V270 M366 250 V270 M374 250 V270" className={s.mesh} />
          <path d="M338 260 H380" className={s.hotwire} />
        </>,
      )}

      {hs(
        'safety-valve',
        <>
          <rect x={452} y={200} width={38} height={32} rx={8} className={s.part} />
          <path d="M461 224 L471 208 L481 224 Z" className={s.valveWarn} />
          <path d="M471 200 V192 M466 196 L471 190 L476 196" className={s.symLine} />
        </>,
      )}

      {hs(
        'pressure-sensor',
        <>
          <circle cx={410} cy={340} r={24} className={s.part} />
          <path d="M393 348 A19 19 0 1 1 427 348" className={s.gaugeArc} />
          <path d="M410 340 L421 329" className={s.needle} />
          <circle cx={410} cy={340} r={3} fill="var(--c-text)" />
        </>,
      )}

      {hs(
        'exp-flow-sensor',
        <>
          <rect x={442} y={406} width={56} height={28} rx={8} className={s.part} />
          <path d="M454 410 V430 M462 410 V430 M470 410 V430 M478 410 V430 M486 410 V430" className={s.mesh} />
          <path d="M450 420 H492" className={s.hotwire} />
        </>,
      )}

      {hs(
        'exp-valve',
        <>
          <rect x={330} y={392} width={76} height={56} rx={12} className={s.part} />
          <path d="M346 432 Q368 404 390 432" className={s.membrane} />
          <path d="M368 404 V396 M360 398 H376" className={s.symLine} />
          <text x={368} y={442} className={s.micro} textAnchor="middle">PEEP</text>
        </>,
      )}

      {hs(
        'control-unit',
        <>
          <rect x={112} y={470} width={160} height={70} rx={12} fill="var(--c-primary-800)" />
          <rect x={172} y={485} width={40} height={40} rx={4} fill="var(--c-primary-600)" stroke="var(--c-primary-300)" strokeWidth={1.5} />
          <path d="M178 485 v-6 M186 485 v-6 M194 485 v-6 M202 485 v-6 M178 525 v6 M186 525 v6 M194 525 v6 M202 525 v6 M172 492 h-6 M172 505 h-6 M172 518 h-6 M212 492 h6 M212 505 h6 M212 518 h6" stroke="var(--c-primary-300)" strokeWidth={1.5} />
          <text x={192} y={509} className={s.chipText} textAnchor="middle">CPU</text>
          <circle cx={128} cy={486} r={4} fill="var(--c-accent-300)" />
          <circle cx={256} cy={486} r={4} fill="var(--c-accent-300)" />
        </>,
      )}

      {hs(
        'power',
        <>
          <rect x={398} y={472} width={104} height={66} rx={12} className={s.part} />
          <rect x={410} y={488} width={46} height={26} rx={4} fill="none" stroke="var(--c-text-2)" strokeWidth={2} />
          <rect x={456} y={496} width={4} height={10} rx={1} fill="var(--c-text-2)" />
          <rect x={414} y={492} width={28} height={18} rx={2} fill="var(--c-success)" />
          <path d="M478 486 l-8 14 h8 l-6 14" fill="none" stroke="var(--c-warning)" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
          <text x={450} y={530} className={s.micro} textAnchor="middle">230 V / Akku</text>
        </>,
      )}

      {hs(
        'filter',
        <>
          <path d="M534 260 L546 244 H574 L586 260 L574 276 H546 Z" className={s.part} />
          <path d="M552 248 V272 M560 246 V274 M568 248 V272" className={s.mesh} />
        </>,
      )}

      {hs(
        'humidifier',
        <>
          <rect x={604} y={214} width={84} height={44} rx={10} fill="var(--c-text-2)" />
          <rect x={612} y={222} width={30} height={10} rx={3} fill="var(--c-accent-300)" />
          <text x={666} y={242} className={s.chipText} textAnchor="middle">37 °C</text>
          <path d="M600 258 H692 V320 Q692 336 676 336 H616 Q600 336 600 320 Z" fill="var(--c-surface)" stroke="var(--c-border-strong)" strokeWidth={1.5} opacity={0.95} />
          <path d="M602 296 Q624 290 646 296 T690 296 V320 Q690 334 676 334 H616 Q602 334 602 320 Z" fill="url(#vx-water)" opacity={0.85} />
          <path d="M624 286 q-4 -6 0 -12 M646 286 q-4 -6 0 -12 M668 286 q-4 -6 0 -12" fill="none" stroke="var(--c-primary-300)" strokeWidth={1.5} strokeLinecap="round" />
        </>,
      )}

      {hs(
        'insp-limb',
        <>
          <path d={INSP_LIMB_D} className={s.limbRibs} />
        </>,
      )}

      {hs(
        'exp-limb',
        <>
          <path d={EXP_LIMB_D} className={s.limbRibs} />
        </>,
      )}

      {hs(
        'patient',
        <>
          <path d="M893 470 C872 448 832 456 826 495 C820 540 826 580 850 590 C872 597 893 582 893 560 Z" fill="url(#vx-lung)" stroke="var(--c-danger)" strokeOpacity={0.5} strokeWidth={1.5} />
          <path d="M917 470 C938 448 978 456 984 495 C990 540 984 580 960 590 C938 597 917 582 917 560 Z" fill="url(#vx-lung)" stroke="var(--c-danger)" strokeOpacity={0.5} strokeWidth={1.5} />
          <path d="M905 456 V480" fill="none" stroke="var(--c-text-3)" strokeWidth={5} strokeLinecap="round" />
          <path d="M905 480 L888 502 L874 528 M888 502 L896 524 M905 480 L922 502 L936 528 M922 502 L914 524" fill="none" stroke="var(--c-text-3)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M885 400 Q905 400 905 420 V458" fill="none" stroke="var(--c-primary-300)" strokeWidth={9} strokeLinecap="round" />
          <ellipse cx={905} cy={446} rx={10} ry={12} fill="var(--c-primary-100)" stroke="var(--c-primary-400)" strokeWidth={1.5} />
        </>,
      )}

      {hs(
        'y-piece',
        <>
          <path d="M796 386 L822 400 L796 414 M822 400 H854" fill="none" stroke="var(--c-primary-600)" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M796 386 L822 400 L796 414 M822 400 H854" fill="none" stroke="var(--c-primary-200)" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={846} y={392} width={14} height={16} rx={3} fill="var(--c-surface)" stroke="var(--c-xp)" strokeWidth={1.5} />
        </>,
      )}

      {/* ---------- Beschriftungen ---------- */}
      {showLabels && !quiz && (
        <g className={s.labels} aria-hidden="true">
          {(Object.keys(GEO) as VentComponentId[]).map((id) => {
            const [lx, ly, anchor] = GEO[id].label;
            return (
              <text key={id} x={lx} y={ly} textAnchor={anchor} className={cx(selected === id && s.labelActive)}>
                {COMPONENT_BY_ID[id].short}
              </text>
            );
          })}
        </g>
      )}
    </svg>
  );
}

export const DeviceDiagram = memo(DeviceDiagramImpl);
