import type { LeadsDailyPoint } from "@/lib/dashboard/stats";

type LeadsDailyBreakdownProps = {
  data: LeadsDailyPoint[];
};

export function LeadsDailyBreakdown({ data }: LeadsDailyBreakdownProps) {
  const daysWithLeads = data.filter((day) => day.total > 0);

  if (daysWithLeads.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
        Desglose diario
      </h2>
      <div className="rounded-lg border ring-1 ring-border/60">
        <ul className="divide-y divide-border/60">
          {daysWithLeads.map((day) => {
            const parts = Object.entries(day.bySource)
              .filter(([, count]) => count > 0)
              .map(([source, count]) => `${source} ${count}`)
              .join(" · ");

            return (
              <li key={day.dateKey} className="flex items-baseline justify-between gap-4 px-4 py-3">
                <span className="text-sm font-medium capitalize">{day.dayLabel}</span>
                <span className="text-right text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{day.total}</span>
                  {parts && <> — {parts}</>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
