"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toggleReadyPacked } from "@/lib/logistics/actions";
import type { EventLogistics } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type ReadyPackedButtonProps = {
  eventId: string;
  logistics: EventLogistics | null;
};

export function ReadyPackedButton({
  eventId,
  logistics,
}: ReadyPackedButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const done = Boolean(logistics?.packed_at);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleReadyPacked(eventId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        aria-pressed={done}
        disabled={isPending}
        onClick={handleToggle}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-60",
          done
            ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600/90"
            : "border-border bg-background hover:bg-muted",
        )}
      >
        <span
          className={cn(
            "flex size-5 items-center justify-center rounded-full border",
            done ? "border-white/50 bg-white/15" : "border-input bg-background",
          )}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : done ? (
            <Check className="size-3.5" />
          ) : null}
        </span>
        Lista
      </button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
