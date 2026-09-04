"use client";

import { useRouter } from "next/navigation";
import { CalendarRange, X } from "lucide-react";
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
import {
  LOST_DATE_FIELD,
  REPORTS_TAB,
  type LostDateFieldParam,
} from "@/lib/reports/constants";
import { isLostDefaultDateRange } from "@/lib/reports/period";
import { buildReportesHref } from "@/lib/reports/url";

type LostFiltersProps = {
  dateFrom?: string;
  dateTo?: string;
  dateField: LostDateFieldParam;
};

export function LostFilters({
  dateFrom,
  dateTo,
  dateField,
}: LostFiltersProps) {
  const router = useRouter();

  function navigate(next: {
    dateFrom?: string;
    dateTo?: string;
    dateField?: LostDateFieldParam;
  }) {
    router.push(
      buildReportesHref({
        tab: REPORTS_TAB.LOST,
        dateFrom: next.dateFrom,
        dateTo: next.dateTo,
        dateField: next.dateField,
      }),
    );
  }

  const hasFilters = Boolean(
    !isLostDefaultDateRange(dateFrom, dateTo) ||
      dateField !== LOST_DATE_FIELD.ARCHIVED,
  );

  return (
    <Card>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(2,minmax(0,1fr))_auto] lg:items-end">
          <div className="grid gap-2">
            <Label htmlFor="lost-date-field">Filtrar por</Label>
            <Select
              value={dateField}
              onValueChange={(value) =>
                navigate({
                  dateFrom,
                  dateTo,
                  dateField:
                    value === LOST_DATE_FIELD.EVENT
                      ? LOST_DATE_FIELD.EVENT
                      : LOST_DATE_FIELD.ARCHIVED,
                })
              }
              items={[
                {
                  value: LOST_DATE_FIELD.ARCHIVED,
                  label: "Fecha de pérdida",
                },
                {
                  value: LOST_DATE_FIELD.EVENT,
                  label: "Fecha del evento",
                },
              ]}
            >
              <SelectTrigger id="lost-date-field" className="h-8 w-full">
                <SelectValue placeholder="Fecha de pérdida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LOST_DATE_FIELD.ARCHIVED}>
                  Fecha de pérdida
                </SelectItem>
                <SelectItem value={LOST_DATE_FIELD.EVENT}>
                  Fecha del evento
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="lost-from"
              className="inline-flex h-5 items-center gap-1.5"
            >
              <CalendarRange className="size-3.5" />
              Desde
            </Label>
            <Input
              id="lost-from"
              type="date"
              value={dateFrom ?? ""}
              onChange={(event) =>
                navigate({
                  dateFrom: event.target.value || undefined,
                  dateTo,
                  dateField,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lost-to">Hasta</Label>
            <Input
              id="lost-to"
              type="date"
              value={dateTo ?? ""}
              onChange={(event) =>
                navigate({
                  dateFrom,
                  dateTo: event.target.value || undefined,
                  dateField,
                })
              }
            />
          </div>

          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              className="inline-flex h-8 items-center gap-1.5"
              onClick={() =>
                router.push(buildReportesHref({ tab: REPORTS_TAB.LOST }))
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
