"use client";

import { useEffect, useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCustomer } from "@/lib/customers/actions";
import {
  formatPhoneNumber,
  PHONE_MASK_PLACEHOLDER,
} from "@/lib/customers/phone";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/lib/customers/schema";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EditCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerWithRelations;
  customerTypes: CustomerType[];
};

function getDefaultValues(customer: CustomerWithRelations): CustomerFormValues {
  return {
    name: customer.name,
    identification: customer.identification ?? "",
    customer_type_id: customer.customer_type_id,
    email: customer.email ?? "",
    phone: formatPhoneNumber(customer.phone ?? ""),
    notes: customer.notes ?? "",
  };
}

export function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
  customerTypes,
}: EditCustomerDialogProps) {
  const router = useRouter();
  const fieldId = useId();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: getDefaultValues(customer),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(customer));
    }
  }, [open, customer, reset]);

  function onSubmit(values: CustomerFormValues) {
    startTransition(async () => {
      const result = await updateCustomer(customer.id, values);
      if (!result.success) {
        form.setError("root", {
          message: "No se pudo actualizar el cliente.",
        });
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Actualice los datos del cliente sin salir del evento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-name`}>Nombre *</Label>
            <Input id={`${fieldId}-name`} {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-phone`}>Teléfono *</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  id={`${fieldId}-phone`}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={PHONE_MASK_PLACEHOLDER}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(formatPhoneNumber(event.target.value))
                  }
                />
              )}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-type`}>Tipo de cliente *</Label>
            <Controller
              control={control}
              name="customer_type_id"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                  items={customerTypes.map((type) => ({
                    value: String(type.id),
                    label: type.name,
                  }))}
                >
                  <SelectTrigger id={`${fieldId}-type`} className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customer_type_id && (
              <p className="text-sm text-destructive">
                {errors.customer_type_id.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-identification`}>Identificación</Label>
              <Input
                id={`${fieldId}-identification`}
                {...register("identification")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-email`}>Email</Label>
              <Input
                id={`${fieldId}-email`}
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-notes`}>Notas</Label>
            <Textarea id={`${fieldId}-notes`} rows={2} {...register("notes")} />
          </div>

          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
