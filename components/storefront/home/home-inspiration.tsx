import { SectionHeading } from "@/components/storefront/section-heading";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import { HOME_INSPIRATION } from "@/lib/storefront/home-content";
import { cn } from "@/lib/utils";

export function HomeInspiration() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-6 md:py-28">
      <SectionHeading
        eyebrow="Galería"
        title="Inspirate para tu próximo evento."
        description="Las fotos reales de Chumes van a vivir aquí. Por ahora dejamos la estructura lista."
      />
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {HOME_INSPIRATION.map((item) => (
          <StorefrontImage
            key={item.image}
            placeholder={item.image}
            alt={item.alt}
            className={cn("aspect-[4/5]", item.className)}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ))}
      </div>
    </section>
  );
}
