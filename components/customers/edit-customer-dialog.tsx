"use client";

import { useEffect, useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { updateCustomer } from "@/lib/customers/actions";
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
  getCustomerFormValues,
  hasAdvancedCustomerFields,
} from "@/components/customers/customer-form-fields";

type EditCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerWithRelations;
  customerTypes: CustomerType[];
};

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
    defaultValues: getCustomerFormValues(customer),
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
      reset(getCustomerFormValues(customer));
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
      <DialogContent className="max-h-[min(90vh,40rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-muted-foreground" />
            Editar cliente
          </DialogTitle>
          <DialogDescription>
            Actualice los datos del cliente sin salir del evento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CustomerFormFields
            customerTypes={customerTypes}
            register={register}
            control={control}
            errors={errors}
            idPrefix={fieldId}
            defaultAdvancedOpen={hasAdvancedCustomerFields(customer)}
            resetKey={`${open}-${customer.id}`}
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
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
