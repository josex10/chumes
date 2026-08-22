import type { Metadata } from "next";
import { StoreHero } from "@/app/(public)/layout";
import { CHUMES_STOREFRONT, getWhatsAppUrl } from "@/lib/storefront/company";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctenos para cotizar mantelería y mobiliario para eventos.",
};

export default function ContactPage() {
  const whatsappUrl = getWhatsAppUrl();

  return (
    <>
      <StoreHero
        eyebrow="Contacto"
        title="Hablemos de su evento"
        description="Cuéntenos qué necesita y con gusto le ayudamos a armar la cotización ideal."
      />

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-20 md:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-card p-8">
          <h2 className="text-xl font-semibold">{CHUMES_STOREFRONT.name}</h2>
          <dl className="mt-6 space-y-4 text-sm">
            {CHUMES_STOREFRONT.phone ? (
              <div>
                <dt className="text-muted-foreground">Teléfono</dt>
                <dd className="mt-1 text-base">{CHUMES_STOREFRONT.phone}</dd>
              </div>
            ) : null}
            {CHUMES_STOREFRONT.email ? (
              <div>
                <dt className="text-muted-foreground">Correo</dt>
                <dd className="mt-1 text-base">{CHUMES_STOREFRONT.email}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-8">
          <h2 className="text-xl font-semibold">¿Prefiere cotizar en línea?</h2>
          <p className="mt-3 text-muted-foreground">
            Arme su lista de productos en el catálogo y envíenos la solicitud con
            un solo formulario.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/catalogo"
              className={cn(buttonVariants({ variant: "commit" }), "rounded-full px-6")}
            >
              Ver catálogo
            </a>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-6")}
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
