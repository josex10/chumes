import Image from "next/image";
import Link from "next/link";
import { STOREFRONT_HERO } from "@/lib/storefront/media";

export function HomeHero() {
  return (
    <section className="bg-ivory">
      <div className="grid lg:min-h-[calc(100svh-7.25rem)] lg:grid-cols-2">
        <div className="relative order-1 min-h-[48svh] overflow-hidden lg:order-2 lg:min-h-full">
          <Image
            src={STOREFRONT_HERO.src}
            alt={STOREFRONT_HERO.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative order-2 flex flex-col items-start px-5 py-12 md:px-10 md:py-16 lg:order-1 lg:items-center lg:justify-center lg:px-12 lg:py-16 xl:px-16">
          <div className="w-full max-w-md lg:text-center">
            <h1 className="font-heading text-4xl leading-[1.18] font-medium tracking-tight text-charcoal md:text-5xl">
              Hacemos que tu evento se sienta{" "}
              <span className="font-script inline-block text-[1.28em] leading-none font-normal tracking-normal">
                especial.
              </span>
            </h1>
            <p className="mt-5 text-base text-muted-foreground md:text-lg">
              Mobiliario, mesas, sillas y mantelería para crear el ambiente
              perfecto en cada celebración.
            </p>
            <p className="mt-4 text-base font-semibold tracking-wide text-charcoal md:text-lg">
              Calidad, estilo y simplicidad.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 lg:justify-center">
              <Link
                href="/cotizar#formulario"
                className="inline-flex h-12 items-center rounded-full bg-brand px-7 text-sm font-semibold tracking-wide text-ivory transition hover:bg-brand-deep"
              >
                Cotizar mi evento
              </Link>
              <Link
                href="/catalogo"
                className="inline-flex h-12 items-center rounded-full border border-arena px-7 text-sm font-semibold tracking-wide text-brand transition hover:border-brand hover:bg-brand/5"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
          <a
            href="#confianza"
            className="mt-10 hidden w-fit flex-col items-center gap-2 text-muted-foreground lg:absolute lg:bottom-8 lg:left-1/2 lg:flex lg:-translate-x-1/2"
          >
            <span className="text-[0.65rem] tracking-[0.22em] uppercase">
              Seguí explorando
            </span>
            <span className="storefront-scroll-cue h-8 w-px bg-brand/35" />
            <span className="sr-only">Ir a la siguiente sección</span>
          </a>
        </div>
      </div>
    </section>
  );
}
