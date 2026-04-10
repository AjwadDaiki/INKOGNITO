import type { PropsWithChildren } from "react";
import clsx from "clsx";

export function GlassPanel({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={clsx("paper-sheet p-4 md:p-5", className)}>{children}</section>
  );
}
