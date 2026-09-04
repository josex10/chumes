import Link from "next/link";
import { SectionHeading } from "@/components/storefront/section-heading";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import { formatCurrency } from "@/lib/quotes/format";
import type { PublicProduct } from "@/lib/supabase/types";

type HomeLinensProps = {
  products: PublicProduct[];
  categoryHref: string;
};

export function HomeLinens({ products, categoryHref }: HomeLinensProps) {
  const featured = products.slice(0, 6);

  return (
    <section className="border-y border-arena/70 bg-[#f3eee6]">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 md:px-6 md:py-28">
        <SectionHeading
          eyebrow="Mantelería"
          title="Elegí el estilo de tu evento."
          description="Más de 25 colores y distintos materiales. Esta es una muestra; el catálogo tiene el resto."
        />

        {featured.length === 0 ? (
          <div className="mt-12 border border-dashed border-arena px-6 py-14 text-center text-muted-foreground">
            Pronto vamos a mostrar la paleta completa de mantelería.
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/catalogo/${product.slug}`}
                className="group"
              >
                <StorefrontImage
                  src={product.primary_image_url}
                  placeholder="manteleria-estilo"
                  alt={product.name}
                  className="aspect-square"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <p className="mt-3 text-sm">{product.name}</p>
                {product.rental_price != null ? (
                  <p className="text-xs text-muted-foreground">
                    Desde {formatCurrency(product.rental_price)}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link href={categoryHref} className="text-sm text-brand">
            Ver toda la mantelería
          </Link>
        </div>
      </div>
    </section>
  );
}
