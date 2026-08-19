"use client";

import { useMemo } from "react";
import type { EventStatus } from "@/lib/supabase/types";
import { SearchCombobox } from "@/components/ui/search-combobox";

type EventStatusComboboxProps = {
  statuses: EventStatus[];
  value: string;
  onValueChange: (statusCode: string) => void;
  disabled?: boolean;
};

export function EventStatusCombobox({
  statuses,
  value,
  onValueChange,
  disabled = false,
}: EventStatusComboboxProps) {
  const items = useMemo(
    () =>
      statuses.map((status) => ({
        value: status.code,
        label: status.name,
        searchText: `${status.name} ${status.code}`,
        description: status.description ?? undefined,
      })),
    [statuses],
  );

  return (
    <SearchCombobox
      items={items}
      value={value}
      onValueChange={onValueChange}
      placeholder="Seleccionar estado..."
      searchPlaceholder="Buscar estado..."
      emptyMessage="No se encontraron estados."
      disabled={disabled}
    />
  );
}
