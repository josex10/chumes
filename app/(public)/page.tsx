import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { StoreHero } from "@/app/(public)/layout";
import { CHUMES_STOREFRONT } from "@/lib/storefront/company";
import {
  getPublicProductCategories,
  getPublicProducts,
} from "@/lib/storefront/queries";

export default async function PublicHomePage() {
  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicProductCategories(),
  ]);

  const featuredProducts = products.slice(0, 6);

  return (
    <>
      <StoreHero
        eyebrow="Costa Rica"
        title={CHUMES_STOREFRONT.tagline}
        description={CHUMES_STOREFRONT.description}
        primaryHref="/armar-mesa"
        primaryLabel="Armar tu mesa"
        secondaryHref="/catalogo"
        secondaryLabel="Ver catálogo"
      />

      <section className="mx-auto w-full max-w-6xl px-6 pb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo?categoria=${category.id}`}
              className="rounded-full border border-border/70 bg-card px-4 py-2 text-sm transition hover:bg-muted"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Productos destacados</h2>
            <p className="mt-2 text-muted-foreground">
              Explore mantelería, mobiliario y accesorios para su próximo evento.
            </p>
          </div>
          <Link href="/catalogo" className="text-sm text-primary hover:underline">
            Ver todo
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 px-8 py-16 text-center text-muted-foreground">
            Pronto publicaremos productos en el catálogo.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
