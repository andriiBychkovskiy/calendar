/** Matches `data-month-key` format: `YYYY-M` (month 1–12). */
export const monthKeyFromDate = (d: Date): string => `${d.getFullYear()}-${d.getMonth() + 1}`;
