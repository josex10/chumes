import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteRequestForm } from "@/components/storefront/quote-request-form";
import { SectionHeading } from "@/components/storefront/section-heading";

export const metadata: Metadata = {
  title: "Cotizar",
  description:
    "Armá tu evento, contanos los detalles y recibí una cotización de Chumes.",
};

export default function QuotePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-5 pt-14 pb-8 md:px-6 md:pt-20">
        <SectionHeading
          as="h1"
          eyebrow="Cotización"
          title="Armá tu evento y pedí cotización."
          description="Revisá lo que elegiste, contanos fecha y cantidad de personas, y te contactamos."
        />
      </section>
      <section className="mx-auto w-full max-w-6xl px-5 pb-24 md:px-6">
        <Suspense>
          <QuoteRequestForm />
        </Suspense>
      </section>
    </>
  );
}
