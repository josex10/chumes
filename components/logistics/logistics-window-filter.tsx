"use client";

import { useRouter } from "next/navigation";
import {
  LOGISTICS_WINDOW_OPTIONS,
  type LogisticsTab,
  type LogisticsWindow,
} from "@/lib/logistics/constants";
import { buildLogisticsHref } from "@/lib/logistics/url";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LogisticsWindowFilterProps = {
  activeTab: LogisticsTab;
  activeWindow: LogisticsWindow;
};

export function LogisticsWindowFilter({
  activeTab,
  activeWindow,
}: LogisticsWindowFilterProps) {
  const router = useRouter();
  const items = LOGISTICS_WINDOW_OPTIONS.map((option) => ({
    value: option.id,
    label: option.label,
  }));

  return (
    <Select
      value={activeWindow}
      onValueChange={(next) => {
        if (!next) return;
        router.push(
          buildLogisticsHref({
            tab: activeTab,
            window: next as LogisticsWindow,
          }),
        );
      }}
      items={items}
    >
      <SelectTrigger className="min-w-[11.5rem]" aria-label="Ventana de fechas">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOGISTICS_WINDOW_OPTIONS.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
