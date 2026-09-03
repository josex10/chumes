"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Loader2,
  PackageCheck,
  Pencil,
  Truck,
} from "lucide-react";
import { updateEventSchedule } from "@/lib/events/actions";
import {
  formatDeliveryPickupDateTime,
  formatEventDate,
  formatDatesStatusLabel,
  getDatesStatusVariant,
  toDatetimeLocalValue,
} from "@/lib/events/format-dates";
import { computeDatesStatus } from "@/lib/events/dates-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type EventScheduleCardProps = {
  eventId: string;
  eventDate: string | null;
  deliveryDate: string | null;
  pickupDate: string | null;
  canEdit?: boolean;
};

const statusStyles = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  muted: "bg-muted text-muted-foreground",
};

export function EventScheduleCard({
  eventId,
  eventDate,
  deliveryDate,
  pickupDate,
  canEdit = false,
}: EventScheduleCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [eventDateValue, setEventDateValue] = useState(eventDate ?? "");
  const [deliveryValue, setDeliveryValue] = useState(
    toDatetimeLocalValue(deliveryDate),
  );
  const [pickupValue, setPickupValue] = useState(
    toDatetimeLocalValue(pickupDate),
  );

  const datesStatus = computeDatesStatus(eventDate, deliveryDate, pickupDate);
  const statusVariant = getDatesStatusVariant(datesStatus);

  const rows = [
    {
      label: "Evento",
      value: formatEventDate(eventDate),
      icon: CalendarDays,
    },
    {
      label: "Entrega",
      value: formatDeliveryPickupDateTime(deliveryDate),
      icon: Truck,
    },
    {
      label: "Recogida",
      value: formatDeliveryPickupDateTime(pickupDate),
      icon: PackageCheck,
    },
  ];

  useEffect(() => {
    if (!open) return;
    setError(null);
    setEventDateValue(eventDate ?? "");
    setDeliveryValue(toDatetimeLocalValue(deliveryDate));
    setPickupValue(toDatetimeLocalValue(pickupDate));
  }, [open, eventDate, deliveryDate, pickupDate]);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateEventSchedule(eventId, {
        event_date: eventDateValue,
        delivery_date: deliveryValue,
        pickup_date: pickupValue,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Card className="ring-1 ring-border/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4">
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <CalendarDays className="size-4 text-muted-foreground" />
            Fechas de la reserva
            {canEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Editar fechas"
                onClick={() => setOpen(true)}
              >
                <Pencil className="size-3.5" />
              </Button>
            ) : null}
          </CardTitle>
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
                <dt className="inline-flex w-28 shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <row.icon className="size-3.5" />
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

      {canEdit ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar fechas</DialogTitle>
              <DialogDescription>
                Podés ajustar la fecha del evento y las horas de entrega y
                retiro. Se guardan en hora de Costa Rica.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule_event_date">Fecha del evento</Label>
                <Input
                  id="schedule_event_date"
                  type="date"
                  value={eventDateValue}
                  onChange={(event) => setEventDateValue(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule_delivery_date">Entrega</Label>
                <Input
                  id="schedule_delivery_date"
                  type="datetime-local"
                  value={deliveryValue}
                  onChange={(event) => setDeliveryValue(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule_pickup_date">Recogida</Label>
                <Input
                  id="schedule_pickup_date"
                  type="datetime-local"
                  value={pickupValue}
                  onChange={(event) => setPickupValue(event.target.value)}
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="commit"
                disabled={isPending}
                onClick={handleSave}
              >
                {isPending ? <Loader2 className="animate-spin" /> : null}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
