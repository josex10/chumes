import Link from "next/link";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import type { PublicProduct } from "@/lib/supabase/types";

type HomeTiffanyProps = {
  product: PublicProduct | null;
};

export function HomeTiffany({ product }: HomeTiffanyProps) {
  if (!product) {
    return null;
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-6 md:py-28">
      <StorefrontImage
        src={product.primary_image_url}
        placeholder="silla-tiffany"
        alt={product.name}
        className="aspect-[4/5]"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div>
        <p className="text-[0.7rem] tracking-[0.28em] text-brand-gold uppercase">
          Producto estrella
        </p>
        <h2 className="font-heading mt-4 text-3xl md:text-5xl">
          El detalle que cambia por completo la mesa.
        </h2>
        <p className="mt-5 max-w-md text-muted-foreground">
          Elegantes, versátiles y perfectas para celebraciones donde cada detalle
          importa.
        </p>
        <Link
          href={`/catalogo/${product.slug}`}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-7 text-sm text-ivory hover:bg-brand-deep"
        >
          Ver sillas Tiffany
        </Link>
      </div>
    </section>
  );
}
