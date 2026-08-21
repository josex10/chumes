"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { LeadsDailyPoint } from "@/lib/dashboard/stats";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type LeadsHeroChartProps = {
  data: LeadsDailyPoint[];
  sourceNames: string[];
};

export function LeadsHeroChart({ data, sourceNames }: LeadsHeroChartProps) {
  const activeSources = sourceNames.filter((name) =>
    data.some((day) => (day.bySource[name] ?? 0) > 0),
  );

  const chartConfig = activeSources.reduce<ChartConfig>((config, name, index) => {
    config[sanitizeKey(name)] = {
      label: name,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
    return config;
  }, {});

  const chartData = data.map((day) => {
    const row: Record<string, string | number> = {
      dayLabel: day.dayLabel,
      total: day.total,
    };
    for (const name of activeSources) {
      row[sanitizeKey(name)] = day.bySource[name] ?? 0;
    }
    return row;
  });

  if (activeSources.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        No hay leads registrados esta semana
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
        <XAxis
          dataKey="dayLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          className="text-xs"
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {activeSources.map((name) => (
          <Bar
            key={name}
            dataKey={sanitizeKey(name)}
            stackId="leads"
            fill={`var(--color-${sanitizeKey(name)})`}
            radius={[0, 0, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function sanitizeKey(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}
