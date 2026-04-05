import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: "primary" | "secondary" | "ghost" | "danger";
    fullWidth?: boolean;
  }
>;

export function Button({
  children,
  className,
  tone = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" &&
          "bg-neon-violet text-white shadow-glow hover:bg-[#8f4dff] active:translate-y-px",
        tone === "secondary" &&
          "border border-white/10 bg-white/5 text-white shadow-cyan hover:border-neon-cyan/40 hover:bg-white/10",
        tone === "ghost" && "text-ink-200 hover:bg-white/5",
        tone === "danger" &&
          "border border-neon-rose/30 bg-neon-rose/10 text-white hover:bg-neon-rose/20",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
