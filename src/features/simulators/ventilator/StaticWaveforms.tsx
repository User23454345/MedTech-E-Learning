/**
 * Statische SVG-Darstellung von Druck, Flow und Volumen (z. B. Kurvendetektiv).
 * Optional mit blasser Referenzkurve (Normalbefund) zum Vergleich.
 */
import { useId } from 'react';
import type { Sample } from './model';
import s from './StaticWaveforms.module.css';

interface Channel {
  key: 'p' | 'flow' | 'vol';
  label: string;
  unit: string;
  color: string;
}

const CHANNELS: Channel[] = [
  { key: 'p', label: 'Druck', unit: 'cmH₂O', color: 'var(--c-wave-pressure)' },
  { key: 'flow', label: 'Flow', unit: 'L/min', color: 'var(--c-wave-flow)' },
  { key: 'vol', label: 'Volumen', unit: 'ml', color: 'var(--c-wave-volume)' },
];

const W = 600;
const H = 110;
const PAD_L = 38;
const PAD_R = 8;
const PAD_T = 8;
const PAD_B = 8;

function niceStep(range: number): number {
  const raw = range / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

function scaleFor(key: Channel['key'], all: Sample[][]): { min: number; max: number; step: number } {
  let lo = Infinity;
  let hi = -Infinity;
  for (const arr of all) for (const p of arr) {
    lo = Math.min(lo, p[key]);
    hi = Math.max(hi, p[key]);
  }
  if (key === 'p') lo = Math.min(0, lo);
  if (key === 'vol') lo = Math.min(0, lo);
  if (key === 'flow') {
    const m = Math.max(Math.abs(lo), Math.abs(hi));
    const step = niceStep(2 * m);
    const top = Math.ceil((m * 1.08) / step) * step;
    return { min: -top, max: top, step };
  }
  const step = niceStep(hi - lo);
  return { min: Math.floor(lo / step) * step, max: Math.ceil((hi * 1.08) / step) * step, step };
}

function path(data: Sample[], key: Channel['key'], tMax: number, sc: { min: number; max: number }): string {
  const w = W - PAD_L - PAD_R;
  const h = H - PAD_T - PAD_B;
  let d = '';
  const stride = Math.max(1, Math.floor(data.length / 900));
  for (let i = 0; i < data.length; i += stride) {
    const p = data[i];
    const x = PAD_L + (p.t / tMax) * w;
    const y = PAD_T + h - ((p[key] - sc.min) / (sc.max - sc.min)) * h;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

export function StaticWaveforms({ samples, reference, ariaLabel }: { samples: Sample[]; reference?: Sample[]; ariaLabel: string }) {
  const id = useId();
  const tMax = Math.max(samples[samples.length - 1]?.t ?? 1, reference?.[reference.length - 1]?.t ?? 0);
  const all = reference ? [samples, reference] : [samples];
  return (
    <div className={s.monitor} role="img" aria-label={ariaLabel}>
      {CHANNELS.map((ch) => {
        const sc = scaleFor(ch.key, all);
        const w = W - PAD_L - PAD_R;
        const h = H - PAD_T - PAD_B;
        const yOf = (v: number) => PAD_T + h - ((v - sc.min) / (sc.max - sc.min)) * h;
        const ticks: number[] = [];
        for (let v = sc.min; v <= sc.max + 1e-9; v += sc.step) ticks.push(Math.round(v * 100) / 100);
        return (
          <div key={ch.key} className={s.panel}>
            <div className={s.label} style={{ color: ch.color }}>
              {ch.label} <span className={s.unit}>{ch.unit}</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={s.svg} aria-hidden="true">
              <clipPath id={`${id}-${ch.key}`}>
                <rect x={PAD_L} y={0} width={w} height={H} />
              </clipPath>
              {ticks.map((v) => (
                <line key={v} x1={PAD_L} x2={W - PAD_R} y1={yOf(v)} y2={yOf(v)} className={v === 0 ? s.zero : s.grid} vectorEffect="non-scaling-stroke" />
              ))}
              <g clipPath={`url(#${id}-${ch.key})`}>
                {reference && <path d={path(reference, ch.key, tMax, sc)} className={s.ref} vectorEffect="non-scaling-stroke" />}
                <path d={path(samples, ch.key, tMax, sc)} stroke={ch.color} className={s.line} vectorEffect="non-scaling-stroke" />
              </g>
            </svg>
            <div className={s.ticks} aria-hidden="true" style={{ width: `${(PAD_L / W) * 100}%` }}>
              {ticks.map((v) => (
                <span key={v} style={{ top: `${(yOf(v) / H) * 100}%` }}>
                  {v.toLocaleString('de-DE')}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      {reference && (
        <div className={s.legend}>
          <span className={s.legendRef} /> Referenz (Normalbefund)
        </div>
      )}
    </div>
  );
}
