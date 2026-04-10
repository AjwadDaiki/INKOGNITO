import { InkSplatter } from "./InkSplatter";

/**
 * Ambient ink-stained background — replaces gradient orbs with organic ink splatters.
 */
export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <InkSplatter variant={0} className="-left-8 top-0" size={360} opacity={0.09} />
      <InkSplatter variant={1} className="-right-10 bottom-0" size={320} opacity={0.1} />
      <InkSplatter variant={2} className="right-[18%] top-[8%]" size={150} opacity={0.05} />
      <InkSplatter variant={3} className="left-[18%] bottom-[10%]" size={170} opacity={0.045} />
    </div>
  );
}
