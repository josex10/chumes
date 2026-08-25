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
};

export type FollowUpQueue = {
  step1: FollowUpQueueItem[];
  step2: FollowUpQueueItem[];
  step3: FollowUpQueueItem[];
  noResponse: FollowUpQueueItem[];
  total: number;
};
