"use client";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FillRow } from "@/lib/api";
import {
  type Bucket,
  bucketKey,
  bucketRange,
  estimateCommissionUsd,
  fmtBucketLabel,
  fmtMoney,
} from "@/lib/fmt";

type Point = {
  key: string;
  label: string;
  tsStart: string;
  tsEnd: string;
  gross: number;
  commission: number;
  net: number;
  buyAmount: number;
  sellAmount: number;
  cumGross: number;
  cumCommission: number;
  cumNet: number;
};

type Props = {
  rows: FillRow[];
  onRangeChange?: (range: { start: string; end: string } | null) => void;
};

const BUCKETS: { value: Bucket; label: string }[] = [
  { value: "fill", label: "逐笔" },
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

export function PnlChart({ rows, onRangeChange }: Props) {
  const [bucket, setBucket] = useState<Bucket>("day");
  const [brush, setBrush] = useState<{ startIndex: number; endIndex: number } | null>(null);

  const series = useMemo<Point[]>(() => {
    const sorted = [...rows]
      .filter((r) => r.time)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    const buckets = new Map<
      string,
      {
        tsStart: string;
        tsEnd: string;
        gross: number;
        commission: number;
        buyAmount: number;
        sellAmount: number;
      }
    >();
    for (const r of sorted) {
      if (!r.time) continue;
      const key = bucketKey(r.time, bucket);
      const range = bucketRange(key, bucket);
      const b = buckets.get(key) ?? {
        tsStart: range.start,
        tsEnd: range.end,
        gross: 0,
        commission: 0,
        buyAmount: 0,
        sellAmount: 0,
      };
      if (r.profit_usd != null) b.gross += Number(r.profit_usd);
      const amount = Math.abs(Number(r.qty) || 0) * (Math.abs(Number(r.price)) || 0);
      if (r.side === "BUY") b.buyAmount += amount;
      if (r.side === "SELL") b.sellAmount += amount;
      b.commission += estimateCommissionUsd(r.qty, r.price);
      buckets.set(key, b);
    }
    const entries = Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b));
    return entries.reduce<Point[]>((acc, [key, v]) => {
      const prev = acc[acc.length - 1];
      const cumGross = (prev?.cumGross ?? 0) + v.gross;
      const cumCommission = (prev?.cumCommission ?? 0) + v.commission;
      const net = v.gross - v.commission;
      return [
        ...acc,
        {
          key,
          label: fmtBucketLabel(key, bucket),
          tsStart: v.tsStart,
          tsEnd: v.tsEnd,
          gross: v.gross,
          commission: v.commission,
          net,
          buyAmount: v.buyAmount,
          sellAmount: v.sellAmount,
          cumGross,
          cumCommission,
          cumNet: cumGross - cumCommission,
        },
      ];
    }, []);
  }, [rows, bucket]);

  const handleBrushChange = (b: { startIndex?: number; endIndex?: number } | null) => {
    if (!b || b.startIndex == null || b.endIndex == null) return;
    const { startIndex, endIndex } = b;
    if (startIndex === 0 && endIndex === series.length - 1) {
      setBrush(null);
      onRangeChange?.(null);
      return;
    }
    setBrush({ startIndex, endIndex });
    const start = series[startIndex]?.tsStart;
    const end = series[endIndex]?.tsEnd;
    if (start && end) onRangeChange?.({ start, end });
  };

  const handleBucketChange = (nextBucket: Bucket) => {
    if (nextBucket === bucket) return;
    setBucket(nextBucket);
    setBrush(null);
    onRangeChange?.(null);
  };

  const spanLabel =
    bucket === "day" ? "当日" : bucket === "week" ? "当周" : bucket === "month" ? "当月" : "本笔";

  const renderTooltip = (props: {
    active?: boolean;
    payload?: ReadonlyArray<{ payload?: Point }>;
    label?: string | number;
  }) => {
    const { active, payload, label } = props;
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    if (!p) return null;
    const netColor =
      p.net > 0 ? "var(--success)" : p.net < 0 ? "var(--danger)" : "var(--foreground)";
    const cumColor =
      p.cumNet > 0 ? "var(--success)" : p.cumNet < 0 ? "var(--danger)" : "var(--foreground)";
    return (
      <div
        style={{
          background: "white",
          borderRadius: 12,
          border: "1px solid rgba(91,97,110,0.2)",
          boxShadow: "0 8px 24px rgba(10,11,13,0.08)",
          fontSize: 12,
          padding: "8px 10px",
          minWidth: 160,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        <Row k={`${spanLabel}买入金额`} v={fmtMoney(p.buyAmount)} />
        <Row k={`${spanLabel}卖出金额`} v={fmtMoney(p.sellAmount)} />
        <div style={{ margin: "6px 0", height: 1, background: "rgba(91,97,110,0.15)" }} />
        <Row k={`${spanLabel}毛盈亏`} v={fmtMoney(p.gross, { sign: true })} />
        <Row k={`${spanLabel}手续费`} v={fmtMoney(-p.commission)} />
        <Row k={`${spanLabel}净盈亏`} v={fmtMoney(p.net, { sign: true })} color={netColor} bold />
        <div style={{ margin: "6px 0", height: 1, background: "rgba(91,97,110,0.15)" }} />
        <Row k="累计净" v={fmtMoney(p.cumNet, { sign: true })} color={cumColor} bold />
        <Row k="累计毛" v={fmtMoney(p.cumGross, { sign: true })} muted />
        <Row k="累计手续费" v={fmtMoney(-p.cumCommission)} muted />
      </div>
    );
  };

  if (!series.length) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed py-16 text-center text-sm text-[var(--muted)]">
        暂无已实现盈亏数据
      </div>
    );
  }

  const last = series[series.length - 1];
  const totalNet = last.cumNet;
  const totalCommission = last.cumCommission;
  const totalGross = last.cumGross;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
          <span>
            毛盈亏 <span className="font-semibold text-[var(--foreground)] tabular">{fmtMoney(totalGross, { sign: true })}</span>
          </span>
          <span>·</span>
          <span>
            估算手续费 <span className="font-semibold text-[var(--foreground)] tabular">{fmtMoney(-totalCommission)}</span>
          </span>
          <span>·</span>
          <span>
            净盈亏{" "}
            <span
              className={
                totalNet > 0
                  ? "font-semibold text-[var(--success)] tabular"
                  : totalNet < 0
                  ? "font-semibold text-[var(--danger)] tabular"
                  : "font-semibold tabular"
              }
            >
              {fmtMoney(totalNet, { sign: true })}
            </span>
          </span>
        </div>
        <div className="inline-flex rounded-[var(--radius-sm)] border overflow-hidden">
          {BUCKETS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => handleBucketChange(b.value)}
              className={
                bucket === b.value
                  ? "px-3 py-1 text-[12px] font-semibold bg-[var(--brand)] text-white"
                  : "px-3 py-1 text-[12px] text-[var(--muted)] hover:text-[var(--foreground)]"
              }
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pnlFillNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0052ff" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#0052ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(91,97,110,0.15)" vertical={false} />
            <XAxis
              dataKey="label"
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
            <Tooltip content={renderTooltip} />
            <Area
              type="monotone"
              dataKey="cumNet"
              stroke="#0052ff"
              strokeWidth={2}
              fill="url(#pnlFillNet)"
            />
            <Area
              type="monotone"
              dataKey="cumGross"
              stroke="#8aa4cc"
              strokeDasharray="4 3"
              strokeWidth={1}
              fill="transparent"
            />
            {series.length > 2 && (
              <Brush
                dataKey="label"
                height={24}
                stroke="#0052ff"
                travellerWidth={8}
                startIndex={brush?.startIndex}
                endIndex={brush?.endIndex}
                onChange={handleBrushChange}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  color,
  bold,
  muted,
}: {
  k: string;
  v: string;
  color?: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, lineHeight: 1.6 }}>
      <span style={{ color: muted ? "#5b616e" : "inherit" }}>{k}</span>
      <span
        className="tabular"
        style={{ fontWeight: bold ? 600 : 400, color: color ?? (muted ? "#5b616e" : "inherit") }}
      >
        {v}
      </span>
    </div>
  );
}
