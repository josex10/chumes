import type { CartItem } from "@/components/storefront/cart-provider";

export type QuoteWhatsAppPayload = {
  name?: string;
  eventDate?: string;
  guestCount?: number | null;
  location?: string;
  notes?: string;
  items: Array<{ name: string; quantity: number }>;
};

export function buildQuoteWhatsAppMessage(payload: QuoteWhatsAppPayload): string {
  const lines = ["Hola Chumes, quiero cotizar mi evento.", ""];

  if (payload.eventDate) {
    lines.push(`Fecha: ${payload.eventDate}`);
  }
  if (payload.guestCount) {
    lines.push(`Cantidad de personas: ${payload.guestCount}`);
  }
  if (payload.location) {
    lines.push(`Ubicación: ${payload.location}`);
  }

  if (payload.items.length > 0) {
    lines.push("", "Productos:");
    for (const item of payload.items) {
      lines.push(`${item.quantity} ${item.name}`);
    }
  }

  if (payload.notes) {
    lines.push("", payload.notes);
  }

  lines.push("", "Me gustaría recibir una cotización.");
  return lines.join("\n");
}

export function cartItemsToWhatsAppLines(items: CartItem[]) {
  return items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
  }));
}

export const LAST_QUOTE_WHATSAPP_KEY = "chumes-last-quote-whatsapp";
