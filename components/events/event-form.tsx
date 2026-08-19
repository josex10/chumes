"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEvent, updateEvent } from "@/lib/events/actions";
import { EVENT_PRIORITY } from "@/lib/events/constants";
import { toDatetimeLocalValue } from "@/lib/events/format-dates";
import {
  eventFormSchema,
  type EventFormValues,
} from "@/lib/events/schema";
import type {
  CustomerType,
  EventSource,
  EventWithRelations,
} from "@/lib/supabase/types";
import { EventCustomerPicker } from "@/components/events/event-customer-picker";
import { EventSourceCombobox } from "@/components/events/event-source-combobox";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EventFormProps = {
  customerTypes: CustomerType[];
  sources: EventSource[];
  event?: EventWithRelations;
};

export function EventForm({ customerTypes, sources, event }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(event);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title ?? "",
      customer_id: event?.customer_id ?? "",
      contact_id: event?.contact_id ?? null,
      source_id: event?.source_id ?? undefined,
      event_date: event?.event_date ?? "",
      delivery_date: toDatetimeLocalValue(event?.delivery_date),
      pickup_date: toDatetimeLocalValue(event?.pickup_date),
      estimated_location: event?.estimated_location ?? "",
      notes: event?.notes ?? "",
      priority: event?.priority ?? EVENT_PRIORITY.NORMAL,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const customerId = watch("customer_id");

  function onSubmit(values: EventFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateEvent(event!.id, values)
        : await createEvent(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      router.push(isEditing ? `/events/${event!.id}` : `/events/${result.eventId}`);
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar evento" : "Nuevo evento"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información comercial del deal."
            : "Crea una solicitud con cliente obligatorio."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input id="title" placeholder="Ej. Boda María" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <Controller
            control={control}
            name="customer_id"
            render={({ field }) => (
              <EventCustomerPicker
                customerTypes={customerTypes}
                value={field.value}
                defaultCustomer={event?.customers}
                onChange={field.onChange}
              />
            )}
          />
          {errors.customer_id && (
            <p className="text-sm text-destructive">{errors.customer_id.message}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source_id">
                Fuente <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="source_id"
                render={({ field }) => (
                  <EventSourceCombobox
                    id="source_id"
                    sources={sources}
                    value={field.value ? String(field.value) : undefined}
                    currentSourceId={event?.source_id}
                    onValueChange={(value) => field.onChange(Number(value))}
                  />
                )}
              />
              {errors.source_id && (
                <p className="text-sm text-destructive">{errors.source_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="priority" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EVENT_PRIORITY.LOW}>Baja</SelectItem>
                      <SelectItem value={EVENT_PRIORITY.NORMAL}>Normal</SelectItem>
                      <SelectItem value={EVENT_PRIORITY.HIGH}>Alta</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
            <p className="text-sm font-medium">Fechas de la reserva</p>
            <div className="space-y-2">
              <Label htmlFor="event_date">Fecha del evento</Label>
              <Input id="event_date" type="date" {...register("event_date")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Entrega (fecha y hora)</Label>
                <Input
                  id="delivery_date"
                  type="datetime-local"
                  {...register("delivery_date")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup_date">Recogida (fecha y hora)</Label>
                <Input
                  id="pickup_date"
                  type="datetime-local"
                  {...register("pickup_date")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_location">Ubicación estimada</Label>
            <Input
              id="estimated_location"
              placeholder="Lugar del evento"
              {...register("estimated_location")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending || !customerId}>
              {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear evento"}
            </Button>
            <Link
              href={isEditing ? `/events/${event!.id}` : "/events"}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
