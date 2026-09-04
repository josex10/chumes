import type { Metadata } from "next";
import { CatalogFilters } from "@/components/storefront/catalog-filters";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";
import {
  filterCatalogProducts,
  resolveCatalogFilters,
  type CatalogSearchParams,
} from "@/lib/storefront/catalog";
import {
  getPublicProductCategories,
  getPublicProducts,
} from "@/lib/storefront/queries";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explorá nuestras mesas, sillas, mantelería, combos y equipo para eventos.",
};

type CatalogPageProps = {
  searchParams: Promise<CatalogSearchParams>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicProductCategories(),
  ]);
  const filters = resolveCatalogFilters(params, categories);
  const visible = filterCatalogProducts(products, filters);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-5 pt-14 pb-8 md:px-6 md:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="Catálogo"
          title="Encontrá todo lo que necesitás para tu evento."
          description="Explorá nuestras mesas, sillas, mantelería, combos y equipo."
        />
        <div className="mt-10">
          <CatalogFilters categories={categories} filters={filters} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-24 md:px-6">
        {visible.length === 0 ? (
          <div className="border border-dashed border-arena px-6 py-16 text-center text-muted-foreground">
            No hay productos publicados con estos filtros.
            {filters.category || filters.typeSlug || filters.priceSlug
              ? " Probá quitar un filtro o cotizá y te ayudamos a elegir."
              : " Pronto publicaremos el catálogo."}
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
