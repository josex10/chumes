import { getLinkedQuote } from "@/lib/events/event-badges";
import { addCalendarDays, todayInCostaRica } from "@/lib/follow-ups/calendar";
import {
  PIPELINE_BUCKET,
  PIPELINE_HORIZON_DAYS,
  type PipelineBucket,
} from "@/lib/reports/constants";
import type { EventWithRelations } from "@/lib/supabase/types";

export type PipelineRow = {
  eventId: string;
  title: string;
  customerName: string;
  statusName: string;
  eventDate: string | null;
  amount: number;
  bucket: PipelineBucket;
};

export type PipelineReport = {
  todayKey: string;
  horizonKey: string;
  totalAmount: number;
  nearAmount: number;
  futureAmount: number;
  undatedAmount: number;
  overdueAmount: number;
  quoteCount: number;
  withoutQuoteCount: number;
  rows: PipelineRow[];
};

export function classifyPipelineBucket(
  eventDate: string | null | undefined,
  todayKey: string,
): PipelineBucket {
  if (!eventDate) return PIPELINE_BUCKET.UNDATED;

  const dateKey = eventDate.slice(0, 10);
  if (dateKey < todayKey) return PIPELINE_BUCKET.OVERDUE;

  const horizonKey = addCalendarDays(todayKey, PIPELINE_HORIZON_DAYS);
  if (dateKey <= horizonKey) return PIPELINE_BUCKET.NEAR;
  return PIPELINE_BUCKET.FUTURE;
}

export function buildPipelineReport(
  events: EventWithRelations[],
  todayKey = todayInCostaRica(),
): PipelineReport {
  const horizonKey = addCalendarDays(todayKey, PIPELINE_HORIZON_DAYS);
  const rows: PipelineRow[] = [];
  let nearAmount = 0;
  let futureAmount = 0;
  let undatedAmount = 0;
  let overdueAmount = 0;
  let withoutQuoteCount = 0;

  for (const event of events) {
    const quote = getLinkedQuote(event);
    if (!quote) {
      withoutQuoteCount += 1;
      continue;
    }

    const amount = Number(quote.total);
    const bucket = classifyPipelineBucket(event.event_date, todayKey);

    if (bucket === PIPELINE_BUCKET.NEAR) nearAmount += amount;
    else if (bucket === PIPELINE_BUCKET.FUTURE) futureAmount += amount;
    else if (bucket === PIPELINE_BUCKET.UNDATED) undatedAmount += amount;
    else overdueAmount += amount;

    rows.push({
      eventId: event.id,
      title: event.title,
      customerName: event.customers.name,
      statusName: event.event_statuses.name,
      eventDate: event.event_date,
      amount,
      bucket,
    });
  }

  rows.sort((a, b) => {
    if (!a.eventDate && !b.eventDate) {
      return a.title.localeCompare(b.title, "es");
    }
    if (!a.eventDate) return 1;
    if (!b.eventDate) return -1;
    const byDate = a.eventDate.localeCompare(b.eventDate);
    if (byDate !== 0) return byDate;
    return a.title.localeCompare(b.title, "es");
  });

  return {
    todayKey,
    horizonKey,
    totalAmount: nearAmount + futureAmount + undatedAmount + overdueAmount,
    nearAmount,
    futureAmount,
    undatedAmount,
    overdueAmount,
    quoteCount: rows.length,
    withoutQuoteCount,
    rows,
  };
}
