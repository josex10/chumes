export const CUSTOMER_TYPE = {
  INDIVIDUAL: "INDIVIDUAL",
  COMPANY: "COMPANY",
  GOVERNMENT: "GOVERNMENT",
  EVENT_PLANNER: "EVENT_PLANNER",
  VENUE: "VENUE",
} as const;

export type CustomerTypeCode =
  (typeof CUSTOMER_TYPE)[keyof typeof CUSTOMER_TYPE];
