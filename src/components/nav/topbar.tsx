"use client";

import { useEffect, useState } from "react";
import { Activity, AlertCircle, Clock, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api, type SystemState } from "@/lib/api";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [state, setState] = useState<SystemState | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const s = await api.state();
        if (alive) {
          setState(s);
          setErr(null);
        }
      } catch (e) {
        if (alive) setErr(String(e));
      }
    };
    tick();
    const t = setInterval(tick, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight leading-[1.1]">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--muted)] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {err && (
            <Badge tone="danger" className="gap-1.5">
              <AlertCircle className="h-3 w-3" />
              API offline
            </Badge>
          )}
          {state && (
            <>
              <Badge tone={state.bot.running ? "success" : "neutral"} className="gap-1.5">
                {state.bot.running ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                Bot {state.bot.running ? "Running" : "Stopped"}
              </Badge>
              <Badge
                tone={state.trading_window.is_open ? "success" : "warn"}
                className="gap-1.5"
              >
                <Activity className="h-3 w-3" />
                Window {state.trading_window.is_open ? "Open" : "Closed"}
              </Badge>
              <Badge tone="neutral" className="gap-1.5 hidden lg:inline-flex">
                <Clock className="h-3 w-3" />
                NY {state.now_local.slice(11, 19)}
              </Badge>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
