"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { linkQuoteToEvent } from "@/lib/events/actions";
import type { EventWithRelations } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuoteLinkEventDialogProps = {
  quoteId: string;
  events: EventWithRelations[];
  trigger?: ReactElement;
};

export function QuoteLinkEventDialog({
  quoteId,
  events,
  trigger,
}: QuoteLinkEventDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLink() {
    if (!selectedEventId) return;
    setError(null);

    startTransition(async () => {
      const result = await linkQuoteToEvent(quoteId, selectedEventId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setSelectedEventId("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button type="button" variant="outline" className="w-full">
              Vincular a evento
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular a evento</DialogTitle>
          <DialogDescription>
            Selecciona un evento comercial sin cotización del mismo cliente.
          </DialogDescription>
        </DialogHeader>

        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay eventos disponibles para vincular.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-event">Evento</Label>
              <Select
                value={selectedEventId || undefined}
                onValueChange={(value) => value && setSelectedEventId(value)}
              >
                <SelectTrigger id="link-event" className="w-full">
                  <SelectValue placeholder="Seleccionar evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} · {event.event_statuses.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="button"
              className="w-full"
              disabled={isPending || !selectedEventId}
              onClick={handleLink}
            >
              {isPending ? "Vinculando..." : "Vincular"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
