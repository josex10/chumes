import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/storefront/section-heading";
import { HOME_CATEGORIES } from "@/lib/storefront/home-content";
import { STOREFRONT_HERO } from "@/lib/storefront/media";

export function HomeCategories() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-6 md:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Link
          href="/catalogo"
          className="group relative block aspect-[5/4] overflow-hidden bg-charcoal lg:aspect-[4/5]"
        >
          <Image
            src={STOREFRONT_HERO.src}
            alt="Montaje con mesas vestidas, sillas Tiffany y mantelería."
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-[center_68%] transition duration-700 ease-out group-hover:scale-[1.03]"
          />
          <span className="sr-only">Ver catálogo</span>
        </Link>

        <div>
          <SectionHeading
            eyebrow="El catálogo"
            title="Todo lo que necesitás"
            description="Elegí una categoría o entrá al catálogo para ver cada pieza."
          />

          <ul className="mt-8 border-t border-arena/80">
            {HOME_CATEGORIES.map((category) => (
              <li key={category.title} className="border-b border-arena/80">
                <Link
                  href={category.href}
                  className="group grid grid-cols-1 gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:items-baseline sm:gap-6"
                >
                  <span className="font-heading text-xl text-charcoal transition-colors group-hover:text-brand">
                    {category.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground sm:text-right">
                    {category.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/catalogo"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-7 text-sm font-semibold tracking-wide text-ivory transition hover:bg-brand-deep"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
