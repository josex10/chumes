"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DemoReport, DemoSeriesPoint } from "@/lib/demo-report/aggregate";
import { DEMO_VIEW } from "@/lib/demo-report/period";
import { formatDateKey } from "@/lib/follow-ups/calendar";
import { formatCurrency } from "@/lib/quotes/format";

const moneyConfig = {
  sold: { label: "Vendidos", color: "var(--chart-5)" },
  lost: { label: "Perdidos", color: "var(--chart-2)" },
} satisfies ChartConfig;

const quotedConfig = {
  quoted: { label: "Cotizado", color: "var(--chart-3)" },
} satisfies ChartConfig;

const leadsConfig = {
  leads: { label: "Leads", color: "var(--chart-4)" },
} satisfies ChartConfig;

const transportConfig = {
  transport: { label: "Transporte", color: "var(--chart-5)" },
} satisfies ChartConfig;

const comparisonConfig = {
  amount: { label: "Monto", color: "var(--chart-5)" },
} satisfies ChartConfig;

type DemoReportChartsProps = {
  report: DemoReport;
};

function dateLabel(payload: unknown): string {
  const point = payload as DemoSeriesPoint | undefined;
  return point?.dateKey ? formatDateKey(point.dateKey) : "";
}

export function DemoReportCharts({ report }: DemoReportChartsProps) {
  const tickInterval = report.view === DEMO_VIEW.MONTH ? 2 : 0;

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Comparación del periodo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Los cuatro montos juntos. El transporte ya está dentro de vendidos.
          </p>
        </div>
        <ChartContainer config={comparisonConfig} className="aspect-auto h-[220px] w-full">
          <BarChart
            data={report.comparison}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={96}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={4} maxBarSize={28} />
          </BarChart>
        </ChartContainer>
      </section>

      <section id="vendidos" className="flex scroll-mt-6 flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Vendidos y perdidos por fecha del evento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Un evento archivado hoy con fecha en otro mes aparece en ese mes.
          </p>
        </div>
        <ChartContainer config={moneyConfig} className="aspect-auto h-[280px] w-full">
          <LineChart data={report.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              interval={tickInterval}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => dateLabel(payload?.[0]?.payload)}
                  formatter={(value, name) => {
                    const label = name === "lost" ? "Perdidos" : "Vendidos";
                    return `${label}: ${formatCurrency(Number(value))}`;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="sold"
              stroke="var(--color-sold)"
              strokeWidth={1.75}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="lost"
              stroke="var(--color-lost)"
              strokeWidth={1.75}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section id="cotizaciones" className="flex scroll-mt-6 flex-col gap-3">
          <div>
            <h2 className="text-sm font-medium">Cotizaciones por día de creación</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Incluye las que siguen abiertas.
            </p>
          </div>
          <ChartContainer config={quotedConfig} className="aspect-auto h-[220px] w-full">
            <BarChart data={report.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                interval={tickInterval}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => dateLabel(payload?.[0]?.payload)}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar dataKey="quoted" fill="var(--color-quoted)" radius={[2, 2, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ChartContainer>
        </section>

        <section id="leads" className="flex scroll-mt-6 flex-col gap-3">
          <div>
            <h2 className="text-sm font-medium">Leads por día</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cantidad de eventos creados cada día.
            </p>
          </div>
          <ChartContainer config={leadsConfig} className="aspect-auto h-[220px] w-full">
            <BarChart data={report.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                interval={tickInterval}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => dateLabel(payload?.[0]?.payload)}
                    formatter={(value) => {
                      const count = Number(value);
                      return `${count} lead${count === 1 ? "" : "s"}`;
                    }}
                  />
                }
              />
              <Bar dataKey="leads" fill="var(--color-leads)" radius={[2, 2, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ChartContainer>
        </section>
      </div>

      <section id="transporte" className="flex scroll-mt-6 flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Transporte cobrado por fecha del evento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo alquileres vendidos. Es el monto de transporte de la cotización.
          </p>
        </div>
        <ChartContainer config={transportConfig} className="aspect-auto h-[200px] w-full">
          <BarChart data={report.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              interval={tickInterval}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => dateLabel(payload?.[0]?.payload)}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Bar
              dataKey="transport"
              fill="var(--color-transport)"
              radius={[2, 2, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ChartContainer>
      </section>
    </div>
  );
}
