export const NAIRA_SYMBOL = '\u20A6';

export function parseCurrencyValue(value: string | number) {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNaira(value: string | number) {
  return `${NAIRA_SYMBOL}${parseCurrencyValue(value).toLocaleString('en-NG')}`;
}

export function formatCompactNaira(value: string | number) {
  const compactValue = new Intl.NumberFormat('en-NG', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(parseCurrencyValue(value));

  return `${NAIRA_SYMBOL}${compactValue}`;
}

export function normalizeCurrencyString(value: string) {
  return formatNaira(parseCurrencyValue(value));
}
