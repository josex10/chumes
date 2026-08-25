import Link from "next/link";
import { Archive, Handshake, Truck } from "lucide-react";
import {
  EVENTS_PIPELINE_TAB,
  type EventsPipelineTab,
} from "@/lib/events/constants";
import { buildEventsHref } from "@/lib/events/events-url";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EventsPipelineTabsProps = {
  activeTab: EventsPipelineTab;
  customerId?: string;
};

const TABS: {
  id: EventsPipelineTab;
  label: string;
  icon: typeof Handshake;
}[] = [
  { id: EVENTS_PIPELINE_TAB.COMMERCIAL, label: "Comercial", icon: Handshake },
  { id: EVENTS_PIPELINE_TAB.OPERATIONAL, label: "Operación", icon: Truck },
  { id: EVENTS_PIPELINE_TAB.HISTORY, label: "Historial", icon: Archive },
];

export function EventsPipelineTabs({
  activeTab,
  customerId,
}: EventsPipelineTabsProps) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/30 p-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            href={buildEventsHref({
              tab: tab.id,
              customerId,
            })}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "inline-flex items-center gap-1.5",
              activeTab === tab.id &&
                "bg-background shadow-sm hover:bg-background",
            )}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
