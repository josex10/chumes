"use client";

import { useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomerAndFetch } from "@/lib/customers/actions";
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
    defaultValues: {
      name: "",
      identification: "",
      customer_type_id: customerTypes[0]?.id,
      email: "",
      phone: "",
      notes: "",
    },
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
      reset({
        name: "",
        identification: "",
        customer_type_id: customerTypes[0]?.id,
        email: "",
        phone: "",
        notes: "",
      });
    }
  }, [open, reset, customerTypes]);

  function onSubmit(values: CustomerFormValues) {
    startTransition(async () => {
      const result = await createCustomerAndFetch(values);
      if (!result.success || !result.customer) {
        form.setError("root", {
          message: result.success ? "Could not load customer." : result.error,
        });
        return;
      }

      onCreated(result.customer);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>
            Agregue un cliente sin salir de la cotización.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-customer-name">Nombre *</Label>
            <Input id="quick-customer-name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-customer-phone">Teléfono *</Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  id="quick-customer-phone"
                  inputMode="numeric"
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
            <Label htmlFor="quick-customer-type">Tipo de cliente *</Label>
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
                  <SelectTrigger id="quick-customer-type" className="w-full">
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
              <Label htmlFor="quick-customer-identification">Identificación</Label>
              <Input id="quick-customer-identification" {...register("identification")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quick-customer-email">Email</Label>
              <Input id="quick-customer-email" type="email" {...register("email")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-customer-notes">Notas</Label>
            <Textarea id="quick-customer-notes" rows={2} {...register("notes")} />
          </div>

          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
