"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Settings2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, hint: "Live PnL & Activity" },
  { href: "/symbols", label: "Symbols", icon: Settings2, hint: "Grid Configuration" },
  { href: "/bot", label: "Bot Control", icon: Activity, hint: "Start, Stop, Logs" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-72 shrink-0 border-r bg-white">
      <div className="px-6 pt-7 pb-5 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-full bg-[var(--brand)] grid place-items-center text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight">Trader</div>
          <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.08em]">
            ibkr grid · live
          </div>
        </div>
      </div>
      <nav className="px-3 py-2 flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon, hint }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors",
                active
                  ? "bg-[var(--surface-secondary)] text-foreground"
                  : "text-[var(--muted)] hover:text-foreground hover:bg-[var(--surface-secondary)]/60"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-[var(--brand)]")} />
              <div className="flex-1">
                <div className="text-sm font-semibold leading-tight">{label}</div>
                <div className="text-[11px] text-[var(--muted)]">{hint}</div>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 border-t">
        <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--muted)]">
          Design system
        </div>
        <div className="text-[12px] text-foreground mt-1">
          Coinbase tokens · v2 frontend
        </div>
      </div>
    </aside>
  );
}
