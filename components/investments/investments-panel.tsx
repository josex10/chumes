"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreditorsDialog } from "@/components/investments/creditors-dialog";
import { InvestmentDetailDialog } from "@/components/investments/investment-detail-dialog";
import { InvestmentForm } from "@/components/investments/investment-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateKey } from "@/lib/follow-ups/calendar";
import type { InvestmentListItem } from "@/lib/investments/types";
import { sumMoney } from "@/lib/money";
import { formatCurrency } from "@/lib/quotes/format";
import type { CompanyPaymentMethod, InvestmentCreditor } from "@/lib/supabase/types";

type InvestmentsPanelProps = {
  investments: InvestmentListItem[];
  creditors: InvestmentCreditor[];
  methods: CompanyPaymentMethod[];
};

function paidPercent(investment: InvestmentListItem): number {
  if (investment.amount <= 0) return 0;
  return Math.min(100, Math.round((investment.paid / investment.amount) * 100));
}

function groupByCreditor(items: InvestmentListItem[]) {
  const groups = new Map<
    number,
    { name: string; items: InvestmentListItem[]; remaining: number }
  >();

  for (const item of items) {
    const current = groups.get(item.creditor_id) ?? {
      name: item.investment_creditors.name,
      items: [],
      remaining: 0,
    };
    current.items.push(item);
    current.remaining = sumMoney([current.remaining, item.remaining]);
    groups.set(item.creditor_id, current);
  }

  return [...groups.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "es"),
  );
}

function InvestmentCard({
  investment,
  onOpen,
}: {
  investment: InvestmentListItem;
  onOpen: () => void;
}) {
  const percent = paidPercent(investment);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl px-4 py-3 text-left ring-1 ring-border/60 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{investment.title}</p>
          <p className="text-sm text-muted-foreground">
            {formatDateKey(investment.invested_on)}
          </p>
        </div>
        <p className="text-sm font-medium">
          {investment.remaining === 0
            ? "Completada"
            : `${formatCurrency(investment.remaining)} pendiente`}
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-foreground" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatCurrency(investment.paid)} de {formatCurrency(investment.amount)}
      </p>
    </button>
  );
}

function InvestmentGroups({
  items,
  onOpen,
}: {
  items: InvestmentListItem[];
  onOpen: (id: string) => void;
}) {
  const groups = groupByCreditor(items);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.name} className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-medium">{group.name}</h3>
            <p className="text-sm text-muted-foreground">
              {group.remaining === 0
                ? "Sin saldo"
                : `${formatCurrency(group.remaining)} pendiente`}
            </p>
          </div>
          <div className="grid gap-3">
            {group.items.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onOpen={() => onOpen(investment.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function InvestmentsPanel({
  investments,
  creditors,
  methods,
}: InvestmentsPanelProps) {
  const [creditorsOpen, setCreditorsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = investments.find((item) => item.id === selectedId) ?? null;
  const openItems = investments.filter((item) => item.status === "OPEN");
  const settledItems = investments.filter((item) => item.status === "SETTLED");
  const activeCreditors = creditors.filter((creditor) => creditor.is_active);
  const totals = [
    { label: "Total invertido", value: formatCurrency(sumMoney(investments.map((item) => item.amount))) },
    { label: "Total abonado", value: formatCurrency(sumMoney(investments.map((item) => item.paid))) },
    { label: "Saldo pendiente", value: formatCurrency(sumMoney(investments.map((item) => item.remaining))) },
    { label: "Inversiones abiertas", value: String(openItems.length) },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {totals.map((item) => (
          <Card key={item.label} className="shadow-none ring-1 ring-border/60">
            <CardContent className="pt-0">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setCreditorsOpen(true)}>
          Quién invirtió
        </Button>
        <Button
          type="button"
          variant="add"
          onClick={() => setCreating(true)}
          disabled={activeCreditors.length === 0}
        >
          <Plus className="size-4" />
          Nueva inversión
        </Button>
      </div>

      {activeCreditors.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Agrega al menos una persona activa antes de registrar una inversión.
        </p>
      ) : null}

      {investments.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">Todavía no hay inversiones.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {openItems.length > 0 ? (
            <InvestmentGroups items={openItems} onOpen={setSelectedId} />
          ) : (
            <p className="text-sm text-muted-foreground">No hay inversiones pendientes.</p>
          )}

          {settledItems.length > 0 ? (
            <details className="group" open={openItems.length === 0}>
              <summary className="cursor-pointer text-sm font-medium">
                Completadas ({settledItems.length})
              </summary>
              <div className="mt-4">
                <InvestmentGroups items={settledItems} onOpen={setSelectedId} />
              </div>
            </details>
          ) : null}
        </div>
      )}

      <CreditorsDialog
        creditors={creditors}
        open={creditorsOpen}
        onOpenChange={setCreditorsOpen}
      />

      <Dialog open={creating} onOpenChange={setCreating} disablePointerDismissal>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva inversión</DialogTitle>
            <DialogDescription>
              Lo que alguien pagó de su plata y la empresa va a devolver con abonos.
            </DialogDescription>
          </DialogHeader>
          {creating ? (
            <InvestmentForm
              creditors={activeCreditors}
              onSuccess={() => setCreating(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <InvestmentDetailDialog
        investment={selected}
        creditors={creditors}
        methods={methods}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
