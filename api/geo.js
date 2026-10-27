export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Disable caching so VPN switching is detected with 0-second lag
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Read Vercel Edge Geolocation header
  const countryHeader =
    req.headers['x-vercel-ip-country'] ||
    req.headers['cf-ipcountry'] ||
    req.headers['x-country-code'] ||
    '';

  const country = typeof countryHeader === 'string' && countryHeader ? countryHeader.toUpperCase().trim() : 'US';
  const isIndia = (country === 'IN');
  const city = req.headers['x-vercel-ip-city'] || 'Global';

  return res.status(200).json({
    country,
    isIndia,
    recommendedMethod: isIndia ? 'UPI' : 'CARD_USD',
    city,
    currency: isIndia ? 'INR' : 'USD',
    timestamp: new Date().toISOString()
  });
}
