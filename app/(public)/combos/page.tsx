import type { Metadata } from "next";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";
import { PRODUCT_TYPE } from "@/lib/products/constants";
import { getPublicProducts } from "@/lib/storefront/queries";

export const metadata: Metadata = {
  title: "Combos",
  description:
    "Combos de mesas, sillas y mantelería para simplificar la planificación de tu evento.",
};

export default async function CombosPage() {
  const products = await getPublicProducts();
  const combos = products.filter(
    (product) => product.product_types.code === PRODUCT_TYPE.BUNDLE,
  );

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-5 pt-14 pb-8 md:px-6 md:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="Combos"
          title="Elegí un combo y simplificá tu evento."
          description="Sillas, mesa y mantel listos para cotizar. Los precios salen del catálogo actual."
        />
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-24 md:px-6">
        {combos.length === 0 ? (
          <div className="border border-dashed border-arena px-6 py-16 text-center">
            <p className="font-heading text-2xl">Pronto publicamos los combos</p>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Mientras tanto, cotizá tu evento y te armamos la combinación justa.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => (
              <ProductCard key={combo.id} product={combo} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
