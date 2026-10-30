"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { setDeliveryAssignees } from "@/lib/logistics/actions";
import {
  DELIVERY_COLLABORATORS,
  assigneeNames,
  orderedAssigneeCodes,
} from "@/lib/logistics/collaborators";
import type { EventLogistics } from "@/lib/supabase/types";
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

type DeliveryAssigneesProps = {
  eventId: string;
  logistics: EventLogistics | null;
};

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function DeliveryAssignees({
  eventId,
  logistics,
}: DeliveryAssigneesProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const selected = useMemo(
    () => new Set(logistics?.assignee_codes ?? []),
    [logistics?.assignee_codes],
  );
  const selectedLabel = assigneeNames(logistics?.assignee_codes).join(", ");

  function handleToggle(code: string) {
    const next = selected.has(code)
      ? [...selected].filter((current) => current !== code)
      : [...selected, code];

    setError(null);
    startTransition(async () => {
      const result = await setDeliveryAssignees(
        eventId,
        orderedAssigneeCodes(next),
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Colaboradores
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={isPending}
          className="inline-flex w-full min-w-0"
          render={
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={isPending}
              className={cn(
                "h-8 w-full justify-between px-2 font-normal",
                !selectedLabel && "text-muted-foreground",
              )}
            />
          }
        >
          <span className="truncate text-left">
            {selectedLabel || "Asignar colaboradores"}
          </span>
          {isPending ? (
            <Loader2 className="ml-2 size-3.5 shrink-0 animate-spin opacity-70" />
          ) : (
            <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(100vw-2rem,24rem)] p-0"
        >
          <Command
            filter={(itemValue, search) => {
              const collaborator = DELIVERY_COLLABORATORS.find(
                (entry) => entry.code === itemValue,
              );
              if (!collaborator) return 0;
              const haystack = normalizeSearch(collaborator.name);
              const needle = normalizeSearch(search);
              return haystack.includes(needle) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Buscar colaborador..." />
            <CommandList className="max-h-60">
              <CommandEmpty>No se encontraron colaboradores.</CommandEmpty>
              <CommandGroup>
                {DELIVERY_COLLABORATORS.map((collaborator) => (
                  <CommandItem
                    key={collaborator.code}
                    value={collaborator.code}
                    data-checked={selected.has(collaborator.code)}
                    disabled={isPending}
                    onSelect={() => handleToggle(collaborator.code)}
                  >
                    <span className="truncate">{collaborator.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
