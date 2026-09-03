import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ReadyForInstallBadgeProps = {
  className?: string;
};

export function ReadyForInstallBadge({ className }: ReadyForInstallBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300",
        className,
      )}
    >
      <Check className="size-3" />
      Lista para instalar
    </span>
  );
}
