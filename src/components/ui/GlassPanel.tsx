import type { PropsWithChildren } from "react";
import clsx from "clsx";

export function GlassPanel({
  children,
  className
}: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx("glass-panel rounded-[28px] p-5 md:p-6", className)}>{children}</section>;
}
