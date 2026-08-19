"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAdvance,
  createRefund,
  deleteMovement,
  updateMovement,
} from "@/lib/payments/actions";
import {
  FINANCIAL_MOVEMENT_TYPE,
  FINANCIAL_MOVEMENT_TYPE_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/payments/constants";
import { getPaymentAccess } from "@/lib/payments/access";
import {
  getFullPendingAmount,
  getQuickAdvanceAmounts,
} from "@/lib/payments/amount-presets";
import {
  advanceFormSchema,
  refundFormSchema,
  updateMovementSchema,
  type AdvanceFormValues,
  type RefundFormValues,
  type UpdateMovementFormValues,
} from "@/lib/payments/schema";
import { formatCurrency } from "@/lib/quotes/format";
import type {
  EventFinancialMovementWithRelations,
  PaymentMethod,
  PaymentSummary,
} from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type EventPaymentsPanelProps = {
  eventId: string;
  eventPhase: string;
  eventStatusCode: string;
  summary: PaymentSummary;
  movements: EventFinancialMovementWithRelations[];
  paymentMethods: PaymentMethod[];
};

type FormMode =
  | { kind: "closed" }
  | { kind: "advance" }
  | { kind: "refund" }
  | { kind: "edit"; movement: EventFinancialMovementWithRelations };

function toDatetimeLocalValue(isoDate: string): string {
  const date = new Date(isoDate);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function defaultDatetimeLocalValue(): string {
  return toDatetimeLocalValue(new Date().toISOString());
}

function formatMovementDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

function PaymentMethodSelect({
  value,
  onChange,
  paymentMethods,
  error,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
  paymentMethods: PaymentMethod[];
  error?: string;
}) {
  const items = useMemo(
    () =>
      paymentMethods.map((method) => ({
        value: String(method.id),
        label: method.name,
      })),
    [paymentMethods],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="payment_method_id">Forma de pago</Label>
      <Select
        value={value ? String(value) : null}
        onValueChange={(next) => next && onChange(Number(next))}
        items={items}
      >
        <SelectTrigger id="payment_method_id" className="w-full">
          <SelectValue placeholder="Seleccionar" />
        </SelectTrigger>
        <SelectContent>
          {paymentMethods.map((method) => (
            <SelectItem key={method.id} value={String(method.id)}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function AmountPresetButtons({
  balanceDue,
  onSelect,
}: {
  balanceDue: number;
  onSelect: (amount: number) => void;
}) {
  const presets = getQuickAdvanceAmounts(balanceDue);
  const fullAmount = getFullPendingAmount(balanceDue);

  return (
    <div className="space-y-2">
      <Label>Montos rápidos</Label>
      <div className="flex flex-wrap gap-2">
        {presets.map(({ percentage, amount }) => (
          <Button
            key={percentage}
            type="button"
            variant="outline"
            size="sm"
            disabled={amount <= 0}
            onClick={() => onSelect(amount)}
          >
            {percentage}%
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={fullAmount <= 0}
          onClick={() => onSelect(fullAmount)}
        >
          Cancelación completa
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Calculado sobre el saldo pendiente ({formatCurrency(balanceDue)}). Verifica
        el monto antes de guardar.
      </p>
    </div>
  );
}

type SharedMovementValues = AdvanceFormValues;

function MovementFields({
  register,
  control,
  errors,
  paymentMethods,
  showTypeField,
  movementTypeControl,
  amountPresets,
}: {
  register: UseFormRegister<SharedMovementValues>;
  control: Control<SharedMovementValues>;
  errors: FieldErrors<SharedMovementValues>;
  paymentMethods: PaymentMethod[];
  showTypeField?: boolean;
  movementTypeControl?: Control<UpdateMovementFormValues>;
  amountPresets?: {
    balanceDue: number;
    onSelect: (amount: number) => void;
  };
}) {
  const movementTypeItems = useMemo(
    () => [
      {
        value: FINANCIAL_MOVEMENT_TYPE.ADVANCE,
        label: FINANCIAL_MOVEMENT_TYPE_LABELS.ADVANCE,
      },
      {
        value: FINANCIAL_MOVEMENT_TYPE.REFUND,
        label: FINANCIAL_MOVEMENT_TYPE_LABELS.REFUND,
      },
    ],
    [],
  );

  return (
    <>
      {showTypeField && movementTypeControl ? (
        <div className="space-y-2">
          <Label htmlFor="movement_type">Tipo</Label>
          <Controller
            control={movementTypeControl}
            name="movement_type"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={movementTypeItems}
              >
                <SelectTrigger id="movement_type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FINANCIAL_MOVEMENT_TYPE.ADVANCE}>
                    {FINANCIAL_MOVEMENT_TYPE_LABELS.ADVANCE}
                  </SelectItem>
                  <SelectItem value={FINANCIAL_MOVEMENT_TYPE.REFUND}>
                    {FINANCIAL_MOVEMENT_TYPE_LABELS.REFUND}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      ) : null}

      {amountPresets ? (
        <AmountPresetButtons
          balanceDue={amountPresets.balanceDue}
          onSelect={amountPresets.onSelect}
        />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          {...register("amount")}
        />
        {errors.amount ? (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        ) : null}
      </div>

      <Controller
        control={control}
        name="payment_method_id"
        render={({ field }) => (
          <PaymentMethodSelect
            value={field.value}
            onChange={field.onChange}
            paymentMethods={paymentMethods}
            error={errors.payment_method_id?.message}
          />
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="movement_date">Fecha</Label>
        <Input
          id="movement_date"
          type="datetime-local"
          {...register("movement_date")}
        />
        {errors.movement_date ? (
          <p className="text-sm text-destructive">{errors.movement_date.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" rows={2} {...register("notes")} />
      </div>
    </>
  );
}

function CreateAdvanceDialog({
  eventId,
  balanceDue,
  paymentMethods,
  onClose,
}: {
  eventId: string;
  balanceDue: number;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<AdvanceFormValues>({
    resolver: zodResolver(advanceFormSchema),
    defaultValues: {
      amount: undefined,
      payment_method_id: paymentMethods[0]?.id,
      movement_date: defaultDatetimeLocalValue(),
      notes: "",
    },
  });

  function applyAmount(amount: number) {
    form.setValue("amount", amount, { shouldValidate: true, shouldDirty: true });
  }

  function onSubmit(values: AdvanceFormValues) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createAdvance(eventId, values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar adelanto</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <MovementFields
            register={form.register}
            control={form.control}
            errors={form.formState.errors}
            paymentMethods={paymentMethods}
            amountPresets={{
              balanceDue,
              onSelect: applyAmount,
            }}
          />
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          <DialogFooter className="border-t-0 bg-transparent p-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateRefundDialog({
  eventId,
  paymentMethods,
  onClose,
}: {
  eventId: string;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      amount: undefined,
      payment_method_id: paymentMethods[0]?.id,
      movement_date: defaultDatetimeLocalValue(),
      notes: "",
    },
  });

  function onSubmit(values: RefundFormValues) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createRefund(eventId, values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar devolución</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <MovementFields
            register={form.register}
            control={form.control}
            errors={form.formState.errors}
            paymentMethods={paymentMethods}
          />
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          <DialogFooter className="border-t-0 bg-transparent p-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditMovementDialog({
  movement,
  paymentMethods,
  onClose,
}: {
  movement: EventFinancialMovementWithRelations;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<UpdateMovementFormValues>({
    resolver: zodResolver(updateMovementSchema),
    defaultValues: {
      movement_type: movement.movement_type,
      amount: Number(movement.amount),
      payment_method_id: movement.payment_method_id,
      movement_date: toDatetimeLocalValue(movement.movement_date),
      notes: movement.notes ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      movement_type: movement.movement_type,
      amount: Number(movement.amount),
      payment_method_id: movement.payment_method_id,
      movement_date: toDatetimeLocalValue(movement.movement_date),
      notes: movement.notes ?? "",
    });
  }, [movement, form]);

  function onSubmit(values: UpdateMovementFormValues) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await updateMovement(movement.id, values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <MovementFields
            register={form.register as unknown as UseFormRegister<SharedMovementValues>}
            control={form.control as unknown as Control<SharedMovementValues>}
            errors={form.formState.errors as FieldErrors<SharedMovementValues>}
            paymentMethods={paymentMethods}
            showTypeField
            movementTypeControl={form.control}
          />
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          <DialogFooter className="border-t-0 bg-transparent p-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MovementFormDialog({
  mode,
  eventId,
  balanceDue,
  paymentMethods,
  onClose,
}: {
  mode: Exclude<FormMode, { kind: "closed" }>;
  eventId: string;
  balanceDue: number;
  paymentMethods: PaymentMethod[];
  onClose: () => void;
}) {
  if (mode.kind === "edit") {
    return (
      <EditMovementDialog
        movement={mode.movement}
        paymentMethods={paymentMethods}
        onClose={onClose}
      />
    );
  }

  if (mode.kind === "refund") {
    return (
      <CreateRefundDialog
        eventId={eventId}
        paymentMethods={paymentMethods}
        onClose={onClose}
      />
    );
  }

  return (
    <CreateAdvanceDialog
      eventId={eventId}
      balanceDue={balanceDue}
      paymentMethods={paymentMethods}
      onClose={onClose}
    />
  );
}

export function EventPaymentsPanel({
  eventId,
  eventPhase,
  eventStatusCode,
  summary,
  movements,
  paymentMethods,
}: EventPaymentsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [actionError, setActionError] = useState<string | null>(null);

  const access = getPaymentAccess(
    eventPhase,
    eventStatusCode,
    summary.paymentStatus,
  );
  const statusLabel = PAYMENT_STATUS_LABELS[summary.paymentStatus];
  const isPaid = summary.paymentStatus === PAYMENT_STATUS.PAID;

  function openAdvance() {
    setFormMode({ kind: "advance" });
  }

  function openRefund() {
    setFormMode({ kind: "refund" });
  }

  function openEdit(movement: EventFinancialMovementWithRelations) {
    setFormMode({ kind: "edit", movement });
  }

  function handleDelete(movement: EventFinancialMovementWithRelations) {
    const label = FINANCIAL_MOVEMENT_TYPE_LABELS[movement.movement_type].toLowerCase();
    if (!confirm(`¿Eliminar este ${label} de ${formatCurrency(Number(movement.amount))}?`)) {
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const result = await deleteMovement(movement.id);
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const dialogMode = formMode.kind === "closed" ? null : formMode;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Pagos</CardTitle>
            <CardDescription>
              Adelantos y devoluciones registrados contra el total de la cotización.
            </CardDescription>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
              isPaid
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
            )}
          >
            {statusLabel}
          </span>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total cotización</p>
              <p className="font-semibold">{formatCurrency(summary.quoteTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Adelantos</p>
              <p className="font-semibold">{formatCurrency(summary.totalAdvances)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Devoluciones</p>
              <p className="font-semibold">{formatCurrency(summary.totalRefunds)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo pendiente</p>
              <p className="text-lg font-semibold">
                {formatCurrency(summary.balanceDue)}
              </p>
            </div>
          </div>

          {summary.overpaidAmount > 0 ? (
            <p className="text-sm text-muted-foreground">
              Pagado en exceso: {formatCurrency(summary.overpaidAmount)}
            </p>
          ) : null}

          {access.movementsLocked ? (
            <p className="text-sm text-muted-foreground">
              Este evento está cerrado. Los movimientos de pago ya no se pueden modificar.
            </p>
          ) : isPaid ? (
            <p className="text-sm text-muted-foreground">
              La factura está cancelada. Solo puedes registrar devoluciones si es necesario.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="add"
              size="sm"
              disabled={access.advanceDisabled}
              onClick={openAdvance}
            >
              + Adelanto
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={access.refundDisabled}
              onClick={openRefund}
            >
              + Devolución
            </Button>
          </div>

          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay movimientos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="w-[120px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatMovementDate(movement.movement_date)}
                      </TableCell>
                      <TableCell>
                        {FINANCIAL_MOVEMENT_TYPE_LABELS[movement.movement_type]}
                      </TableCell>
                      <TableCell>{movement.payment_methods.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(movement.amount))}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-muted-foreground">
                        {movement.notes?.trim() || "—"}
                      </TableCell>
                      <TableCell>
                        {!access.editDisabled ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(movement)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleDelete(movement)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {actionError ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
        </CardContent>
      </Card>

      {dialogMode ? (
        <MovementFormDialog
          mode={dialogMode}
          eventId={eventId}
          balanceDue={summary.balanceDue}
          paymentMethods={paymentMethods}
          onClose={() => setFormMode({ kind: "closed" })}
        />
      ) : null}
    </>
  );
}
