"use client";

import { useMemo } from "react";
import type { CustomerWithRelations } from "@/lib/supabase/types";
import { SearchCombobox } from "@/components/ui/search-combobox";

type CustomerComboboxProps = {
  customers: CustomerWithRelations[];
  value?: string;
  onValueChange: (customerId: string) => void;
  disabled?: boolean;
  id?: string;
  onCreateNew?: () => void;
};

export function CustomerCombobox({
  customers,
  value,
  onValueChange,
  disabled = false,
  id,
  onCreateNew,
}: CustomerComboboxProps) {
  const items = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: customer.name,
        searchText: `${customer.name} ${customer.identification ?? ""} ${customer.email ?? ""} ${customer.phone ?? ""}`,
        description: [customer.identification, customer.phone].filter(Boolean).join(" · ") || undefined,
      })),
    [customers],
  );

  return (
    <SearchCombobox
      id={id}
      items={items}
      value={value}
      onValueChange={onValueChange}
      placeholder="Buscar cliente..."
      searchPlaceholder="Nombre, cédula, teléfono..."
      emptyMessage="No se encontraron clientes."
      createLabel="Nuevo cliente"
      disabled={disabled}
      onCreateNew={onCreateNew}
    />
  );
}
