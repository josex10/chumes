import Link from "next/link";
import { LeadsDailyBreakdown } from "@/components/dashboard/leads-daily-breakdown";
import { LeadsHeroChart } from "@/components/dashboard/leads-hero-chart";
import { LeadsSourceSummary } from "@/components/dashboard/leads-source-summary";
import { ReservationsSummary } from "@/components/dashboard/reservations-summary";
import { buttonVariants } from "@/components/ui/button";
import type { LeadsWeekStats, ReservationsWeekStats } from "@/lib/dashboard/stats";
import { cn } from "@/lib/utils";

type MainTabProps = {
  leadsStats: LeadsWeekStats;
  reservationsStats: ReservationsWeekStats;
  sourceNames: string[];
};

export function MainTab({ leadsStats, reservationsStats, sourceNames }: MainTabProps) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <p className="text-5xl font-semibold tracking-tight sm:text-6xl">
            {leadsStats.totalLeads}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {leadsStats.totalLeads === 0
              ? "Aún no hay leads registrados esta semana"
              : `lead${leadsStats.totalLeads === 1 ? "" : "s"} registrado${leadsStats.totalLeads === 1 ? "" : "s"}`}
          </p>
        </div>

        <LeadsHeroChart data={leadsStats.leadsDaily} sourceNames={sourceNames} />
        <LeadsSourceSummary sourceTotals={leadsStats.sourceTotals} />
        <LeadsDailyBreakdown data={leadsStats.leadsDaily} />
      </section>

      <ReservationsSummary
        totalReserved={reservationsStats.totalReserved}
        totalReservedAmount={reservationsStats.totalReservedAmount}
        reservationsDaily={reservationsStats.reservationsDaily}
      />

      <section className="flex flex-wrap gap-3">
        <Link href="/events/new" className={cn(buttonVariants({ variant: "add" }))}>
          Nuevo evento
        </Link>
        <Link href="/customers/new" className={cn(buttonVariants({ variant: "add" }))}>
          Nuevo cliente
        </Link>
      </section>
    </div>
  );
}
