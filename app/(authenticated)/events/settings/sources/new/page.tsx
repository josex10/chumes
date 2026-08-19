import Link from "next/link";
import { EventSourceForm } from "@/components/events/event-source-form";

export const dynamic = "force-dynamic";

export default function NewEventSourcePage() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/events/settings/sources"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a fuentes
      </Link>
      <EventSourceForm />
    </main>
  );
}
