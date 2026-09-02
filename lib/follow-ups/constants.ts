export const FOLLOW_UP_DELAYS = {
  STEP_1: 3,
  STEP_2: 5,
  STEP_3: 10,
  NO_RESPONSE: 3,
} as const;

export const FOLLOW_UP_BUCKET = {
  CLOSE_THIS_WEEK: "CLOSE_THIS_WEEK",
  STEP_1: "STEP_1",
  STEP_2: "STEP_2",
  STEP_3: "STEP_3",
  NO_RESPONSE: "NO_RESPONSE",
} as const;

export type FollowUpBucket =
  (typeof FOLLOW_UP_BUCKET)[keyof typeof FOLLOW_UP_BUCKET];

export type FollowUpStep = 1 | 2 | 3;

export const FOLLOW_UP_STEPS: FollowUpStep[] = [1, 2, 3];

export const DEFAULT_LOST_FOLLOW_UP_REASON =
  "Sin respuesta después de 3 seguimientos";

export const UNUSED_TEMPLATE_STEP: FollowUpStep = 1;

export function getFollowUpStepLabel(step: FollowUpStep): string {
  switch (step) {
    case 1:
      return "Primer seguimiento";
    case 2:
      return "Segundo seguimiento";
    case 3:
      return "Tercer seguimiento";
  }
}

export function getFollowUpLogLabel(step: FollowUpStep | null): string {
  if (step == null) return "Esta semana";
  return getFollowUpStepLabel(step);
}

export function getFollowUpPhaseLabel(step: FollowUpStep): string {
  return `Fase ${step} — ${getFollowUpStepLabel(step)}`;
}
