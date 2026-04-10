import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { motion } from "framer-motion";
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
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97, y: 1 }}
      whileHover={disabled ? {} : { y: -1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      disabled={disabled}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-[1.15rem] border px-5 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45",
        tone === "primary" &&
          "border-ink-950 bg-ink-950 text-paper shadow-card hover:bg-ink-900",
        tone === "secondary" &&
          "border-[rgba(74,60,46,0.16)] bg-paper text-ink-950 shadow-card hover:bg-paper-warm",
        tone === "ghost" &&
          "border-transparent bg-transparent text-ink-700 hover:bg-[rgba(74,60,46,0.08)]",
        tone === "danger" &&
          "border-[rgba(120,42,33,0.24)] bg-tertiary text-paper shadow-tertiary hover:bg-[#aa3628]",
        fullWidth && "w-full",
        className
      )}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </motion.button>
  );
}
