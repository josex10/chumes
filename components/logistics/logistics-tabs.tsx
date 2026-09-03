import Link from "next/link";
import { Package, Truck, Undo2 } from "lucide-react";
import {
  LOGISTICS_TAB,
  type LogisticsTab,
  type LogisticsWindow,
} from "@/lib/logistics/constants";
import { buildLogisticsHref } from "@/lib/logistics/url";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogisticsTabsProps = {
  activeTab: LogisticsTab;
  window: LogisticsWindow;
  counts: {
    warehouse: number;
    delivery: number;
    pickup: number;
  };
};

const TABS: {
  id: LogisticsTab;
  label: string;
  icon: typeof Package;
  countKey: keyof LogisticsTabsProps["counts"];
}[] = [
  {
    id: LOGISTICS_TAB.WAREHOUSE,
    label: "Bodega",
    icon: Package,
    countKey: "warehouse",
  },
  {
    id: LOGISTICS_TAB.DELIVERY,
    label: "Instalaciones",
    icon: Truck,
    countKey: "delivery",
  },
  {
    id: LOGISTICS_TAB.PICKUP,
    label: "Retirada",
    icon: Undo2,
    countKey: "pickup",
  },
];

export function LogisticsTabs({
  activeTab,
  window,
  counts,
}: LogisticsTabsProps) {
  return (
    <div className="flex w-full rounded-lg border bg-muted/30 p-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const count = counts[tab.countKey];
        return (
          <Link
            key={tab.id}
            href={buildLogisticsHref({ tab: tab.id, window })}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-h-10 flex-1 items-center justify-center gap-1.5",
              activeTab === tab.id &&
                "bg-background shadow-sm hover:bg-background",
            )}
          >
            <Icon className="size-3.5" />
            {tab.label}
            <span className="tabular-nums text-muted-foreground">{count}</span>
          </Link>
        );
      })}
    </div>
  );
}
