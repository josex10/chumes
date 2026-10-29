import {
  EVENT_STATUS,
  OPERATIONAL_STATUS_CODES,
} from "@/lib/events/constants";
import {
  DEMO_VIEW,
  formatSeriesLabel,
  listDateKeys,
  type DemoPeriod,
  type DemoView,
} from "@/lib/demo-report/period";
import { toCostaRicaDateKey } from "@/lib/follow-ups/calendar";

const SOLD_STATUS_CODES = new Set<string>([
  ...OPERATIONAL_STATUS_CODES,
  EVENT_STATUS.WON_ARCHIVED,
]);

export type DemoEventRow = {
  id: string;
  title: string;
  customerName: string;
  eventDate: string | null;
  createdAt: string;
  archivedAt: string | null;
  lostReason: string | null;
  statusCode: string;
  statusName: string;
  quoteId: string | null;
  quoteTotal: number;
  deliveryFee: number;
};

export type DemoQuoteRow = {
  id: string;
  quoteNumber: string;
  customerName: string;
  eventId: string | null;
  eventTitle: string | null;
  eventDate: string | null;
  createdAt: string;
  statusName: string;
  total: number;
};

export type DemoSeriesPoint = {
  dateKey: string;
  label: string;
  sold: number;
  lost: number;
  quoted: number;
  transport: number;
  leads: number;
};

export type DemoMoneySlice = {
  amount: number;
  count: number;
};

export type DemoReport = {
  view: DemoView;
  sold: DemoMoneySlice & { rows: DemoEventRow[] };
  leads: { count: number };
  quoted: DemoMoneySlice & { rows: DemoQuoteRow[] };
  lost: DemoMoneySlice & { rows: DemoEventRow[] };
  transport: DemoMoneySlice;
  series: DemoSeriesPoint[];
  comparison: { key: string; label: string; amount: number }[];
};

export function isSoldStatus(statusCode: string): boolean {
  return SOLD_STATUS_CODES.has(statusCode);
}

export function selectQuotesForPeriod(quotes: DemoQuoteRow[]): DemoQuoteRow[] {
  const sorted = [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latestByEvent = new Map<string, DemoQuoteRow>();
  const standalone: DemoQuoteRow[] = [];

  for (const quote of sorted) {
    if (!quote.eventId) {
      standalone.push(quote);
      continue;
    }
    if (!latestByEvent.has(quote.eventId)) {
      latestByEvent.set(quote.eventId, quote);
    }
  }

  return [...latestByEvent.values(), ...standalone].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

function eventDateKey(event: DemoEventRow): string | null {
  if (!event.eventDate) return null;
  return event.eventDate.slice(0, 10);
}

function addAmount(
  buckets: Map<string, DemoSeriesPoint>,
  dateKey: string,
  field: keyof Pick<
    DemoSeriesPoint,
    "sold" | "lost" | "quoted" | "transport" | "leads"
  >,
  amount: number,
) {
  const bucket = buckets.get(dateKey);
  if (!bucket) return;
  bucket[field] += amount;
}

export function buildDemoReport(
  period: Pick<DemoPeriod, "view" | "startKey" | "endKey">,
  eventsByDate: DemoEventRow[],
  leads: DemoEventRow[],
  quotes: DemoQuoteRow[],
): DemoReport {
  const soldRows = eventsByDate
    .filter((event) => isSoldStatus(event.statusCode))
    .sort((a, b) => (a.eventDate ?? "").localeCompare(b.eventDate ?? ""));
  const lostRows = eventsByDate
    .filter((event) => event.statusCode === EVENT_STATUS.LOST)
    .sort((a, b) => (a.eventDate ?? "").localeCompare(b.eventDate ?? ""));
  const quotedRows = selectQuotesForPeriod(quotes);
  const transportRows = soldRows.filter((event) => event.deliveryFee > 0);

  const series = listDateKeys(period.startKey, period.endKey).map((dateKey) => ({
    dateKey,
    label: formatSeriesLabel(dateKey, period.view),
    sold: 0,
    lost: 0,
    quoted: 0,
    transport: 0,
    leads: 0,
  }));
  const buckets = new Map(series.map((point) => [point.dateKey, point]));

  for (const event of soldRows) {
    const dateKey = eventDateKey(event);
    if (!dateKey) continue;
    addAmount(buckets, dateKey, "sold", event.quoteTotal);
    addAmount(buckets, dateKey, "transport", event.deliveryFee);
  }

  for (const event of lostRows) {
    const dateKey = eventDateKey(event);
    if (!dateKey) continue;
    addAmount(buckets, dateKey, "lost", event.quoteTotal);
  }

  for (const quote of quotedRows) {
    addAmount(buckets, toCostaRicaDateKey(quote.createdAt), "quoted", quote.total);
  }

  for (const lead of leads) {
    addAmount(buckets, toCostaRicaDateKey(lead.createdAt), "leads", 1);
  }

  const soldAmount = soldRows.reduce((sum, event) => sum + event.quoteTotal, 0);
  const lostAmount = lostRows.reduce((sum, event) => sum + event.quoteTotal, 0);
  const quotedAmount = quotedRows.reduce((sum, quote) => sum + quote.total, 0);
  const transportAmount = soldRows.reduce((sum, event) => sum + event.deliveryFee, 0);

  return {
    view: period.view,
    sold: { amount: soldAmount, count: soldRows.length, rows: soldRows },
    leads: { count: leads.length },
    quoted: { amount: quotedAmount, count: quotedRows.length, rows: quotedRows },
    lost: { amount: lostAmount, count: lostRows.length, rows: lostRows },
    transport: { amount: transportAmount, count: transportRows.length },
    series,
    comparison: [
      { key: "sold", label: "Vendidos", amount: soldAmount },
      { key: "quoted", label: "Cotizado", amount: quotedAmount },
      { key: "lost", label: "Perdidos", amount: lostAmount },
      { key: "transport", label: "Transporte", amount: transportAmount },
    ],
  };
}

export function periodNoun(view: DemoView): string {
  return view === DEMO_VIEW.MONTH ? "mes" : "semana";
}
