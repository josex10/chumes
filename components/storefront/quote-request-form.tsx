"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/storefront/cart-provider";
import { QuoteSummary } from "@/components/storefront/quote-summary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitQuoteRequest } from "@/lib/storefront/actions";
import { PHONE_MASK_PLACEHOLDER } from "@/lib/customers/phone";
import {
  LAST_QUOTE_WHATSAPP_KEY,
  buildQuoteWhatsAppMessage,
  cartItemsToWhatsAppLines,
} from "@/lib/storefront/quote-message";

export function QuoteRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inquiryType = searchParams.get("tipo") ?? "";
  const hasItems = items.length > 0;

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) {
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hasItems]);

  function handleSubmit(formData: FormData) {
    setError(null);
    const guestRaw = String(formData.get("guest_count") ?? "").trim();
    const guestCount = guestRaw ? Number(guestRaw) : undefined;
    const payload = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      event_date: String(formData.get("event_date") ?? ""),
      estimated_location: String(formData.get("estimated_location") ?? ""),
      guest_count: guestCount,
      inquiry_type: String(formData.get("inquiry_type") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      website: String(formData.get("website") ?? ""),
      items: items.map((item) => ({
        product_id: item.productId,
        line_type: item.lineType,
        quantity: item.quantity,
      })),
    };

    startTransition(async () => {
      const result = await submitQuoteRequest(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      const message = buildQuoteWhatsAppMessage({
        name: payload.name,
        eventDate: payload.event_date || undefined,
        guestCount: guestCount || null,
        location: payload.estimated_location || undefined,
        notes: payload.notes || undefined,
        items: cartItemsToWhatsAppLines(items),
      });
      sessionStorage.setItem(LAST_QUOTE_WHATSAPP_KEY, message);
      clearCart();
      router.push("/cotizar/exito");
    });
  }

  return (
    <div
      className={
        hasItems
          ? "grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          : "mx-auto max-w-xl"
      }
    >
      {hasItems ? <QuoteSummary /> : null}

      <section
        id="formulario"
        className="scroll-mt-32 border border-arena/80 bg-ivory p-6 md:p-8"
      >
        <p className="text-[0.7rem] tracking-[0.22em] text-brand-gold uppercase">
          Datos
        </p>
        <h2 className="font-heading mt-2 text-3xl">Contanos sobre tu evento</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {hasItems
            ? "Con la fecha y cuántas personas van, te ayudamos a calcular lo que necesitás."
            : "Dejanos fecha, lugar y cuántas personas van. Si querés, después armás el equipo en el catálogo."}
        </p>
        <form action={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input
              id="phone"
              name="phone"
              required
              inputMode="tel"
              placeholder={PHONE_MASK_PLACEHOLDER}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo (opcional)</Label>
            <Input id="email" name="email" type="email" autoComplete="email" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event_date">Fecha del evento</Label>
              <Input id="event_date" name="event_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest_count">Cantidad de personas</Label>
              <Input
                id="guest_count"
                name="guest_count"
                type="number"
                min="1"
                placeholder="Ej. 80"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_location">Ubicación</Label>
            <Input
              id="estimated_location"
              name="estimated_location"
              placeholder="Gran Área Metropolitana"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Comentarios</Label>
            <Textarea id="notes" name="notes" rows={4} />
          </div>
          <input type="hidden" name="inquiry_type" value={inquiryType} />
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold tracking-wide text-ivory hover:bg-brand-deep disabled:opacity-60"
          >
            {isPending ? "Enviando..." : "Solicitar cotización"}
          </button>
        </form>
        {hasItems ? null : (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya sabés qué equipo necesitás?{" "}
            <Link href="/catalogo" className="text-brand">
              Armá tu evento en el catálogo
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
