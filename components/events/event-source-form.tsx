"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEventSource,
  updateEventSource,
} from "@/lib/event-sources/actions";
import {
  eventSourceFormSchema,
  slugifyEventSourceCode,
  type EventSourceFormValues,
} from "@/lib/event-sources/schema";
import type { EventSource } from "@/lib/supabase/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EventSourceFormProps = {
  source?: EventSource;
};

export function EventSourceForm({ source }: EventSourceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [codeTouched, setCodeTouched] = useState(Boolean(source));
  const isEditing = Boolean(source);

  const form = useForm<EventSourceFormValues>({
    resolver: zodResolver(eventSourceFormSchema),
    defaultValues: {
      name: source?.name ?? "",
      code: source?.code ?? "",
      description: source?.description ?? "",
      is_active: source?.is_active ?? true,
      is_favorite: source?.is_favorite ?? false,
      sort_order: source?.sort_order ?? 0,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const name = watch("name");

  useEffect(() => {
    if (!codeTouched && name) {
      setValue("code", slugifyEventSourceCode(name));
    }
  }, [name, codeTouched, setValue]);

  function onSubmit(values: EventSourceFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateEventSource(source!.id, values)
        : await createEventSource(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      router.push("/events/settings/sources");
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar fuente" : "Nueva fuente"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la campaña o canal de origen."
            : "Crea una campaña o canal para rastrear de dónde vienen los eventos."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="Ej. WhatsApp Ads Q1" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Código <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              placeholder="WHATSAPP_ADS_Q1"
              {...register("code", {
                onChange: () => setCodeTouched(true),
              })}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Orden</Label>
            <Input id="sort_order" type="number" min={0} {...register("sort_order")} />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("is_active")} />
              Activa
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("is_favorite")} />
              Favorita (aparece primero)
            </label>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear fuente"}
            </Button>
            <Link
              href="/events/settings/sources"
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
