/**
 * Kombinierter Regler (Slider + Stepper), wie ein Drehknopf am Beatmungsgerät.
 */
import { useId, type ReactNode } from 'react';
import { Icon, cx } from '@/components/ui';
import s from './ControlSlider.module.css';

interface Props {
  label: string;
  /** optionaler Kurzname, z. B. „VT“ */
  short?: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  /** Zusatzinfo unter dem Regler */
  hint?: string;
  tone?: 'default' | 'warning';
  format?: (v: number) => string;
}

export function ControlSlider({ label, short, value, min, max, step, unit, digits = 0, onChange, disabled, hint, tone = 'default', format }: Props) {
  const id = useId();
  const show = format ? format(value) : value.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const set = (v: number) => {
    const snapped = Math.round(v / step) * step;
    const clamped = Math.min(max, Math.max(min, Number(snapped.toFixed(4))));
    if (clamped !== value) onChange(clamped);
  };
  return (
    <div className={cx(s.ctrl, disabled && s.disabled, tone === 'warning' && s.warning)}>
      <div className={s.head}>
        <label htmlFor={id} className={s.label}>
          {short && <span className={s.short}>{short}</span>}
          {label}
        </label>
        <output htmlFor={id} className={s.value} aria-live="off">
          {show}
          {unit && <span className={s.unit}> {unit}</span>}
        </output>
      </div>
      <div className={s.row}>
        <button type="button" className={s.step} onClick={() => set(value - step)} disabled={disabled || value <= min} aria-label={`${label} verringern`}>
          <Icon name="chevronLeft" size={16} />
        </button>
        <input
          id={id}
          type="range"
          className={s.range}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => set(Number(e.target.value))}
          aria-valuetext={`${show}${unit ? ` ${unit}` : ''}`}
          style={{ ['--pct' as string]: `${((value - min) / (max - min)) * 100}%` }}
        />
        <button type="button" className={s.step} onClick={() => set(value + step)} disabled={disabled || value >= max} aria-label={`${label} erhöhen`}>
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
      {hint && <div className={s.hint}>{hint}</div>}
    </div>
  );
}
