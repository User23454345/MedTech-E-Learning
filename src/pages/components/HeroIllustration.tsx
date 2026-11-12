/**
 * Dekorative Hero-Grafik: stilisierter Beatmungsmonitor mit „live“ laufenden
 * Kurven (druckkontrollierte Beatmung, Einkompartiment-Modell, I:E = 1:2).
 * Die Kurven sind periodisch und werden per CSS-Animation verschoben.
 */
import { useMemo } from 'react';
import s from './HeroIllustration.module.css';

const PERIOD = 150; // px pro Atemzyklus
const SAMPLES = 90;
const TI = 1 / 3; // Inspirationsanteil (I:E 1:2)
const TAU = 0.093; // τ = R·C ≈ 0,4 s bei T ≈ 4,3 s (f = 14/min)
const RISE = 0.02; // kurze Druckanstiegszeit

type Signal = 'pressure' | 'flow' | 'volume';

/** Normierte Signalwerte (−1..1) über eine Periode (t = 0..1). */
function sample(sig: Signal, t: number): number {
  const vEnd = 1 - Math.exp(-TI / TAU);
  if (t < TI) {
    if (sig === 'pressure') return 0.15 + 0.85 * Math.min(1, t / RISE);
    if (sig === 'flow') return Math.exp(-t / TAU) * Math.min(1, t / 0.006);
    return 1 - Math.exp(-t / TAU);
  }
  const te = t - TI;
  if (sig === 'pressure') return 0.15 + 0.85 * Math.max(0, 1 - te / RISE);
  if (sig === 'flow') return -vEnd * Math.exp(-te / TAU) * Math.min(1, te / 0.006);
  return vEnd * Math.exp(-te / TAU);
}

function buildPath(sig: Signal, cycles: number, height: number): string {
  const base = sig === 'flow' ? height / 2 : height - 2;
  const amp = sig === 'flow' ? height / 2 - 3 : height - 6;
  const pts: string[] = [];
  for (let c = 0; c < cycles; c++) {
    for (let i = 0; i <= SAMPLES; i++) {
      if (c > 0 && i === 0) continue;
      const t = i / SAMPLES;
      const x = c * PERIOD + t * PERIOD;
      const y = base - sample(sig, t) * amp;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
  }
  return `M${pts.join(' L')}`;
}

const ROWS: { sig: Signal; label: string; unit: string; cls: string }[] = [
  { sig: 'pressure', label: 'P', unit: 'cmH₂O', cls: 'pressure' },
  { sig: 'flow', label: 'V̇', unit: 'L/min', cls: 'flow' },
  { sig: 'volume', label: 'V', unit: 'ml', cls: 'volume' },
];

const VALUES: { label: string; value: string; unit: string; cls?: string }[] = [
  { label: 'P peak', value: '17', unit: 'cmH₂O', cls: 'pressure' },
  { label: 'PEEP', value: '5', unit: 'cmH₂O', cls: 'pressure' },
  { label: 'V T', value: '480', unit: 'ml', cls: 'volume' },
  { label: 'f', value: '14', unit: '/min' },
  { label: 'MV', value: '6,7', unit: 'L/min', cls: 'flow' },
  { label: 'FiO₂', value: '40', unit: '%' },
];

export function HeroIllustration() {
  const rowH = 52;
  const paths = useMemo(() => ROWS.map((r) => buildPath(r.sig, 4, rowH)), []);

  return (
    <div className={s.wrap} aria-hidden="true">
      <div className={s.glow} />
      <svg className={s.svg} viewBox="0 0 480 360" role="presentation">
        <defs>
          <linearGradient id="heroBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-surface)" />
            <stop offset="100%" stopColor="var(--c-surface-3)" />
          </linearGradient>
          <clipPath id="heroWaveClip">
            <rect x="0" y="0" width="300" height="200" />
          </clipPath>
          <linearGradient id="heroFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--c-monitor-bg)" stopOpacity="1" />
            <stop offset="8%" stopColor="var(--c-monitor-bg)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gerätegehäuse */}
        <rect x="10" y="10" width="460" height="300" rx="26" fill="url(#heroBody)" stroke="var(--c-border-strong)" />
        <rect x="28" y="28" width="424" height="236" rx="14" fill="var(--c-monitor-bg)" />
        {/* Standfuß */}
        <path d="M200 310h80l14 34H186z" fill="var(--c-surface-3)" stroke="var(--c-border-strong)" />
        <rect x="150" y="340" width="180" height="10" rx="5" fill="var(--c-border-strong)" />
        {/* Bedienknopf & LEDs */}
        <circle cx="436" cy="287" r="11" fill="var(--c-surface)" stroke="var(--c-border-strong)" />
        <circle cx="436" cy="287" r="4" fill="var(--c-primary-400)" />
        <circle cx="50" cy="287" r="4" fill="var(--c-accent-400)" className={s.led} />
        <rect x="62" y="283" width="60" height="8" rx="4" fill="var(--c-border)" />

        {/* Kopfzeile Monitor */}
        <text x="42" y="48" className={s.monoSmall}>
          PC-CMV · Erwachsene
        </text>
        <circle cx="430" cy="44" r="4" fill="var(--c-accent-400)" className={s.led} />

        {/* Kurven */}
        <g transform="translate(42 58)">
          <g clipPath="url(#heroWaveClip)">
            {ROWS.map((r, i) => (
              <g key={r.sig} transform={`translate(0 ${i * (rowH + 14)})`}>
                <line x1="0" x2="300" y1={r.sig === 'flow' ? rowH / 2 : rowH - 2} y2={r.sig === 'flow' ? rowH / 2 : rowH - 2} className={s.grid} />
                <path d={paths[i]} className={`${s.wave} ${s[r.cls]}`} />
              </g>
            ))}
            <rect x="0" y="0" width="300" height="200" fill="url(#heroFade)" />
          </g>
          {ROWS.map((r, i) => (
            <text key={r.sig} x="4" y={i * (rowH + 14) + 10} className={`${s.monoSmall} ${s[`${r.cls}Text`]}`}>
              {r.label} [{r.unit}]
            </text>
          ))}
        </g>

        {/* Messwerte */}
        <g transform="translate(356 56)">
          {VALUES.map((v, i) => (
            <g key={v.label} transform={`translate(0 ${i * 34})`}>
              <text x="0" y="8" className={s.valLabel}>
                {v.label}
              </text>
              <text x="0" y="28" className={`${s.valNum} ${v.cls ? s[`${v.cls}Text`] : ''}`}>
                {v.value}
                <tspan className={s.valUnit} dx="4">
                  {v.unit}
                </tspan>
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className={`${s.float} ${s.floatA}`}>
        <span className={s.floatDot} />
        <div>
          <div className={s.floatLabel}>Driving Pressure</div>
          <div className={s.floatValue}>ΔP = 12 cmH₂O</div>
        </div>
      </div>
      <div className={`${s.float} ${s.floatB}`}>
        <div>
          <div className={s.floatLabel}>Zeitkonstante</div>
          <div className={s.floatValue}>τ = R · C ≈ 0,4 s</div>
        </div>
      </div>
    </div>
  );
}
