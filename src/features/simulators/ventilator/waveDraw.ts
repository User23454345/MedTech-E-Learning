/**
 * Canvas-Zeichenroutinen für den Monitor (Sweep-Darstellung wie am Gerät).
 */

export interface ChannelScale {
  min: number;
  max: number;
  /** Abstand der Gitterlinien in Einheiten */
  step: number;
}

export interface MonitorColors {
  bg: string;
  grid: string;
  text: string;
  line: string;
}

/** „Schöne“ Achsenobergrenze (Vielfache von step) */
export function niceCeil(v: number, step: number): number {
  return Math.max(step, Math.ceil(v / step) * step);
}

/**
 * Zeichnet einen Kanal. `data` ist ein Ringpuffer (NaN = keine Daten),
 * `cursor` der zuletzt geschriebene Index; vor dem Cursor bleibt eine Lücke.
 */
export function drawSweep(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
  dpr: number,
  data: Float32Array,
  cursor: number,
  gapN: number,
  scale: ChannelScale,
  colors: MonitorColors,
  windowSeconds: number,
) {
  const padL = 34;
  const padR = 6;
  const padT = 6;
  const padB = 6;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, cssW, cssH);
  const w = cssW - padL - padR;
  const h = cssH - padT - padB;
  if (w <= 0 || h <= 0) return;
  const yOf = (v: number) => padT + h - ((v - scale.min) / (scale.max - scale.min)) * h;

  // Gitter & Achsenbeschriftung
  ctx.lineWidth = 1;
  ctx.font = '10px ui-monospace, Menlo, Consolas, monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const pxPerStep = (h * scale.step) / (scale.max - scale.min);
  const labelEvery = Math.max(1, Math.ceil(13 / Math.max(1, pxPerStep)));
  let k = 0;
  for (let v = scale.min; v <= scale.max + 1e-9; v += scale.step, k++) {
    const y = Math.round(yOf(v)) + 0.5;
    ctx.strokeStyle = colors.grid;
    ctx.globalAlpha = v === 0 ? 1 : 0.7;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + w, y);
    ctx.stroke();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = colors.text;
    if (k % labelEvery === 0) ctx.fillText(String(Math.round(v)), padL - 5, Math.min(cssH - 6, Math.max(6, y)));
  }
  ctx.globalAlpha = 0.5;
  for (let s = 1; s < windowSeconds; s++) {
    const x = Math.round(padL + (s / windowSeconds) * w) + 0.5;
    ctx.strokeStyle = colors.grid;
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Nulllinie hervorheben (Flow)
  if (scale.min < 0) {
    const y = Math.round(yOf(0)) + 0.5;
    ctx.strokeStyle = colors.text;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + w, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Kurve
  const N = data.length;
  ctx.save();
  ctx.beginPath();
  ctx.rect(padL, 0, w, cssH);
  ctx.clip();
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  let pen = false;
  for (let i = 0; i < N; i++) {
    const ahead = (i - cursor + N) % N; // Abstand vor dem Cursor
    const v = data[i];
    if ((ahead > 0 && ahead <= gapN) || Number.isNaN(v)) {
      pen = false;
      continue;
    }
    const x = padL + (i / (N - 1)) * w;
    const y = yOf(Math.max(scale.min - 2, Math.min(scale.max + 2, v)));
    if (!pen) {
      ctx.moveTo(x, y);
      pen = true;
    } else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // Leuchtender Cursorpunkt
  const cv = data[cursor];
  if (!Number.isNaN(cv)) {
    ctx.fillStyle = colors.line;
    ctx.beginPath();
    ctx.arc(padL + (cursor / (N - 1)) * w, yOf(Math.max(scale.min, Math.min(scale.max, cv))), 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Liest Design-Token-Farben einmalig aus dem DOM */
export function readMonitorColors(el: Element): { bg: string; grid: string; text: string; pressure: string; flow: string; volume: string } {
  const cs = getComputedStyle(el);
  const v = (n: string, fb: string) => cs.getPropertyValue(n).trim() || fb;
  return {
    bg: v('--c-monitor-bg', '#0b1626'),
    grid: v('--c-monitor-grid', '#1b2a40'),
    text: v('--c-monitor-text', '#d7e3f4'),
    pressure: v('--c-wave-pressure', '#f2b705'),
    flow: v('--c-wave-flow', '#2dc3ad'),
    volume: v('--c-wave-volume', '#6aa8ff'),
  };
}
