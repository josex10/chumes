import { Card, CardContent } from "@/components/ui/card";
import type { SourceTotal } from "@/lib/dashboard/stats";

type LeadsSourceSummaryProps = {
  sourceTotals: SourceTotal[];
};

export function LeadsSourceSummary({ sourceTotals }: LeadsSourceSummaryProps) {
  if (sourceTotals.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
        Leads por canal
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sourceTotals.map((source) => (
          <Card key={source.sourceName} className="ring-1 ring-border/60 shadow-none">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">{source.sourceName}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{source.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
