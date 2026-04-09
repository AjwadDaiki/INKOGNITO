import { useEffect, useState } from "react";
import clsx from "clsx";
import { formatRemainingTime, isEndingSoon } from "@/lib/time";

export function CountdownPill({ endsAt }: { endsAt: number | null }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => forceTick((v) => v + 1), 500);
    return () => window.clearInterval(interval);
  }, []);

  const urgent = isEndingSoon(endsAt);

  return (
    <div
      className={clsx(
        "rounded-full px-3 py-2 font-mono text-sm font-semibold transition",
        urgent ? "bg-tertiary-light text-tertiary" : "bg-surface-low text-ink-700"
      )}
    >
      ⏱ {formatRemainingTime(endsAt)}
    </div>
  );
}
