"use client";

import Link from "next/link";
import { PackingList } from "@/components/logistics/packing-list";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPhoneNumber } from "@/lib/customers/phone";
import {
  formatDeliveryPickupDateTime,
  formatEventDate,
} from "@/lib/events/format-dates";
import type { PlannerEvent } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

type PlannerEventDrawerProps = {
  event: PlannerEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd>{value?.trim() ? value : "Sin definir"}</dd>
    </div>
  );
}

export function PlannerEventDrawer({
  event,
  open,
  onOpenChange,
}: PlannerEventDrawerProps) {
  const phoneDigits = event?.phone?.replace(/\D/g, "").slice(-8) ?? "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {event ? (
          <>
            <SheetHeader>
              <SheetTitle>{event.title}</SheetTitle>
              <SheetDescription>{event.customerName}</SheetDescription>
              <span className="inline-flex w-fit rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {event.statusName}
              </span>
            </SheetHeader>

            <Link
              href={`/events/${event.id}`}
              className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
            >
              Abrir evento
            </Link>

            <dl className="flex flex-col gap-3">
              {event.phone ? (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Teléfono
                  </dt>
                  <dd>
                    {phoneDigits.length === 8 ? (
                      <a
                        href={`tel:+506${phoneDigits}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {formatPhoneNumber(event.phone)}
                      </a>
                    ) : (
                      event.phone
                    )}
                  </dd>
                </div>
              ) : null}
              <Detail
                label="Fecha del evento"
                value={formatEventDate(event.eventDate)}
              />
              <Detail
                label="Entrega"
                value={formatDeliveryPickupDateTime(event.deliveryDate)}
              />
              <Detail
                label="Retirada"
                value={formatDeliveryPickupDateTime(event.pickupDate)}
              />
              <Detail label="Lugar" value={event.location} />
            </dl>

            {event.notes ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Notas
                </p>
                <p className="whitespace-pre-wrap rounded-lg bg-muted/30 px-3 py-2">
                  {event.notes}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Qué llevar
              </p>
              <PackingList lines={event.packingList} showStock />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
