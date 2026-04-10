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
        "rounded-full border px-3 py-1.5 font-mono text-sm font-semibold transition",
        urgent
          ? "border-[rgba(120,42,33,0.2)] bg-tertiary-light text-tertiary"
          : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
      )}
    >
      ⏱ {formatRemainingTime(endsAt)}
    </div>
  );
}
