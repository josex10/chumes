"use client";

import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import {
  formatPackingQuantity,
  groupPackingListByCategory,
  type PackingListLine,
} from "@/lib/logistics/packing-list";
import { cn } from "@/lib/utils";

type PackingListProps = {
  lines: PackingListLine[];
  checkable?: boolean;
  showStock?: boolean;
};

export function PackingList({
  lines,
  checkable = false,
  showStock = false,
}: PackingListProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const groups = groupPackingListByCategory(lines);

  if (lines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este evento no tiene productos en la cotización.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div key={group.categoryName} className="flex flex-col gap-1.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.categoryName}
          </p>
          <ul className="flex flex-col gap-1">
            {group.lines.map((line) => {
              const isChecked = Boolean(checked[line.productId]);
              const content = (
                <>
                  {checkable ? (
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border",
                        isChecked
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-input bg-background",
                      )}
                    >
                      {isChecked ? <Check className="size-3" /> : null}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="tabular-nums font-semibold">
                      {formatPackingQuantity(line.quantity)}
                    </span>
                    {" × "}
                    {line.name}
                  </span>
                  {showStock ? (
                    <span
                      className={cn(
                        "shrink-0 text-xs tabular-nums",
                        line.short
                          ? "font-medium text-amber-700 dark:text-amber-300"
                          : "text-muted-foreground",
                      )}
                    >
                      {line.short ? (
                        <span className="inline-flex items-center gap-1">
                          <AlertTriangle className="size-3" />
                          Stock {formatPackingQuantity(line.stock)}
                        </span>
                      ) : (
                        `Stock ${formatPackingQuantity(line.stock)}`
                      )}
                    </span>
                  ) : null}
                </>
              );

              if (!checkable) {
                return (
                  <li
                    key={line.productId}
                    className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm"
                  >
                    {content}
                  </li>
                );
              }

              return (
                <li key={line.productId}>
                  <button
                    type="button"
                    onClick={() =>
                      setChecked((current) => ({
                        ...current,
                        [line.productId]: !current[line.productId],
                      }))
                    }
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      isChecked
                        ? "border-emerald-600/30 bg-emerald-500/10 text-muted-foreground line-through"
                        : "border-transparent bg-muted/30 hover:bg-muted/50",
                    )}
                  >
                    {content}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
