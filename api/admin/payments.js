import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'spartan_impax_jwt_super_secret_2026';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const admin = verifyToken(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized. Valid administrator session required.' });
  }

  try {
    const { status, search, currency } = req.query || {};

    let transactions = [];
    if (process.env.DATABASE_URL) {
      try {
        const { default: prisma } = await import('../../server/src/prisma.js');
        if (prisma) {
          const where = {};
          if (status && status !== 'ALL') where.status = String(status);
          if (currency && currency !== 'ALL') where.currency = String(currency).toUpperCase();
          if (search) {
            where.OR = [
              { customerName: { contains: String(search), mode: 'insensitive' } },
              { customerEmail: { contains: String(search), mode: 'insensitive' } },
              { orderId: { contains: String(search), mode: 'insensitive' } },
              { paymentId: { contains: String(search), mode: 'insensitive' } },
              { planName: { contains: String(search), mode: 'insensitive' } },
            ];
          }

          transactions = await prisma.paymentTransaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
          });
        }
      } catch (dbErr) {
        console.error('Error fetching transactions from DB:', dbErr);
      }
    }

    // Revenue calculations by currency
    const paidTxs = transactions.filter(t => t.status === 'PAID');
    const currencyTotals = {};
    paidTxs.forEach(t => {
      const c = t.currency || 'INR';
      currencyTotals[c] = (currencyTotals[c] || 0) + t.amount;
    });

    // Approximate total in INR for high-level aggregation
    const FX_TO_INR = { USD: 87, EUR: 92, GBP: 108, JPY: 0.58, AED: 23.7, CAD: 62, AUD: 56, SGD: 65, INR: 1 };
    const totalRevenueEstINR = paidTxs.reduce((sum, t) => {
      const rate = FX_TO_INR[t.currency] || 1;
      return sum + Math.round(t.amount * rate);
    }, 0);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      paidCount: paidTxs.length,
      pendingCount: transactions.filter(t => t.status === 'PENDING').length,
      failedCount: transactions.filter(t => t.status === 'FAILED').length,
      currencyTotals,
      totalRevenueEstINR,
      transactions,
    });
  } catch (error) {
    console.error('Admin payments error:', error);
    return res.status(500).json({ error: 'Failed to retrieve transactions registry.' });
  }
}