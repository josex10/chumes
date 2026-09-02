import { randomInt } from "node:crypto";

export const ANONYMOUS_NAME_PREFIX = "Anonymous";
export const ANONYMOUS_NAME_MIN = 10_000;
export const ANONYMOUS_NAME_MAX = 100_000;
export const ANONYMOUS_NAME_MAX_ATTEMPTS = 10;

export function buildAnonymousCustomerName(
  value: number = randomInt(ANONYMOUS_NAME_MIN, ANONYMOUS_NAME_MAX),
): string {
  return `${ANONYMOUS_NAME_PREFIX} ${value}`;
}
