"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";
import { CustomerCombobox } from "@/components/quotes/customer-combobox";
import { QuickCustomerModal } from "@/components/quotes/quick-customer-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type EventCustomerPickerProps = {
  customerTypes: CustomerType[];
  value: string;
  onChange: (customerId: string) => void;
  defaultCustomer?: CustomerWithRelations;
  onCustomerCreated?: (customer: CustomerWithRelations) => void;
};

export function EventCustomerPicker({
  customerTypes,
  value,
  onChange,
  defaultCustomer,
  onCustomerCreated,
}: EventCustomerPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [createdCustomer, setCreatedCustomer] = useState<
    CustomerWithRelations | undefined
  >();

  const activeCustomer = createdCustomer ?? defaultCustomer;

  function handleCustomerCreated(customer: CustomerWithRelations) {
    setCreatedCustomer(customer);
    onChange(customer.id);
    onCustomerCreated?.(customer);
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="customer_id">
          Cliente <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <CustomerCombobox
              id="customer_id"
              value={value || undefined}
              defaultCustomer={activeCustomer}
              onValueChange={onChange}
              onCreateNew={() => setModalOpen(true)}
            />
          </div>
          <Button
            type="button"
            variant="add"
            size="icon"
            aria-label="Nuevo cliente"
            onClick={() => setModalOpen(true)}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <QuickCustomerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        customerTypes={customerTypes}
        onCreated={handleCustomerCreated}
      />
    </>
  );
}
