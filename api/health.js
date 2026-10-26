export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    status: 'healthy',
    gateway: 'Razorpay Live Integration',
    platform: 'Spartan Impax Enterprise Cloud',
    timestamp: new Date().toISOString()
  });
}