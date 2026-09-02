import {
  FOLLOW_UP_BUCKET,
  FOLLOW_UP_DELAYS,
  getFollowUpStepLabel,
  type FollowUpStep,
} from "@/lib/follow-ups/constants";
import {
  addCalendarDays,
  dateKeyToIso,
  toCostaRicaDateKey,
} from "@/lib/follow-ups/calendar";

export type CompletedFollowUp = {
  step: number | null;
  completed_at: string;
};

export type FollowUpProgress =
  | {
      kind: "paused";
    }
  | {
      kind: "pending";
      bucket:
        | typeof FOLLOW_UP_BUCKET.STEP_1
        | typeof FOLLOW_UP_BUCKET.STEP_2
        | typeof FOLLOW_UP_BUCKET.STEP_3;
      step: FollowUpStep;
      dueDateKey: string;
    }
  | {
      kind: "exhausted";
      bucket: typeof FOLLOW_UP_BUCKET.NO_RESPONSE;
      dueDateKey: string;
    };

function isCadenceStep(step: number | null): step is FollowUpStep {
  return step === 1 || step === 2 || step === 3;
}

function latestByStep(
  completed: CompletedFollowUp[],
): Map<FollowUpStep, CompletedFollowUp> {
  const byStep = new Map<FollowUpStep, CompletedFollowUp>();

  for (const item of completed) {
    if (!isCadenceStep(item.step)) continue;
    const current = byStep.get(item.step);
    if (!current || item.completed_at > current.completed_at) {
      byStep.set(item.step, item);
    }
  }

  return byStep;
}

export function getFollowUpProgress(
  createdAt: string,
  completed: CompletedFollowUp[],
  pausedAt: string | null | undefined,
): FollowUpProgress {
  if (pausedAt) {
    return { kind: "paused" };
  }

  const byStep = latestByStep(completed);
  const createdKey = toCostaRicaDateKey(createdAt);

  if (!byStep.has(1)) {
    return {
      kind: "pending",
      bucket: FOLLOW_UP_BUCKET.STEP_1,
      step: 1,
      dueDateKey: addCalendarDays(createdKey, FOLLOW_UP_DELAYS.STEP_1),
    };
  }

  if (!byStep.has(2)) {
    return {
      kind: "pending",
      bucket: FOLLOW_UP_BUCKET.STEP_2,
      step: 2,
      dueDateKey: addCalendarDays(
        toCostaRicaDateKey(byStep.get(1)!.completed_at),
        FOLLOW_UP_DELAYS.STEP_2,
      ),
    };
  }

  if (!byStep.has(3)) {
    return {
      kind: "pending",
      bucket: FOLLOW_UP_BUCKET.STEP_3,
      step: 3,
      dueDateKey: addCalendarDays(
        toCostaRicaDateKey(byStep.get(2)!.completed_at),
        FOLLOW_UP_DELAYS.STEP_3,
      ),
    };
  }

  return {
    kind: "exhausted",
    bucket: FOLLOW_UP_BUCKET.NO_RESPONSE,
    dueDateKey: addCalendarDays(
      toCostaRicaDateKey(byStep.get(3)!.completed_at),
      FOLLOW_UP_DELAYS.NO_RESPONSE,
    ),
  };
}

export function getFollowUpCadenceLabel(
  progress: FollowUpProgress,
  todayKey: string,
): string {
  if (progress.kind === "paused") return "Pausado";
  if (progress.kind === "pending") {
    if (progress.dueDateKey > todayKey) return "Aún no toca";
    return getFollowUpStepLabel(progress.step);
  }
  if (progress.dueDateKey > todayKey) return "Aún no toca";
  return "Sin respuesta";
}

export function getNextFollowUpDateKey(progress: FollowUpProgress): string | null {
  if (progress.kind === "paused") return null;
  return progress.dueDateKey;
}

export function getInitialFollowUpAt(from = new Date()): string {
  return dateKeyToIso(
    addCalendarDays(toCostaRicaDateKey(from), FOLLOW_UP_DELAYS.STEP_1),
  );
}
