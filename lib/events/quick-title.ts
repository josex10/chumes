export function buildQuickEventTitle(customerName: string): string {
  const slug = customerName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(/[\s-]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean)
    .join("-");

  return slug ? `${slug}-Quick-Event` : "Quick-Event";
}
