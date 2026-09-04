import type { Metadata } from "next";
import { QuoteSuccessActions } from "@/components/storefront/quote-success-actions";
import { SectionHeading } from "@/components/storefront/section-heading";

export const metadata: Metadata = {
  title: "Solicitud enviada",
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuoteSuccessPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-20 md:px-6 md:py-28">
      <SectionHeading
        as="h1"
        eyebrow="Listo"
        title="Recibimos tu solicitud."
        description="Ya nos llegó como un lead del sitio web. Te vamos a escribir para confirmar fecha, entrega y la cotización final."
      />
      <QuoteSuccessActions />
    </section>
  );
}
