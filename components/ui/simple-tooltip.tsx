import { cn } from "@/lib/utils";

type SimpleTooltipProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
  wide?: boolean;
};

export function SimpleTooltip({
  label,
  children,
  className,
  side = "top",
  wide = false,
}: SimpleTooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          side === "top"
            ? "bottom-[calc(100%+6px)]"
            : "top-[calc(100%+6px)]",
          wide
            ? "w-64 whitespace-normal text-left leading-relaxed"
            : "whitespace-nowrap",
        )}
      >
        {label}
      </span>
    </span>
  );
}
