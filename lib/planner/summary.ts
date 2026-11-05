import { PACKING_CATEGORY_ORDER } from "@/lib/logistics/constants";
import type { PackingListLine } from "@/lib/logistics/packing-list";

function categoryRank(code: string): number {
  const index = PACKING_CATEGORY_ORDER.indexOf(
    code as (typeof PACKING_CATEGORY_ORDER)[number],
  );
  return index === -1 ? PACKING_CATEGORY_ORDER.length : index;
}

export function summarizePackingLists(
  lists: PackingListLine[][],
): PackingListLine[] {
  const aggregated = new Map<string, PackingListLine>();

  for (const list of lists) {
    for (const line of list) {
      const existing = aggregated.get(line.productId);
      if (existing) {
        existing.quantity += line.quantity;
        existing.short = existing.stock < existing.quantity;
        continue;
      }

      aggregated.set(line.productId, {
        ...line,
        short: line.stock < line.quantity,
      });
    }
  }

  return [...aggregated.values()].sort((a, b) => {
    const rankDiff = categoryRank(a.categoryCode) - categoryRank(b.categoryCode);
    if (rankDiff !== 0) return rankDiff;
    return a.name.localeCompare(b.name, "es");
  });
}
