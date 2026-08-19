import { notFound } from "next/navigation";
import { getCustomerTypes } from "@/lib/customers/queries";
import { getEventSourcesForSelect } from "@/lib/event-sources/queries";
import { getEventById } from "@/lib/events/queries";
import { getStatusPhase } from "@/lib/events/status-transitions";
import { EVENT_PHASE } from "@/lib/events/constants";
import { EventForm } from "@/components/events/event-form";

export const dynamic = "force-dynamic";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  if (getStatusPhase(event.event_statuses.code) !== EVENT_PHASE.COMMERCIAL) {
    notFound();
  }

  const [customerTypes, sources] = await Promise.all([
    getCustomerTypes(),
    getEventSourcesForSelect(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-8">
      <EventForm customerTypes={customerTypes} sources={sources} event={event} />
    </main>
  );
}
