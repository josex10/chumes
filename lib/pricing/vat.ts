export const STANDARD_VAT_RATE = 0.13;
export const STANDARD_VAT_PERCENT = 13;

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function netFromGross(
  gross: number,
  rate = STANDARD_VAT_RATE,
): number {
  return roundCurrency(gross / (1 + rate));
}

export function grossFromNet(net: number, rate = STANDARD_VAT_RATE): number {
  return roundCurrency(net * (1 + rate));
}

export function vatBreakdownFromGross(
  gross: number,
  rate = STANDARD_VAT_RATE,
): { gross: number; net: number; vat: number } {
  const roundedGross = roundCurrency(gross);
  const net = netFromGross(roundedGross, rate);
  return {
    gross: roundedGross,
    net,
    vat: roundCurrency(roundedGross - net),
  };
}

export function toOptionalNet(
  gross: number | null | undefined,
): number | undefined {
  if (gross == null || Number.isNaN(gross)) return undefined;
  return netFromGross(gross);
}

export function toOptionalGross(
  net: number | null | undefined,
): number | undefined {
  if (net == null || Number.isNaN(net)) return undefined;
  return grossFromNet(net);
}

export function grossFromNetOrNull(
  net: number | null | undefined,
): number | null {
  if (net == null || Number.isNaN(net)) return null;
  return grossFromNet(net);
}
