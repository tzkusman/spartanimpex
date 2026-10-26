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
    return res.status(401).json({ error: 'Unauthorized. Admin session required.' });
  }

  try {
    let totalMessages = 0;
    let unreadMessages = 0;
    let transactions = [];
    let activeVisitors = 1;
    let recentMessages = [];

    if (process.env.DATABASE_URL) {
      try {
        const { default: prisma } = await import('../../server/src/prisma.js');
        if (prisma) {
          const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
          const [msgCount, unreadCount, txs, visitorsCount, rMsgs] = await Promise.all([
            prisma.contactMessage.count(),
            prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
            prisma.paymentTransaction.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
            prisma.visitorLog.count({ where: { createdAt: { gte: fifteenMinsAgo } } }),
            prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
          ]);

          totalMessages = msgCount;
          unreadMessages = unreadCount;
          transactions = txs;
          activeVisitors = Math.max(visitorsCount, 1);
          recentMessages = rMsgs;
        }
      } catch (dbErr) {
        console.warn('Overview DB aggregation bypassed:', dbErr.message);
      }
    }

    const paidTxs = transactions.filter(t => t.status === 'PAID');
    const currencyTotals = {};
    paidTxs.forEach(t => {
      const c = t.currency || 'INR';
      currencyTotals[c] = (currencyTotals[c] || 0) + t.amount;
    });

    const FX_TO_INR = { USD: 87, EUR: 92, GBP: 108, JPY: 0.58, AED: 23.7, CAD: 62, AUD: 56, SGD: 65, INR: 1 };
    const totalRevenueEstINR = paidTxs.reduce((sum, t) => {
      const rate = FX_TO_INR[t.currency] || 1;
      return sum + Math.round(t.amount * rate);
    }, 0);

    return res.status(200).json({
      metrics: {
        totalRevenue: totalRevenueEstINR,
        currencyTotals,
        paidTransactionsCount: paidTxs.length,
        pendingTransactionsCount: transactions.filter(t => t.status === 'PENDING').length,
        totalMessages,
        unreadMessages,
        activeVisitors,
        totalProjects: 6,
        totalPlans: 3,
      },
      recentTransactions: transactions.slice(0, 5),
      recentMessages,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ error: 'Failed to compute dashboard metrics.' });
  }
}