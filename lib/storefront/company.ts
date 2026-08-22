export const CHUMES_STOREFRONT = {
  name: "Chumes Todo en Mantelería",
  tagline: "Alquiler y venta de mantelería para eventos",
  description:
    "Mantelería, forros de silla, sillas, mesas y accesorios para bodas, quince años y eventos corporativos en Costa Rica.",
  phone: "",
  email: "",
  whatsappMessage: "Hola, me interesa cotizar mantelería para mi evento.",
} as const;

export function getWhatsAppUrl(message?: string): string | null {
  const digits = CHUMES_STOREFRONT.phone.replace(/\D/g, "");
  if (digits.length < 8) {
    return null;
  }

  const text = encodeURIComponent(message ?? CHUMES_STOREFRONT.whatsappMessage);
  return `https://wa.me/506${digits}?text=${text}`;
}
