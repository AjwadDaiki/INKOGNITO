import { InkSplatter } from "./InkSplatter";

/**
 * Ambient ink-stained background — replaces gradient orbs with organic ink splatters.
 */
export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <InkSplatter variant={0} className="left-[8%] top-[5%]" size={320} opacity={0.035} animate />
      <InkSplatter variant={1} className="-bottom-12 -right-8" size={280} opacity={0.04} animate />
      <InkSplatter variant={2} className="left-[50%] top-[40%]" size={200} opacity={0.025} animate />
      <InkSplatter variant={3} className="-left-10 bottom-[20%]" size={240} opacity={0.03} animate />
    </div>
  );
}
