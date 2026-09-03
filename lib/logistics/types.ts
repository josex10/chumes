import type { LogisticsTab } from "@/lib/logistics/constants";
import type { PackingListLine } from "@/lib/logistics/packing-list";
import type {
  BankAccount,
  EventLogistics,
  EventWithRelations,
  PaymentMethod,
  PaymentSummary,
} from "@/lib/supabase/types";

export type LogisticsQueueItem = {
  event: EventWithRelations;
  tab: LogisticsTab;
  dateKey: string | null;
  sortAt: string | null;
  phone: string | null;
  mapsUrl: string | null;
  locationLabel: string | null;
  packingList: PackingListLine[];
  hasShortage: boolean;
  paymentSummary: PaymentSummary | null;
  logistics: EventLogistics | null;
  prepCompleted: number;
  prepTotal: number;
  readyForInstall: boolean;
};

export type LogisticsDayGroup = {
  dateKey: string | null;
  label: string;
  items: LogisticsQueueItem[];
};

export type LogisticsQueue = {
  warehouse: LogisticsQueueItem[];
  delivery: LogisticsQueueItem[];
  pickup: LogisticsQueueItem[];
};

export type LogisticsPageData = {
  queue: LogisticsQueue;
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
};
