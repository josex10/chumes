import Link from "next/link";
import { getWhatsAppHref, hasWhatsAppNumber } from "@/lib/storefront/company";

export function HomeFinalCta() {
  const whatsappHref = getWhatsAppHref();

  return (
    <section className="bg-brand-deep text-ivory">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-6 md:py-28">
        <div className="max-w-xl">
          <h2 className="font-heading text-4xl md:text-5xl">¿Ya tenés fecha?</h2>
          <p className="mt-5 text-ivory/75">
            Contanos qué estás organizando y te ayudamos a preparar todo lo
            necesario.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/cotizar"
            className="inline-flex h-12 items-center rounded-full bg-ivory px-7 text-sm text-brand hover:bg-brand-gold-soft"
          >
            Cotizar mi evento
          </Link>
          <a
            href={whatsappHref}
            target={hasWhatsAppNumber() ? "_blank" : undefined}
            rel={hasWhatsAppNumber() ? "noreferrer" : undefined}
            className="inline-flex h-12 items-center rounded-full border border-ivory/35 px-7 text-sm text-ivory hover:border-ivory"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
