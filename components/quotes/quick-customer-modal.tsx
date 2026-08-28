"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { createCustomerAndFetch } from "@/lib/customers/actions";
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
import {
  CustomerFormFields,
  getEmptyCustomerFormValues,
} from "@/components/customers/customer-form-fields";

type QuickCustomerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerTypes: CustomerType[];
  onCreated: (customer: CustomerWithRelations) => void;
};

export function QuickCustomerModal({
  open,
  onOpenChange,
  customerTypes,
  onCreated,
}: QuickCustomerModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: getEmptyCustomerFormValues(customerTypes),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) {
      reset(getEmptyCustomerFormValues(customerTypes));
    }
  }, [open, reset, customerTypes]);

  function onSubmit(values: CustomerFormValues) {
    startTransition(async () => {
      const result = await createCustomerAndFetch(values);
      if (!result.success || !result.customer) {
        form.setError("root", {
          message: result.success
            ? "No se pudo cargar el cliente."
            : result.error,
        });
        return;
      }

      onCreated(result.customer);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,40rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-4 text-action-add" />
            Nuevo cliente
          </DialogTitle>
          <DialogDescription>
            Nombre y teléfono bastan para crearlo sin salir de aquí.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CustomerFormFields
            customerTypes={customerTypes}
            register={register}
            control={control}
            errors={errors}
            idPrefix="quick-customer"
            resetKey={open}
            notesRows={2}
          />

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
              {isPending ? "Creando..." : "Crear cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
