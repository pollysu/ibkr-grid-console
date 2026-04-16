"use client";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column, type RowTone } from "@/components/ui/data-table";
import type { OrderRow } from "@/lib/api";
import { fmtNum, fmtTimeBJ } from "@/lib/fmt";

const statusTone = (s: string): "success" | "warn" | "danger" | "neutral" | "brand" => {
  const u = (s || "").toUpperCase();
  if (u.includes("FILLED") || u.includes("SUBMITTED")) return "brand";
  if (u.includes("PRESUBMIT")) return "neutral";
  if (u.includes("CANCEL") || u.includes("INACTIVE")) return "warn";
  if (u.includes("REJECT") || u.includes("ERROR")) return "danger";
  return "neutral";
};

const cols: Column<OrderRow>[] = [
  {
    key: "time_last",
    header: "最近事件 (BJ)",
    cell: (r) => <span className="text-[var(--muted)]">{fmtTimeBJ(r.time_last)}</span>,
  },
  { key: "symbol", header: "Symbol", cell: (r) => <span className="font-semibold">{r.symbol}</span> },
  {
    key: "side",
    header: "Side",
    cell: (r) => <Badge tone={r.side === "BUY" ? "success" : "danger"}>{r.side}</Badge>,
  },
  { key: "level", header: "L#", align: "right", cell: (r) => fmtNum(r.level, 0) },
  { key: "qty", header: "Qty", align: "right", cell: (r) => fmtNum(r.qty, 0) },
  { key: "price", header: "Price", align: "right", cell: (r) => fmtNum(r.price, 4) },
  {
    key: "filled",
    header: "Filled / Rem",
    align: "right",
    cell: (r) => (
      <span className="tabular text-[12px]">
        {fmtNum(r.filled, 0)} / {fmtNum(r.remaining, 0)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => <Badge tone={statusTone(r.status)}>{r.status || r.event_last}</Badge>,
  },
  {
    key: "events",
    header: "evts",
    align: "right",
    cell: (r) => <span className="text-[12px] text-[var(--muted)]">{r.events}</span>,
  },
];

const tone = (r: OrderRow): RowTone => {
  const u = (r.status || "").toUpperCase();
  if (u.includes("CANCEL") || u.includes("INACTIVE") || u.includes("REJECT")) return "warn";
  return r.side === "BUY" ? "buy" : "sell";
};

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  return <DataTable columns={cols} rows={rows} rowTone={tone} maxHeight={520} />;
}
