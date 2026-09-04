import type { Metadata } from "next";
import Link from "next/link";
import { HomeProcess } from "@/components/storefront/home/home-process";
import { SectionHeading } from "@/components/storefront/section-heading";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import { CHUMES_STOREFRONT } from "@/lib/storefront/company";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Chumes alquila mesas, sillas, mantelería y equipo para eventos en la Gran Área Metropolitana. Puntualidad, presentación y atención personalizada.",
};

const VALUES = [
  {
    title: "Puntualidad",
    text: "El equipo llega a tiempo para que el evento empiece tranquilo.",
  },
  {
    title: "Presentación",
    text: "Limpio, ordenado y listo para verse bien en fotos y en persona.",
  },
  {
    title: "Facilidad",
    text: "Vos disfrutás el evento. Nosotros nos encargamos del equipo.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-6 md:py-24">
        <div>
          <p className="text-[0.7rem] tracking-[0.28em] text-brand-gold uppercase">
            Nosotros
          </p>
          <h1 className="font-heading mt-4 text-4xl font-medium tracking-tight md:text-5xl">
            Vos disfrutás el evento. Nosotros nos encargamos del equipo.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {CHUMES_STOREFRONT.description} Trabajamos para que no tengás que
            preocuparte por sillas, mesas ni mantelería: llega bien, a tiempo y
            se ve increíble.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cotizar"
              className="inline-flex h-12 items-center rounded-full bg-brand px-7 text-sm text-ivory hover:bg-brand-deep"
            >
              Cotizar mi evento
            </Link>
            <Link
              href="/contacto"
              className="inline-flex h-12 items-center rounded-full border border-arena px-7 text-sm text-brand"
            >
              Hablar con nosotros
            </Link>
          </div>
        </div>
        <StorefrontImage
          placeholder="inspiracion-montaje"
          alt="Montaje de evento con equipo de Chumes"
          className="aspect-[4/5]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </section>

      <section className="border-y border-arena/70 bg-[#f3eee6]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 md:px-6 md:py-24">
          {VALUES.map((value) => (
            <div key={value.title}>
              <h2 className="font-heading text-2xl">{value.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-6 md:py-24">
        <SectionHeading
          title="Área de cobertura"
          description={CHUMES_STOREFRONT.coverage}
        />
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Atendemos reuniones pequeñas, celebraciones familiares y eventos de
          mayor tamaño. Si estás organizando algo cerca, escribinos y te
          confirmamos la entrega.
        </p>
      </section>

      <HomeProcess />

      <section className="bg-brand-deep text-ivory">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-24">
          <h2 className="font-heading max-w-xl text-3xl md:text-4xl">
            ¿Ya tenés fecha?
          </h2>
          <Link
            href="/cotizar"
            className="inline-flex h-12 items-center rounded-full bg-ivory px-7 text-sm text-brand hover:bg-brand-gold-soft"
          >
            Cotizar mi evento
          </Link>
        </div>
      </section>
    </>
  );
}
