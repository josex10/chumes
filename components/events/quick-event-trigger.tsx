"use client";

import { Zap } from "lucide-react";
import { useQuickEvent } from "@/components/events/quick-event-provider";
import { Button } from "@/components/ui/button";

type QuickEventTriggerProps = {
  size?: "sm" | "default";
};

export function QuickEventTrigger({ size = "sm" }: QuickEventTriggerProps) {
  const { openQuickEvent } = useQuickEvent();

  return (
    <Button type="button" variant="add" size={size} onClick={openQuickEvent}>
      <Zap />
      Evento rápido
    </Button>
  );
}
