"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getWeekKey } from "@/lib/dashboard/stats";
import { gastosHref } from "@/lib/expenses/format";
import { addCalendarDays } from "@/lib/follow-ups/calendar";
import { cn } from "@/lib/utils";

type GastosWeekNavProps = {
  weekKey: string;
  weekRange: string;
};

export function GastosWeekNav({ weekKey, weekRange }: GastosWeekNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(nextWeek: string | null) {
    const category = searchParams.get("category");
    const method = searchParams.get("method");
    const categoryId = category && /^\d+$/.test(category) ? Number(category) : null;
    const methodId = method && /^\d+$/.test(method) ? Number(method) : null;
    router.push(
      gastosHref({
        tab: searchParams.get("tab") === "inversiones" ? "inversiones" : "gastos",
        week: nextWeek,
        category: categoryId,
        method: methodId,
      }),
    );
  }

  const isCurrentWeek = weekKey === getWeekKey();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => navigate(addCalendarDays(weekKey, -7))}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        aria-label="Semana anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex min-w-[180px] flex-col items-center">
        <span className="text-sm font-medium">{weekRange}</span>
        {!isCurrentWeek ? (
          <button
            type="button"
            onClick={() => navigate(null)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Ir a esta semana
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => navigate(addCalendarDays(weekKey, 7))}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        aria-label="Semana siguiente"
        disabled={isCurrentWeek}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
