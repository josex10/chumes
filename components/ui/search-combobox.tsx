"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchComboboxItem = {
  value: string;
  label: string;
  searchText?: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
};

type SearchComboboxProps = {
  items: SearchComboboxItem[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  id?: string;
  onCreateNew?: () => void;
  createLabel?: string;
};

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function SearchCombobox({
  items,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados.",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
  id,
  onCreateNew,
  createLabel = "Crear nuevo",
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => items.find((item) => item.value === value),
    [items, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        className={cn("inline-flex w-full min-w-0", className)}
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-8 w-full justify-between px-2 font-normal",
              !selected && "text-muted-foreground",
              triggerClassName,
            )}
          />
        }
      >
        <span className="truncate text-left">{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-[min(100vw-2rem,420px)] p-0", contentClassName)}
      >
        <Command
          filter={(itemValue, search) => {
            const item = items.find((entry) => entry.value === itemValue);
            if (!item) return 0;
            const haystack = normalizeSearch(
              item.searchText ?? `${item.label} ${item.description ?? ""}`,
            );
            const needle = normalizeSearch(search);
            return haystack.includes(needle) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  data-checked={value === item.value}
                  disabled={item.disabled}
                  onSelect={(currentValue) => {
                    if (item.disabled) return;
                    onValueChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{item.label}</p>
                    {item.description || item.disabledReason ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.disabledReason ?? item.description}
                      </p>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {onCreateNew ? (
            <div className="border-t border-border/60 p-2">
              <Button
                type="button"
                variant="add"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  onCreateNew();
                }}
              >
                + {createLabel}
              </Button>
            </div>
          ) : null}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
