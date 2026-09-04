import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToQuotePanel } from "@/components/storefront/add-to-quote-panel";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPriceBadges } from "@/components/storefront/product-card";
import { getCategorySlug } from "@/lib/storefront/catalog";
import { getWhatsAppHref, hasWhatsAppNumber } from "@/lib/storefront/company";
import { getPublicProductBySlug } from "@/lib/storefront/queries";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.name,
    description:
      product.description ??
      `Alquiler de ${product.name} para eventos en la Gran Área Metropolitana.`,
    openGraph: {
      title: product.name,
      description:
        product.description ??
        `Alquiler de ${product.name} para eventos en la Gran Área Metropolitana.`,
      images: product.primary_image_url
        ? [{ url: product.primary_image_url, alt: product.name }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categoryHref = `/catalogo?categoria=${getCategorySlug(product.product_categories)}`;
  const whatsappHref = getWhatsAppHref(
    `Hola Chumes, quiero cotizar ${product.name} para mi evento.`,
  );

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
      <ProductGallery product={product} />

      <div>
        <Link
          href={categoryHref}
          className="text-[0.7rem] tracking-[0.24em] text-muted-foreground uppercase"
        >
          {product.product_categories.name}
        </Link>
        <h1 className="font-heading mt-3 text-4xl font-medium tracking-tight md:text-5xl">
          {product.name}
        </h1>
        {product.product_types.code === "BUNDLE" ? (
          <p className="mt-3 text-sm text-brand">Combo</p>
        ) : null}

        <div className="mt-8">
          <ProductPriceBadges product={product} />
        </div>

        {product.description ? (
          <p className="mt-8 leading-7 text-muted-foreground whitespace-pre-wrap">
            {product.description}
          </p>
        ) : null}

        <div className="mt-10">
          <AddToQuotePanel product={product} />
        </div>

        <a
          href={whatsappHref}
          target={hasWhatsAppNumber() ? "_blank" : undefined}
          rel={hasWhatsAppNumber() ? "noreferrer" : undefined}
          className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full border border-arena text-sm text-brand"
        >
          Cotizar este producto por WhatsApp
        </a>

        <p className="mt-6 text-sm text-muted-foreground">
          Esta solicitud no reserva inventario. El equipo confirma
          disponibilidad, entrega y el total final.
        </p>
      </div>
    </section>
  );
}
