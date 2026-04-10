import { useEffect, useRef } from "react";
import clsx from "clsx";
import { formatRemainingTime, isEndingSoon } from "@/lib/time";

/**
 * CountdownPill — updates the DOM directly via ref instead of
 * triggering a React re-render every 500ms.
 */
export function CountdownPill({ endsAt }: { endsAt: number | null }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const wasUrgentRef = useRef(false);

  useEffect(() => {
    function tick() {
      const el = textRef.current;
      const pill = pillRef.current;
      if (!el || !pill) return;

      el.textContent = formatRemainingTime(endsAt);

      const urgent = isEndingSoon(endsAt);
      if (urgent !== wasUrgentRef.current) {
        wasUrgentRef.current = urgent;
        pill.className = urgent
          ? "animate-pulse rounded-full border border-[rgba(120,42,33,0.2)] bg-tertiary-light px-3 py-1.5 font-mono text-sm font-semibold text-tertiary transition"
          : "rounded-full border border-[rgba(74,60,46,0.12)] bg-paper px-3 py-1.5 font-mono text-sm font-semibold text-ink-700 transition";
      }
    }

    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const urgent = isEndingSoon(endsAt);
  wasUrgentRef.current = urgent;

  return (
    <div
      ref={pillRef}
      className={clsx(
        "rounded-full border px-3 py-1.5 font-mono text-sm font-semibold transition",
        urgent
          ? "animate-pulse border-[rgba(120,42,33,0.2)] bg-tertiary-light text-tertiary"
          : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
      )}
    >
      ⏱ <span ref={textRef}>{formatRemainingTime(endsAt)}</span>
    </div>
  );
}
