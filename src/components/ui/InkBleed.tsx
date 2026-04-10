import { useId } from "react";

/**
 * Wraps text with an SVG ink-bleed effect — edges look like wet ink
 * spreading into paper fibers.
 */
export function InkBleed({
  children,
  className = "",
  intensity = 1
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const id = useId();
  const filterId = `ink-bleed-${id}`;

  return (
    <span className={`relative inline-block ${className}`}>
      {/* SVG filter definition — hidden, referenced by CSS */}
      <svg className="absolute h-0 w-0" aria-hidden>
        <defs>
          <filter id={filterId} x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.04 * intensity}
              numOctaves={4}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={3.5 * intensity}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <span style={{ filter: `url(#${filterId})` }}>{children}</span>
    </span>
  );
}
