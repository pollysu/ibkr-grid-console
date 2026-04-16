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
