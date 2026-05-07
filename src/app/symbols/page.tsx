"use client";

import { useEffect, useState } from "react";
import { Plus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Topbar } from "@/components/nav/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SymbolForm } from "@/components/symbols/symbol-form";
import { api, type SymbolConfig } from "@/lib/api";
import { fmtMoney, fmtNum } from "@/lib/fmt";
import { cn } from "@/lib/utils";

export default function SymbolsPage() {
  const [list, setList] = useState<SymbolConfig[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSym, setNewSym] = useState("");
  const [cloneTo, setCloneTo] = useState("");

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const xs = await api.symbols();
        if (!alive) return;
        setList(xs);
        setActive((current) => {
          if (!xs.length) return null;
          if (current && xs.find((x) => x.symbol === current)) return current;
          return xs[0].symbol;
        });
      } catch (e) {
        console.error(e);
        if (!alive) return;
        setList([]);
        setActive(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const current = list.find((s) => s.symbol === active);

  const onAdd = async () => {
    const sym = newSym.trim().toUpperCase();
    if (!sym) return;
    try {
      const out = await api.addSymbol(sym);
      setList(out);
      setActive(sym);
      setNewSym("");
      toast.success(`已添加 ${sym}`);
    } catch (e) {
      toast.error(String(e));
    }
  };

  const onClone = async () => {
    if (!active) return;
    const sym = cloneTo.trim().toUpperCase();
    if (!sym) return;
    try {
      const out = await api.cloneSymbol(active, sym);
      setList(out);
      setActive(sym);
      setCloneTo("");
      toast.success(`已克隆为 ${sym}`);
    } catch (e) {
      toast.error(String(e));
    }
  };

  const onDelete = async () => {
    if (!active) return;
    try {
      const out = await api.deleteSymbol(active);
      setList(out);
      setActive(out[0]?.symbol ?? null);
      toast.success(`已删除 ${active}`);
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <>
      <Topbar title="Symbols" subtitle="网格参数 · 实时同步至 config.yaml" />
      <div className="px-6 py-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>已配置 ({list.length})</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="primary">
                    <Plus className="h-4 w-4" />
                    新增
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增标的</DialogTitle>
                    <DialogDescription>
                      会用默认网格参数创建一份配置，保存后立即写入 config.yaml。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Input
                      value={newSym}
                      onChange={(e) => setNewSym(e.target.value.toUpperCase())}
                      placeholder="例如 NVDA"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={onAdd} variant="primary">
                      添加
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="px-2 pb-3 space-y-1">
              {loading && <div className="text-sm text-[var(--muted)] px-3 py-4">加载中…</div>}
              {!loading && !list.length && (
                <div className="text-sm text-[var(--muted)] px-3 py-4">尚未配置任何标的</div>
              )}
              {list.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => setActive(s.symbol)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] transition-colors",
                    s.symbol === active
                      ? "bg-[var(--surface-secondary)]"
                      : "hover:bg-[var(--surface-secondary)]/60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{s.symbol}</span>
                    <span className="text-[11px] text-[var(--muted)] uppercase tracking-wider">
                      {s.grid.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--muted)] tabular mt-0.5">
                    {fmtNum(s.grid.lower, 2)} – {fmtNum(s.grid.upper, 2)} · {s.grid.grids} grids
                  </div>
                  <div className="text-[11px] text-[var(--muted)] tabular">
                    Budget {fmtMoney(s.grid_budget_usd, { digits: 0 })}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {current && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>克隆为</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cloneTo}
                      onChange={(e) => setCloneTo(e.target.value.toUpperCase())}
                      placeholder="新 symbol"
                    />
                    <Button size="sm" variant="secondary" onClick={onClone}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="danger" className="w-full">
                      <Trash2 className="h-4 w-4" />
                      删除 {current.symbol}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>删除标的 {current.symbol}？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作会立即写入 config.yaml，已挂出的订单不会自动撤销，重启 bot 后才会生效。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <Button variant="secondary">取消</Button>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button variant="danger" onClick={onDelete}>
                          确认删除
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-12 lg:col-span-9">
          {current ? (
            <SymbolForm key={current.symbol} symbol={current} onSaved={(out) => setList(out)} />
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-sm text-[var(--muted)]">
                选择左侧标的查看 / 编辑详情
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
