"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, DollarSign, ListChecks, ScanLine, TrendingUp, X } from "lucide-react";

import { Topbar } from "@/components/nav/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FillsTable } from "@/components/dashboard/fills-table";
import { Kpi } from "@/components/dashboard/kpi";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { PnlChart } from "@/components/dashboard/pnl-chart";
import { api, type FillsResponse, type OrderRow } from "@/lib/api";
import { estimateCommissionUsd, fmtInt, fmtMoney, fmtTimeBJ } from "@/lib/fmt";

type TimeRange = { start: string; end: string } | null;

export default function DashboardPage() {
  const [fills, setFills] = useState<FillsResponse | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>(null);

  const load = async () => {
    try {
      const [f, o] = await Promise.all([api.fills(undefined, 500), api.orders(undefined, 500)]);
      setFills(f);
      setOrders(o.rows);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const handleRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  const sum = fills?.summary;

  const commissionTotal = useMemo(() => {
    if (!fills?.rows) return 0;
    return fills.rows.reduce((acc, r) => acc + estimateCommissionUsd(r.qty, r.price), 0);
  }, [fills]);

  const netPnl = (sum?.realized_pnl_usd ?? 0) - commissionTotal;

  const inRange = (iso: string | null | undefined) => {
    if (!timeRange) return true;
    if (!iso) return false;
    return iso >= timeRange.start && iso < timeRange.end;
  };

  const filteredFills = useMemo(
    () => (fills?.rows ?? []).filter((r) => inRange(r.time)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fills, timeRange]
  );
  const filteredOrders = useMemo(
    () => orders.filter((r) => inRange(r.time_last ?? r.time_first)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, timeRange]
  );

  return (
    <>
      <Topbar
        title="Live Dashboard"
        subtitle="实时跟踪 GRID 策略成交、订单与已实现盈亏"
      />
      <div className="px-6 py-6 space-y-6">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            label="累计已实现 (净·估)"
            value={fmtMoney(netPnl, { sign: true })}
            hint={`毛 ${fmtMoney(sum?.realized_pnl_usd ?? 0, { sign: true })} · 手续费 ${fmtMoney(-commissionTotal)}`}
            tone={netPnl > 0 ? "good" : netPnl < 0 ? "bad" : "neutral"}
            icon={DollarSign}
          />
          <Kpi
            label="买入金额"
            value={fmtMoney(sum?.buy_amount_usd ?? 0)}
            hint={`${fmtInt(sum?.buy_qty)} 股`}
            tone="brand"
            icon={ArrowDownRight}
          />
          <Kpi
            label="卖出金额"
            value={fmtMoney(sum?.sell_amount_usd ?? 0)}
            hint={`${fmtInt(sum?.sell_qty)} 股`}
            tone="brand"
            icon={ArrowUpRight}
          />
          <Kpi
            label="成交记录"
            value={fmtInt(sum?.total)}
            hint={`挂单 ${fmtInt(orders.length)}`}
            icon={ListChecks}
          />
        </section>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--brand)]" />
                累计已实现盈亏
              </CardTitle>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                基于 GRID FIFO 配对；手续费按 IBKR Pro Tiered 费率估算（$0.0035/股，最低 $0.35，上限成交额 1%）
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <PnlChart rows={fills?.rows ?? []} onRangeChange={handleRangeChange} />
          </CardContent>
        </Card>

        {sum && sum.by_symbol.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-[var(--brand)]" />
                按标的拆分
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {sum.by_symbol.map((s) => (
                  <Card key={s.symbol} className="px-4 py-4">
                    <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {s.symbol}
                    </div>
                    <div
                      className={
                        s.realized_pnl_usd > 0
                          ? "text-[20px] font-bold text-[var(--success)] tabular"
                          : s.realized_pnl_usd < 0
                          ? "text-[20px] font-bold text-[var(--danger)] tabular"
                          : "text-[20px] font-bold tabular"
                      }
                    >
                      {fmtMoney(s.realized_pnl_usd, { sign: true })}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] mt-1 tabular">
                      B {fmtInt(s.buy_qty)} · S {fmtInt(s.sell_qty)}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <Tabs defaultValue="fills">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <CardTitle>成交与订单</CardTitle>
                  {timeRange && (
                    <div className="flex items-center gap-1 text-[12px] text-[var(--muted)] bg-[var(--surface-secondary)] px-2 py-1 rounded-[var(--radius-sm)]">
                      <span className="tabular">
                        {fmtTimeBJ(timeRange.start)} ~ {fmtTimeBJ(timeRange.end)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTimeRange(null)}
                        className="ml-1 hover:text-[var(--foreground)]"
                        title="清除筛选"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <TabsList>
                  <TabsTrigger value="fills">
                    成交{timeRange ? ` (${filteredFills.length}/${fills?.rows.length ?? 0})` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="orders">
                    订单{timeRange ? ` (${filteredOrders.length}/${orders.length})` : ""}
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="fills">
                {loading ? (
                  <SkeletonTable />
                ) : (
                  <FillsTable rows={filteredFills} />
                )}
              </TabsContent>
              <TabsContent value="orders">
                {loading ? <SkeletonTable /> : <OrdersTable rows={filteredOrders} />}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 rounded-[var(--radius-sm)] bg-[var(--surface-secondary)]" />
      ))}
    </div>
  );
}
