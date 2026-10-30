export const DELIVERY_COLLABORATORS = [
  { code: "jose-badilla", name: "Jose Badilla" },
  { code: "ricardo-badilla", name: "Ricardo Badilla" },
  { code: "carolina-corrales", name: "Carolina Corrales" },
  { code: "arturo-badilla", name: "Arturo Badilla" },
  { code: "xinia-porras", name: "Xinia Porras" },
] as const;

export type DeliveryCollaboratorCode =
  (typeof DELIVERY_COLLABORATORS)[number]["code"];

const COLLABORATOR_CODES = new Set<string>(
  DELIVERY_COLLABORATORS.map((collaborator) => collaborator.code),
);

export function isDeliveryCollaboratorCode(
  value: string,
): value is DeliveryCollaboratorCode {
  return COLLABORATOR_CODES.has(value);
}

export function orderedAssigneeCodes(codes: string[]): DeliveryCollaboratorCode[] {
  const selected = new Set(codes);
  return DELIVERY_COLLABORATORS.flatMap((collaborator) =>
    selected.has(collaborator.code) ? [collaborator.code] : [],
  );
}

export function assigneeNames(codes: string[] | null | undefined): string[] {
  const selected = new Set(codes ?? []);
  return DELIVERY_COLLABORATORS.flatMap((collaborator) =>
    selected.has(collaborator.code) ? [collaborator.name] : [],
  );
}
