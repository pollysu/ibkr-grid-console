import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] rounded-full",
  {
    variants: {
      tone: {
        neutral: "bg-[var(--surface-secondary)] text-foreground",
        brand: "bg-[var(--brand)] text-white",
        success: "bg-[#e6f7ef] text-[var(--success)]",
        warn: "bg-[#fef4e1] text-[var(--warning)]",
        danger: "bg-[#fde7e9] text-[var(--danger)]",
        outline: "border border-foreground text-foreground bg-transparent",
        dark: "bg-[var(--surface-dark)] text-white",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...p }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...p} />;
}
