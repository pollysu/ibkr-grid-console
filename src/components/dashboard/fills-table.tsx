"use client";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column, type RowTone } from "@/components/ui/data-table";
import type { FillRow } from "@/lib/api";
import { estimateCommissionUsd, fmtMoney, fmtNum, fmtTimeBJ, pctClass } from "@/lib/fmt";
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
    key: "commission_est",
    header: "估算手续费",
    align: "right",
    cell: (r) => {
      const c = estimateCommissionUsd(r.qty, r.price);
      return <span className="text-[var(--muted)] tabular">{fmtMoney(-c)}</span>;
    },
  },
  {
    key: "net_pnl_est",
    header: "净盈亏 (估)",
    align: "right",
    cell: (r) => {
      if (r.profit_usd == null) return "—";
      const c = estimateCommissionUsd(r.qty, r.price);
      const net = Number(r.profit_usd) - c;
      return (
        <span className={cn("font-semibold", pctClass(net))}>{fmtMoney(net, { sign: true })}</span>
      );
    },
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
