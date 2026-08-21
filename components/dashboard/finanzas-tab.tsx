import { FinanceEventsTable } from "@/components/dashboard/finance-events-table";
import { FinanceSummaryCards } from "@/components/dashboard/finance-summary-cards";
import type { FinanceWeekStats } from "@/lib/dashboard/stats";

type FinanzasTabProps = {
  stats: FinanceWeekStats;
};

export function FinanzasTab({ stats }: FinanzasTabProps) {
  return (
    <div className="flex flex-col gap-8">
      <FinanceSummaryCards stats={stats} />
      <section className="flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
          Eventos de la semana
        </h2>
        <FinanceEventsTable stats={stats} />
      </section>
    </div>
  );
}
