import Link from "next/link";
import { MessageCircleMore, Settings2 } from "lucide-react";
import {
  FollowUpQueueSummary,
  FollowUpQueueTable,
} from "@/components/follow-ups/follow-up-queue-table";
import { EventsHint } from "@/components/events/events-hint";
import { FOLLOW_UP_BUCKET } from "@/lib/follow-ups/constants";
import {
  getFollowUpQueue,
  getFollowUpTemplates,
} from "@/lib/follow-ups/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SeguimientosPage() {
  const [queue, templates] = await Promise.all([
    getFollowUpQueue(),
    getFollowUpTemplates(true),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="inline-flex items-center gap-1.5 text-3xl font-semibold tracking-tight">
            <MessageCircleMore className="size-7 text-muted-foreground" />
            Seguimientos
            <EventsHint description="Cola de contactos para hoy y vencidos, más eventos comerciales con fecha esta semana. El kanban no se mueve al escribirle al cliente." />
          </h1>
          <p className="mt-2 text-muted-foreground">
            Estos son los clientes a los que deberías escribirles hoy, y los
            eventos de esta semana aún sin cerrar.
          </p>
        </div>
        <Link
          href="/seguimientos/plantillas"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex items-center gap-1.5",
          )}
        >
          <Settings2 className="size-4" />
          Plantillas
        </Link>
      </div>

      <FollowUpQueueSummary
        counts={{
          closeThisWeek: queue.closeThisWeek.length,
          step1: queue.step1.length,
          step2: queue.step2.length,
          step3: queue.step3.length,
          noResponse: queue.noResponse.length,
        }}
      />

      <FollowUpQueueTable
        items={queue.closeThisWeek}
        bucket={FOLLOW_UP_BUCKET.CLOSE_THIS_WEEK}
        templates={templates}
      />
      <FollowUpQueueTable
        items={queue.step1}
        bucket={FOLLOW_UP_BUCKET.STEP_1}
        templates={templates}
      />
      <FollowUpQueueTable
        items={queue.step2}
        bucket={FOLLOW_UP_BUCKET.STEP_2}
        templates={templates}
      />
      <FollowUpQueueTable
        items={queue.step3}
        bucket={FOLLOW_UP_BUCKET.STEP_3}
        templates={templates}
      />
      <FollowUpQueueTable
        items={queue.noResponse}
        bucket={FOLLOW_UP_BUCKET.NO_RESPONSE}
        templates={templates}
      />
    </main>
  );
}
