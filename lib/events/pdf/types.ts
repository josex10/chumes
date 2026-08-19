import type {
  EventFinancialMovementWithRelations,
  EventWithRelations,
  PaymentSummary,
  QuoteWithRelations,
} from "@/lib/supabase/types";

export type EventReservationPdfData = {
  event: EventWithRelations;
  quote: QuoteWithRelations;
  paymentSummary: PaymentSummary;
  movements: EventFinancialMovementWithRelations[];
};
