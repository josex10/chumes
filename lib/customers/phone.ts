const PHONE_DIGIT_LENGTH = 8;
const CR_COUNTRY_CODE = "506";

export function extractPhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (
    digits.startsWith(`00${CR_COUNTRY_CODE}`) &&
    digits.length >= 5 + PHONE_DIGIT_LENGTH
  ) {
    digits = digits.slice(5);
  } else if (
    digits.startsWith(CR_COUNTRY_CODE) &&
    digits.length >= CR_COUNTRY_CODE.length + PHONE_DIGIT_LENGTH
  ) {
    digits = digits.slice(CR_COUNTRY_CODE.length);
  }

  return digits.slice(0, PHONE_DIGIT_LENGTH);
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
export const PHONE_COUNTRY_PREFIX = "+506";
