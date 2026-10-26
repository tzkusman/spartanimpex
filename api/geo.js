export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Read Vercel Edge Geolocation header
  const countryHeader = req.headers['x-vercel-ip-country'];
  const country = typeof countryHeader === 'string' ? countryHeader.toUpperCase() : 'US';
  const city = req.headers['x-vercel-ip-city'] || 'Global';

  const countryToCurrencyMap = {
    US: 'USD',
    JP: 'JPY',
    IN: 'INR',
    GB: 'GBP',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    AE: 'AED',
    CA: 'CAD',
    AU: 'AUD',
    SG: 'SGD',
  };

  const currency = countryToCurrencyMap[country] || 'USD';

  return res.status(200).json({
    country,
    city,
    currency,
    timestamp: new Date().toISOString()
  });
}