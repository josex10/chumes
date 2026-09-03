"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { LOGISTICS_TAB } from "@/lib/logistics/constants";
import type { LogisticsQueueItem } from "@/lib/logistics/types";
import {
  formatPhoneNumber,
  getCustomerWhatsAppUrl,
} from "@/lib/customers/phone";
import type { BankAccount, PaymentMethod } from "@/lib/supabase/types";
import { ConfirmDeliveryDialog } from "@/components/logistics/confirm-delivery-dialog";
import { ConfirmPickupDialog } from "@/components/logistics/confirm-pickup-dialog";
import { DeliveryFinanceBlock } from "@/components/logistics/delivery-finance-block";
import { PackingList } from "@/components/logistics/packing-list";
import { PrepChecklist } from "@/components/logistics/prep-checklist";
import { ReadyForInstallBadge } from "@/components/logistics/ready-for-install-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogisticsEventDetailProps = {
  item: LogisticsQueueItem;
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
};

export function LogisticsEventDetail({
  item,
  paymentMethods,
  bankAccounts,
}: LogisticsEventDetailProps) {
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const { event, tab } = item;
  const isWarehouse = tab === LOGISTICS_TAB.WAREHOUSE;
  const isDelivery = tab === LOGISTICS_TAB.DELIVERY;
  const isPickup = tab === LOGISTICS_TAB.PICKUP;
  const whatsappUrl = item.phone
    ? getCustomerWhatsAppUrl(
        item.phone,
        `Hola, te escribo de Chumes por ${event.title}.`,
      )
    : null;

  return (
    <>
      <div className="flex flex-col gap-4">
        {item.readyForInstall ? <ReadyForInstallBadge /> : null}
        {item.mapsUrl ? (
          <a
            href={item.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-2 text-sm font-medium text-primary hover:underline"
          >
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{item.locationLabel ?? "Ver en Google Maps"}</span>
            <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-70" />
          </a>
        ) : (
          <p className="inline-flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            Sin lugar registrado
          </p>
        )}

        {item.phone ? (
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:+506${item.phone.replace(/\D/g, "").slice(-8)}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "min-h-10",
              )}
            >
              <Phone className="size-3.5" />
              {formatPhoneNumber(item.phone)}
            </a>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "min-h-10",
                )}
              >
                <MessageCircle className="size-3.5" />
                WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}

        {isDelivery ? (
          <DeliveryFinanceBlock summary={item.paymentSummary} />
        ) : null}

        {isPickup &&
        item.paymentSummary &&
        item.paymentSummary.balanceDue > 0 ? (
          <DeliveryFinanceBlock summary={item.paymentSummary} compact />
        ) : null}

        {item.hasShortage && isWarehouse ? (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            Hay ítems con stock insuficiente. Validá inventario antes de empacar.
          </p>
        ) : null}

        <PackingList
          lines={item.packingList}
          checkable={!isWarehouse}
          showStock={isWarehouse}
        />

        {isWarehouse ? (
          <PrepChecklist eventId={event.id} logistics={item.logistics} />
        ) : null}

        {isDelivery || isPickup ? (
          <div className="flex justify-end">
            {isDelivery ? (
              <Button
                type="button"
                variant="commit"
                className="min-h-10 w-full sm:w-auto"
                onClick={() => setDeliveryOpen(true)}
              >
                Confirmar entrega
              </Button>
            ) : null}
            {isPickup ? (
              <Button
                type="button"
                variant="commit"
                className="min-h-10 w-full sm:w-auto"
                onClick={() => setPickupOpen(true)}
              >
                Confirmar retiro
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isDelivery ? (
        <ConfirmDeliveryDialog
          open={deliveryOpen}
          onOpenChange={setDeliveryOpen}
          eventId={event.id}
          eventTitle={event.title}
          pickupDate={event.pickup_date}
          balanceDue={item.paymentSummary?.balanceDue ?? 0}
          paymentMethods={paymentMethods}
          bankAccounts={bankAccounts}
        />
      ) : null}

      {isPickup ? (
        <ConfirmPickupDialog
          open={pickupOpen}
          onOpenChange={setPickupOpen}
          eventId={event.id}
          eventTitle={event.title}
        />
      ) : null}
    </>
  );
}
