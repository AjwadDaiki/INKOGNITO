/**
 * Wrap around a paper-sheet to add decorative loose pages underneath.
 * The wrapper must be position:relative so the fake pages sit behind the main sheet.
 */
export function StackedPages({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ isolation: "isolate" }}>
      <div className="stacked-page" aria-hidden />
      <div className="stacked-page" aria-hidden />
      {children}
    </div>
  );
}
