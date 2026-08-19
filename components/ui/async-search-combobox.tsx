"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { CUSTOMER_SEARCH_DEBOUNCE_MS } from "@/lib/customers/constants";
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

export type AsyncSearchComboboxItem = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
};

export type AsyncSearchComboboxFetchResult = {
  items: AsyncSearchComboboxItem[];
  hasMore: boolean;
};

type AsyncSearchComboboxProps = {
  value?: string;
  onValueChange: (value: string, item?: AsyncSearchComboboxItem) => void;
  selectedLabel?: string;
  onFetch: (query: string, page: number) => Promise<AsyncSearchComboboxFetchResult>;
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
  debounceMs?: number;
};

export function AsyncSearchCombobox({
  value,
  onValueChange,
  selectedLabel,
  onFetch,
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
  debounceMs = CUSTOMER_SEARCH_DEBOUNCE_MS,
}: AsyncSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AsyncSearchComboboxItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = items.find((item) => item.value === value);
  const triggerLabel = selected?.label ?? selectedLabel ?? placeholder;

  const loadPage = useCallback(
    async (query: string, nextPage: number, append: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const requestId = ++requestIdRef.current;
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await onFetch(query, nextPage);
        if (requestId !== requestIdRef.current) return;

        setItems((current) => {
          if (!append) return result.items;
          const seen = new Set(current.map((item) => item.value));
          const merged = [...current];
          for (const item of result.items) {
            if (!seen.has(item.value)) merged.push(item);
          }
          return merged;
        });
        setHasMore(result.hasMore);
        setPage(nextPage);
      } finally {
        loadingRef.current = false;
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [onFetch],
  );

  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void loadPage(search, 1, false);
    }, search ? debounceMs : 0);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, open, debounceMs, loadPage]);

  useEffect(() => {
    if (!open || !hasMore || isLoading || isLoadingMore) return;

    const sentinel = sentinelRef.current;
    const root = listRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadPage(search, page + 1, true);
        }
      },
      { root, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, isLoading, isLoadingMore, search, page, loadPage]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setItems([]);
      setPage(1);
      setHasMore(false);
      loadingRef.current = false;
      requestIdRef.current += 1;
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
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
              !value && !selectedLabel && "text-muted-foreground",
              triggerClassName,
            )}
          />
        }
      >
        <span className="truncate text-left">{triggerLabel}</span>
        <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-[min(100vw-2rem,420px)] p-0", contentClassName)}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList ref={listRef} className="max-h-72">
            {isLoading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando...
              </div>
            ) : (
              <>
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
                        onValueChange(currentValue, item);
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
                {hasMore ? (
                  <div
                    ref={sentinelRef}
                    className="flex items-center justify-center py-3 text-xs text-muted-foreground"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                        Cargando más...
                      </>
                    ) : (
                      "Desplázate para cargar más"
                    )}
                  </div>
                ) : null}
              </>
            )}
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
