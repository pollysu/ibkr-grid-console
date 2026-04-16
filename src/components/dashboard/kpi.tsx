"use client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "neutral" | "good" | "bad" | "warn" | "brand";
  icon?: LucideIcon;
}) {
  const toneFg = {
    neutral: "text-foreground",
    good: "text-[var(--success)]",
    bad: "text-[var(--danger)]",
    warn: "text-[var(--warning)]",
    brand: "text-[var(--brand)]",
  }[tone];

  return (
    <Card className="px-6 py-5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-[var(--muted)]" />}
      </div>
      <div className={cn("text-[28px] font-bold leading-[1.05] tabular tracking-tight", toneFg)}>
        {value}
      </div>
      {hint && <div className="text-[12px] text-[var(--muted)] tabular">{hint}</div>}
    </Card>
  );
}
