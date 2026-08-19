"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CustomerCombobox } from "@/components/quotes/customer-combobox";
import { Button } from "@/components/ui/button";
import type { CustomerWithRelations } from "@/lib/supabase/types";

type EventsToolbarProps = {
  customerId?: string;
  defaultCustomer?: CustomerWithRelations | null;
};

export function EventsToolbar({ customerId, defaultCustomer }: EventsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateCustomerFilter(nextCustomerId: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCustomerId) {
      params.set("customerId", nextCustomerId);
    } else {
      params.delete("customerId");
    }

    const next = params.toString();
    router.push(next ? `${pathname}?${next}` : pathname);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full max-w-md">
        <CustomerCombobox
          value={customerId}
          onValueChange={updateCustomerFilter}
          defaultCustomer={defaultCustomer ?? undefined}
          id="events-customer-filter"
        />
      </div>
      {customerId && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => updateCustomerFilter("")}
        >
          Limpiar filtro
        </Button>
      )}
    </div>
  );
}
