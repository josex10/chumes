import type { Metadata } from "next";
import Link from "next/link";
import { StoreHero } from "@/app/(public)/layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Solicitud enviada",
};

export default function QuoteSuccessPage() {
  return (
    <>
      <StoreHero
        eyebrow="Gracias"
        title="Recibimos su solicitud"
        description="Nuestro equipo revisará los productos seleccionados y se comunicará con usted para confirmar fecha, entrega y cotización final."
      />
      <section className="mx-auto flex w-full max-w-6xl gap-4 px-6 pb-20">
        <Link
          href="/catalogo"
          className={cn(buttonVariants({ variant: "commit" }), "rounded-full px-6")}
        >
          Seguir explorando
        </Link>
        <Link
          href="/contacto"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-6")}
        >
          Contacto
        </Link>
      </section>
    </>
  );
}
