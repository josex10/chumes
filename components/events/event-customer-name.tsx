"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventCustomerNameProps = {
  customer: CustomerWithRelations;
  customerTypes: CustomerType[];
  className?: string;
};

export function EventCustomerName({
  customer,
  customerTypes,
  className,
}: EventCustomerNameProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Editar cliente: ${customer.name}`}
        className={cn(
          "flex w-fit max-w-full items-center gap-1.5 text-left underline decoration-current/40 underline-offset-4 transition hover:decoration-current",
          className,
        )}
      >
        <span className="truncate">{customer.name}</span>
        <Pencil className="size-3.5 shrink-0 opacity-70" aria-hidden />
      </button>
      <EditCustomerDialog
        open={open}
        onOpenChange={setOpen}
        customer={customer}
        customerTypes={customerTypes}
      />
    </>
  );
}
