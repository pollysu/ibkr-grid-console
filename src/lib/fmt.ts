export function fmtMoney(n: number | null | undefined, opts?: { sign?: boolean; digits?: number }) {
  if (n == null || Number.isNaN(n)) return "—";
  const digits = opts?.digits ?? 2;
  const v = Number(n);
  const s = v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  if (opts?.sign && v > 0) return `+$${s}`;
  if (v < 0) return `-$${s.replace("-", "")}`;
  return `$${s}`;
}

export function fmtNum(n: number | null | undefined, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtInt(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return Math.round(Number(n)).toLocaleString("en-US");
}

const BJ = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function fmtTimeBJ(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return BJ.format(d);
  } catch {
    return iso;
  }
}

export function fmtBytes(n: number | null | undefined) {
  if (n == null || n === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let v = Number(n);
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`;
}

export function pctClass(n: number | null | undefined): string {
  if (n == null || n === 0) return "text-foreground";
  return n > 0 ? "text-success" : "text-danger";
}

/**
 * Estimate IBKR Pro US-stocks commission for a single fill.
 * Pro Tiered plan: $0.0035/share, min $0.35/order, capped at 1% of trade value.
 * Real commission (incl. SEC/FINRA regulatory fees) will differ — this is an estimate.
 */
export function estimateCommissionUsd(qty: number | null | undefined, price: number | null | undefined): number {
  const q = Math.abs(Number(qty) || 0);
  const p = Math.abs(Number(price) || 0);
  if (q === 0) return 0;
  const perShare = 0.0035;
  const minPerOrder = 0.35;
  const notional = q * p;
  const raw = q * perShare;
  const capped = notional > 0 ? Math.min(raw, notional * 0.01) : raw;
  return Math.max(capped, minPerOrder);
}

export type Bucket = "fill" | "day" | "week" | "month";

/**
 * Map a UTC ISO timestamp to a bucket key in Asia/Shanghai local time.
 * - day: YYYY-MM-DD
 * - week: YYYY-MM-DD of the Monday that starts the ISO week
 * - month: YYYY-MM
 * - fill: the original ISO string (one bucket per fill)
 */
export function bucketKey(iso: string | null | undefined, bucket: Bucket): string {
  if (!iso) return "";
  if (bucket === "fill") return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const bj = new Date(d.getTime() + 8 * 3600 * 1000);
  const y = bj.getUTCFullYear();
  const m = String(bj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(bj.getUTCDate()).padStart(2, "0");
  if (bucket === "month") return `${y}-${m}`;
  if (bucket === "day") return `${y}-${m}-${day}`;
  const weekday = bj.getUTCDay() || 7;
  const monday = new Date(bj.getTime() - (weekday - 1) * 86400000);
  const my = monday.getUTCFullYear();
  const mm = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const md = String(monday.getUTCDate()).padStart(2, "0");
  return `${my}-${mm}-${md}`;
}

/** Human-friendly axis label for a bucket key. */
export function fmtBucketLabel(key: string, bucket: Bucket): string {
  if (!key) return "";
  if (bucket === "fill") {
    const d = new Date(key);
    if (Number.isNaN(d.getTime())) return key.slice(5, 16);
    const bj = new Date(d.getTime() + 8 * 3600 * 1000);
    const m = String(bj.getUTCMonth() + 1).padStart(2, "0");
    const day = String(bj.getUTCDate()).padStart(2, "0");
    const hh = String(bj.getUTCHours()).padStart(2, "0");
    const mm = String(bj.getUTCMinutes()).padStart(2, "0");
    return `${m}-${day} ${hh}:${mm}`;
  }
  if (bucket === "month") return key;
  if (bucket === "week") return `W ${key.slice(5)}`;
  return key.slice(5);
}

/**
 * Parse the inclusive ISO range covered by a bucket key.
 * Returned values are UTC ISO strings; callers compare with fill.time (ISO).
 */
export function bucketRange(key: string, bucket: Bucket): { start: string; end: string } {
  if (bucket === "fill") return { start: key, end: key };
  const toBJ = (y: number, m: number, d: number, hh = 0, mm = 0, ss = 0) => {
    const utcMs = Date.UTC(y, m - 1, d, hh, mm, ss) - 8 * 3600 * 1000;
    return new Date(utcMs).toISOString();
  };
  if (bucket === "month") {
    const [ys, ms] = key.split("-");
    const y = Number(ys); const m = Number(ms);
    const start = toBJ(y, m, 1, 0, 0, 0);
    const nextMonth = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
    const end = toBJ(nextMonth.y, nextMonth.m, 1, 0, 0, 0);
    return { start, end };
  }
  const [ys, ms, ds] = key.split("-");
  const y = Number(ys); const m = Number(ms); const d = Number(ds);
  const start = toBJ(y, m, d, 0, 0, 0);
  const spanDays = bucket === "week" ? 7 : 1;
  const endMs = Date.UTC(y, m - 1, d + spanDays, 0, 0, 0) - 8 * 3600 * 1000;
  return { start, end: new Date(endMs).toISOString() };
}
