import Link from "next/link";
import { StorefrontImage } from "@/components/storefront/storefront-image";

export function HomeHero() {
  return (
    <section className="relative min-h-[88svh] overflow-hidden">
      <StorefrontImage
        placeholder="hero-montaje"
        alt="Todo listo para que tu evento sea inolvidable."
        priority
        sizes="100vw"
        className="absolute inset-0"
      />
      <div className="absolute inset-0 bg-charcoal/35" />
      <div className="relative mx-auto flex min-h-[88svh] w-full max-w-6xl flex-col justify-end px-5 pb-20 md:px-6 md:pb-24">
        <p className="text-[0.7rem] tracking-[0.32em] text-brand-gold-soft uppercase">
          Gran Área Metropolitana
        </p>
        <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.05] font-medium text-ivory md:text-6xl">
          Todo listo para que tu evento sea inolvidable.
        </h1>
        <p className="mt-5 max-w-xl text-base text-ivory/80 md:text-lg">
          Alquiler de mesas, sillas, mantelería y equipo para eventos en la Gran
          Área Metropolitana.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/cotizar"
            className="inline-flex h-12 items-center rounded-full bg-brand px-7 text-sm text-ivory transition hover:bg-brand-deep"
          >
            Cotizar mi evento
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex h-12 items-center rounded-full border border-ivory/40 px-7 text-sm text-ivory transition hover:border-ivory hover:bg-ivory/10"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
      <a
        href="#confianza"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/70"
      >
        <span className="text-[0.65rem] tracking-[0.22em] uppercase">
          Seguí explorando
        </span>
        <span className="storefront-scroll-cue h-8 w-px bg-ivory/60" />
        <span className="sr-only">Ir a la siguiente sección</span>
      </a>
    </section>
  );
}
