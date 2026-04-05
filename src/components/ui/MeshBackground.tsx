export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden noise">
      <div className="mesh-orb left-[-10rem] top-[-12rem] bg-neon-violet" />
      <div className="mesh-orb right-[-10rem] top-[10rem] bg-neon-cyan" />
      <div className="mesh-orb bottom-[-18rem] left-[20%] bg-neon-rose" />
      <div className="absolute inset-0 ink-grid opacity-40" />
    </div>
  );
}
