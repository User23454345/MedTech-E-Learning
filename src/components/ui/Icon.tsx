import type { SVGProps } from 'react';

/**
 * Schlanke, einheitliche Icon-Bibliothek (24×24, Strichstärke 1.75).
 * Neue Icons hier ergänzen – Pfade im Stil von Lucide/Feather.
 */
const paths = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  gamepad: 'M6 12h4M8 10v4M15 13h.01M18 11h.01M17.3 5H6.7a4 4 0 0 0-3.96 3.43l-.73 5.1A3 3 0 0 0 7.2 16l1.3-1h7l1.3 1a3 3 0 0 0 5.19-2.47l-.73-5.1A4 4 0 0 0 17.3 5z',
  user: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  lungs: 'M12 4v8M12 12l-3 2M12 12l3 2M8.5 7C6 7 3 10.5 3 15.5 3 18 4 20 6 20c2.5 0 3.5-1.5 3.5-4V9.5C9.5 8 9 7 8.5 7zM15.5 7C18 7 21 10.5 21 15.5 21 18 20 20 18 20c-2.5 0-3.5-1.5-3.5-4V9.5c0-1.5.5-2.5 1-2.5z',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4M6 11h3l1.5-3 2 6 1.5-3H18',
  zap: 'M13 2 4 14h7l-1 8 9-12h-7z',
  heartPulse: 'M19.5 13.5 12 21l-7.5-7.5A5 5 0 0 1 12 6.5a5 5 0 0 1 7.5 7zM3.5 12h4l1.5-2.5 2 4 1.5-1.5h3',
  droplet: 'M12 2.7s-6 6.6-6 11.3a6 6 0 0 0 12 0c0-4.7-6-11.3-6-11.3z',
  syringe: 'm18 2 4 4M17 7l3-3M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5M9 11l4 4M5 19l-3 3M14 4l6 6',
  waves: 'M2 6c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2',
  scan: 'M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10',
  mask: 'M12 3c-4 0-7 3-7 7v3a7 7 0 0 0 14 0v-3c0-4-3-7-7-7zM9 10h6M9 14h6M5 11H2M22 11h-3',
  filter: 'M4 4h16l-6 8v6l-4 2v-8z',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  chevronRight: 'm9 18 6-6-6-6',
  chevronLeft: 'm15 18-6-6 6-6',
  chevronDown: 'm6 9 6 6 6-6',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  arrowLeft: 'M19 12H5M11 19l-7-7 7-7',
  play: 'M6 4l14 8-14 8z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  reset: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  unlock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.5-2',
  star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3',
  flame: 'M12 22a7 7 0 0 0 7-7c0-3-2-5.5-3.5-7-.5 2-1.5 3-3 3.5C13 8 12 5 9 2c0 4-4 6.5-4 13a7 7 0 0 0 7 7z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  layers: 'm12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5',
  cpu: 'M6 6h12v12H6zM9 9h6v6H9zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  brain: 'M9.5 2A2.5 2.5 0 0 0 7 4.5v.5a3 3 0 0 0-3 3 3 3 0 0 0 .5 5A3 3 0 0 0 7 18a2.5 2.5 0 0 0 5 1V4.5A2.5 2.5 0 0 0 9.5 2zM14.5 2A2.5 2.5 0 0 1 17 4.5v.5a3 3 0 0 1 3 3 3 3 0 0 1-.5 5A3 3 0 0 1 17 18a2.5 2.5 0 0 1-5 1',
  award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  alert: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  stethoscope: 'M5 3v6a5 5 0 0 0 10 0V3M10 14v2a5 5 0 0 0 10 0v-2M20 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  lightbulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z',
  flask: 'M9 3h6M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3L14 9V3M7 15h10',
  menu: 'M4 6h16M4 12h16M4 18h16',
  sparkles: 'm12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9zM5 2l.6 1.4L7 4l-1.4.6L5 6l-.6-1.4L3 4l1.4-.6z',
  swords: 'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5 14 2h3v3l-4.5 4.5M5 14l-3 3 2 2 3-3M7 17l-2 2',
  chart: 'M3 3v18h18M7 16l4-5 4 3 5-7',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  quote: 'M3 21c3 0 7-1 7-8V5H3v7h4c0 3.5-2 5-4 5zM14 21c3 0 7-1 7-8V5h-7v7h4c0 3.5-2 5-4 5z',
  gauge: 'M12 14l4-4M3.3 19a10 10 0 1 1 17.4 0',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  refresh: 'M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5',
  shuffle: 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
  calendar: 'M3 5h18v16H3zM16 3v4M8 3v4M3 10h18',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  hand: 'M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15',
  fan: 'M12 12c-3-4-1-9 2-9s3 4-2 9zM12 12c4-3 9-1 9 2s-4 3-9-2zM12 12c3 4 1 9-2 9s-3-4 2-9zM12 12c-4 3-9 1-9-2s4-3 9 2z',
  wind: 'M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2',
  thermometer: 'M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z',
  battery: 'M2 7h16v10H2zM22 11v2M6 10v4M10 10v4',
  plug: 'M12 22v-5M9 8V2M15 8V2M18 8v5a6 6 0 0 1-12 0V8z',
  valve: 'M3 12h4M17 12h4M7 7l10 10V7L7 17zM12 3v5',
  radio: 'M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9a10 10 0 0 1 0 14.2',
} as const;

export type IconName = keyof typeof paths;
export const iconNames = Object.keys(paths) as IconName[];

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Für dekorative Icons weglassen; sonst wird ein Label vorgelesen. */
  label?: string;
}

export function Icon({ name, size = 20, label, strokeWidth = 1.75, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
