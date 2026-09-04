import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import {
  CHUMES_STOREFRONT,
  getWhatsAppHref,
  hasWhatsAppNumber,
} from "@/lib/storefront/company";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos por WhatsApp o cotizá en línea. Alquiler de equipo para eventos en la Gran Área Metropolitana.",
};

export default function ContactPage() {
  const whatsappHref = getWhatsAppHref();

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-5 pt-16 pb-10 md:px-6 md:pt-24">
        <p className="text-[0.7rem] tracking-[0.28em] text-brand-gold uppercase">
          Contacto
        </p>
        <h1 className="font-heading mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
          Hablemos de tu evento.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Contanos qué estás organizando. Te ayudamos a elegir el equipo y te
          armamos la cotización.
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-24 md:grid-cols-2 md:px-6">
        <div className="border border-arena/80 bg-ivory p-8">
          <h2 className="font-heading text-2xl">WhatsApp</h2>
          <p className="mt-3 text-muted-foreground">
            Es la forma más rápida de coordinar fechas y cantidades.
          </p>
          <p className="mt-6 text-lg">{CHUMES_STOREFRONT.phone}</p>
          <div className="mt-6">
            <WhatsAppButton label="Hablar por WhatsApp" />
          </div>
          <dl className="mt-10 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Cobertura</dt>
              <dd className="mt-1 text-base">{CHUMES_STOREFRONT.coverage}</dd>
            </div>
            {CHUMES_STOREFRONT.email ? (
              <div>
                <dt className="text-muted-foreground">Correo</dt>
                <dd className="mt-1 text-base">{CHUMES_STOREFRONT.email}</dd>
              </div>
            ) : null}
            {CHUMES_STOREFRONT.instagram ? (
              <div>
                <dt className="text-muted-foreground">Instagram</dt>
                <dd className="mt-1">
                  <a
                    href={CHUMES_STOREFRONT.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand"
                  >
                    {CHUMES_STOREFRONT.instagram}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="border border-arena/80 bg-ivory p-8">
          <h2 className="font-heading text-2xl">Cotizá en el sitio</h2>
          <p className="mt-3 text-muted-foreground">
            Armá tu evento en el catálogo, envianos la solicitud y te llega como
            lead. Si preferís, también podés escribirnos.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/cotizar"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand text-sm text-ivory hover:bg-brand-deep"
            >
              Cotizar mi evento
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex h-12 items-center justify-center rounded-full border border-arena text-sm text-brand"
            >
              Ver catálogo
            </Link>
            <a
              href={whatsappHref}
              target={hasWhatsAppNumber() ? "_blank" : undefined}
              rel={hasWhatsAppNumber() ? "noreferrer" : undefined}
              className="inline-flex h-12 items-center justify-center rounded-full border border-arena text-sm text-brand"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
