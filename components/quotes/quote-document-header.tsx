"use client";

import { useState } from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import type { QuoteFormValues } from "@/lib/quotes/schema";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";
import { CustomerCombobox } from "@/components/quotes/customer-combobox";
import { QuickCustomerModal } from "@/components/quotes/quick-customer-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuoteDocumentHeaderProps = {
  control: Control<QuoteFormValues>;
  register: UseFormRegister<QuoteFormValues>;
  errors: FieldErrors<QuoteFormValues>;
  customerTypes: CustomerType[];
  defaultCustomer?: CustomerWithRelations;
  onCustomerCreated: (customer: CustomerWithRelations) => void;
  isEditing: boolean;
  quoteNumber?: string;
  disabled?: boolean;
  hideTitle?: boolean;
};

export function QuoteDocumentHeader({
  control,
  register,
  errors,
  customerTypes,
  defaultCustomer,
  onCustomerCreated,
  isEditing,
  quoteNumber,
  disabled = false,
  hideTitle = false,
}: QuoteDocumentHeaderProps) {
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<
    CustomerWithRelations | undefined
  >();

  const activeCustomer = createdCustomer ?? defaultCustomer;

  function handleCustomerCreated(customer: CustomerWithRelations) {
    setCreatedCustomer(customer);
    onCustomerCreated(customer);
  }

  return (
    <>
      <div className="space-y-6 border-b border-border/60 pb-6">
        {!hideTitle && (
          <div>
            <h2 className="text-2xl font-medium tracking-tight">
              {isEditing ? "Editar cotización" : "Nueva cotización"}
            </h2>
            {quoteNumber ? (
              <p className="mt-1 text-sm text-muted-foreground">Nº {quoteNumber}</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Complete los datos del documento
              </p>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="customer_id">Cliente</Label>
            <Controller
              control={control}
              name="customer_id"
              render={({ field }) => (
                <CustomerCombobox
                  id="customer_id"
                  defaultCustomer={activeCustomer}
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={disabled}
                  onCreateNew={() => setCustomerModalOpen(true)}
                />
              )}
            />
            {errors.customer_id && (
              <p className="text-sm text-destructive">{errors.customer_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until">Válida hasta</Label>
            <Input id="valid_until" type="date" disabled={disabled} {...register("valid_until")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_location">Ubicación estimada</Label>
            <Input
              id="estimated_location"
              placeholder="Opcional"
              disabled={disabled}
              {...register("estimated_location")}
            />
          </div>
        </div>
      </div>

      <QuickCustomerModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        customerTypes={customerTypes}
        onCreated={handleCustomerCreated}
      />
    </>
  );
}
