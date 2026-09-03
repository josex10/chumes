import { LogisticsQueueTable } from "@/components/logistics/logistics-queue-table";
import { groupLogisticsItemsByDay } from "@/lib/logistics/schedule";
import type { LogisticsQueueItem } from "@/lib/logistics/types";
import type { BankAccount, PaymentMethod } from "@/lib/supabase/types";

type LogisticsBoardProps = {
  items: LogisticsQueueItem[];
  emptyLabel: string;
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
};

export function LogisticsBoard({
  items,
  emptyLabel,
  paymentMethods,
  bankAccounts,
}: LogisticsBoardProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  const groups = groupLogisticsItemsByDay(items);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.dateKey ?? "undated"} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight capitalize">
            {group.label}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {group.items.length}
            </span>
          </h2>
          <div className="overflow-hidden rounded-xl ring-1 ring-border/60">
            <LogisticsQueueTable
              items={group.items}
              paymentMethods={paymentMethods}
              bankAccounts={bankAccounts}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
