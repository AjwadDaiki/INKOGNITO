/**
 * Spiral binding — metallic wire loops running along the left edge
 * of a notebook page. Positioned absolutely, meant to sit on
 * the left margin of a .notebook-page element.
 */
export function SpiralBinding({ className = "" }: { className?: string }) {
  // Each loop is spaced 34px apart (matching the hole spacing in CSS)
  const loopSpacing = 34;
  const loopCount = 24; // enough for tall pages, SVG clips the rest
  const loopWidth = 18;
  const loopRadius = 6;
  const wireWidth = 1.8;

  return (
    <div
      className={`pointer-events-none absolute bottom-4 left-0 top-4 ${className}`}
      style={{ width: loopWidth + 6 }}
      aria-hidden
    >
      <svg
        width={loopWidth + 6}
        height="100%"
        viewBox={`0 0 ${loopWidth + 6} ${loopCount * loopSpacing + 10}`}
        preserveAspectRatio="xMinYMin slice"
        className="h-full"
      >
        <defs>
          {/* Metallic gradient for the wire */}
          <linearGradient id="spiral-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(160,150,135,0.9)" />
            <stop offset="40%" stopColor="rgba(200,195,180,0.95)" />
            <stop offset="60%" stopColor="rgba(140,132,118,0.85)" />
            <stop offset="100%" stopColor="rgba(170,162,148,0.9)" />
          </linearGradient>
          {/* Shadow for depth */}
          <filter id="spiral-shadow" x="-20%" y="-10%" width="140%" height="120%">
            <feDropShadow dx="1" dy="1" stdDeviation="0.8" floodColor="rgba(60,45,30,0.25)" />
          </filter>
        </defs>
        {Array.from({ length: loopCount }, (_, i) => {
          const cy = 12 + i * loopSpacing;
          // Each loop: a C-shaped arc that wraps around the page edge
          return (
            <g key={i} filter="url(#spiral-shadow)">
              {/* The loop — an arc from top to bottom */}
              <path
                d={`M ${loopWidth + 2} ${cy - loopRadius}
                    A ${loopRadius} ${loopRadius} 0 1 0 ${loopWidth + 2} ${cy + loopRadius}`}
                fill="none"
                stroke="url(#spiral-metal)"
                strokeWidth={wireWidth}
                strokeLinecap="round"
              />
              {/* Small highlight on the wire for metallic shine */}
              <path
                d={`M ${loopWidth + 2} ${cy - loopRadius + 1}
                    A ${loopRadius - 1} ${loopRadius - 1} 0 1 0 ${loopWidth + 2} ${cy + loopRadius - 1}`}
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={0.6}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
