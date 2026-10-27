export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Read Vercel Edge Geolocation header
  const countryHeader = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '';
  const country = typeof countryHeader === 'string' && countryHeader ? countryHeader.toUpperCase().trim() : 'US';
  const isIndia = (country === 'IN');
  const city = req.headers['x-vercel-ip-city'] || 'Global';

  // Cache for 10 minutes at CDN edge, 60 seconds on client
  res.setHeader('Cache-Control', 'public, s-maxage=600, max-age=60');

  return res.status(200).json({
    country,
    isIndia,
    recommendedMethod: isIndia ? 'UPI' : 'CARD_USD',
    city,
    currency: isIndia ? 'INR' : 'USD',
    timestamp: new Date().toISOString()
  });
}
