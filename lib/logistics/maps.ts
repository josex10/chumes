export function mapsUrl(location: string | null | undefined): string | null {
  const trimmed = location?.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export function isMapsLink(location: string | null | undefined): boolean {
  return Boolean(location?.trim() && /^https?:\/\//i.test(location.trim()));
}

export function locationLabel(location: string | null | undefined): string | null {
  const trimmed = location?.trim();
  if (!trimmed) return null;
  if (isMapsLink(trimmed)) return "Ver en Google Maps";
  return trimmed;
}
