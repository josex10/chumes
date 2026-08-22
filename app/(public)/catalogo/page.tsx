import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { StoreHero } from "@/app/(public)/layout";
import {
  getPublicProductCategories,
  getPublicProducts,
} from "@/lib/storefront/queries";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Catálogo de mantelería, mobiliario y accesorios para eventos.",
};

type CatalogPageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const categoryId = params.categoria ? Number(params.categoria) : undefined;
  const [products, categories] = await Promise.all([
    getPublicProducts(
      categoryId && !Number.isNaN(categoryId) ? { categoryId } : undefined,
    ),
    getPublicProductCategories(),
  ]);

  return (
    <>
      <StoreHero
        eyebrow="Catálogo"
        title="Productos para eventos"
        description="Consulte precios de alquiler y venta, y arme su solicitud de cotización en línea."
      />

      <section className="mx-auto w-full max-w-6xl px-6 pb-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/catalogo"
            className={`rounded-full border px-4 py-2 text-sm transition ${
              !categoryId
                ? "border-foreground bg-foreground text-background"
                : "border-border/70 bg-card hover:bg-muted"
            }`}
          >
            Todos
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo?categoria=${category.id}`}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                categoryId === category.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/70 bg-card hover:bg-muted"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 px-8 py-16 text-center text-muted-foreground">
            No hay productos publicados en esta categoría.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
