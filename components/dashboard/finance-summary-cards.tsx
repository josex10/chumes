import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/quotes/format";
import type { FinanceWeekStats } from "@/lib/dashboard/stats";

type FinanceSummaryCardsProps = {
  stats: FinanceWeekStats;
};

export function FinanceSummaryCards({ stats }: FinanceSummaryCardsProps) {
  const cards = [
    {
      label: "Eventos confirmados",
      value: String(stats.confirmedEventsCount),
    },
    {
      label: "Valor total",
      value: formatCurrency(stats.totalQuoteValue),
    },
    {
      label: "Adelantos recibidos",
      value: formatCurrency(stats.totalNetPaid),
    },
    {
      label: "Pendiente por cobrar",
      value: formatCurrency(stats.totalBalanceDue),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="ring-1 ring-border/60 shadow-none">
          <CardContent className="pt-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
