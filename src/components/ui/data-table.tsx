"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
};

export type RowTone = "neutral" | "buy" | "sell" | "warn" | "good";

const toneClass: Record<RowTone, string> = {
  neutral: "",
  buy: "bg-[#e6f7ef]/40 hover:bg-[#e6f7ef]/70",
  sell: "bg-[#fde7e9]/40 hover:bg-[#fde7e9]/70",
  warn: "bg-[#fef4e1]/40 hover:bg-[#fef4e1]/70",
  good: "bg-[#e6f7ef]/40 hover:bg-[#e6f7ef]/70",
};

export function DataTable<T>({
  columns,
  rows,
  rowTone,
  empty = "暂无数据",
  maxHeight = 480,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  rowTone?: (row: T) => RowTone;
  empty?: string;
  maxHeight?: number;
  rowKey?: (row: T, idx: number) => string;
}) {
  if (!rows.length)
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed py-12 text-center text-sm text-[var(--muted)]">
        {empty}
      </div>
    );
  return (
    <div
      className="rounded-[var(--radius-md)] border bg-white overflow-auto"
      style={{ maxHeight }}
    >
      <table className="w-full text-sm tabular">
        <thead className="sticky top-0 z-10 bg-[var(--surface-secondary)]">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--muted)]",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                  c.align === "left" && "text-left",
                  !c.align && "text-left"
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const tone = rowTone ? rowTone(r) : "neutral";
            return (
              <tr
                key={rowKey ? rowKey(r, idx) : idx}
                className={cn("border-t hover:bg-[var(--surface-secondary)]/50", toneClass[tone])}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 py-2",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      c.className
                    )}
                  >
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
