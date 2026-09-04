export const STOREFRONT_LOGO = {
  src: "/brand/logo-oficial.png",
  fallbackSrc: "/brand/logo-oficial-2026.jpg",
  alt: "Chume's — Todo en Mantelería",
  width: 576,
  height: 506,
} as const;

export const STOREFRONT_PLACEHOLDERS = {
  "hero-montaje": "Fotografía de un montaje Chumes",
  "categoria-mesas": "Mesas para eventos",
  "categoria-sillas": "Sillas para eventos",
  "categoria-manteleria": "Mantelería",
  "categoria-combos": "Combos para eventos",
  "categoria-cocteleras": "Mesas cocteleras",
  "categoria-toldos": "Toldos profesionales",
  "silla-tiffany": "Sillas Tiffany",
  "manteleria-estilo": "Mantelería en colores",
  "ocasion-bodas": "Bodas",
  "ocasion-cumpleanos": "Cumpleaños",
  "ocasion-baby-shower": "Baby showers",
  "ocasion-corporativo": "Eventos corporativos",
  "ocasion-graduaciones": "Graduaciones",
  "ocasion-familia": "Celebraciones familiares",
  "ocasion-aire-libre": "Eventos al aire libre",
  "inspiracion-mesas": "Detalle de mesas",
  "inspiracion-sillas": "Detalle de sillas",
  "inspiracion-montaje": "Montaje completo",
  "inspiracion-mantel": "Mantelería",
  "inspiracion-evento": "Ambiente de evento",
  "inspiracion-detalle": "Detalle de montaje",
} as const;

export type StorefrontPlaceholderKey = keyof typeof STOREFRONT_PLACEHOLDERS;
