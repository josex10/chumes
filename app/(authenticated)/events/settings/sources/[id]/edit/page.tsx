import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventSourceById } from "@/lib/event-sources/queries";
import { EventSourceForm } from "@/components/events/event-source-form";

export const dynamic = "force-dynamic";

type EditEventSourcePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventSourcePage({
  params,
}: EditEventSourcePageProps) {
  const { id } = await params;
  const sourceId = Number(id);

  if (!Number.isInteger(sourceId) || sourceId <= 0) {
    notFound();
  }

  const source = await getEventSourceById(sourceId);

  if (!source) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/events/settings/sources"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a fuentes
      </Link>
      <EventSourceForm source={source} />
    </main>
  );
}
