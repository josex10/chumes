import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  Archive,
  BadgeCheck,
  BookmarkCheck,
  CalendarClock,
  CalendarOff,
  CalendarRange,
  ClipboardCheck,
  FileQuestion,
  Inbox,
  MessageCircleOff,
  PackageCheck,
  Send,
  Trophy,
  Truck,
  XCircle,
} from "lucide-react";
import { EVENT_STATUS } from "@/lib/events/constants";

export type EventStatusVisual = {
  icon: LucideIcon;
  pill: string;
  iconClass: string;
  columnAccent: string;
};

const DEFAULT_VISUAL: EventStatusVisual = {
  icon: Inbox,
  pill: "border-border bg-muted/60 text-muted-foreground",
  iconClass: "text-muted-foreground",
  columnAccent: "border-t-border",
};

const STATUS_VISUALS: Record<string, EventStatusVisual> = {
  [EVENT_STATUS.INQUIRY]: {
    icon: Inbox,
    pill: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
    iconClass: "text-sky-600 dark:text-sky-400",
    columnAccent: "border-t-sky-500",
  },
  [EVENT_STATUS.NO_RESPONSE]: {
    icon: MessageCircleOff,
    pill: "border-zinc-500/30 bg-zinc-500/10 text-zinc-800 dark:text-zinc-300",
    iconClass: "text-zinc-600 dark:text-zinc-400",
    columnAccent: "border-t-zinc-400",
  },
  [EVENT_STATUS.QUOTING]: {
    icon: FileQuestion,
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    iconClass: "text-amber-600 dark:text-amber-400",
    columnAccent: "border-t-amber-500",
  },
  [EVENT_STATUS.QUOTED_NO_DATES]: {
    icon: CalendarOff,
    pill: "border-orange-500/30 bg-orange-500/10 text-orange-800 dark:text-orange-300",
    iconClass: "text-orange-600 dark:text-orange-400",
    columnAccent: "border-t-orange-500",
  },
  [EVENT_STATUS.QUOTE_SENT]: {
    icon: Send,
    pill: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-300",
    iconClass: "text-violet-600 dark:text-violet-400",
    columnAccent: "border-t-violet-500",
  },
  [EVENT_STATUS.FOLLOW_UP]: {
    icon: CalendarClock,
    pill: "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300",
    iconClass: "text-blue-600 dark:text-blue-400",
    columnAccent: "border-t-blue-500",
  },
  [EVENT_STATUS.APPROVED]: {
    icon: BadgeCheck,
    pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    columnAccent: "border-t-emerald-500",
  },
  [EVENT_STATUS.RESERVED]: {
    icon: BookmarkCheck,
    pill: "border-teal-500/30 bg-teal-500/10 text-teal-800 dark:text-teal-300",
    iconClass: "text-teal-600 dark:text-teal-400",
    columnAccent: "border-t-teal-500",
  },
  [EVENT_STATUS.PREP_CURRENT_WEEK]: {
    icon: CalendarRange,
    pill: "border-cyan-500/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300",
    iconClass: "text-cyan-600 dark:text-cyan-400",
    columnAccent: "border-t-cyan-500",
  },
  [EVENT_STATUS.PREP_DAY_BEFORE]: {
    icon: AlarmClock,
    pill: "border-indigo-500/30 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300",
    iconClass: "text-indigo-600 dark:text-indigo-400",
    columnAccent: "border-t-indigo-500",
  },
  [EVENT_STATUS.DELIVERED]: {
    icon: Truck,
    pill: "border-sky-500/35 bg-sky-500/15 text-sky-900 dark:text-sky-200",
    iconClass: "text-sky-700 dark:text-sky-300",
    columnAccent: "border-t-sky-600",
  },
  [EVENT_STATUS.PICKED_UP]: {
    icon: PackageCheck,
    pill: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-800 dark:text-fuchsia-300",
    iconClass: "text-fuchsia-600 dark:text-fuchsia-400",
    columnAccent: "border-t-fuchsia-500",
  },
  [EVENT_STATUS.INSPECTION_PENDING]: {
    icon: ClipboardCheck,
    pill: "border-amber-500/35 bg-amber-500/15 text-amber-900 dark:text-amber-200",
    iconClass: "text-amber-700 dark:text-amber-300",
    columnAccent: "border-t-amber-600",
  },
  [EVENT_STATUS.COMPLETED]: {
    icon: Trophy,
    pill: "border-emerald-500/40 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200",
    iconClass: "text-emerald-700 dark:text-emerald-300",
    columnAccent: "border-t-emerald-600",
  },
  [EVENT_STATUS.WON_ARCHIVED]: {
    icon: Archive,
    pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    columnAccent: "border-t-emerald-500",
  },
  [EVENT_STATUS.LOST]: {
    icon: XCircle,
    pill: "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
    iconClass: "text-rose-600 dark:text-rose-400",
    columnAccent: "border-t-rose-500",
  },
};

export function getEventStatusVisual(statusCode: string): EventStatusVisual {
  return STATUS_VISUALS[statusCode] ?? DEFAULT_VISUAL;
}
