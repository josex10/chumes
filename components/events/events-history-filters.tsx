"use client";

import { useRouter } from "next/navigation";
import { Archive, CalendarRange, UserRound, X } from "lucide-react";
import {
  EVENT_ARCHIVE_TYPE,
  EVENTS_PIPELINE_TAB,
  type EventArchiveType,
} from "@/lib/events/constants";
import { buildEventsHref } from "@/lib/events/events-url";
import { CustomerCombobox } from "@/components/quotes/customer-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerWithRelations } from "@/lib/supabase/types";

const ALL_ARCHIVE_TYPES = "all";

type EventsHistoryFiltersProps = {
  customerId?: string;
  defaultCustomer?: CustomerWithRelations | null;
  dateFrom?: string;
  dateTo?: string;
  archiveType?: EventArchiveType;
};

export function EventsHistoryFilters({
  customerId,
  defaultCustomer,
  dateFrom,
  dateTo,
  archiveType,
}: EventsHistoryFiltersProps) {
  const router = useRouter();

  function navigate(next: {
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    archiveType?: EventArchiveType;
  }) {
    router.push(
      buildEventsHref({
        tab: EVENTS_PIPELINE_TAB.HISTORY,
        customerId: next.customerId,
        dateFrom: next.dateFrom,
        dateTo: next.dateTo,
        archiveType: next.archiveType,
      }),
    );
  }

  const hasFilters = Boolean(customerId || dateFrom || dateTo || archiveType);

  return (
    <Card>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
          <div className="grid gap-2">
            <Label
              htmlFor="history-customer"
              className="inline-flex h-5 items-center gap-1.5"
            >
              <UserRound className="size-3.5" />
              Cliente
            </Label>
            <CustomerCombobox
              value={customerId}
              onValueChange={(nextCustomerId) =>
                navigate({
                  customerId: nextCustomerId || undefined,
                  dateFrom,
                  dateTo,
                  archiveType,
                })
              }
              defaultCustomer={defaultCustomer ?? undefined}
              id="history-customer"
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="history-from"
              className="inline-flex h-5 items-center gap-1.5"
            >
              <CalendarRange className="size-3.5" />
              Desde
            </Label>
            <Input
              id="history-from"
              type="date"
              value={dateFrom ?? ""}
              onChange={(event) =>
                navigate({
                  customerId,
                  dateFrom: event.target.value || undefined,
                  dateTo,
                  archiveType,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="history-to">Hasta</Label>
            <Input
              id="history-to"
              type="date"
              value={dateTo ?? ""}
              onChange={(event) =>
                navigate({
                  customerId,
                  dateFrom,
                  dateTo: event.target.value || undefined,
                  archiveType,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="history-archive-type"
              className="inline-flex h-5 items-center gap-1.5"
            >
              <Archive className="size-3.5" />
              Tipo de archivado
            </Label>
            <Select
              value={archiveType ?? ALL_ARCHIVE_TYPES}
              onValueChange={(value) =>
                navigate({
                  customerId,
                  dateFrom,
                  dateTo,
                  archiveType:
                    value === EVENT_ARCHIVE_TYPE.WON ||
                    value === EVENT_ARCHIVE_TYPE.LOST
                      ? value
                      : undefined,
                })
              }
              items={[
                { value: ALL_ARCHIVE_TYPES, label: "Todos" },
                { value: EVENT_ARCHIVE_TYPE.WON, label: "Ganado" },
                { value: EVENT_ARCHIVE_TYPE.LOST, label: "Perdido" },
              ]}
            >
              <SelectTrigger id="history-archive-type" className="h-8 w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ARCHIVE_TYPES}>Todos</SelectItem>
                <SelectItem value={EVENT_ARCHIVE_TYPE.WON}>Ganado</SelectItem>
                <SelectItem value={EVENT_ARCHIVE_TYPE.LOST}>Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              className="inline-flex h-8 items-center gap-1.5"
              onClick={() =>
                router.push(
                  buildEventsHref({ tab: EVENTS_PIPELINE_TAB.HISTORY }),
                )
              }
            >
              <X className="size-4" />
              Limpiar
            </Button>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
