"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SaveResult = { success: true } | { success: false; error: string };

type ProductInlineTextCellProps = {
  value: string;
  onSave: (value: string) => Promise<SaveResult>;
  ariaLabel: string;
  placeholder?: string;
  emptyLabel?: string;
  multiline?: boolean;
  className?: string;
};

export function ProductInlineTextCell({
  value: initialValue,
  onSave,
  ariaLabel,
  placeholder,
  emptyLabel = "Sin valor",
  multiline = false,
  className,
}: ProductInlineTextCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue);
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDisplayValue(initialValue);
    if (!isEditing) {
      setDraft(initialValue);
    }
  }, [initialValue, isEditing]);

  function startEditing() {
    setDraft(displayValue);
    setError(null);
    setIsEditing(true);
  }

  function cancel() {
    setDraft(displayValue);
    setError(null);
    setIsEditing(false);
  }

  function save() {
    const nextValue = draft.trim();
    if (nextValue === displayValue.trim()) {
      setIsEditing(false);
      setError(null);
      return;
    }

    startTransition(async () => {
      const result = await onSave(nextValue);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDisplayValue(nextValue);
      setError(null);
      setIsEditing(false);
    });
  }

  if (isEditing) {
    const sharedProps = {
      value: draft,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setDraft(event.target.value),
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          save();
        }
        if (multiline && event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          save();
        }
      },
      disabled: isPending,
      "aria-label": ariaLabel,
      "aria-invalid": Boolean(error),
      placeholder,
    };

    return (
      <div className={cn("min-w-[140px] space-y-1", className)}>
        {multiline ? (
          <Textarea
            autoFocus
            rows={3}
            className="min-h-16 text-sm"
            {...sharedProps}
          />
        ) : (
          <Input autoFocus className="h-8 text-sm" {...sharedProps} />
        )}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="commit"
            disabled={isPending}
            onClick={save}
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Guardar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={cancel}
          >
            Cancelar
          </Button>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  const isEmpty = !displayValue.trim();

  return (
    <div className={cn("min-w-0", className)}>
      <button
        type="button"
        onClick={startEditing}
        aria-label={ariaLabel}
        className="group flex max-w-full items-center gap-1.5 text-left"
      >
        <span
          className={cn(
            "min-w-0",
            multiline ? "line-clamp-2" : "truncate",
            isEmpty ? "text-muted-foreground" : undefined,
          )}
        >
          {isEmpty ? emptyLabel : displayValue}
        </span>
        <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-70" />
      </button>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
