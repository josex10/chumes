"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCustomerByIdAction, searchCustomersAction } from "@/lib/customers/actions";
import type { CustomerWithRelations } from "@/lib/supabase/types";
import {
  AsyncSearchCombobox,
  type AsyncSearchComboboxFetchResult,
} from "@/components/ui/async-search-combobox";

type CustomerComboboxProps = {
  value?: string;
  onValueChange: (customerId: string) => void;
  defaultCustomer?: CustomerWithRelations;
  disabled?: boolean;
  id?: string;
  onCreateNew?: () => void;
};

function toComboboxItem(customer: CustomerWithRelations) {
  return {
    value: customer.id,
    label: customer.name,
    description:
      [customer.identification, customer.phone].filter(Boolean).join(" · ") ||
      undefined,
  };
}

export function CustomerCombobox({
  value,
  onValueChange,
  defaultCustomer,
  disabled = false,
  id,
  onCreateNew,
}: CustomerComboboxProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(
    defaultCustomer?.name,
  );

  useEffect(() => {
    if (defaultCustomer && defaultCustomer.id === value) {
      setSelectedLabel(defaultCustomer.name);
    }
  }, [defaultCustomer, value]);

  useEffect(() => {
    if (!value) {
      setSelectedLabel(undefined);
      return;
    }

    if (defaultCustomer?.id === value) {
      setSelectedLabel(defaultCustomer.name);
      return;
    }

    let cancelled = false;

    void getCustomerByIdAction(value).then((customer) => {
      if (!cancelled && customer) {
        setSelectedLabel(customer.name);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value, defaultCustomer]);

  const handleFetch = useCallback(
    async (query: string, page: number): Promise<AsyncSearchComboboxFetchResult> => {
      const result = await searchCustomersAction({ query, page });
      return {
        items: result.customers.map(toComboboxItem),
        hasMore: result.hasMore,
      };
    },
    [],
  );

  const pinnedItem = useMemo(() => {
    if (!value || !selectedLabel) return null;
    return {
      value,
      label: selectedLabel,
      description: defaultCustomer
        ? [defaultCustomer.identification, defaultCustomer.phone]
            .filter(Boolean)
            .join(" · ") || undefined
        : undefined,
    };
  }, [value, selectedLabel, defaultCustomer]);

  const handleFetchWithPinned = useCallback(
    async (query: string, page: number): Promise<AsyncSearchComboboxFetchResult> => {
      const result = await handleFetch(query, page);
      if (!pinnedItem || page !== 1) {
        return result;
      }

      const alreadyIncluded = result.items.some((item) => item.value === pinnedItem.value);
      if (alreadyIncluded) {
        return result;
      }

      return {
        ...result,
        items: [pinnedItem, ...result.items],
      };
    },
    [handleFetch, pinnedItem],
  );

  return (
    <AsyncSearchCombobox
      id={id}
      value={value}
      selectedLabel={selectedLabel}
      onValueChange={(nextValue, item) => {
        if (item) {
          setSelectedLabel(item.label);
        }
        onValueChange(nextValue);
      }}
      onFetch={handleFetchWithPinned}
      placeholder="Buscar cliente..."
      searchPlaceholder="Nombre, cédula, teléfono..."
      emptyMessage="No se encontraron clientes."
      createLabel="Nuevo cliente"
      disabled={disabled}
      onCreateNew={onCreateNew}
      triggerClassName="min-w-[220px]"
    />
  );
}
