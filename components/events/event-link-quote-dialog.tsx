"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { linkQuoteToEvent } from "@/lib/events/actions";
import { formatCurrency } from "@/lib/quotes/format";
import type { QuoteWithRelations } from "@/lib/supabase/types";
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

type EventLinkQuoteDialogProps = {
  eventId: string;
  quotes: QuoteWithRelations[];
};

export function EventLinkQuoteDialog({
  eventId,
  quotes,
}: EventLinkQuoteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLink() {
    if (!selectedQuoteId) return;
    setError(null);

    startTransition(async () => {
      const result = await linkQuoteToEvent(selectedQuoteId, eventId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setSelectedQuoteId("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline">
            Vincular cotización existente
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular cotización</DialogTitle>
          <DialogDescription>
            Selecciona una cotización huérfana del mismo cliente.
          </DialogDescription>
        </DialogHeader>

        {quotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay cotizaciones disponibles para vincular.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-quote">Cotización</Label>
              <Select
                value={selectedQuoteId || undefined}
                onValueChange={(value) => value && setSelectedQuoteId(value)}
              >
                <SelectTrigger id="link-quote" className="w-full">
                  <SelectValue placeholder="Seleccionar cotización" />
                </SelectTrigger>
                <SelectContent>
                  {quotes.map((quote) => (
                    <SelectItem key={quote.id} value={quote.id}>
                      {quote.quote_number} · {formatCurrency(Number(quote.total))} ·{" "}
                      {quote.quote_statuses.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="button"
              className="w-full"
              disabled={isPending || !selectedQuoteId}
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
