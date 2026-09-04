import Link from "next/link";
import { SectionHeading } from "@/components/storefront/section-heading";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import { HOME_CATEGORIES } from "@/lib/storefront/home-content";

export function HomeCategories() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-6 md:py-28">
      <SectionHeading
        eyebrow="El equipo"
        title="Todo lo que necesitás"
        description="Explorá por categoría y armá el ambiente de tu evento sin complicarte."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {HOME_CATEGORIES.map((category) => (
          <article key={category.title} className="group">
            <Link href={category.href} className="block">
              <StorefrontImage
                placeholder={category.image}
                alt={category.title}
                className="aspect-[4/3]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="pt-5">
                <h3 className="font-heading text-2xl">{category.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {category.description}
                </p>
                <p className="mt-4 text-sm text-brand">Ver productos</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
