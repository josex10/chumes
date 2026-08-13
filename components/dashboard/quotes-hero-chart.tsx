"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/quotes/format";
import type { DailyPoint } from "@/lib/dashboard/stats";

const chartConfig = {
  amount: {
    label: "Monto",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type QuotesHeroChartProps = {
  data: DailyPoint[];
};

export function QuotesHeroChart({ data }: QuotesHeroChartProps) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="quoteAmountFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-amount)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="var(--color-amount)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/30" />
        <XAxis
          dataKey="dayLabel"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          className="text-xs"
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                if (name === "amount") {
                  return formatCurrency(Number(value));
                }
                return value;
              }}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="var(--color-amount)"
          strokeWidth={1.5}
          fill="url(#quoteAmountFill)"
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
