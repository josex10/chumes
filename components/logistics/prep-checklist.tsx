"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { togglePrepStep } from "@/lib/logistics/actions";
import { PREP_STEPS, PREP_STEP_COLUMNS, type PrepStep } from "@/lib/logistics/constants";
import type { EventLogistics } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type PrepChecklistProps = {
  eventId: string;
  logistics: EventLogistics | null;
};

function isStepDone(logistics: EventLogistics | null, step: PrepStep): boolean {
  if (!logistics) return false;
  return Boolean(logistics[PREP_STEP_COLUMNS[step]]);
}

export function PrepChecklist({ eventId, logistics }: PrepChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingStep, setPendingStep] = useState<PrepStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleToggle(step: PrepStep) {
    setError(null);
    setPendingStep(step);
    startTransition(async () => {
      const result = await togglePrepStep(eventId, step);
      setPendingStep(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Alistado
      </p>
      <div className="flex flex-col gap-1.5">
        {PREP_STEPS.map((step, index) => {
          const done = isStepDone(logistics, step.id);
          const loading = pendingStep === step.id && isPending;

          return (
            <button
              key={step.id}
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(step.id)}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                done
                  ? "border-emerald-600/30 bg-emerald-500/10"
                  : "border-transparent bg-muted/30 hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  done
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-input bg-background text-muted-foreground",
                )}
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : done ? (
                  <Check className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              {step.label}
            </button>
          );
        })}
      </div>
      {PREP_STEPS.every((step) => isStepDone(logistics, step.id)) ? (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300">
          Lista para instalar. Ya aparece en Instalaciones.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
