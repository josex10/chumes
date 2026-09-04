"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRound, X } from "lucide-react";
import { parseEventsPipelineTab } from "@/lib/events/constants";
import { buildEventsHref } from "@/lib/events/events-url";
import { CustomerCombobox } from "@/components/quotes/customer-combobox";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { CustomerWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventsToolbarProps = {
  customerId?: string;
  source?: string;
  defaultCustomer?: CustomerWithRelations | null;
};

export function EventsToolbar({
  customerId,
  source,
  defaultCustomer,
}: EventsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseEventsPipelineTab(searchParams.get("tab") ?? undefined);

  function updateCustomerFilter(nextCustomerId: string) {
    router.push(
      buildEventsHref({
        tab,
        customerId: nextCustomerId || undefined,
        source,
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
          <Link
            href={buildEventsHref({
              tab,
              customerId,
              source: source === "WEBSITE" ? undefined : "WEBSITE",
            })}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex h-8 items-center gap-1.5",
              source === "WEBSITE" &&
                "border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-300",
            )}
          >
            Sitio web
          </Link>
          {customerId || source ? (
            <Button
              type="button"
              variant="outline"
              className="inline-flex h-8 items-center gap-1.5"
              onClick={() =>
                router.push(buildEventsHref({ tab }))
              }
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
