import type { EventWithRelations, QuoteWithRelations } from "@/lib/supabase/types";

export type EventReservationPdfData = {
  event: EventWithRelations;
  quote: QuoteWithRelations;
};
