"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getWeekKey, parseWeekKey } from "@/lib/dashboard/stats";
import { cn } from "@/lib/utils";

type WeekPickerProps = {
  weekKey: string;
  weekRange: string;
};

export function WeekPicker({ weekKey, weekRange }: WeekPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigateToWeek(reference: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", getWeekKey(reference));
    router.push(`/dashboard?${params.toString()}`);
  }

  function goToPreviousWeek() {
    const current = parseWeekKey(weekKey);
    current.setDate(current.getDate() - 7);
    navigateToWeek(current);
  }

  function goToNextWeek() {
    const current = parseWeekKey(weekKey);
    current.setDate(current.getDate() + 7);
    navigateToWeek(current);
  }

  function goToCurrentWeek() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("week");
    router.push(`/dashboard?${params.toString()}`);
  }

  const isCurrentWeek = weekKey === getWeekKey();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={goToPreviousWeek}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        aria-label="Semana anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex min-w-[180px] flex-col items-center">
        <span className="text-sm font-medium">{weekRange}</span>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={goToCurrentWeek}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Ir a esta semana
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={goToNextWeek}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        aria-label="Semana siguiente"
        disabled={isCurrentWeek}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
