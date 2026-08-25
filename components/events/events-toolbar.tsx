"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { UserRound, X } from "lucide-react";
import { parseEventsPipelineTab } from "@/lib/events/constants";
import { buildEventsHref } from "@/lib/events/events-url";
import { CustomerCombobox } from "@/components/quotes/customer-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { CustomerWithRelations } from "@/lib/supabase/types";

type EventsToolbarProps = {
  customerId?: string;
  defaultCustomer?: CustomerWithRelations | null;
};

export function EventsToolbar({ customerId, defaultCustomer }: EventsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateCustomerFilter(nextCustomerId: string) {
    router.push(
      buildEventsHref({
        tab: parseEventsPipelineTab(searchParams.get("tab") ?? undefined),
        customerId: nextCustomerId || undefined,
      }),
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid w-full max-w-md gap-2">
            <Label
              htmlFor="events-customer-filter"
              className="inline-flex h-5 items-center gap-1.5"
            >
              <UserRound className="size-3.5" />
              Cliente
            </Label>
            <CustomerCombobox
              value={customerId}
              onValueChange={updateCustomerFilter}
              defaultCustomer={defaultCustomer ?? undefined}
              id="events-customer-filter"
            />
          </div>
          {customerId ? (
            <Button
              type="button"
              variant="outline"
              className="inline-flex h-8 items-center gap-1.5"
              onClick={() => updateCustomerFilter("")}
            >
              <X className="size-4" />
              Limpiar
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
