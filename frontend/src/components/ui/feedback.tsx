import { AlertCircle, FolderOpen, Loader2, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger" | "accent";
}) {
  const variants = {
    default: "bg-white",
    success: "bg-brutal-success",
    warning: "bg-brutal-accent",
    danger: "bg-brutal-destructive",
    accent: "bg-brutal-secondary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border-2 border-brutal px-2 py-0.5 text-xs font-black uppercase shadow-brutal-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Alert({
  className,
  children,
  variant = "danger",
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "danger" | "warning" | "info";
}) {
  const variants = {
    danger: "bg-brutal-destructive",
    warning: "bg-brutal-accent",
    info: "bg-brutal-secondary",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 border-3 border-brutal p-4 font-bold text-black shadow-brutal",
        variants[variant],
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 stroke-[3]" />
      <div>{children}</div>
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-3 border-3 border-brutal bg-white px-4 py-3 font-black shadow-brutal">
      <Loader2 className="h-5 w-5 animate-spin stroke-[3]" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title = "No tasks",
  description = "Create a task to start filling this category.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center border-3 border-brutal bg-white p-10 text-center shadow-brutal">
      <div className="relative mb-5">
        <div className="absolute inset-0 translate-x-2 translate-y-2 border-3 border-brutal bg-brutal-accent" />
        <div className="relative flex h-16 w-16 items-center justify-center border-3 border-brutal bg-white">
          <FolderOpen className="h-8 w-8 stroke-[3]" />
        </div>
      </div>
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-2 max-w-sm font-bold text-gray-700">{description}</p>
    </div>
  );
}

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  duration?: number;
};

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const variants = {
    default: "bg-white",
    success: "bg-brutal-success",
    warning: "bg-brutal-accent",
    danger: "bg-brutal-destructive",
  };

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto border-3 border-brutal p-4 text-black shadow-brutal-lg",
        variants[toast.variant ?? "default"],
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-black">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-sm font-bold">{toast.description}</p> : null}
          {toast.action ? <div className="mt-3">{toast.action}</div> : null}
        </div>
        <Button
          aria-label="Close notification"
          className="h-8 w-8 px-0"
          size="icon"
          type="button"
          variant="outline"
          onClick={() => onRemove(toast.id)}
        >
          <X className="h-4 w-4 stroke-[3]" />
        </Button>
      </div>
    </div>
  );
}
