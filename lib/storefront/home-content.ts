import { PRODUCT_CATEGORY } from "@/lib/products/constants";
import type { StorefrontPlaceholderKey } from "@/lib/storefront/media";

export const HOME_CATEGORIES = [
  {
    title: "Mesas",
    description: "Mesas para distintos tipos de evento, listas para vestir.",
    href: "/catalogo?categoria=mesas",
    categoryCode: PRODUCT_CATEGORY.TABLES,
    image: "categoria-mesas",
  },
  {
    title: "Sillas",
    description: "Sillas elegantes y funcionales para cada ocasión.",
    href: "/catalogo?categoria=sillas",
    categoryCode: PRODUCT_CATEGORY.CHAIRS,
    image: "categoria-sillas",
  },
  {
    title: "Mantelería",
    description: "Colores y materiales para personalizar la mesa.",
    href: "/catalogo?categoria=manteleria",
    categoryCode: PRODUCT_CATEGORY.TABLE_LINENS,
    image: "categoria-manteleria",
  },
  {
    title: "Combos",
    description: "Soluciones completas para simplificar la planificación.",
    href: "/combos",
    categoryCode: null,
    image: "categoria-combos",
  },
  {
    title: "Mesas cocteleras",
    description: "Ideales para eventos sociales y corporativos.",
    href: "/catalogo?categoria=mesas-cocteleras",
    categoryCode: PRODUCT_CATEGORY.COCKTAIL_TABLES,
    image: "categoria-cocteleras",
  },
  {
    title: "Toldos",
    description: "Protección y comodidad para eventos al aire libre.",
    href: "/catalogo?categoria=toldos",
    categoryCode: PRODUCT_CATEGORY.TENTS,
    image: "categoria-toldos",
  },
] as const satisfies ReadonlyArray<{
  title: string;
  description: string;
  href: string;
  categoryCode: string | null;
  image: StorefrontPlaceholderKey;
}>;

export const HOME_OCCASIONS = [
  {
    title: "Bodas",
    href: "/catalogo",
    image: "ocasion-bodas",
  },
  {
    title: "Cumpleaños",
    href: "/catalogo",
    image: "ocasion-cumpleanos",
  },
  {
    title: "Baby showers",
    href: "/catalogo",
    image: "ocasion-baby-shower",
  },
  {
    title: "Eventos corporativos",
    href: "/cotizar?tipo=corporativo",
    image: "ocasion-corporativo",
  },
  {
    title: "Graduaciones",
    href: "/catalogo",
    image: "ocasion-graduaciones",
  },
  {
    title: "Celebraciones familiares",
    href: "/catalogo",
    image: "ocasion-familia",
  },
  {
    title: "Eventos al aire libre",
    href: "/catalogo?categoria=toldos",
    image: "ocasion-aire-libre",
  },
] as const satisfies ReadonlyArray<{
  title: string;
  href: string;
  image: StorefrontPlaceholderKey;
}>;

export const HOME_PROCESS = [
  {
    step: "01",
    title: "Contanos sobre tu evento.",
    text: "Fecha, lugar y cuántas personas. Con eso empezamos.",
  },
  {
    step: "02",
    title: "Te ayudamos a elegir lo que necesitás.",
    text: "Mesas, sillas, mantelería o un combo listo.",
  },
  {
    step: "03",
    title: "Reservamos tu equipo.",
    text: "Confirmamos disponibilidad y dejamos todo anotado.",
  },
  {
    step: "04",
    title: "Lo llevamos y dejamos listo.",
    text: "Llega a tiempo, limpio y con presentación.",
  },
] as const;

export const HOME_INSPIRATION = [
  {
    image: "inspiracion-mesas",
    alt: "Detalle de mesas para eventos",
    className: "md:col-span-2 md:aspect-[16/9]",
  },
  {
    image: "inspiracion-sillas",
    alt: "Detalle de sillas para eventos",
    className: "",
  },
  {
    image: "inspiracion-mantel",
    alt: "Mantelería para eventos",
    className: "",
  },
  {
    image: "inspiracion-montaje",
    alt: "Montaje completo de evento",
    className: "",
  },
  {
    image: "inspiracion-evento",
    alt: "Ambiente de evento",
    className: "",
  },
  {
    image: "inspiracion-detalle",
    alt: "Detalle de montaje",
    className: "md:col-span-2 md:aspect-[16/9]",
  },
] as const satisfies ReadonlyArray<{
  image: StorefrontPlaceholderKey;
  alt: string;
  className: string;
}>;

export const TIFFANY_SLUGS = ["silla-tiffany", "sillas-tiffany"] as const;
