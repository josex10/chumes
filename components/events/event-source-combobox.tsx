"use client";

import { useMemo } from "react";
import type { EventSource } from "@/lib/supabase/types";
import { SearchCombobox } from "@/components/ui/search-combobox";

type EventSourceComboboxProps = {
  sources: EventSource[];
  value?: string;
  onValueChange: (sourceId: string) => void;
  disabled?: boolean;
  id?: string;
  currentSourceId?: number;
};

export function EventSourceCombobox({
  sources,
  value,
  onValueChange,
  disabled = false,
  id,
  currentSourceId,
}: EventSourceComboboxProps) {
  const items = useMemo(
    () =>
      sources.map((source) => {
        const isCurrentInactive =
          !source.is_active && source.id === currentSourceId;

        return {
          value: String(source.id),
          label: source.is_favorite ? `★ ${source.name}` : source.name,
          searchText: `${source.name} ${source.code} ${source.description ?? ""}`,
          description: source.description ?? undefined,
          disabled: !source.is_active && !isCurrentInactive,
          disabledReason:
            !source.is_active && !isCurrentInactive ? "Deshabilitado" : undefined,
        };
      }),
    [sources, currentSourceId],
  );

  return (
    <SearchCombobox
      id={id}
      items={items}
      value={value}
      onValueChange={onValueChange}
      placeholder="Buscar fuente..."
      searchPlaceholder="Nombre o código..."
      emptyMessage="No se encontraron fuentes."
      disabled={disabled}
      triggerClassName="min-w-[220px]"
    />
  );
}
