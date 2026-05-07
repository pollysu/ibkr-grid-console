/* Typed API client for the Trader API. All calls are proxied via Next rewrites. */

export type TradingWindow = {
  enabled: boolean;
  timezone: string;
  start: string;
  end: string;
  is_open: boolean;
};

export type IbCfg = {
  host: string;
  port: number;
  client_id: number;
  market_data_type: string;
};

export type ExecCfg = {
  poll_interval_sec: number;
  tif: string;
  outside_rth: boolean;
  resume_existing_orders: boolean;
  reconcile_on_start_lookback_hours: number;
};

export type SystemState = {
  now_utc: string;
  now_local: string;
  trading_window: TradingWindow;
  bot: { pid: number | null; running: boolean };
  ib: IbCfg;
  execution: ExecCfg;
  counts: { symbols: number; fills_csv_bytes: number; orders_csv_bytes: number };
  paths: { config: string; state_dir: string };
};

export type SymbolGrid = {
  type: "discrete_pct" | "pine_grid" | "geometric";
  lower: number;
  upper: number;
  grids: number;
  grid_type: "Geometric" | "Arithmetic";
  anchor: number;
  step_pct: number;
  extend_upper: boolean;
  min_trade_value_usd: number;
  follow_enabled: boolean;
  follow_buy_levels: number;
  stop_loss: number | null;
  pause_below_lower: boolean;
};

export type SymbolConfig = {
  symbol: string;
  exchange: string;
  currency: string;
  con_id: number | null;
  primary_exchange: string | null;
  total_position_usd: number;
  grid_budget_usd: number;
  base_lock_pct_shares: number;
  grid: SymbolGrid;
};

export type FillRow = {
  time: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  order_ref: string;
  order_id: string;
  perm_id: string;
  exec_id: string;
  buy_price: number | null;
  profit_usd: number | null;
};

export type FillsResponse = {
  rows: FillRow[];
  summary: {
    total: number;
    buy_qty: number;
    sell_qty: number;
    buy_amount_usd: number;
    sell_amount_usd: number;
    realized_pnl_usd: number;
    by_symbol: {
      symbol: string;
      buy_qty: number;
      sell_qty: number;
      buy_amount_usd: number;
      sell_amount_usd: number;
      realized_pnl_usd: number;
    }[];
  };
};

export type OrderRow = {
  time_first: string | null;
  time_last: string | null;
  symbol: string;
  side: string;
  level: number | null;
  price: number | null;
  qty: number | null;
  status: string;
  filled: number | null;
  remaining: number | null;
  event_last: string;
  order_ref: string;
  order_id: string;
  perm_id: string;
  events: number;
  ref_kind: string | null;
};

const API_BASE = "/api";

async function jfetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${input}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  state: () => jfetch<SystemState>("/state"),
  symbols: () => jfetch<SymbolConfig[]>("/symbols"),
  addSymbol: (symbol: string) =>
    jfetch<SymbolConfig[]>("/symbols", { method: "POST", body: JSON.stringify({ symbol }) }),
  updateSymbol: (symbol: string, body: SymbolConfig) =>
    jfetch<SymbolConfig[]>(`/symbols/${encodeURIComponent(symbol)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteSymbol: (symbol: string) =>
    jfetch<SymbolConfig[]>(`/symbols/${encodeURIComponent(symbol)}`, { method: "DELETE" }),
  cloneSymbol: (symbol: string, newSymbol: string) =>
    jfetch<SymbolConfig[]>(`/symbols/${encodeURIComponent(symbol)}/clone`, {
      method: "POST",
      body: JSON.stringify({ new_symbol: newSymbol }),
    }),
  fills: (symbol?: string, limit = 200) =>
    jfetch<FillsResponse>(`/fills?limit=${limit}${symbol ? `&symbol=${encodeURIComponent(symbol)}` : ""}`),
  orders: (symbol?: string, limit = 200) =>
    jfetch<{ rows: OrderRow[] }>(`/orders?limit=${limit}${symbol ? `&symbol=${encodeURIComponent(symbol)}` : ""}`),
  botStatus: () => jfetch<{ pid: number | null; running: boolean }>("/bot/status"),
  botStart: () => jfetch<{ started: boolean; pid: number }>("/bot/start", { method: "POST" }),
  botStop: () => jfetch<{ stopped: boolean }>("/bot/stop", { method: "POST" }),
  botLog: (bytes = 16000) => jfetch<{ text: string }>(`/bot/log?bytes=${bytes}`),
  botLogClear: () => jfetch<{ cleared: boolean }>("/bot/log/clear", { method: "POST" }),
};
