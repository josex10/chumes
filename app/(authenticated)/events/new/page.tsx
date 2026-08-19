import { getCustomerTypes } from "@/lib/customers/queries";
import { getEventSourcesForSelect } from "@/lib/event-sources/queries";
import { EventForm } from "@/components/events/event-form";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const [customerTypes, sources] = await Promise.all([
    getCustomerTypes(),
    getEventSourcesForSelect(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 py-8">
      <EventForm customerTypes={customerTypes} sources={sources} />
    </main>
  );
}
