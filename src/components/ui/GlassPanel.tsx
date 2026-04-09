import type { PropsWithChildren } from "react";
import clsx from "clsx";

export function GlassPanel({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={clsx("bento-card p-4 md:p-5", className)}>{children}</section>
  );
}
