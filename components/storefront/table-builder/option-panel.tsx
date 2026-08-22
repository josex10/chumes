"use client";

import { Circle, Layers, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/quotes/format";
import {
  chairCountRange,
  optionsForSlot,
  SETUP_SLOT,
  type ChairStyle,
  type LinkedSetupOption,
  type QuoteLineDraft,
  type TableBuilderSelection,
  type TableShape,
} from "@/lib/storefront/table-builder";
import { cn } from "@/lib/utils";

type OptionPanelProps = {
  selection: TableBuilderSelection;
  options: LinkedSetupOption[];
  quoteLines: QuoteLineDraft[];
  onChange: (next: TableBuilderSelection) => void;
  onQuote: () => void;
};

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function SwatchRow({
  values,
  selected,
  onSelect,
  includeNone,
  noneLabel = "Ninguno",
}: {
  values: LinkedSetupOption[];
  selected: string;
  onSelect: (value: string) => void;
  includeNone?: boolean;
  noneLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {includeNone ? (
        <button
          type="button"
          onClick={() => onSelect("none")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
            selected === "none"
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          {noneLabel}
        </button>
      ) : null}
      {values.map((option) => {
        const active = selected === option.variantKey;
        return (
          <button
            key={option.variantKey}
            type="button"
            title={option.label}
            onClick={() => onSelect(option.variantKey)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm transition",
              active
                ? "border-foreground"
                : "border-border hover:border-foreground/40",
            )}
          >
            <span
              className="size-4 rounded-full border border-black/10"
              style={{ backgroundColor: option.previewColor }}
            />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function OptionPanel({
  selection,
  options,
  quoteLines,
  onChange,
  onQuote,
}: OptionPanelProps) {
  const tables = optionsForSlot(options, SETUP_SLOT.TABLE);
  const chairs = optionsForSlot(options, SETUP_SLOT.CHAIR);
  const linens = optionsForSlot(options, SETUP_SLOT.LINEN);
  const overlays = optionsForSlot(options, SETUP_SLOT.OVERLAY);
  const covers = optionsForSlot(options, SETUP_SLOT.COVER);
  const range = chairCountRange(selection.table);
  const total = quoteLines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );

  function setTable(shape: TableShape) {
    const nextRange = chairCountRange(shape);
    onChange({
      ...selection,
      table: shape,
      chairCount: Math.min(
        nextRange.max,
        Math.max(nextRange.min, selection.chairCount),
      ),
    });
  }

  return (
    <div className="flex h-full flex-col gap-6 rounded-3xl border border-border/70 bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Arme su mesa</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gire la vista y elija mantel, sillas y forros. Al final puede cotizar este diseño.
        </p>
      </div>

      <section className="space-y-3">
        <Label>Mesa</Label>
        <div className="flex flex-wrap gap-2">
          {tables.map((option) => (
            <ChoiceButton
              key={option.variantKey}
              active={selection.table === option.variantKey}
              onClick={() => setTable(option.variantKey as TableShape)}
            >
              <span className="inline-flex items-center gap-1.5">
                <Circle className="size-3.5" />
                {option.label}
              </span>
            </ChoiceButton>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Label>Sillas</Label>
        <div className="flex flex-wrap gap-2">
          {chairs.map((option) => (
            <ChoiceButton
              key={option.variantKey}
              active={selection.chair === option.variantKey}
              onClick={() =>
                onChange({ ...selection, chair: option.variantKey as ChairStyle })
              }
            >
              {option.label}
            </ChoiceButton>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-border/70 px-3 py-2">
          <span className="text-sm text-muted-foreground">Cantidad</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                onChange({
                  ...selection,
                  chairCount: Math.max(range.min, selection.chairCount - 1),
                })
              }
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {selection.chairCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() =>
                onChange({
                  ...selection,
                  chairCount: Math.min(range.max, selection.chairCount + 1),
                })
              }
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Label>Mantel</Label>
        <SwatchRow
          values={linens}
          selected={selection.linen}
          onSelect={(linen) => onChange({ ...selection, linen })}
        />
      </section>

      <section className="space-y-3">
        <Label className="inline-flex items-center gap-1.5">
          <Layers className="size-3.5" />
          Sobre-mantel
        </Label>
        <SwatchRow
          values={overlays}
          selected={selection.overlay}
          onSelect={(overlay) => onChange({ ...selection, overlay })}
          includeNone
        />
      </section>

      <section className="space-y-3">
        <Label>Forro de silla</Label>
        <SwatchRow
          values={covers}
          selected={selection.cover}
          onSelect={(cover) => onChange({ ...selection, cover })}
          includeNone
          noneLabel="Sin forro"
        />
      </section>

      <div className="mt-auto space-y-4 border-t border-border/60 pt-5">
        {quoteLines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            El preview ya funciona. Para cotizar, vincule estos artículos al catálogo
            público (mismo slug sugerido o `product_id` en opciones de setup).
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {quoteLines.map((line) => (
              <li key={line.product.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {line.quantity} × {line.product.name}
                </span>
                <span className="font-medium">
                  {formatCurrency(line.unitPrice * line.quantity)}
                </span>
              </li>
            ))}
            <li className="flex justify-between pt-1 font-medium">
              <span>Estimado alquiler</span>
              <span>{formatCurrency(total)}</span>
            </li>
          </ul>
        )}

        <Button
          type="button"
          variant="commit"
          className="w-full rounded-full"
          onClick={onQuote}
          disabled={quoteLines.length === 0}
        >
          <ShoppingBag className="size-4" />
          Cotizar este diseño
        </Button>
      </div>
    </div>
  );
}
