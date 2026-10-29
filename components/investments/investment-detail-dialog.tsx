"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChoiceChips } from "@/components/expenses/choice-chips";
import { InvestmentForm } from "@/components/investments/investment-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatSpentAt } from "@/lib/expenses/format";
import { toDatetimeLocalValue } from "@/lib/events/format-dates";
import { formatDateKey } from "@/lib/follow-ups/calendar";
import {
  createInvestmentPayment,
  deleteInvestment,
  deleteInvestmentPayment,
  updateInvestmentPayment,
} from "@/lib/investments/actions";
import {
  investmentPaymentFormSchema,
  type InvestmentPaymentFormValues,
} from "@/lib/investments/schema";
import type { InvestmentListItem, InvestmentPaymentItem } from "@/lib/investments/types";
import { remainingMoney } from "@/lib/money";
import { formatCurrency } from "@/lib/quotes/format";
import type { CompanyPaymentMethod, InvestmentCreditor } from "@/lib/supabase/types";

type InvestmentDetailDialogProps = {
  investment: InvestmentListItem | null;
  creditors: InvestmentCreditor[];
  methods: CompanyPaymentMethod[];
  onOpenChange: (open: boolean) => void;
};

function paidPercent(investment: InvestmentListItem): number {
  if (investment.amount <= 0) return 0;
  return Math.min(100, Math.round((investment.paid / investment.amount) * 100));
}

function activeMethods(
  methods: CompanyPaymentMethod[],
  currentId?: number,
): CompanyPaymentMethod[] {
  return methods.filter((method) => method.is_active || method.id === currentId);
}

