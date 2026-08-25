import { MessageCircleMore } from "lucide-react";
import {
  FollowUpQueueSummary,
  FollowUpQueueTable,
} from "@/components/follow-ups/follow-up-queue-table";
import { FollowUpTemplatesPanel } from "@/components/follow-ups/follow-up-templates-panel";
import { EventsHint } from "@/components/events/events-hint";
import { FOLLOW_UP_BUCKET } from "@/lib/follow-ups/constants";
import {
  getFollowUpQueue,
  getFollowUpTemplates,
} from "@/lib/follow-ups/queries";

export const dynamic = "force-dynamic";

export default async function SeguimientosPage() {
  const [queue, templates] = await Promise.all([
    getFollowUpQueue(),
    getFollowUpTemplates(),
  ]);
  const activeTemplates = templates.filter((template) => template.is_active);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div>
        <h1 className="inline-flex items-center gap-1.5 text-3xl font-semibold tracking-tight">
          <MessageCircleMore className="size-7 text-muted-foreground" />
          Seguimientos
          <EventsHint description="Cola de contactos para hoy y vencidos. El kanban no se mueve al escribirle al cliente." />
        </h1>
        <p className="mt-2 text-muted-foreground">
          Estos son los clientes a los que deberías escribirles hoy.
        </p>
      </div>

      <FollowUpQueueSummary
        counts={{
          step1: queue.step1.length,
          step2: queue.step2.length,
          step3: queue.step3.length,
          noResponse: queue.noResponse.length,
        }}
      />

      <FollowUpQueueTable
        items={queue.step1}
        bucket={FOLLOW_UP_BUCKET.STEP_1}
        templates={activeTemplates}
      />
      <FollowUpQueueTable
        items={queue.step2}
        bucket={FOLLOW_UP_BUCKET.STEP_2}
        templates={activeTemplates}
      />
      <FollowUpQueueTable
        items={queue.step3}
        bucket={FOLLOW_UP_BUCKET.STEP_3}
        templates={activeTemplates}
      />
      <FollowUpQueueTable
        items={queue.noResponse}
        bucket={FOLLOW_UP_BUCKET.NO_RESPONSE}
        templates={activeTemplates}
      />

      <FollowUpTemplatesPanel templates={templates} />
    </main>
  );
}
