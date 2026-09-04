import Link from "next/link";
import { SectionHeading } from "@/components/storefront/section-heading";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import { formatCurrency } from "@/lib/quotes/format";
import type { PublicProduct } from "@/lib/supabase/types";

type HomeCombosProps = {
  combos: PublicProduct[];
};

export function HomeCombos({ combos }: HomeCombosProps) {
  return (
    <section className="bg-charcoal text-ivory">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 md:px-6 md:py-28">
        <SectionHeading
          eyebrow="La forma más fácil"
          title="Elegí tu combo"
          description="Un combo simplifica la decisión: sillas, mesa y mantel listos para cotizar."
          tone="dark"
        />

        {combos.length === 0 ? (
          <div className="mt-12 border border-ivory/15 px-6 py-14 text-center">
            <p className="font-heading text-2xl">Pronto publicamos los combos</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ivory/65">
              Mientras tanto, contanos cuántas personas van y te armamos la
              combinación justa.
            </p>
            <Link
              href="/cotizar"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-7 text-sm text-ivory hover:bg-brand-deep"
            >
              Cotizar mi evento
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {combos.map((combo) => (
              <article key={combo.id} className="group flex flex-col">
                <StorefrontImage
                  src={combo.primary_image_url}
                  placeholder="categoria-combos"
                  alt={combo.name}
                  className="aspect-[4/5]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="flex flex-1 flex-col pt-5">
                  <h3 className="font-heading text-2xl">{combo.name}</h3>
                  {combo.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-ivory/65">
                      {combo.description}
                    </p>
                  ) : null}
                  {combo.rental_price != null ? (
                    <p className="mt-4 text-sm text-brand-gold-soft">
                      Desde {formatCurrency(combo.rental_price)}
                    </p>
                  ) : null}
                  <Link
                    href={`/catalogo/${combo.slug}`}
                    className="mt-6 inline-flex text-sm text-ivory underline-offset-4 hover:underline"
                  >
                    Elegir mi combo
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
