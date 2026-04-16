"use client";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api, type SymbolConfig } from "@/lib/api";

export function SymbolForm({
  symbol,
  onSaved,
}: {
  symbol: SymbolConfig;
  onSaved: (out: SymbolConfig[]) => void;
}) {
  const [draft, setDraft] = useState<SymbolConfig>(symbol);
  const [saving, setSaving] = useState(false);

  const setGrid = <K extends keyof SymbolConfig["grid"]>(k: K, v: SymbolConfig["grid"][K]) =>
    setDraft({ ...draft, grid: { ...draft.grid, [k]: v } });

  const save = async () => {
    setSaving(true);
    try {
      const out = await api.updateSymbol(draft.symbol, draft);
      onSaved(out);
      toast.success(`已保存 ${draft.symbol}`);
    } catch (e) {
      toast.error(`保存失败: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{draft.symbol}</CardTitle>
        <Button size="sm" variant="primary" onClick={save} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "保存中…" : "保存"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section title="合约">
          <Field label="Exchange">
            <Input value={draft.exchange} onChange={(e) => setDraft({ ...draft, exchange: e.target.value })} />
          </Field>
          <Field label="Currency">
            <Input value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
          </Field>
          <Field label="Primary Exchange">
            <Input
              value={draft.primary_exchange ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, primary_exchange: e.target.value || null })
              }
              placeholder="可空"
            />
          </Field>
          <Field label="Con ID">
            <Input
              type="number"
              value={draft.con_id ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, con_id: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="可空"
            />
          </Field>
        </Section>

        <Section title="资金分配">
          <Field label="Total Position USD">
            <Input
              type="number"
              value={draft.total_position_usd}
              onChange={(e) => setDraft({ ...draft, total_position_usd: Number(e.target.value) })}
            />
          </Field>
          <Field label="Grid Budget USD">
            <Input
              type="number"
              value={draft.grid_budget_usd}
              onChange={(e) => setDraft({ ...draft, grid_budget_usd: Number(e.target.value) })}
            />
          </Field>
          <Field label="Base Lock Pct">
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={draft.base_lock_pct_shares}
              onChange={(e) => setDraft({ ...draft, base_lock_pct_shares: Number(e.target.value) })}
            />
          </Field>
        </Section>

        <Section title="网格参数">
          <Field label="Mode">
            <Select value={draft.grid.type} onValueChange={(v) => setGrid("type", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discrete_pct">discrete_pct</SelectItem>
                <SelectItem value="pine_grid">pine_grid</SelectItem>
                <SelectItem value="geometric">geometric</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Grid Type">
            <Select value={draft.grid.grid_type} onValueChange={(v) => setGrid("grid_type", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Geometric">Geometric</SelectItem>
                <SelectItem value="Arithmetic">Arithmetic</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Lower">
            <Input type="number" value={draft.grid.lower} onChange={(e) => setGrid("lower", Number(e.target.value))} />
          </Field>
          <Field label="Upper">
            <Input type="number" value={draft.grid.upper} onChange={(e) => setGrid("upper", Number(e.target.value))} />
          </Field>
          <Field label="Anchor">
            <Input type="number" value={draft.grid.anchor} onChange={(e) => setGrid("anchor", Number(e.target.value))} />
          </Field>
          <Field label="Grids">
            <Input
              type="number"
              value={draft.grid.grids}
              onChange={(e) => setGrid("grids", Math.max(1, Number(e.target.value)))}
            />
          </Field>
          <Field label="Step %">
            <Input
              type="number"
              step="0.1"
              value={draft.grid.step_pct}
              onChange={(e) => setGrid("step_pct", Number(e.target.value))}
            />
          </Field>
          <Field label="Min Trade Value USD">
            <Input
              type="number"
              value={draft.grid.min_trade_value_usd}
              onChange={(e) => setGrid("min_trade_value_usd", Number(e.target.value))}
            />
          </Field>
          <Field label="Stop Loss">
            <Input
              type="number"
              value={draft.grid.stop_loss ?? ""}
              onChange={(e) => setGrid("stop_loss", e.target.value ? Number(e.target.value) : null)}
              placeholder="可空"
            />
          </Field>
        </Section>

        <Section title="策略开关">
          <Toggle
            label="Extend Upper"
            checked={draft.grid.extend_upper}
            onChange={(v) => setGrid("extend_upper", v)}
          />
          <Toggle
            label="Pause Below Lower"
            checked={draft.grid.pause_below_lower}
            onChange={(v) => setGrid("pause_below_lower", v)}
          />
          <Toggle
            label="Follow Enabled"
            checked={draft.grid.follow_enabled}
            onChange={(v) => setGrid("follow_enabled", v)}
          />
          <Field label="Follow Buy Levels">
            <Input
              type="number"
              value={draft.grid.follow_buy_levels}
              onChange={(e) => setGrid("follow_buy_levels", Math.max(0, Number(e.target.value)))}
            />
          </Field>
        </Section>
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[var(--muted)] mb-3">
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[var(--radius-md)] border px-4 py-3">
      <Label className="cursor-pointer normal-case tracking-normal text-sm font-medium text-foreground">
        {label}
      </Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
