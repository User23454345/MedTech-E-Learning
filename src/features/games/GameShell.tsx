/**
 * Gemeinsame Bausteine der Lernspiele und Quizformate:
 * Rahmen-Karte, Ergebnis-Panel, CSS-Konfetti, Timer-Hook, Zeitformat.
 */
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { Card, Icon, ProgressRing, cx, type IconName } from '@/components/ui';
import s from './GameShell.module.css';

export function GameFrame({
  kind,
  icon,
  title,
  meta,
  children,
  className,
}: {
  kind: string;
  icon: IconName;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <Card className={cx(s.frame, className)} role="region" aria-labelledby={id}>
      <header className={s.head}>
        <span className={s.headIcon} aria-hidden>
          <Icon name={icon} size={20} />
        </span>
        <div className={s.headText}>
          <div className={s.kind}>{kind}</div>
          <h3 id={id} className={s.title}>
            {title}
          </h3>
        </div>
        {meta && <div className={s.meta}>{meta}</div>}
      </header>
      {children}
    </Card>
  );
}

/** Kleines Statistik-Pill im Kopfbereich (z. B. Timer, Fehler). */
export function MetaPill({ icon, label, children, tone }: { icon: IconName; label: string; children: ReactNode; tone?: 'danger' | 'success' }) {
  return (
    <span className={cx(s.pill, tone && s[`pill-${tone}`])} aria-label={label} title={label}>
      <Icon name={icon} size={14} />
      <span aria-hidden>{children}</span>
    </span>
  );
}

/** Rein dekoratives CSS-Konfetti (respektiert prefers-reduced-motion). */
export function Burst() {
  return (
    <div className={s.burst} aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <span key={i} className={s.particle} style={{ '--a': `${i * 22.5}deg`, '--d': `${70 + (i % 3) * 22}px` } as CSSProperties} />
      ))}
    </div>
  );
}

export interface Stat {
  label: string;
  value: ReactNode;
}

/** Abschluss-Panel mit Score-Ring, Botschaft, Kennzahlen und Aktionen. */
export function ResultPanel({
  score,
  heading,
  message,
  stats,
  actions,
  ringLabel,
  children,
}: {
  score: number;
  heading: string;
  message?: ReactNode;
  stats?: Stat[];
  actions?: ReactNode;
  ringLabel?: ReactNode;
  children?: ReactNode;
}) {
  const perfect = score >= 0.999;
  return (
    <div className={s.result} role="status" aria-live="polite">
      <div className={s.ringWrap}>
        {perfect && <Burst />}
        <ProgressRing value={score} size={112} stroke={9} label={`Ergebnis ${Math.round(score * 100)} Prozent`}>
          <span className={s.ringValue}>{ringLabel ?? `${Math.round(score * 100)} %`}</span>
        </ProgressRing>
      </div>
      <div className={s.resultBody}>
        <h4 className={s.resultHeading}>
          {perfect && <Icon name="star" size={18} className={s.star} />}
          {heading}
        </h4>
        {message && <div className={s.resultMsg}>{message}</div>}
        {stats && stats.length > 0 && (
          <dl className={s.stats}>
            {stats.map((st) => (
              <div key={st.label} className={s.stat}>
                <dt>{st.label}</dt>
                <dd>{st.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {children}
        {actions && <div className={s.actions}>{actions}</div>}
      </div>
    </div>
  );
}

/** Kurztext abhängig vom Score – motivierend, nicht kindlich. */
export function scoreMessage(score: number): string {
  if (score >= 0.999) return 'Perfekt – fehlerfrei gelöst.';
  if (score >= 0.8) return 'Sehr gut – sicher beherrscht.';
  if (score >= 0.6) return 'Gut – mit kleinen Lücken. Ein zweiter Durchgang festigt das Wissen.';
  if (score >= 0.4) return 'Solide Basis – wiederhole die markierten Punkte.';
  return 'Dranbleiben – nimm dir die Erklärungen in Ruhe vor und versuche es erneut.';
}

export function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Laufende Stoppuhr; `start`/`end` als Zeitstempel (ms) oder null. */
export function useElapsed(start: number | null, end: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (start === null || end !== null) return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [start, end]);
  if (start === null) return 0;
  return (end ?? Math.max(now, start)) - start;
}

/** Griff-Symbol für Drag & Drop (sechs Punkte). */
export function GripIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor">
      {[8, 16].map((x) => [6, 12, 18].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} />))}
    </svg>
  );
}
