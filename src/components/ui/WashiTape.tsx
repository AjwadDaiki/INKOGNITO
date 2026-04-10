/**
 * Decorative washi-tape strip — a semi-transparent patterned tape
 * positioned absolutely on a parent container.
 *
 * Variants:
 *  0 — diagonal stripes (warm)
 *  1 — dots (muted red)
 *  2 — cross-hatch (cool)
 */
export function WashiTape({
  className = "",
  variant = 0,
  width = 110,
  rotate = -6
}: {
  className?: string;
  variant?: 0 | 1 | 2;
  width?: number;
  rotate?: number;
}) {
  const height = 26;

  const patterns: Record<number, { bg: string; pattern: React.ReactNode; id: string }> = {
    0: {
      bg: "rgba(212,180,130,0.45)",
      id: "washi-stripe",
      pattern: (
        <pattern id="washi-stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="8" fill="rgba(180,140,80,0.3)" />
        </pattern>
      )
    },
    1: {
      bg: "rgba(196,120,110,0.35)",
      id: "washi-dots",
      pattern: (
        <pattern id="washi-dots" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2" fill="rgba(170,70,60,0.3)" />
        </pattern>
      )
    },
    2: {
      bg: "rgba(140,160,180,0.35)",
      id: "washi-cross",
      pattern: (
        <pattern id="washi-cross" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5h10M5 0v10" stroke="rgba(90,120,150,0.3)" strokeWidth="1.5" />
        </pattern>
      )
    }
  };

  const { bg, pattern, id } = patterns[variant];

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{ width, height: height + 4, transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <svg width={width} height={height + 4} viewBox={`0 0 ${width} ${height + 4}`}>
        <defs>
          {pattern}
          {/* Torn/rough edges */}
          <filter id={`${id}-edge`} x="-4%" y="-10%" width="108%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={3} seed={variant + 3} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={2.5} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#${id}-edge)`}>
          {/* Tape body */}
          <rect x="0" y="2" width={width} height={height} rx="1" fill={bg} />
          {/* Pattern overlay */}
          <rect x="0" y="2" width={width} height={height} rx="1" fill={`url(#${id})`} />
          {/* Subtle shine along top */}
          <rect x="0" y="2" width={width} height={6} rx="1" fill="rgba(255,255,255,0.15)" />
        </g>
      </svg>
    </div>
  );
}