function PaymentForm({
  methods,
  maxAmount,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  methods: CompanyPaymentMethod[];
  maxAmount: number;
  initialValues?: InvestmentPaymentFormValues;
  submitLabel: string;
  onSubmit: (
    values: InvestmentPaymentFormValues,
  ) => Promise<{ success: true } | { success: false; error: string }>;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<InvestmentPaymentFormValues>({
    resolver: zodResolver(investmentPaymentFormSchema),
    defaultValues: initialValues ?? {
      payment_method_id: undefined,
      amount: undefined,
      paid_at: toDatetimeLocalValue(new Date().toISOString()),
      notes: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = form;
  const methodId = useWatch({ control, name: "payment_method_id" });

  function submit(values: InvestmentPaymentFormValues) {
    if (values.amount > maxAmount) {
      setSubmitError("El abono no puede ser mayor al saldo pendiente.");
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const result = await onSubmit(values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      router.refresh();
      onCancel();
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-3 rounded-lg bg-muted/40 p-3">
      <ChoiceChips
        label="Cómo se pagó"
        options={methods.map((method) => ({ id: method.id, label: method.name }))}
        value={methodId}
        onChange={(id) =>
          setValue("payment_method_id", id, { shouldValidate: true, shouldDirty: true })
        }
        error={errors.payment_method_id?.message}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="abono-amount">Monto</Label>
          <Input
            id="abono-amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            max={maxAmount}
            {...register("amount", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Saldo disponible {formatCurrency(maxAmount)}
          </p>
          {errors.amount ? (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="abono-date">Fecha y hora</Label>
          <Input id="abono-date" type="datetime-local" {...register("paid_at")} />
          {errors.paid_at ? (
            <p className="text-sm text-destructive">{errors.paid_at.message}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="abono-notes">
          Nota <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea id="abono-notes" {...register("notes")} />
      </div>
      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="commit" disabled={isPending || methods.length === 0}>
          {isPending ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function InvestmentDetailBody({
  investment,
  creditors,
  methods,
  onClose,
}: {
  investment: InvestmentListItem;
  creditors: InvestmentCreditor[];
  methods: CompanyPaymentMethod[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [editingPayment, setEditingPayment] = useState<InvestmentPaymentItem | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const percent = paidPercent(investment);
  const creditorOptions = creditors.filter(
    (creditor) => creditor.is_active || creditor.id === investment.creditor_id,
  );

  function removeInvestment() {
    setError(null);
    startTransition(async () => {
      const result = await deleteInvestment(investment.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function removePayment(paymentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteInvestmentPayment(paymentId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDeletePaymentId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <DialogHeader>
        <DialogTitle>{investment.title}</DialogTitle>
        <DialogDescription>
          {investment.investment_creditors.name} · {formatDateKey(investment.invested_on)}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {formatCurrency(investment.paid)} de {formatCurrency(investment.amount)}
          </p>
          <p className="text-sm font-medium">
            {investment.remaining === 0
              ? "Completada"
              : `${formatCurrency(investment.remaining)} pendiente`}
          </p>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Avance del pago"
        >
          <div className="h-full bg-foreground" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {investment.notes ? <p className="text-sm">{investment.notes}</p> : null}

      {editing ? (
        <InvestmentForm
          creditors={creditorOptions}
          investmentId={investment.id}
          initialValues={{
            creditor_id: investment.creditor_id,
            title: investment.title,
            amount: investment.amount,
            invested_on: investment.invested_on,
            notes: investment.notes ?? "",
          }}
          onSuccess={() => setEditing(false)}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            Editar datos
          </Button>
          {investment.remaining > 0 ? (
            <Button
              type="button"
              variant="add"
              onClick={() => {
                setEditingPayment(null);
                setPaying(true);
              }}
            >
              Abonar
            </Button>
          ) : null}
        </div>
      )}

      {paying ? (
        <PaymentForm
          key={`new-${investment.remaining}`}
          methods={activeMethods(methods)}
          maxAmount={investment.remaining}
          submitLabel="Registrar abono"
          onSubmit={(values) => createInvestmentPayment(investment.id, values)}
          onCancel={() => setPaying(false)}
        />
      ) : null}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Abonos</h3>
        {investment.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay abonos.</p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-lg ring-1 ring-border/60">
            {investment.payments.map((payment) => (
              <li key={payment.id} className="space-y-2 px-3 py-3">
                {editingPayment?.id === payment.id ? (
                  <PaymentForm
                    methods={activeMethods(methods, payment.payment_method_id)}
                    maxAmount={remainingMoney(
                      investment.amount,
                      investment.paid - payment.amount,
                    )}
                    initialValues={{
                      payment_method_id: payment.payment_method_id,
                      amount: payment.amount,
                      paid_at: toDatetimeLocalValue(payment.paid_at),
                      notes: payment.notes ?? "",
                    }}
                    submitLabel="Guardar abono"
                    onSubmit={(values) => updateInvestmentPayment(payment.id, values)}
                    onCancel={() => setEditingPayment(null)}
                  />
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.company_payment_methods.name} · {formatSpentAt(payment.paid_at)}
                      </p>
                      {payment.notes ? <p className="text-sm">{payment.notes}</p> : null}
                      <p className="text-xs text-muted-foreground">
                        {payment.created_by_name ?? "Usuario"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {deletePaymentId === payment.id ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletePaymentId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isPending}
                            onClick={() => removePayment(payment.id)}
                          >
                            Confirmar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPaying(false);
                              setDeletePaymentId(null);
                              setEditingPayment(payment);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletePaymentId(payment.id)}
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {confirmDelete ? (
        <div className="space-y-3 rounded-lg bg-destructive/10 p-3">
          <p className="text-sm">
            Se borra la inversión y todos sus abonos. Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" disabled={isPending} onClick={removeInvestment}>
              {isPending ? "Eliminando..." : "Eliminar inversión"}
            </Button>
          </div>
        </div>
      ) : (
        <DialogFooter>
          <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
            Eliminar inversión
          </Button>
        </DialogFooter>
      )}
    </div>
  );
}

export function InvestmentDetailDialog({
  investment,
  creditors,
  methods,
  onOpenChange,
}: InvestmentDetailDialogProps) {
  return (
    <Dialog open={investment !== null} onOpenChange={onOpenChange} disablePointerDismissal>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        {investment ? (
          <InvestmentDetailBody
            key={investment.id}
            investment={investment}
            creditors={creditors}
            methods={methods}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
