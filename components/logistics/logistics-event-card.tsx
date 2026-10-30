"use client";

import { useState } from "react";
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
import { PAYMENT_STATUS } from "@/lib/payments/constants";
import { formatCurrency } from "@/lib/quotes/format";
import type { BankAccount, PaymentMethod, PaymentSummary } from "@/lib/supabase/types";
import { ConfirmDeliveryDialog } from "@/components/logistics/confirm-delivery-dialog";
import { ConfirmPickupDialog } from "@/components/logistics/confirm-pickup-dialog";
import { DeliveryAssignees } from "@/components/logistics/delivery-assignees";
import { HoursConfirmedCheck } from "@/components/logistics/hours-confirmed-check";
import { PackingList } from "@/components/logistics/packing-list";
import { ReadyPackedButton } from "@/components/logistics/ready-packed-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogisticsEventDetailProps = {
  item: LogisticsQueueItem;
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
};

function BalanceChip({ summary }: { summary: PaymentSummary | null }) {
  if (!summary) return null;
  const isPaid = summary.paymentStatus === PAYMENT_STATUS.PAID;

  return (
    <span
      className={cn(
        "inline-flex h-10 items-center rounded-full border px-3.5 text-sm font-medium",
        isPaid
          ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
          : "border-amber-600/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
      )}
    >
      {isPaid ? "Pagado" : `Cobrar ${formatCurrency(summary.balanceDue)}`}
    </span>
  );
}

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
  const showReady = isWarehouse || isDelivery;
  const showBalance = isDelivery || (isPickup && (item.paymentSummary?.balanceDue ?? 0) > 0);
  const whatsappUrl = item.phone
    ? getCustomerWhatsAppUrl(
        item.phone,
        `Hola, te escribo de Chumes por ${event.title}.`,
      )
    : null;

  return (
    <>
      <div className="flex flex-col gap-4">
        <HoursConfirmedCheck
          eventId={event.id}
          deliveryDate={event.delivery_date}
          logistics={item.logistics}
          leading={
            showReady ? (
              <ReadyPackedButton eventId={event.id} logistics={item.logistics} />
            ) : null
          }
          trailing={
            <>
              {showBalance ? <BalanceChip summary={item.paymentSummary} /> : null}
              {item.phone ? (
                <a
                  href={`tel:+506${item.phone.replace(/\D/g, "").slice(-8)}`}
                  aria-label={formatPhoneNumber(item.phone)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "size-10 rounded-full",
                  )}
                >
                  <Phone className="size-4" />
                </a>
              ) : null}
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "size-10 rounded-full",
                  )}
                >
                  <MessageCircle className="size-4" />
                </a>
              ) : null}
            </>
          }
          aside={<DeliveryAssignees eventId={event.id} logistics={item.logistics} />}
        />

        {item.mapsUrl ? (
          <a
            href={item.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <MapPin className="size-4 shrink-0" />
            <span>{item.locationLabel ?? "Ver en Google Maps"}</span>
            <ExternalLink className="size-3.5 shrink-0 opacity-70" />
          </a>
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            Sin lugar registrado
          </p>
        )}

        {item.hasShortage && isWarehouse ? (
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Hay ítems con stock insuficiente.
          </p>
        ) : null}

        <PackingList
          lines={item.packingList}
          checkable={!isWarehouse}
          showStock={isWarehouse}
        />

        {isDelivery || isPickup ? (
          <div className="flex justify-end">
            {isDelivery ? (
              <Button
                type="button"
                variant="commit"
                className="min-h-10 rounded-full px-5"
                onClick={() => setDeliveryOpen(true)}
              >
                Confirmar entrega
              </Button>
            ) : null}
            {isPickup ? (
              <Button
                type="button"
                variant="commit"
                className="min-h-10 rounded-full px-5"
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
