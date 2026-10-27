export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Inspect Vercel edge IP geolocation header
  const countryHeader =
    req.headers['x-vercel-ip-country'] ||
    req.headers['cf-ipcountry'] ||
    req.headers['x-country-code'] ||
    '';

  const country = String(countryHeader).toUpperCase().trim();
  const isIndia = (country === 'IN');

  // If visitor is from India, default to domestic UPI & NetBanking
  // If visitor is from US or any other international country, default to native USD Cards & Apple Pay
  const recommendedMethod = isIndia ? 'UPI' : 'CARD_USD';

  // Cache for 10 minutes at CDN edge, 60 seconds on client
  res.setHeader('Cache-Control', 'public, s-maxage=600, max-age=60');

  return res.status(200).json({
    country: country || 'US',
    isIndia,
    recommendedMethod,
    region: req.headers['x-vercel-ip-country-region'] || null,
    city: req.headers['x-vercel-ip-city'] || null,
  });
}
