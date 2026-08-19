export type DatesStatus = "UNKNOWN" | "PARTIAL" | "COMPLETE";

export function computeDatesStatus(
  eventDate: string | null | undefined,
  deliveryDate: string | null | undefined,
  pickupDate: string | null | undefined,
): DatesStatus {
  const dates = [eventDate, deliveryDate, pickupDate].filter(Boolean);
  if (dates.length === 0) return "UNKNOWN";
  if (dates.length === 3) return "COMPLETE";
  return "PARTIAL";
}

export function hasCompleteDates(
  eventDate: string | null | undefined,
  deliveryDate: string | null | undefined,
  pickupDate: string | null | undefined,
): boolean {
  return computeDatesStatus(eventDate, deliveryDate, pickupDate) === "COMPLETE";
}
