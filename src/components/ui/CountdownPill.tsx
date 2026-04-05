import { useEffect, useState } from "react";
import clsx from "clsx";
import { formatRemainingTime, isEndingSoon } from "@/lib/time";

export function CountdownPill({ endsAt }: { endsAt: number | null }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => forceTick((value) => value + 1), 500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={clsx(
        "rounded-full border px-3 py-2 font-mono text-sm transition",
        isEndingSoon(endsAt)
          ? "border-neon-rose/40 bg-neon-rose/10 text-neon-rose"
          : "border-white/10 bg-white/5 text-white"
      )}
    >
      ⏱ {formatRemainingTime(endsAt)}
    </div>
  );
}
