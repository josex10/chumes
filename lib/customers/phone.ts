const PHONE_DIGIT_LENGTH = 8;

export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_DIGIT_LENGTH);
}

export function formatPhoneNumber(value: string): string {
  const digits = extractPhoneDigits(value);

  if (digits.length <= 4) {
    return digits;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function isValidPhoneNumber(value: string): boolean {
  return extractPhoneDigits(value).length === PHONE_DIGIT_LENGTH;
}

export function resolveCustomerPhone(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }

  return null;
}

export function getCustomerWhatsAppUrl(
  phone: string,
  message: string,
): string | null {
  const digits = extractPhoneDigits(phone);
  if (digits.length !== PHONE_DIGIT_LENGTH) return null;
  return `https://wa.me/506${digits}?text=${encodeURIComponent(message)}`;
}

export const PHONE_MASK_PLACEHOLDER = "8888-8888";
