import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToQuotePanel } from "@/components/storefront/add-to-quote-panel";
import { ProductPriceBadges } from "@/components/storefront/product-card";
import { getProductImagePublicUrl } from "@/lib/products/images";
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
      `${product.name} — ${product.product_categories.name}`,
    openGraph: product.primary_image_url
      ? { images: [{ url: product.primary_image_url }] }
      : undefined,
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

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {product.product_categories.name}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {product.name}
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {product.images.length > 0 ? (
            product.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted"
              >
                <Image
                  src={getProductImagePublicUrl(image.storage_path)}
                  alt={image.alt_text ?? product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={image.is_primary}
                />
              </div>
            ))
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/40 px-6 text-center text-sm text-muted-foreground sm:col-span-2">
              Imagen próximamente
            </div>
          )}
        </div>

        {product.description ? (
          <div className="mt-8 space-y-3">
            <h2 className="text-lg font-medium">Descripción</h2>
            <p className="leading-7 text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <ProductPriceBadges product={product} />
        <AddToQuotePanel product={product} />
        <p className="text-sm text-muted-foreground">
          Esta cotización no reserva inventario. Un miembro del equipo confirmará
          disponibilidad, entrega y el total final.
        </p>
      </div>
    </section>
  );
}
