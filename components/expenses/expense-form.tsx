"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChoiceChips } from "@/components/expenses/choice-chips";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toDatetimeLocalValue } from "@/lib/events/format-dates";
import {
  buildExpenseFormSchema,
  type ExpenseFormValues,
} from "@/lib/expenses/schema";
import type { CompanyPaymentMethod, ExpenseCategory } from "@/lib/supabase/types";

type ExpenseFormProps = {
  categories: ExpenseCategory[];
  methods: CompanyPaymentMethod[];
  initialValues?: ExpenseFormValues;
  submitLabel: string;
  onSubmit: (values: ExpenseFormValues) => Promise<
    { success: true } | { success: false; error: string }
  >;
  onSuccess: () => void;
};

export function ExpenseForm({
  categories,
  methods,
  initialValues,
  submitLabel,
  onSubmit,
  onSuccess,
}: ExpenseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const schema = useMemo(() => buildExpenseFormSchema(categories), [categories]);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      category_id: undefined,
      payment_method_id: undefined,
      amount: undefined,
      spent_at: toDatetimeLocalValue(new Date().toISOString()),
      detail: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = form;

  const categoryId = useWatch({ control, name: "category_id" });
  const methodId = useWatch({ control, name: "payment_method_id" });
  const requiresDetail = categories.find((category) => category.id === categoryId)
    ?.requires_detail;

  function submit(values: ExpenseFormValues) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await onSubmit(values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      router.refresh();
      onSuccess();
    });
  }

  const canSubmit = categories.length > 0 && methods.length > 0;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <ChoiceChips
        label="Categoría"
        options={categories.map((category) => ({
          id: category.id,
          label: category.name,
        }))}
        value={categoryId}
        onChange={(id) =>
          setValue("category_id", id, { shouldValidate: true, shouldDirty: true })
        }
        error={errors.category_id?.message}
        emptyMessage="No hay categorías activas."
      />

      <ChoiceChips
        label="Cómo se pagó"
        options={methods.map((method) => ({ id: method.id, label: method.name }))}
        value={methodId}
        onChange={(id) =>
          setValue("payment_method_id", id, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        error={errors.payment_method_id?.message}
        emptyMessage="Agrega un método de pago en Gastos."
      />

      <div className="space-y-2">
        <Label htmlFor="expense-amount">Monto</Label>
        <Input
          id="expense-amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount ? (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-spent-at">Fecha y hora del gasto</Label>
        <Input
          id="expense-spent-at"
          type="datetime-local"
          {...register("spent_at")}
        />
        <p className="text-xs text-muted-foreground">
          Viene en este momento. Si no hubo internet, cámbiala al día en que se hizo el gasto.
        </p>
        {errors.spent_at ? (
          <p className="text-sm text-destructive">{errors.spent_at.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expense-detail">
          Detalle{" "}
          {requiresDetail ? (
            <span className="text-destructive">*</span>
          ) : (
            <span className="font-normal text-muted-foreground">(opcional)</span>
          )}
        </Label>
        <Textarea
          id="expense-detail"
          placeholder={requiresDetail ? "Qué se compró" : "Nota corta, si hace falta"}
          {...register("detail")}
        />
        {errors.detail ? (
          <p className="text-sm text-destructive">{errors.detail.message}</p>
        ) : null}
      </div>

      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancelar
        </DialogClose>
        <Button type="submit" variant="commit" disabled={isPending || !canSubmit}>
          {isPending ? "Guardando..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
