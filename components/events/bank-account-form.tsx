"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createBankAccount,
  updateBankAccount,
} from "@/lib/bank-accounts/actions";
import {
  BANK_ACCOUNT_KIND,
  BANK_ACCOUNT_KIND_LABELS,
} from "@/lib/bank-accounts/constants";
import {
  bankAccountFormSchema,
  type BankAccountFormValues,
} from "@/lib/bank-accounts/schema";
import type { BankAccount } from "@/lib/supabase/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BankAccountFormProps = {
  account?: BankAccount;
};

const KIND_ITEMS = [
  {
    value: BANK_ACCOUNT_KIND.OPERATING,
    label: BANK_ACCOUNT_KIND_LABELS.OPERATING,
  },
  {
    value: BANK_ACCOUNT_KIND.ADVANCES,
    label: BANK_ACCOUNT_KIND_LABELS.ADVANCES,
  },
];

export function BankAccountForm({ account }: BankAccountFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(account);

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: {
      name: account?.name ?? "",
      bank_name: account?.bank_name ?? "",
      account_number: account?.account_number ?? "",
      kind: account?.kind ?? BANK_ACCOUNT_KIND.OPERATING,
      is_active: account?.is_active ?? true,
      sort_order: account?.sort_order ?? 0,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  function onSubmit(values: BankAccountFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateBankAccount(account!.id, values)
        : await createBankAccount(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      router.push("/events/settings/accounts");
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar cuenta" : "Nueva cuenta"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza el nombre, banco o número de la cuenta."
            : "Registra una cuenta para trazar a dónde entra cada adelanto o de dónde sale una devolución."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej. Operativa BAC"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">
              Entidad bancaria <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bank_name"
              placeholder="Ej. BAC Credomatic"
              {...register("bank_name")}
            />
            {errors.bank_name && (
              <p className="text-sm text-destructive">{errors.bank_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">
              Número de cuenta <span className="text-destructive">*</span>
            </Label>
            <Input
              id="account_number"
              placeholder="Ej. CR12 0123 4567"
              {...register("account_number")}
            />
            {errors.account_number && (
              <p className="text-sm text-destructive">
                {errors.account_number.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kind">
              Tipo <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="kind"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={KIND_ITEMS}
                >
                  <SelectTrigger id="kind" className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BANK_ACCOUNT_KIND.OPERATING}>
                      {BANK_ACCOUNT_KIND_LABELS.OPERATING}
                    </SelectItem>
                    <SelectItem value={BANK_ACCOUNT_KIND.ADVANCES}>
                      {BANK_ACCOUNT_KIND_LABELS.ADVANCES}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.kind && (
              <p className="text-sm text-destructive">{errors.kind.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Orden</Label>
            <Input id="sort_order" type="number" min={0} {...register("sort_order")} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_active")} />
            Activa
          </label>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear cuenta"}
            </Button>
            <Link
              href="/events/settings/accounts"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
