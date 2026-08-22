import type { Metadata } from "next";
import { QuoteRequestForm } from "@/components/storefront/quote-request-form";
import { StoreHero } from "@/app/(public)/layout";

export const metadata: Metadata = {
  title: "Cotizar",
  description: "Arme su solicitud de cotización para mantelería y mobiliario.",
};

export default function QuotePage() {
  return (
    <>
      <StoreHero
        eyebrow="Cotización"
        title="Solicite su cotización"
        description="Revise los productos seleccionados, complete sus datos y envíenos la solicitud. Le contactaremos para confirmar detalles."
      />
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <QuoteRequestForm />
      </section>
    </>
  );
}
