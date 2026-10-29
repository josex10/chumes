"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInvestment, updateInvestment } from "@/lib/investments/actions";
import {
  investmentFormSchema,
  type InvestmentFormValues,
} from "@/lib/investments/schema";
import { todayInCostaRica } from "@/lib/follow-ups/calendar";
import type { InvestmentCreditor } from "@/lib/supabase/types";

type InvestmentFormProps = {
  creditors: InvestmentCreditor[];
  initialValues?: InvestmentFormValues;
  investmentId?: string;
  onSuccess: () => void;
};

export function InvestmentForm({
  creditors,
  initialValues,
  investmentId,
  onSuccess,
}: InvestmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: initialValues ?? {
      creditor_id: undefined,
      title: "",
      amount: undefined,
      invested_on: todayInCostaRica(),
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
  const creditorId = useWatch({ control, name: "creditor_id" });

  function submit(values: InvestmentFormValues) {
    setSubmitError(null);
    startTransition(async () => {
      const result = investmentId
        ? await updateInvestment(investmentId, values)
        : await createInvestment(values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      router.refresh();
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="investment-creditor">Quién invirtió</Label>
        <select
          id="investment-creditor"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={creditorId ? String(creditorId) : ""}
          onChange={(event) => {
            const next = Number(event.target.value);
            setValue("creditor_id", next, { shouldValidate: true, shouldDirty: true });
          }}
        >
          <option value="">Selecciona</option>
          {creditors.map((creditor) => (
            <option key={creditor.id} value={creditor.id}>
              {creditor.name}
              {creditor.is_active ? "" : " (inactiva)"}
            </option>
          ))}
        </select>
        {errors.creditor_id ? (
          <p className="text-sm text-destructive">{errors.creditor_id.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="investment-title">Qué se compró</Label>
        <Input id="investment-title" placeholder="50 sillas" {...register("title")} />
        {errors.title ? (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="investment-amount">Monto original</Label>
          <Input
            id="investment-amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount ? (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="investment-date">Fecha</Label>
          <Input id="investment-date" type="date" {...register("invested_on")} />
          {errors.invested_on ? (
            <p className="text-sm text-destructive">{errors.invested_on.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investment-notes">
          Nota <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea id="investment-notes" {...register("notes")} />
      </div>

      {investmentId ? (
        <p className="text-xs text-muted-foreground">
          El monto no puede bajar de lo ya abonado. Si lo subes, la inversión vuelve a quedar pendiente.
        </p>
      ) : null}

      {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancelar
        </DialogClose>
        <Button type="submit" variant="commit" disabled={isPending || creditors.length === 0}>
          {isPending ? "Guardando..." : investmentId ? "Guardar cambios" : "Crear inversión"}
        </Button>
      </DialogFooter>
    </form>
  );
}
