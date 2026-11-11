/**
 * UI-Grundbausteine. Alle Features nutzen diese Komponenten, damit das
 * Erscheinungsbild konsistent bleibt.
 */
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import s from './ui.module.css';
import { Icon, type IconName } from './Icon';
import { useProgress } from '@/state/progress';

export { Icon, type IconName } from './Icon';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export { cx };

/* ---------- Button ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'soft' | 'accent' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface BtnStyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: IconName;
  iconRight?: IconName;
}

function btnClass({ variant = 'primary', size = 'md', block }: BtnStyleProps, extra?: string) {
  return cx(s.btn, variant !== 'primary' && s[variant], size !== 'md' && s[size], block && s.block, extra);
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & BtnStyleProps>(
  ({ variant, size, block, icon, iconRight, className, children, type = 'button', ...rest }, ref) => (
    <button ref={ref} type={type} className={btnClass({ variant, size, block }, className)} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </button>
  ),
);
Button.displayName = 'Button';

export function ButtonLink({ variant, size, block, icon, iconRight, className, children, ...rest }: LinkProps & BtnStyleProps) {
  return (
    <Link className={btnClass({ variant, size, block }, className)} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </Link>
  );
}

/* ---------- Card ---------- */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  flat?: boolean;
  compact?: boolean;
}
export function Card({ interactive, flat, compact, className, ...rest }: CardProps) {
  return <div className={cx(s.card, interactive && s.cardInteractive, flat && s.cardFlat, compact && s.cardCompact, className)} {...rest} />;
}

/* ---------- Progress ---------- */
export function ProgressBar({ value, variant, label, className }: { value: number; variant?: 'xp'; label?: string; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={cx(s.bar, variant === 'xp' && s.barXp, className)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className={s.barFill} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 56, stroke = 6, children, label }: { value: number; size?: number; stroke?: number; children?: ReactNode; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={s.ring} style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v * 100)} % abgeschlossen`}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-primary-500)" />
            <stop offset="100%" stopColor="var(--c-accent-400)" />
          </linearGradient>
        </defs>
        <circle className={s.ringTrack} cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className={s.ringFill}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
        />
      </svg>
      <div className={s.ringLabel}>{children ?? `${Math.round(v * 100)}%`}</div>
    </div>
  );
}

/* ---------- Chip ---------- */
export function Chip({ tone, icon, children, className }: { tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'xp'; icon?: IconName; children: ReactNode; className?: string }) {
  return (
    <span className={cx(s.chip, tone && s[`chip-${tone}`], className)}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

export function IconBadge({ name, size = 44, className, style }: { name: IconName; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={cx(s.iconBadge, className)} style={{ width: size, height: size, ...style }}>
      <Icon name={name} size={Math.round(size * 0.5)} />
    </span>
  );
}

/* ---------- Segmented control ---------- */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div className={s.segmented} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className={s.segBtn} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Toasts ---------- */
export function ToastViewport() {
  const { toasts, dismissToast } = useProgress();
  return (
    <div className={s.toasts} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={cx(s.toast, s[`toast-${t.kind}`])} role="status">
          <span className={s.toastIcon}>
            <Icon name={t.icon ?? 'info'} size={18} />
          </span>
          <div>
            <div className={s.toastTitle}>{t.title}</div>
            {t.message && <div className={s.toastMsg}>{t.message}</div>}
          </div>
          <button className={s.toastClose} onClick={() => dismissToast(t.id)} aria-label="Benachrichtigung schließen">
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
