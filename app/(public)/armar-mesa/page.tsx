import type { Metadata } from "next";
import { TableBuilder } from "@/components/storefront/table-builder/table-builder";
import { getTableBuilderCatalog } from "@/lib/storefront/table-builder-queries";

export const metadata: Metadata = {
  title: "Armar tu mesa",
  description:
    "Diseñe su mesa para eventos: forma, sillas, mantel, forros y sobre-mantel, y solicite una cotización.",
};

export const dynamic = "force-dynamic";

export default async function ArmarMesaPage() {
  const options = await getTableBuilderCatalog();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Configurador
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Armar tu mesa
        </h1>
        <p className="mt-3 text-muted-foreground">
          Elija mesa, sillas, mantel y forros. Gire la vista para ver cómo queda el
          diseño y envíelo a cotización cuando esté listo.
        </p>
      </div>
      <TableBuilder options={options} />
    </main>
  );
}
