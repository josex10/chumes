import type { EventReservationPdfData } from "@/lib/events/pdf/types";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 40);
}

export function getReservationPdfFilename(data: EventReservationPdfData): string {
  const eventSlug = slugify(data.event.title);
  const base = data.quote.quote_number;

  return eventSlug ? `reserva-${base}-${eventSlug}.pdf` : `reserva-${base}.pdf`;
}
