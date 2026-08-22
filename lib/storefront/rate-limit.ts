const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

const submissions = new Map<string, number[]>();

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (recent.length >= MAX_REQUESTS) {
    return false;
  }

  recent.push(now);
  submissions.set(key, recent);
  return true;
}
