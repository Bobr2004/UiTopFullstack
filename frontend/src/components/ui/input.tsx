import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid = false, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full border-3 border-brutal bg-white px-4 py-2 font-bold text-black shadow-brutal transition-all placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-brutal focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-55",
        invalid && "border-brutal-destructive shadow-[4px_4px_0_0_var(--brutal-destructive)]",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
