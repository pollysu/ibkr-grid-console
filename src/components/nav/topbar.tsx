"use client";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight leading-[1.1]">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
