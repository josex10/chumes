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

export const PHONE_MASK_PLACEHOLDER = "8888-8888";
