import { CURRENCIES } from '@entities/options/currencies';

export function formatCurrencyAmount(code: string, amount: number): string {
  const c = CURRENCIES.find((x) => x.code === code);
  const sym = c?.symbol ?? `${code} `;
  return `${sym}${amount.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}
