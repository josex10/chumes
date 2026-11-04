"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatRatioLabel, type WeekReportCategory, type WeekReportDay } from "@/lib/dashboard/week-report";
import { formatCurrency } from "@/lib/quotes/format";

const eventsConfig = {
  count: {
    label: "Eventos",
    color: "var(--foreground)",
  },
} satisfies ChartConfig;

const categoriesConfig = {
  total: {
    label: "Gastos",
    color: "var(--foreground)",
  },
} satisfies ChartConfig;

type ResumenChartsProps = {
  days: WeekReportDay[];
  categories: WeekReportCategory[];
};

export function ResumenCharts({ days, categories }: ResumenChartsProps) {
  const categoryData = categories.map((category) => ({
    name: category.name,
    total: category.total,
    label: `${formatCurrency(category.total)} · ${formatRatioLabel(category.percent)}`,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="flex min-w-0 flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
          Eventos por día
        </h3>
        <ChartContainer config={eventsConfig} className="aspect-auto h-[220px] w-full">
          <BarChart data={days} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[3, 3, 0, 0]}
              maxBarSize={36}
            >
              <LabelList
                dataKey="count"
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </section>

      <section className="flex min-w-0 flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
          Gastos por categoría
        </h3>
        {categoryData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No hay gastos esta semana
          </div>
        ) : (
          <ChartContainer
            config={categoriesConfig}
            className="aspect-auto w-full"
            style={{ height: Math.max(180, categoryData.length * 44) }}
          >
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 4, right: 128, left: 8, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={[0, 3, 3, 0]} barSize={12}>
                <LabelList
                  dataKey="label"
                  position="right"
                  offset={8}
                  className="fill-muted-foreground"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </section>
    </div>
  );
}
