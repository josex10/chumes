export const INVENTORY_MOVEMENT_TYPE = {
  INITIAL_LOAD: "INITIAL_LOAD",
  PURCHASE: "PURCHASE",
  ADJUSTMENT: "ADJUSTMENT",
  DAMAGE: "DAMAGE",
  LOSS: "LOSS",
  EVENT_OUT: "EVENT_OUT",
  EVENT_RETURN: "EVENT_RETURN",
} as const;

export const MANUAL_INVENTORY_MOVEMENT_TYPES = [
  INVENTORY_MOVEMENT_TYPE.INITIAL_LOAD,
  INVENTORY_MOVEMENT_TYPE.PURCHASE,
  INVENTORY_MOVEMENT_TYPE.ADJUSTMENT,
  INVENTORY_MOVEMENT_TYPE.DAMAGE,
  INVENTORY_MOVEMENT_TYPE.LOSS,
] as const;

export type ManualInventoryMovementTypeCode =
  (typeof MANUAL_INVENTORY_MOVEMENT_TYPES)[number];

export const OUTBOUND_INVENTORY_MOVEMENT_TYPES = new Set<string>([
  INVENTORY_MOVEMENT_TYPE.DAMAGE,
  INVENTORY_MOVEMENT_TYPE.LOSS,
  INVENTORY_MOVEMENT_TYPE.EVENT_OUT,
]);

export function signedMovementQuantity(
  movementTypeCode: string,
  quantity: number,
  adjustmentDirection?: "increase" | "decrease",
): number {
  const absoluteQuantity = Math.abs(quantity);

  if (movementTypeCode === INVENTORY_MOVEMENT_TYPE.ADJUSTMENT) {
    return adjustmentDirection === "decrease"
      ? -absoluteQuantity
      : absoluteQuantity;
  }

  if (OUTBOUND_INVENTORY_MOVEMENT_TYPES.has(movementTypeCode)) {
    return -absoluteQuantity;
  }

  return absoluteQuantity;
}
