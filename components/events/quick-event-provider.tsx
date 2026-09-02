"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Zap } from "lucide-react";
import type { CustomerType, EventSource } from "@/lib/supabase/types";
import { QuickEventForm } from "@/components/events/quick-event-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";

type QuickEventContextValue = {
  openQuickEvent: () => void;
};

const QuickEventContext = createContext<QuickEventContextValue | null>(null);

export function useQuickEvent() {
  const context = useContext(QuickEventContext);
  if (!context) {
    throw new Error("useQuickEvent must be used within QuickEventProvider");
  }
  return context;
}

type QuickEventProviderProps = {
  children: React.ReactNode;
  customerTypes: CustomerType[];
  sources: EventSource[];
};

export function QuickEventProvider({
  children,
  customerTypes,
  sources,
}: QuickEventProviderProps) {
  const [open, setOpen] = useState(false);

  const openQuickEvent = useCallback(() => {
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openQuickEvent }),
    [openQuickEvent],
  );

  return (
    <QuickEventContext.Provider value={value}>
      {children}

      <Dialog open={open} onOpenChange={setOpen} disablePointerDismissal>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-4 text-action-add" />
              Evento rápido
            </DialogTitle>
            <DialogDescription>
              Registra un lead con cliente y fuente. El resto se completa después.
            </DialogDescription>
          </DialogHeader>
          <QuickEventForm
            customerTypes={customerTypes}
            sources={sources}
            open={open}
          />
        </DialogContent>
      </Dialog>

      {open ? null : (
        <SimpleTooltip
          label="Evento rápido"
          className="fixed right-6 bottom-6 z-40"
        >
          <Button
            type="button"
            variant="add"
            size="icon-lg"
            aria-label="Evento rápido"
            onClick={openQuickEvent}
            className="size-12 rounded-full shadow-lg"
          >
            <Zap className="size-5" />
          </Button>
        </SimpleTooltip>
      )}
    </QuickEventContext.Provider>
  );
}
