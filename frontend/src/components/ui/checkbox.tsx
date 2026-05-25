"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-6 w-6 shrink-0 items-center justify-center border-3 border-brutal bg-white shadow-brutal-sm transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brutal focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-55 data-[state=checked]:bg-brutal-success",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className="h-4 w-4 stroke-[3] text-black" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
