/**
 * Ambient background with softer color separation.
 */
export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="bg-orb left-[18%] top-[12%] h-[22rem] w-[22rem]"
        style={{ background: "#7C3AED", opacity: 0.05, filter: "blur(88px)" }}
      />
      <div
        className="bg-orb -left-48 -top-48 h-[38rem] w-[38rem]"
        style={{ background: "#F0C000", opacity: 0.1, filter: "blur(82px)" }}
      />
      <div
        className="bg-orb -bottom-48 -right-32 h-[34rem] w-[34rem]"
        style={{ background: "#FF5C4D", opacity: 0.08, filter: "blur(82px)" }}
      />
    </div>
  );
}
