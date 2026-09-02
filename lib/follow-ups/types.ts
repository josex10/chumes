import type { FollowUpBucket } from "@/lib/follow-ups/constants";
import type { EventWithRelations } from "@/lib/supabase/types";

export type FollowUpQueueItem = {
  event: EventWithRelations;
  bucket: FollowUpBucket;
  step: 1 | 2 | 3 | null;
  dueDateKey: string;
  dueLabel: string;
  phone: string | null;
  quoteTotal: number | null;
  isThisWeek: boolean;
  cadenceLabel: string | null;
  contactedThisWeek: boolean;
};

export type FollowUpQueue = {
  closeThisWeek: FollowUpQueueItem[];
  step1: FollowUpQueueItem[];
  step2: FollowUpQueueItem[];
  step3: FollowUpQueueItem[];
  noResponse: FollowUpQueueItem[];
  total: number;
};
