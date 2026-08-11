export const PROFILE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ProfileStatusCode =
  (typeof PROFILE_STATUS)[keyof typeof PROFILE_STATUS];
