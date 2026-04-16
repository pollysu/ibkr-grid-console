"use client";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column, type RowTone } from "@/components/ui/data-table";
import type { FillRow } from "@/lib/api";
import { fmtMoney, fmtNum, fmtTimeBJ, pctClass } from "@/lib/fmt";
import { cn } from "@/lib/utils";

const cols: Column<FillRow>[] = [
  {
    key: "time",
    header: "成交时间 (北京)",
    cell: (r) => <span className="text-[var(--muted)]">{fmtTimeBJ(r.time)}</span>,
  },
  { key: "symbol", header: "Symbol", cell: (r) => <span className="font-semibold">{r.symbol}</span> },
  {
    key: "side",
    header: "Side",
    cell: (r) => (
      <Badge tone={r.side === "BUY" ? "success" : "danger"}>{r.side}</Badge>
    ),
  },
  { key: "qty", header: "Qty", align: "right", cell: (r) => fmtNum(r.qty, 0) },
  { key: "price", header: "Price", align: "right", cell: (r) => fmtNum(r.price, 4) },
  {
    key: "buy_price",
    header: "Cost (FIFO)",
    align: "right",
    cell: (r) => (r.buy_price == null ? "—" : fmtNum(r.buy_price, 4)),
  },
  {
    key: "profit_usd",
    header: "Realized PnL",
    align: "right",
    cell: (r) => (
      <span className={cn("font-semibold", pctClass(r.profit_usd))}>
        {r.profit_usd == null ? "—" : fmtMoney(r.profit_usd, { sign: true })}
      </span>
    ),
  },
  {
    key: "order_ref",
    header: "Order Ref",
    cell: (r) => <span className="text-[12px] text-[var(--muted)]">{r.order_ref}</span>,
  },
];

const tone = (r: FillRow): RowTone => (r.side === "BUY" ? "buy" : "sell");

export function FillsTable({ rows }: { rows: FillRow[] }) {
  return <DataTable columns={cols} rows={rows} rowTone={tone} maxHeight={520} />;
}
