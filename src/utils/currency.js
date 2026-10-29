/**
 * Spartan Impex - Multi-Currency & Geolocation Utility
 * Handles international currencies, exchange rates, subunit calculations,
 * and automatic country detection for Razorpay global payments.
 */

export const SUPPORTED_CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    isZeroDecimal: false,
    format: (amt) => `$${Number(amt).toLocaleString('en-US')}`,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    isZeroDecimal: true, // Razorpay zero-decimal currency
    format: (amt) => `¥${Number(amt).toLocaleString('ja-JP')}`,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    isZeroDecimal: false,
    format: (amt) => `₹${Number(amt).toLocaleString('en-IN')}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    isZeroDecimal: false,
    format: (amt) => `€${Number(amt).toLocaleString('de-DE')}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    isZeroDecimal: false,
    format: (amt) => `£${Number(amt).toLocaleString('en-GB')}`,
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    isZeroDecimal: false,
    format: (amt) => `AED ${Number(amt).toLocaleString('en-AE')}`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    isZeroDecimal: false,
    format: (amt) => `CA$${Number(amt).toLocaleString('en-CA')}`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    isZeroDecimal: false,
    format: (amt) => `A$${Number(amt).toLocaleString('en-AU')}`,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    isZeroDecimal: false,
    format: (amt) => `S$${Number(amt).toLocaleString('en-SG')}`,
  },
};

// Plan Pricing Matrix across supported currencies
export const PLAN_PRICING_MATRIX = {
  'starter-architecture': {
    INR: { price: 14999, originalPrice: 24999 },
    USD: { price: 199, originalPrice: 299 },
    JPY: { price: 29800, originalPrice: 45000 },
    EUR: { price: 185, originalPrice: 279 },
    GBP: { price: 159, originalPrice: 239 },
    AED: { price: 730, originalPrice: 1099 },
    CAD: { price: 269, originalPrice: 399 },
    AUD: { price: 299, originalPrice: 449 },
    SGD: { price: 269, originalPrice: 399 },
  },
  'business-fullstack': {
    INR: { price: 49999, originalPrice: 79999 },
    USD: { price: 649, originalPrice: 999 },
    JPY: { price: 98000, originalPrice: 150000 },
    EUR: { price: 599, originalPrice: 929 },
    GBP: { price: 519, originalPrice: 799 },
    AED: { price: 2380, originalPrice: 3650 },
    CAD: { price: 879, originalPrice: 1349 },
    AUD: { price: 979, originalPrice: 1499 },
    SGD: { price: 879, originalPrice: 1349 },
  },
  'enterprise-custom': {
    INR: { price: 129999, originalPrice: 199999 },
    USD: { price: 1699, originalPrice: 2599 },
    JPY: { price: 255000, originalPrice: 390000 },
    EUR: { price: 1579, originalPrice: 2399 },
    GBP: { price: 1359, originalPrice: 2099 },
    AED: { price: 6240, originalPrice: 9550 },
    CAD: { price: 2299, originalPrice: 3499 },
    AUD: { price: 2549, originalPrice: 3899 },
    SGD: { price: 2299, originalPrice: 3499 },
  },
};

/**
 * Maps ISO 3166-1 alpha-2 country codes to preferred default currencies
 */
export const COUNTRY_TO_CURRENCY = {
  US: 'USD',
  JP: 'JPY',
  IN: 'INR',
  GB: 'GBP',
  UK: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  AE: 'AED',
  CA: 'CAD',
  AU: 'AUD',
  SG: 'SGD',
};

/**
 * Calculates subunit integer for Razorpay order creation
 * JPY is zero-decimal (exact amount)
 * USD, EUR, INR, GBP, etc. are multiplied by 100 (cents/paise/pence)
 */
export function calculateRazorpaySubunit(amount, currencyCode) {
  const curr = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;
  if (curr.isZeroDecimal) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

/**
 * Formats amount in given currency
 */
export function formatCurrencyAmount(amount, currencyCode = 'USD') {
  const curr = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  return curr.format(amount);
}

/**
 * Detects visitor country using client-side signals (timezone, locale)
 */
export function detectVisitorDefaultCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Tokyo') || tz.includes('Japan')) return 'JPY';
    if (tz.includes('Kolkata') || tz.includes('India')) return 'INR';
    if (tz.includes('London')) return 'GBP';
    if (tz.includes('Berlin') || tz.includes('Paris') || tz.includes('Rome') || tz.includes('Madrid') || tz.includes('Amsterdam')) return 'EUR';
    if (tz.includes('Dubai')) return 'AED';
    if (tz.includes('Toronto') || tz.includes('Vancouver')) return 'CAD';
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return 'AUD';
    if (tz.includes('Singapore')) return 'SGD';
    if (tz.includes('America') || tz.includes('US') || tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) return 'USD';
  } catch (e) {
    // ignore
  }

  // Check navigator languages
  const navLang = (navigator.language || navigator.userLanguage || '').toUpperCase();
  if (navLang.includes('-JP') || navLang === 'JA') return 'JPY';
  if (navLang.includes('-IN')) return 'INR';
  if (navLang.includes('-GB')) return 'GBP';
  if (navLang.includes('-DE') || navLang.includes('-FR') || navLang.includes('-ES') || navLang.includes('-IT')) return 'EUR';
  if (navLang.includes('-AE')) return 'AED';
  if (navLang.includes('-CA')) return 'CAD';
  if (navLang.includes('-AU')) return 'AUD';
  if (navLang.includes('-SG')) return 'SGD';

  return 'USD'; // Default international fallback
}