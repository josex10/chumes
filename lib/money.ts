function toCents(value: number): number {
  return Math.round(Number(value) * 100);
}

export function roundMoney(value: number): number {
  return toCents(value) / 100;
}

export function sumMoney(values: number[]): number {
  const cents = values.reduce((total, value) => total + toCents(value), 0);
  return cents / 100;
}

export function remainingMoney(amount: number, paid: number): number {
  return Math.max(0, (toCents(amount) - toCents(paid)) / 100);
}
