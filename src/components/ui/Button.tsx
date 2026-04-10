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
      whileTap={disabled ? {} : { scale: 0.95 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      disabled={disabled}
      className={clsx(
        // Base: min 44 px height (touch target A11y), extreme rounding
        "inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        // Primary — sun-drenched gold gradient + cartoon bottom shadow
        tone === "primary" &&
          "bg-gradient-to-br from-primary to-[#C49000] text-paper shadow-primary border border-[rgba(139,105,20,0.2)] active:translate-y-[2px] active:shadow-none",
        // Secondary — surface tinted + cartoon shadow
        tone === "secondary" &&
          "bg-surface-low text-ink-950 hover:bg-surface-high border border-[rgba(15,23,42,0.08)] shadow-[0_3px_0_rgba(15,23,42,0.09)] active:translate-y-[2px] active:shadow-none",
        // Ghost
        tone === "ghost" && "text-ink-700 hover:bg-surface-low",
        // Danger — coral light + cartoon shadow
        tone === "danger" &&
          "bg-tertiary-light text-tertiary hover:bg-[#ffd4d0] border border-[rgba(255,92,77,0.18)] shadow-[0_3px_0_rgba(255,92,77,0.18)] active:translate-y-[2px] active:shadow-none",
        fullWidth && "w-full",
        className
      )}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </motion.button>
  );
}
