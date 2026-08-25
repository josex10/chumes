"use client";

import { useState, type ReactNode } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EventsCollapsibleFiltersProps = {
  toolbar: ReactNode;
  children: ReactNode;
  hasActiveFilters?: boolean;
};

export function EventsCollapsibleFilters({
  toolbar,
  children,
  hasActiveFilters = false,
}: EventsCollapsibleFiltersProps) {
  const [open, setOpen] = useState(hasActiveFilters);

  return (
    <div className="flex shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {toolbar}
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center gap-1.5"
        >
          <Filter className="size-3.5" />
          Filtros
          {hasActiveFilters ? (
            <span
              className={cn(
                "size-1.5 rounded-full bg-sky-500",
                open && "bg-sky-600",
              )}
              aria-label="Hay filtros activos"
            />
          ) : null}
        </Button>
      </div>
      {open ? children : null}
    </div>
  );
}
