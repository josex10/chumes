import { Card, CardContent } from "@/components/ui/card";
import type { DemoReport } from "@/lib/demo-report/aggregate";
import { periodNoun } from "@/lib/demo-report/aggregate";
import { formatCurrency } from "@/lib/quotes/format";

type DemoReportCardsProps = {
  report: DemoReport;
};

export function DemoReportCards({ report }: DemoReportCardsProps) {
  const noun = periodNoun(report.view);
  const cards = [
    {
      href: "#vendidos",
      label: "Alquileres vendidos",
      value: formatCurrency(report.sold.amount),
      detail: `${report.sold.count} evento${report.sold.count === 1 ? "" : "s"}`,
      hint: `Reservados, en operación y cerrados ganados con fecha de evento en este ${noun}. Incluye archivo.`,
    },
    {
      href: "#leads",
      label: "Leads recibidos",
      value: String(report.leads.count),
      detail: report.leads.count === 1 ? "evento nuevo" : "eventos nuevos",
      hint: `Eventos creados en este ${noun}, sin importar en qué estado estén ahora.`,
    },
    {
      href: "#cotizaciones",
      label: "Cotizaciones",
      value: formatCurrency(report.quoted.amount),
      detail: `${report.quoted.count} cotización${report.quoted.count === 1 ? "" : "es"}`,
      hint: "Creadas en el periodo, abiertas o cerradas. Si un evento tiene varias, cuenta la más reciente.",
    },
    {
      href: "#perdidos",
      label: "Perdidos",
      value: formatCurrency(report.lost.amount),
      detail: `${report.lost.count} evento${report.lost.count === 1 ? "" : "s"}`,
      hint: "Por fecha del evento. Si se archivó hoy y el evento es en diciembre, entra en diciembre.",
    },
    {
      href: "#transporte",
      label: "Transporte cobrado",
      value: formatCurrency(report.transport.amount),
      detail: `${report.transport.count} con transporte`,
      hint: "Monto de transporte de los alquileres vendidos. Ya va dentro del total vendido.",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <a key={card.label} href={card.href} className="block rounded-xl">
          <Card className="h-full ring-1 ring-border/60 shadow-none transition-colors hover:bg-muted/20">
            <CardContent>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
