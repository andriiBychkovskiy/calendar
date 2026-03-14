export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',   label: 'USD – US Dollar' },
  { code: 'EUR', symbol: '€',   label: 'EUR – Euro' },
  { code: 'GBP', symbol: '£',   label: 'GBP – British Pound' },
  { code: 'JPY', symbol: '¥',   label: 'JPY – Japanese Yen' },
  { code: 'CNY', symbol: '¥',   label: 'CNY – Chinese Yuan' },
  { code: 'CHF', symbol: 'Fr',  label: 'CHF – Swiss Franc' },
  { code: 'CAD', symbol: 'C$',  label: 'CAD – Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',  label: 'AUD – Australian Dollar' },
  { code: 'INR', symbol: '₹',   label: 'INR – Indian Rupee' },
  { code: 'BRL', symbol: 'R$',  label: 'BRL – Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', label: 'MXN – Mexican Peso' },
  { code: 'RUB', symbol: '₽',   label: 'RUB – Russian Ruble' },
  { code: 'KRW', symbol: '₩',   label: 'KRW – South Korean Won' },
  { code: 'SGD', symbol: 'S$',  label: 'SGD – Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', label: 'HKD – Hong Kong Dollar' },
];
