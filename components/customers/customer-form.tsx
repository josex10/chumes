"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Pencil, UserPlus } from "lucide-react";
import { createCustomer, updateCustomer } from "@/lib/customers/actions";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/lib/customers/schema";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CustomerFormFields,
  getCustomerFormValues,
  getEmptyCustomerFormValues,
  hasAdvancedCustomerFields,
} from "@/components/customers/customer-form-fields";

type CustomerFormProps = {
  customerTypes: CustomerType[];
  customer?: CustomerWithRelations;
};

export function CustomerForm({ customerTypes, customer }: CustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(customer);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer
      ? getCustomerFormValues(customer)
      : getEmptyCustomerFormValues(customerTypes),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  function onSubmit(values: CustomerFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateCustomer(customer!.id, values)
        : await createCustomer(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      router.push("/customers");
      router.refresh();
    });
  }

  const HeaderIcon = isEditing ? Pencil : UserPlus;

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-action-add-subtle text-action-add">
            <HeaderIcon className="size-5" />
          </div>
          <div className="space-y-1">
            <CardTitle>
              {isEditing ? "Editar cliente" : "Nuevo cliente"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Actualice los datos del cliente."
                : "Nombre y teléfono bastan para crearlo. El resto queda en opciones avanzadas."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CustomerFormFields
            customerTypes={customerTypes}
            register={register}
            control={control}
            errors={errors}
            defaultAdvancedOpen={
              customer ? hasAdvancedCustomerFields(customer) : false
            }
            notesRows={3}
          />

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/customers"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Cancelar
            </Link>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
