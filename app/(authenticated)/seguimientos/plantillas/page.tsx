import Link from "next/link";
import { FollowUpTemplatesManager } from "@/components/follow-ups/follow-up-templates-manager";
import { getFollowUpTemplates } from "@/lib/follow-ups/queries";

export const dynamic = "force-dynamic";

export default async function FollowUpTemplatesPage() {
  const templates = await getFollowUpTemplates();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div>
        <Link
          href="/seguimientos"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver a seguimientos
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Plantillas de WhatsApp
        </h1>
        <p className="mt-2 text-muted-foreground">
          Biblioteca de mensajes. Al dar un seguimiento elegís cualquiera,
          sin importar si el evento está en fase 1, 2 o 3.
        </p>
      </div>

      <FollowUpTemplatesManager templates={templates} />
    </main>
  );
}
