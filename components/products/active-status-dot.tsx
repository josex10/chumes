"use client";

import { cn } from "@/lib/utils";

export function ActiveStatusDot({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  if (!active) {
    return null;
  }

  return (
    <span
      className={cn(
        "relative inline-flex size-3.5 shrink-0 items-center justify-center",
        className,
      )}
    >
      <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-500 opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
    </span>
  );
}
