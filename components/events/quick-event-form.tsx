"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createQuickEvent } from "@/lib/events/actions";
import { buildQuickEventTitle } from "@/lib/events/quick-title";
import {
  quickEventFormSchema,
  type QuickEventFormValues,
} from "@/lib/events/schema";
import type { CustomerType, EventSource } from "@/lib/supabase/types";
import { EventCustomerPicker } from "@/components/events/event-customer-picker";
import { EventSourceCombobox } from "@/components/events/event-source-combobox";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY_VALUES: QuickEventFormValues = {
  title: "",
  customer_id: "",
  source_id: undefined as unknown as number,
};

type QuickEventFormProps = {
  customerTypes: CustomerType[];
  sources: EventSource[];
  open: boolean;
};

export function QuickEventForm({
  customerTypes,
  sources,
  open,
}: QuickEventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [pickerKey, setPickerKey] = useState(0);

  const form = useForm<QuickEventFormValues>({
    resolver: zodResolver(quickEventFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const customerId = watch("customer_id");

  useEffect(() => {
    if (open) {
      return;
    }

    reset(EMPTY_VALUES);
    setSubmitError(null);
    setCreatedEventId(null);
    setPickerKey((key) => key + 1);
  }, [open, reset]);

  function handleCustomerSelected(customer: { id: string; name: string }) {
    setValue("title", buildQuickEventTitle(customer.name), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function onSubmit(values: QuickEventFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = await createQuickEvent(values);
      if (!result.success || !result.eventId) {
        setSubmitError(
          result.success ? "No se pudo crear el evento." : result.error,
        );
        return;
      }

      setCreatedEventId(result.eventId);
      reset(EMPTY_VALUES);
      setPickerKey((key) => key + 1);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={control}
        name="customer_id"
        render={({ field }) => (
          <EventCustomerPicker
            key={pickerKey}
            id="quick-event-customer"
            customerTypes={customerTypes}
            value={field.value}
            onChange={field.onChange}
            onCustomerSelected={handleCustomerSelected}
          />
        )}
      />
      {errors.customer_id && (
        <p className="text-sm text-destructive">{errors.customer_id.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="quick-event-title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="quick-event-title"
          placeholder="Se genera con el cliente"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quick-event-source">
          Fuente <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="source_id"
          render={({ field }) => (
            <EventSourceCombobox
              id="quick-event-source"
              sources={sources}
              value={field.value ? String(field.value) : undefined}
              onValueChange={(value) => field.onChange(Number(value))}
            />
          )}
        />
        {errors.source_id && (
          <p className="text-sm text-destructive">{errors.source_id.message}</p>
        )}
      </div>

      {createdEventId ? (
        <p className="text-sm text-action-add">
          Evento creado.{" "}
          <Link
            href={`/events/${createdEventId}`}
            className="font-medium underline underline-offset-3"
          >
            Ver evento
          </Link>
        </p>
      ) : null}

      {submitError ? (
        <p className="text-sm text-destructive">{submitError}</p>
      ) : null}

      <DialogFooter>
        <Button type="submit" variant="commit" disabled={isPending || !customerId}>
          {isPending ? "Creando..." : "Crear evento"}
        </Button>
      </DialogFooter>
    </form>
  );
}
