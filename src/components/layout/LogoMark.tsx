/** Kleines Logo-Zeichen: abgerundetes Quadrat mit EKG-Linie. */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-primary-500)" />
          <stop offset="100%" stopColor="var(--c-accent-400)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#logoGrad)" />
      <path
        d="M6 21h7l2.5-6 4 13 3.5-10 2 3H34"
        fill="none"
        stroke="var(--c-text-inverse)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
