import { CalendarRange } from "lucide-react";
import { PlannerBoard } from "@/components/planner/planner-board";
import {
  getPlannerMonthGrid,
  parsePlannerDay,
  parsePlannerMonth,
} from "@/lib/planner/calendar";
import { getPlannerEvents } from "@/lib/planner/queries";
import { todayInCostaRica } from "@/lib/follow-ups/calendar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Planificador",
};

type PlannerPageProps = {
  searchParams: Promise<{
    month?: string;
    day?: string;
  }>;
};

export default async function PlannerPage({ searchParams }: PlannerPageProps) {
  const { month: monthParam, day: dayParam } = await searchParams;
  const todayKey = todayInCostaRica();
  const month = parsePlannerMonth(monthParam, todayKey);
  const grid = getPlannerMonthGrid(month);
  const day = parsePlannerDay(dayParam, grid, todayKey);
  const events = await getPlannerEvents(grid.startKey, grid.endKey);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="inline-flex items-center gap-1.5 text-3xl font-semibold tracking-tight">
          <CalendarRange className="size-7 text-muted-foreground" />
          Planificador
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Eventos ya reservados, por fecha del evento. Abrí un día para ver qué
          hay comprometido y si el stock alcanza para otra reserva.
        </p>
      </div>

      <PlannerBoard
        events={events}
        month={month}
        day={day}
        todayKey={todayKey}
      />
    </main>
  );
}
