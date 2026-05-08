import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "default" | "operator" | "equals" | "function";

interface Props {
  children: ReactNode;
  onClick: () => void;
  variant?: Variant;
  className?: string;
  ariaLabel?: string;
}

const variantClasses: Record<Variant, string> = {
  default:
    "glass text-foreground hover:bg-white/40 dark:hover:bg-white/10",
  function:
    "glass text-accent-foreground bg-accent/30 hover:bg-accent/50 text-accent",
  operator:
    "text-primary-foreground gradient-primary shadow-glow hover:brightness-110",
  equals:
    "text-primary-foreground gradient-primary shadow-glow hover:brightness-110",
};

export function CalcButton({ children, onClick, variant = "default", className, ariaLabel }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "h-16 sm:h-18 rounded-2xl text-xl sm:text-2xl font-medium select-none transition-colors flex items-center justify-center",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </motion.button>
  );
}