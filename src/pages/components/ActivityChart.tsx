import { useState } from 'react';
import { todayISO } from '@/lib/gamification';
import s from './ActivityChart.module.css';

const WEEKDAY = new Intl.DateTimeFormat('de', { weekday: 'short' });
const DATE = new Intl.DateTimeFormat('de', { day: '2-digit', month: '2-digit' });

/** Balkendiagramm der gesammelten XP der letzten `days` Tage (eine Serie, eine Achse). */
export function ActivityChart({ activity, days = 14 }: { activity: Record<string, number>; days?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = todayISO(d);
    return { key, date: d, xp: activity[key] ?? 0 };
  });
  const max = Math.max(50, ...data.map((d) => d.xp));
  const niceMax = Math.ceil(max / 50) * 50;
  const total = data.reduce((a, d) => a + d.xp, 0);
  const activeDays = data.filter((d) => d.xp > 0).length;

  const W = 560;
  const H = 180;
  const padL = 34;
  const padB = 24;
  const padT = 12;
  const plotW = W - padL - 4;
  const plotH = H - padB - padT;
  const slot = plotW / days;
  const barW = Math.min(22, slot - 6);
  const y = (v: number) => padT + plotH - (v / niceMax) * plotH;
  const ticks = [0, niceMax / 2, niceMax];

  const hovered = hover !== null ? data[hover] : null;

  return (
    <figure className={s.figure}>
      <div className={s.summary}>
        <span>
          <strong>{total}</strong> XP in {days} Tagen
        </span>
        <span>
          <strong>{activeDays}</strong> aktive {activeDays === 1 ? 'Tag' : 'Tage'}
        </span>
        <span className={s.readout} aria-live="polite">
          {hovered ? `${WEEKDAY.format(hovered.date)}, ${DATE.format(hovered.date)}: ${hovered.xp} XP` : ' '}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.svg} role="img" aria-label={`Aktivität der letzten ${days} Tage: insgesamt ${total} XP an ${activeDays} Tagen`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - 4} y1={y(t)} y2={y(t)} className={t === 0 ? s.baseline : s.grid} />
            <text x={padL - 6} y={y(t) + 4} className={s.tick} textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padL + slot * i + slot / 2;
          const h = Math.max(0, y(0) - y(d.xp));
          const isToday = i === days - 1;
          const r = Math.min(4, h / 2, barW / 2);
          const x0 = cx - barW / 2;
          const top = y(0) - h;
          // nur oben abgerundet, unten bündig an der Grundlinie
          const path =
            h > 0
              ? `M${x0},${y(0)} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + barW - r} Q${x0 + barW},${top} ${x0 + barW},${top + r} V${y(0)} Z`
              : '';
          return (
            <g
              key={d.key}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={hover === i ? s.barHover : undefined}
            >
              <rect x={padL + slot * i} y={padT} width={slot} height={plotH} className={s.hit} />
              {h > 0 ? <path d={path} className={isToday ? s.barToday : s.bar} /> : <circle cx={cx} cy={y(0) - 2} r={2} className={s.zero} />}
              <text x={cx} y={H - 6} textAnchor="middle" className={isToday ? s.labelToday : s.label}>
                {isToday ? 'Heute' : WEEKDAY.format(d.date).replace('.', '').slice(0, 2)}
              </text>
              <title>{`${WEEKDAY.format(d.date)}, ${DATE.format(d.date)}: ${d.xp} XP`}</title>
            </g>
          );
        })}
      </svg>
      <table className="visually-hidden">
        <caption>XP pro Tag, letzte {days} Tage</caption>
        <thead>
          <tr>
            <th scope="col">Datum</th>
            <th scope="col">XP</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{DATE.format(d.date)}</td>
              <td>{d.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
