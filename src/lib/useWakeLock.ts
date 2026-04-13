import { useEffect, useRef } from "react";

/** Keep screen awake during active game phases on mobile */
export function useWakeLock(active: boolean) {
  const lock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let released = false;
    navigator.wakeLock.request("screen").then((sentinel) => {
      if (released) { sentinel.release(); return; }
      lock.current = sentinel;
    }).catch(() => {});

    return () => {
      released = true;
      lock.current?.release();
      lock.current = null;
    };
  }, [active]);
}
