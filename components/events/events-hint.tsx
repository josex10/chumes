import { CircleAlert } from "lucide-react";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { cn } from "@/lib/utils";

type EventsHintProps = {
  description: string;
  side?: "top" | "bottom";
  className?: string;
};

export function EventsHint({
  description,
  side = "bottom",
  className,
}: EventsHintProps) {
  return (
    <SimpleTooltip label={description} side={side} wide>
      <button
        type="button"
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full text-amber-600 transition hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/15 dark:hover:text-amber-300",
          className,
        )}
        aria-label={description}
      >
        <CircleAlert className="size-4" />
      </button>
    </SimpleTooltip>
  );
}
