import { motion } from "framer-motion";

/**
 * Ink splatter shapes — organic SVG blobs that replace gradient orbs.
 * Each variant is a hand-drawn-looking ink spot.
 */

const splatPaths = [
  // Splat 1 — large organic blob
  "M80 20c30-10 60 5 70 30s20 55-5 75-50 25-70 15-40-20-50-45S50 30 80 20z",
  // Splat 2 — elongated drip
  "M60 10c25-5 50 10 55 40s-5 50-30 65-45 10-60-5-25-25-20-50S35 15 60 10z",
  // Splat 3 — round splotch
  "M70 15c35 0 55 25 50 55s-20 45-50 45-50-10-55-40 10-45 20-55S35 15 70 15z",
  // Splat 4 — scattered splash
  "M50 25c20-15 55-10 65 15s15 50 0 70-35 20-55 10-30-15-40-40S30 40 50 25z",
];

// Small drip dots to scatter around splatters
const dripDots = [
  { cx: 15, cy: 85, r: 4 },
  { cx: 130, cy: 25, r: 3 },
  { cx: 140, cy: 90, r: 5 },
  { cx: 10, cy: 40, r: 3 },
];

export function InkSplatter({
  variant = 0,
  className = "",
  size = 160,
  color = "#1a1410",
  opacity = 0.05,
  animate = true,
}: {
  variant?: number;
  className?: string;
  size?: number;
  color?: string;
  opacity?: number;
  animate?: boolean;
}) {
  const path = splatPaths[variant % splatPaths.length];
  const dots = dripDots.slice(0, 2 + (variant % 3));

  const Wrapper = animate ? motion.div : "div";
  const animateProps = animate
    ? {
        animate: { rotate: [0, 2, -1, 0], scale: [1, 1.02, 0.98, 1] },
        transition: { duration: 20 + variant * 5, repeat: Infinity, ease: "easeInOut" as const },
      }
    : {};

  return (
    <Wrapper
      className={`pointer-events-none absolute ${className}`}
      style={{ width: size, height: size, opacity }}
      {...animateProps}
    >
      <svg viewBox="0 0 150 150" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d={path} />
        {dots.map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} />
        ))}
      </svg>
    </Wrapper>
  );
}

/**
 * Ink drip line — a vertical drip for decorative edges
 */
export function InkDrip({
  className = "",
  height = 60,
  color = "#1a1410",
  opacity = 0.08,
}: {
  className?: string;
  height?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <motion.svg
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none ${className}`}
      style={{ originY: 0, opacity }}
      width="8"
      height={height}
      viewBox={`0 0 8 ${height}`}
      fill={color}
    >
      <path d={`M4 0c0 0 2 ${height * 0.6} 1 ${height * 0.85}s-1 ${height * 0.15} 0 ${height * 0.15}S6 ${height * 0.6} 4 0z`} />
    </motion.svg>
  );
}
