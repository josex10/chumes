"use client";

import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/quotes/format";
import type { DailyPoint } from "@/lib/dashboard/stats";

const chartConfig = {
  count: {
    label: "Reservas",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

type ReservationsSummaryProps = {
  totalReserved: number;
  totalReservedAmount: number;
  reservationsDaily: DailyPoint[];
};

export function ReservationsSummary({
  totalReserved,
  totalReservedAmount,
  reservationsDaily,
}: ReservationsSummaryProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Reservas</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="ring-1 ring-border/60 shadow-none">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Leads que reservaron</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{totalReserved}</p>
          </CardContent>
        </Card>
        <Card className="ring-1 ring-border/60 shadow-none">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Monto reservado</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatCurrency(totalReservedAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {totalReserved > 0 && (
        <ChartContainer config={chartConfig} className="aspect-auto h-[120px] w-full">
          <BarChart data={reservationsDaily} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="dayLabel" hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "count") return `${value} reserva${Number(value) === 1 ? "" : "s"}`;
                    return value;
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[2, 2, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ChartContainer>
      )}
    </section>
  );
}
