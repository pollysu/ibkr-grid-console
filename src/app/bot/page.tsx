"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, Pause, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Topbar } from "@/components/nav/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, type SystemState } from "@/lib/api";
import { fmtBytes } from "@/lib/fmt";

export default function BotPage() {
  const [state, setState] = useState<SystemState | null>(null);
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLPreElement | null>(null);

  const refresh = async () => {
    try {
      const [s, l] = await Promise.all([api.state(), api.botLog(40000)]);
      setState(s);
      setLog(l.text);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const start = async () => {
    setBusy(true);
    try {
      const r = await api.botStart();
      toast.success(`Bot started (pid ${r.pid})`);
      await refresh();
    } catch (e) {
      toast.error(String(e));
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      await api.botStop();
      toast.success("Stop signal sent");
      await refresh();
    } catch (e) {
      toast.error(String(e));
    } finally {
      setBusy(false);
    }
  };

  const clearLog = async () => {
    await api.botLogClear();
    await refresh();
    toast.success("Log cleared");
  };

  return (
    <>
      <Topbar title="Bot Control" subtitle="启动 / 停止 LIVE 交易进程，查看运行日志" />
      <div className="px-6 py-6 space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>运行状态</CardTitle>
              <p className="text-sm text-[var(--muted)] mt-0.5">
                进程通过 systemd 之外的子进程方式启动，PID 写入 .state/ibkr_grid_live.pid
              </p>
            </div>
            <div className="flex items-center gap-2">
              {state?.bot.running ? (
                <Badge tone="success">RUNNING · pid {state.bot.pid}</Badge>
              ) : (
                <Badge tone="neutral">STOPPED</Badge>
              )}
              <Button size="sm" variant="ghost" onClick={refresh}>
                <RefreshCw className="h-4 w-4" /> 刷新
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="IB 连接"
              value={`${state?.ib.host ?? "-"}:${state?.ib.port ?? "-"}`}
              hint={`Client ${state?.ib.client_id ?? "-"} · ${(state?.ib.market_data_type ?? "-").toUpperCase()}`}
            />
            <Stat
              label="交易窗口"
              value={state?.trading_window.is_open ? "OPEN" : "CLOSED"}
              hint={`${state?.trading_window.timezone ?? "-"} ${state?.trading_window.start ?? ""}-${state?.trading_window.end ?? ""}`}
            />
            <Stat
              label="运行节奏"
              value={`${state?.execution.poll_interval_sec ?? "-"}s`}
              hint={`TIF ${state?.execution.tif ?? "-"} · resume ${
                state?.execution.resume_existing_orders ? "ON" : "OFF"
              }`}
            />
            <Stat
              label="State 体积"
              value={fmtBytes(state?.counts.fills_csv_bytes ?? 0)}
              hint={`orders ${fmtBytes(state?.counts.orders_csv_bytes ?? 0)} · ${state?.counts.symbols ?? 0} symbols`}
            />
          </CardContent>
          <CardContent className="flex gap-2 pt-0">
            <Button variant="primary" onClick={start} disabled={busy || state?.bot.running}>
              <Play className="h-4 w-4" />
              Start LIVE
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="danger" disabled={busy || !state?.bot.running}>
                  <Pause className="h-4 w-4" />
                  Stop
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认停止 LIVE 交易进程？</AlertDialogTitle>
                  <AlertDialogDescription>
                    将向 bot 进程发送停止信号，已挂出的订单不会自动撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button variant="secondary">取消</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button variant="danger" onClick={stop}>
                      确认停止
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>运行日志</CardTitle>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Eraser className="h-4 w-4" /> 清空
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>清空日志文件？</AlertDialogTitle>
                    <AlertDialogDescription>
                      会截断 .state/ibkr_grid_live.log，历史日志将无法找回。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button variant="secondary">取消</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button variant="danger" onClick={clearLog}>
                        清空
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <pre
              ref={logRef}
              className="h-[460px] overflow-auto rounded-[var(--radius-md)] bg-[var(--surface-dark)] text-[#e6e9ee] font-mono text-[12px] leading-[1.55] p-4 whitespace-pre-wrap"
            >
              {log || "(日志为空)"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--muted)]">
        {label}
      </div>
      <div className="text-[18px] font-bold mt-1 tabular">{value}</div>
      {hint && <div className="text-[11px] text-[var(--muted)] mt-0.5">{hint}</div>}
    </div>
  );
}
