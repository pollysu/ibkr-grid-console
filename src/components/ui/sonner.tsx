"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-[var(--radius-md)] border border-[var(--border)] bg-white text-foreground shadow-lg",
          title: "text-sm font-semibold",
          description: "text-xs text-[var(--muted)]",
        },
      }}
    />
  );
}
