"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, DollarSign, ListChecks, ScanLine, TrendingUp } from "lucide-react";

import { Topbar } from "@/components/nav/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FillsTable } from "@/components/dashboard/fills-table";
import { Kpi } from "@/components/dashboard/kpi";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { PnlChart } from "@/components/dashboard/pnl-chart";
import { api, type FillsResponse, type OrderRow } from "@/lib/api";
import { fmtInt, fmtMoney } from "@/lib/fmt";

export default function DashboardPage() {
  const [fills, setFills] = useState<FillsResponse | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [f, o] = await Promise.all([api.fills(undefined, 500), api.orders(undefined, 500)]);
      setFills(f);
      setOrders(o.rows);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("无法加载仪表盘数据，请确认后端 API 已启动。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const sum = fills?.summary;

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="连接后端后查看成交、订单与已实现盈亏。"
      />
      <div className="px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-[var(--radius-md)] border border-dashed px-4 py-3 text-sm text-[var(--muted)]">
            {error}
          </div>
        )}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            label="累计已实现"
            value={fmtMoney(sum?.realized_pnl_usd ?? 0, { sign: true })}
            hint={`${fmtInt(sum?.sell_qty)} 股 SELL · ${fmtInt(sum?.buy_qty)} 股 BUY`}
            tone={
              sum && sum.realized_pnl_usd > 0 ? "good" : sum && sum.realized_pnl_usd < 0 ? "bad" : "neutral"
            }
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
              <p className="text-sm text-[var(--muted)] mt-0.5">基于 GRID FIFO 配对的逐笔回放</p>
            </div>
          </CardHeader>
          <CardContent>
            <PnlChart rows={fills?.rows ?? []} />
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
              <div className="flex items-center justify-between">
                <CardTitle>成交与订单</CardTitle>
                <TabsList>
                  <TabsTrigger value="fills">成交</TabsTrigger>
                  <TabsTrigger value="orders">订单</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="fills">
                {loading ? (
                  <SkeletonTable />
                ) : (
                  <FillsTable rows={fills?.rows ?? []} />
                )}
              </TabsContent>
              <TabsContent value="orders">
                {loading ? <SkeletonTable /> : <OrdersTable rows={orders} />}
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
