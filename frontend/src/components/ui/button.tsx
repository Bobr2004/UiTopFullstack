import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "accent" | "danger" | "outline" | "ghost";
type ButtonSize = "sm" | "default" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brutal-primary text-black",
  secondary: "bg-brutal-secondary text-black",
  accent: "bg-brutal-accent text-black",
  danger: "bg-brutal-destructive text-black",
  outline: "bg-white text-black",
  ghost: "border-transparent bg-transparent text-black shadow-none hover:bg-brutal-muted",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  default: "h-11 px-4 text-sm",
  lg: "h-13 px-6 text-base",
  icon: "h-11 w-11 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      loading = false,
      variant = "primary",
      size = "default",
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 border-3 border-brutal font-black uppercase tracking-wide shadow-brutal transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brutal focus-visible:ring-offset-2",
          "active:translate-x-1 active:translate-y-1 active:shadow-none",
          "disabled:pointer-events-none disabled:opacity-55",
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin stroke-[3]" /> : null}
        {children}
      </Comp>
    );
  },
);

Button.displayName = "Button";
