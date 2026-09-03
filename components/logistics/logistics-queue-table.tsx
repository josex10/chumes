"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { LogisticsEventDetail } from "@/components/logistics/logistics-event-card";
import { ReadyForInstallBadge } from "@/components/logistics/ready-for-install-badge";
import { LOGISTICS_TAB } from "@/lib/logistics/constants";
import { formatLogisticsTime } from "@/lib/logistics/schedule";
import type { LogisticsQueueItem } from "@/lib/logistics/types";
import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from "@/lib/payments/constants";
import { formatCurrency } from "@/lib/quotes/format";
import type { BankAccount, PaymentMethod } from "@/lib/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type LogisticsQueueTableProps = {
  items: LogisticsQueueItem[];
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
};

function CollectCell({ item }: { item: LogisticsQueueItem }) {
  const summary = item.paymentSummary;
  if (!summary) return <span className="text-muted-foreground">—</span>;
  if (summary.paymentStatus === PAYMENT_STATUS.PAID) {
    return (
      <span className="text-emerald-700 dark:text-emerald-300">
        {PAYMENT_STATUS_LABELS.PAID}
      </span>
    );
  }
  return (
    <span className="font-medium tabular-nums">
      {formatCurrency(summary.balanceDue)}
    </span>
  );
}

export function LogisticsQueueTable({
  items,
  paymentMethods,
  bankAccounts,
}: LogisticsQueueTableProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const tab = items[0]?.tab ?? LOGISTICS_TAB.WAREHOUSE;
  const isWarehouse = tab === LOGISTICS_TAB.WAREHOUSE;
  const isDelivery = tab === LOGISTICS_TAB.DELIVERY;
  const showLocation = !isWarehouse;
  const colSpan =
    4 + (isWarehouse ? 2 : 0) + (showLocation ? 1 : 0) + (isDelivery ? 1 : 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Hora</TableHead>
          <TableHead>Evento</TableHead>
          <TableHead>Cliente</TableHead>
          {isWarehouse ? <TableHead>Ítems</TableHead> : null}
          {isWarehouse ? <TableHead>Alistado</TableHead> : null}
          {showLocation ? <TableHead>Lugar</TableHead> : null}
          {isDelivery ? <TableHead>Cobrar</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isOpen = openId === item.event.id;
          const timeLabel = formatLogisticsTime(item.sortAt) ?? "—";

          return (
            <Fragment key={item.event.id}>
              <TableRow
                className="cursor-pointer"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenId((current) =>
                    current === item.event.id ? null : item.event.id,
                  )
                }
              >
                <TableCell className="w-10">
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </TableCell>
                <TableCell className="tabular-nums font-medium">
                  {timeLabel}
                </TableCell>
                <TableCell className="max-w-[18rem] font-medium">
                  <div className="flex min-w-0 flex-col items-start gap-1">
                    <Link
                      href={`/events/${item.event.id}`}
                      className="truncate hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {item.event.title}
                    </Link>
                    {item.readyForInstall ? <ReadyForInstallBadge /> : null}
                  </div>
                </TableCell>
                <TableCell className="max-w-[12rem] truncate text-muted-foreground">
                  {item.event.customers.name}
                </TableCell>
                {isWarehouse ? (
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      {item.packingList.length}
                      {item.hasShortage ? (
                        <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-300" />
                      ) : null}
                    </span>
                  </TableCell>
                ) : null}
                {isWarehouse ? (
                  <TableCell>
                    <span
                      className={cn(
                        "tabular-nums",
                        item.readyForInstall
                          ? "font-medium text-emerald-700 dark:text-emerald-300"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.readyForInstall
                        ? "Lista"
                        : `${item.prepCompleted}/${item.prepTotal}`}
                    </span>
                  </TableCell>
                ) : null}
                {showLocation ? (
                  <TableCell>
                    <span className="block max-w-[14rem] truncate text-muted-foreground">
                      {item.locationLabel ?? "Sin lugar"}
                    </span>
                  </TableCell>
                ) : null}
                {isDelivery ? (
                  <TableCell>
                    <CollectCell item={item} />
                  </TableCell>
                ) : null}
              </TableRow>
              {isOpen ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={colSpan} className="bg-muted/20 p-4">
                    <LogisticsEventDetail
                      item={item}
                      paymentMethods={paymentMethods}
                      bankAccounts={bankAccounts}
                    />
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
