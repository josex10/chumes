export const CHUMES_STOREFRONT = {
  name: "Chumes",
  wordmark: "Chume's",
  tagline: "Todo en alquiler para tu evento.",
  logoTagline: "Todo en Mantelería",
  description:
    "Alquiler de mesas, sillas, mantelería, toldos y equipo para eventos en la Gran Área Metropolitana.",
  coverage: "Gran Área Metropolitana, Costa Rica",
  phone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "+506 72326801",
  email: process.env.NEXT_PUBLIC_CHUMES_EMAIL ?? "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  whatsappMessage: "Hola Chumes, quiero cotizar mi evento.",
} as const;

function toWhatsAppDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("506") && digits.length >= 11) {
    return digits;
  }
  if (digits.length >= 8) {
    return `506${digits.slice(-8)}`;
  }
  return null;
}

export function getWhatsAppUrl(message?: string): string | null {
  const digits = toWhatsAppDigits(CHUMES_STOREFRONT.phone);
  if (!digits) {
    return null;
  }

  const text = encodeURIComponent(message ?? CHUMES_STOREFRONT.whatsappMessage);
  return `https://wa.me/${digits}?text=${text}`;
}

export function getWhatsAppHref(message?: string): string {
  return getWhatsAppUrl(message) ?? "/contacto";
}

export function hasWhatsAppNumber(): boolean {
  return toWhatsAppDigits(CHUMES_STOREFRONT.phone) !== null;
}
