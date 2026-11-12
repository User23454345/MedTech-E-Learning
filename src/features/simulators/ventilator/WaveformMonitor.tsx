/**
 * Drei Echtzeitkurven (Druck, Flow, Volumen) als Canvas mit devicePixelRatio.
 * Gezeichnet wird auf Anforderung über die imperative `draw()`-Methode,
 * damit eine einzige Animationsschleife (im Simulator) alles steuert.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { drawSweep, readMonitorColors, type ChannelScale } from './waveDraw';
import type { SweepEngine } from './sweepEngine';
import s from './VentilatorSimulator.module.css';

export interface WaveformMonitorHandle {
  draw: () => void;
}

export interface MonitorScales {
  p: ChannelScale;
  flow: ChannelScale;
  vol: ChannelScale;
}

type Key = keyof MonitorScales;

const CHANNELS: { key: Key; label: string; unit: string; cls: string }[] = [
  { key: 'p', label: 'P_aw', unit: 'cmH₂O', cls: 'chPressure' },
  { key: 'flow', label: 'Flow', unit: 'L/min', cls: 'chFlow' },
  { key: 'vol', label: 'Volumen', unit: 'ml', cls: 'chVolume' },
];

export const WaveformMonitor = forwardRef<WaveformMonitorHandle, { engine: SweepEngine; scales: MonitorScales; ariaLabel: string }>(
  function WaveformMonitor({ engine, scales, ariaLabel }, ref) {
    const canvases = useRef<Record<Key, HTMLCanvasElement | null>>({ p: null, flow: null, vol: null });
    const sizes = useRef<Record<Key, { w: number; h: number }>>({ p: { w: 0, h: 0 }, flow: { w: 0, h: 0 }, vol: { w: 0, h: 0 } });
    const colors = useRef<ReturnType<typeof readMonitorColors> | null>(null);
    const scalesRef = useRef(scales);
    scalesRef.current = scales;

    const draw = useCallback(() => {
      const dpr = window.devicePixelRatio || 1;
      for (const ch of CHANNELS) {
        const cv = canvases.current[ch.key];
        if (!cv) continue;
        if (!colors.current) colors.current = readMonitorColors(cv);
        const c = colors.current;
        const ctx = cv.getContext('2d');
        const { w, h } = sizes.current[ch.key];
        if (!ctx || w === 0) continue;
        // devicePixelRatio kann sich ohne Größenänderung ändern (Zoom, anderer Monitor)
        const tw = Math.round(w * dpr);
        const th = Math.round(h * dpr);
        if (cv.width !== tw || cv.height !== th) {
          cv.width = tw;
          cv.height = th;
        }
        const data = ch.key === 'p' ? engine.p : ch.key === 'flow' ? engine.flow : engine.vol;
        const line = ch.key === 'p' ? c.pressure : ch.key === 'flow' ? c.flow : c.volume;
        drawSweep(ctx, w, h, dpr, data, engine.cursor, engine.gapN, scalesRef.current[ch.key], { bg: c.bg, grid: c.grid, text: c.text, line }, engine.windowS);
      }
    }, [engine]);

    useImperativeHandle(ref, () => ({ draw }), [draw]);

    useEffect(() => {
      const ro = new ResizeObserver((entries) => {
        const dpr = window.devicePixelRatio || 1;
        for (const e of entries) {
          const cv = e.target as HTMLCanvasElement;
          const key = cv.dataset.ch as Key;
          const w = Math.max(1, Math.round(e.contentRect.width));
          const h = Math.max(1, Math.round(e.contentRect.height));
          sizes.current[key] = { w, h };
          cv.width = Math.round(w * dpr);
          cv.height = Math.round(h * dpr);
        }
        draw();
      });
      Object.values(canvases.current).forEach((cv) => cv && ro.observe(cv));
      return () => ro.disconnect();
    }, [draw]);

    useEffect(() => {
      draw();
    }, [scales, draw]);

    return (
      <div className={s.waves} role="img" aria-label={ariaLabel}>
        {CHANNELS.map((ch) => (
          <div key={ch.key} className={s.wave}>
            <div className={`${s.waveLabel} ${s[ch.cls]}`}>
              {ch.label === 'P_aw' ? (
                <>
                  P<sub>aw</sub>
                </>
              ) : (
                ch.label
              )}{' '}
              <span className={s.waveUnit}>{ch.unit}</span>
            </div>
            <canvas
              ref={(el) => {
                canvases.current[ch.key] = el;
              }}
              data-ch={ch.key}
              className={s.canvas}
              aria-hidden="true"
            />
          </div>
        ))}
        <div className={s.timeAxis} aria-hidden="true">
          <span>0</span>
          <span>{engine.windowS / 2} s</span>
          <span>{engine.windowS} s</span>
        </div>
      </div>
    );
  },
);
