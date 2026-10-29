"use client";

import { cn } from "@/lib/utils";

type ChoiceChipsProps = {
  label: string;
  options: { id: number; label: string }[];
  value?: number;
  onChange: (id: number) => void;
  error?: string;
  emptyMessage?: string;
};

export function ChoiceChips({
  label,
  options,
  value,
  onChange,
  error,
  emptyMessage = "No hay opciones activas.",
}: ChoiceChipsProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(option.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  selected
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground hover:bg-muted/80",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}
