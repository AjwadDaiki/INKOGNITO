/**
 * CoffeeStain — decorative ring stain like a coffee mug was placed on the paper.
 * Pure SVG, no animation overhead. Rotate/position via className.
 */
export function CoffeeStain({
  className = "",
  size = 120,
  opacity = 0.07
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{ width: size, height: size, opacity }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main ring */}
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke="rgba(120, 80, 40, 0.6)"
          strokeWidth="6"
          fill="none"
          strokeDasharray="8 3 14 5 10 4 20 6"
        />
        {/* Inner fade ring */}
        <circle
          cx="60"
          cy="60"
          r="42"
          stroke="rgba(120, 80, 40, 0.25)"
          strokeWidth="10"
          fill="none"
          strokeDasharray="12 8 6 14 18 4"
        />
        {/* Center fill — very faint */}
        <circle
          cx="60"
          cy="60"
          r="36"
          fill="rgba(140, 100, 55, 0.08)"
        />
        {/* Small drip */}
        <ellipse
          cx="98"
          cy="78"
          rx="7"
          ry="5"
          fill="rgba(120, 80, 40, 0.35)"
          transform="rotate(25, 98, 78)"
        />
      </svg>
    </div>
  );
}
