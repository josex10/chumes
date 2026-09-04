import Link from "next/link";
import { SectionHeading } from "@/components/storefront/section-heading";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import { HOME_OCCASIONS } from "@/lib/storefront/home-content";

export function HomeOccasions() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-6 md:py-28">
      <SectionHeading
        eyebrow="Ocasiones"
        title="Para cada ocasión"
        description="El mismo estándar de presentación, adaptado a lo que estás celebrando."
      />
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {HOME_OCCASIONS.map((occasion) => (
          <Link key={occasion.title} href={occasion.href} className="group">
            <StorefrontImage
              placeholder={occasion.image}
              alt={occasion.title}
              className="aspect-[3/4]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <p className="mt-3 text-sm">{occasion.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
