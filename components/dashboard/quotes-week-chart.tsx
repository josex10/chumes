"use client";

import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyPoint } from "@/lib/dashboard/stats";

const chartConfig = {
  count: {
    label: "Cotizaciones",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type QuotesWeekChartProps = {
  data: DailyPoint[];
};

export function QuotesWeekChart({ data }: QuotesWeekChartProps) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[80px] w-full">
      <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="dayLabel" hide />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[2, 2, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
