"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FillRow } from "@/lib/api";
import { fmtMoney } from "@/lib/fmt";

export function PnlChart({ rows }: { rows: FillRow[] }) {
  // build cumulative realized PnL by time
  const series = [...rows]
    .filter((r) => r.profit_usd != null)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    .reduce<{ t: string; pnl: number; cum: number }[]>((acc, r) => {
      const prev = acc.length ? acc[acc.length - 1].cum : 0;
      const cum = prev + (r.profit_usd ?? 0);
      acc.push({ t: r.time?.slice(5, 16) ?? "", pnl: r.profit_usd ?? 0, cum });
      return acc;
    }, []);

  if (!series.length)
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed py-16 text-center text-sm text-[var(--muted)]">
        暂无已实现盈亏数据
      </div>
    );

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0052ff" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#0052ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(91,97,110,0.15)" vertical={false} />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 11, fill: "#5b616e" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#5b616e" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoney(v as number)}
            width={70}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(91,97,110,0.2)",
              boxShadow: "0 8px 24px rgba(10,11,13,0.08)",
              fontSize: 12,
            }}
            formatter={(v, name) => {
              const num = Number(v);
              return [fmtMoney(num, { sign: true }), name === "cum" ? "累计 PnL" : "本笔"];
            }}
          />
          <Area
            type="monotone"
            dataKey="cum"
            stroke="#0052ff"
            strokeWidth={2}
            fill="url(#pnlFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
