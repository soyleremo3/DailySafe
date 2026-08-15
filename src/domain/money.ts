let cachedFormatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, maximumFractionDigits: number): Intl.NumberFormat {
  const key = `${currency}:${maximumFractionDigits}`;
  let formatter = cachedFormatters.get(key);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits,
        minimumFractionDigits: maximumFractionDigits,
      });
    } catch {
      formatter = new Intl.NumberFormat(undefined, {
        style: 'decimal',
        maximumFractionDigits,
        minimumFractionDigits: maximumFractionDigits,
      });
    }
    cachedFormatters.set(key, formatter);
  }
  return formatter;
}

export function formatMoney(amount: number, currency: string, options?: { compact?: boolean }): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  if (options?.compact && Math.abs(safeAmount) >= 1000) {
    const compactFormatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    });
    try {
      return compactFormatter.format(safeAmount);
    } catch {
      // fall through to standard formatting
    }
  }
  return getFormatter(currency, 2).format(safeAmount);
}

export function formatMoneyWhole(amount: number, currency: string): string {
  return getFormatter(currency, 0).format(Math.round(amount));
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function clampNonNegative(amount: number): number {
  return amount < 0 ? 0 : amount;
}
