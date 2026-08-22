"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartLineType } from "@/components/storefront/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitQuoteRequest } from "@/lib/storefront/actions";
import { formatCurrency } from "@/lib/quotes/format";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";
import { PHONE_MASK_PLACEHOLDER } from "@/lib/customers/phone";
import { cn } from "@/lib/utils";

function lineTypeLabel(lineType: CartLineType) {
  return lineType === QUOTE_LINE_TYPE.RENTAL ? "Alquiler" : "Venta";
}

export function QuoteRequestForm() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );

  function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = await submitQuoteRequest({
        name: String(formData.get("name") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? ""),
        event_date: String(formData.get("event_date") ?? ""),
        estimated_location: String(formData.get("estimated_location") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        website: String(formData.get("website") ?? ""),
        items: items.map((item) => ({
          product_id: item.productId,
          line_type: item.lineType,
          quantity: item.quantity,
        })),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      clearCart();
      router.push("/cotizar/exito");
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold">Su cotización está vacía</h2>
        <p className="mt-3 text-muted-foreground">
          Explore el catálogo y agregue los productos que necesita para su evento.
        </p>
        <Link
          href="/catalogo"
          className={cn(buttonVariants({ variant: "commit" }), "mt-8 rounded-full px-6")}
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-border/70 bg-card p-6 md:p-8">
        <h2 className="text-xl font-semibold">Productos seleccionados</h2>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.lineType}`}
              className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lineTypeLabel(item.lineType)} ·{" "}
                  {formatCurrency(item.unitPrice)} c/u
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) =>
                    updateQuantity(
                      item.productId,
                      item.lineType,
                      Number(event.target.value),
                    )
                  }
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeItem(item.productId, item.lineType)}
                >
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Los precios mostrados son referenciales. El equipo confirmará entrega,
          disponibilidad e impuestos antes de enviar la cotización final.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-card p-6 md:p-8">
        <h2 className="text-xl font-semibold">Datos del evento</h2>
        <form action={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              name="phone"
              required
              placeholder={PHONE_MASK_PLACEHOLDER}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo (opcional)</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_date">Fecha del evento (opcional)</Label>
            <Input id="event_date" name="event_date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_location">Lugar del evento (opcional)</Label>
            <Input id="estimated_location" name="estimated_location" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea id="notes" name="notes" rows={4} />
          </div>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="rounded-2xl bg-muted/50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal referencial</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            variant="commit"
            disabled={isPending}
            className="w-full rounded-full"
          >
            {isPending ? "Enviando..." : "Enviar solicitud de cotización"}
          </Button>
        </form>
      </section>
    </div>
  );
}
