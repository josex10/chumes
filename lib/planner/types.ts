import type { PackingListLine } from "@/lib/logistics/packing-list";

export type PlannerEvent = {
  id: string;
  title: string;
  eventDate: string;
  deliveryDate: string | null;
  pickupDate: string | null;
  location: string | null;
  notes: string | null;
  customerName: string;
  phone: string | null;
  statusCode: string;
  statusName: string;
  packingList: PackingListLine[];
};
