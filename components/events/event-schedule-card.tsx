import {
  formatDeliveryPickupDateTime,
  formatEventDate,
  formatDatesStatusLabel,
  getDatesStatusVariant,
} from "@/lib/events/format-dates";
import { computeDatesStatus } from "@/lib/events/dates-status";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EventScheduleCardProps = {
  eventDate: string | null;
  deliveryDate: string | null;
  pickupDate: string | null;
};

const statusStyles = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  muted: "bg-muted text-muted-foreground",
};

export function EventScheduleCard({
  eventDate,
  deliveryDate,
  pickupDate,
}: EventScheduleCardProps) {
  const datesStatus = computeDatesStatus(eventDate, deliveryDate, pickupDate);
  const statusVariant = getDatesStatusVariant(datesStatus);

  const rows = [
    {
      label: "Evento",
      value: formatEventDate(eventDate),
    },
    {
      label: "Entrega",
      value: formatDeliveryPickupDateTime(deliveryDate),
    },
    {
      label: "Recogida",
      value: formatDeliveryPickupDateTime(pickupDate),
    },
  ];

  return (
    <Card className="ring-1 ring-border/60">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4">
        <CardTitle className="text-lg">Fechas de la reserva</CardTitle>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusStyles[statusVariant],
          )}
        >
          {formatDatesStatusLabel(datesStatus)}
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="divide-y divide-border/60 rounded-lg border bg-muted/20">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4 px-4 py-3"
            >
              <dt className="w-24 shrink-0 text-sm text-muted-foreground">
                {row.label}
              </dt>
              <dd className="min-w-0 flex-1 text-right text-sm font-medium leading-snug capitalize">
                {row.value ?? "—"}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
