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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = verifyToken(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized. Valid administrator session required.' });
  }

  // =========================================================================
  // POST: Real-Time Payment Reconciliation with Razorpay API
  // =========================================================================
  if (req.method === 'POST') {
    const { action, orderId } = req.body || {};
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({ error: 'Razorpay API credentials not configured on the server.' });
    }

    const authHeader = 'Basic ' + Buffer.from(`${key_id}:${key_secret}`).toString('base64');

    let prisma = null;
    if (process.env.DATABASE_URL) {
      try {
        const prismaModule = await import('../../server/src/prisma.js');
        prisma = prismaModule.default || prismaModule.prisma;
      } catch (e) {
        console.warn('Prisma load error in admin payments POST:', e.message);
      }
    }

    // Single order reconciliation
    if (action === 'sync' && orderId) {
      try {
        const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}/payments`, {
          headers: {
            Authorization: authHeader,
            'User-Agent': 'SpartanImpax-Serverless/1.0',
          },
        });

        if (!rzpRes.ok) {
          const errText = await rzpRes.text();
          return res.status(rzpRes.status).json({ error: `Razorpay API error: ${errText}` });
        }

        const data = await rzpRes.json();
        const payments = data.items || [];
        const successfulPayment = payments.find(p => p.status === 'captured' || p.status === 'authorized');

        if (successfulPayment && prisma) {
          await prisma.paymentTransaction.updateMany({
            where: { orderId },
            data: {
              paymentId: successfulPayment.id,
              status: 'PAID',
              paymentMethod: successfulPayment.method ? `Razorpay ${successfulPayment.method.toUpperCase()}` : 'Razorpay Gateway',
              signature: 'RECONCILED_VIA_RAZORPAY_API',
            },
          });

          return res.status(200).json({
            success: true,
            synced: true,
            status: 'PAID',
            paymentId: successfulPayment.id,
            paymentMethod: successfulPayment.method,
            orderId,
            message: `Order ${orderId} reconciled: Payment captured (${successfulPayment.id}).`,
          });
        }

        // If no captured payment, check the order details directly
        const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
          headers: {
            Authorization: authHeader,
            'User-Agent': 'SpartanImpax-Serverless/1.0',
          },
        });
        const orderData = await orderRes.json();

        return res.status(200).json({
          success: true,
          synced: true,
          status: orderData.status === 'paid' ? 'PAID' : 'PENDING',
          orderStatus: orderData.status,
          attempts: orderData.attempts,
          orderId,
          message: `Order status on Razorpay is currently "${orderData.status}".`,
        });
      } catch (syncErr) {
        console.error('Error syncing order with Razorpay:', syncErr);
        return res.status(500).json({ error: syncErr.message || 'Failed to sync with Razorpay.' });
      }
    }

    // Sync all pending orders in database
    if (action === 'sync-all') {
      try {
        if (!prisma) {
          return res.status(500).json({ error: 'Database client unavailable.' });
        }

        const pendingTxs = await prisma.paymentTransaction.findMany({
          where: { status: 'PENDING' },
          take: 50,
          orderBy: { createdAt: 'desc' },
        });

        let updatedCount = 0;
        const results = [];

        for (const tx of pendingTxs) {
          try {
            const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(tx.orderId)}/payments`, {
              headers: {
                Authorization: authHeader,
                'User-Agent': 'SpartanImpax-Serverless/1.0',
              },
            });

            if (rzpRes.ok) {
              const data = await rzpRes.json();
              const payments = data.items || [];
              const successfulPayment = payments.find(p => p.status === 'captured' || p.status === 'authorized');

              if (successfulPayment) {
                await prisma.paymentTransaction.updateMany({
                  where: { orderId: tx.orderId },
                  data: {
                    paymentId: successfulPayment.id,
                    status: 'PAID',
                    paymentMethod: successfulPayment.method ? `Razorpay ${successfulPayment.method.toUpperCase()}` : 'Razorpay Gateway',
                    signature: 'RECONCILED_VIA_RAZORPAY_API',
                  },
                });
                updatedCount++;
                results.push({ orderId: tx.orderId, status: 'PAID', paymentId: successfulPayment.id });
              }
            }
          } catch (e) {
            console.warn(`Sync failed for order ${tx.orderId}:`, e.message);
          }
        }

        return res.status(200).json({
          success: true,
          syncedCount: updatedCount,
          totalPendingChecked: pendingTxs.length,
          results,
        });
      } catch (allErr) {
        console.error('Error syncing all pending orders:', allErr);
        return res.status(500).json({ error: allErr.message });
      }
    }

    return res.status(400).json({ error: 'Invalid action specified in request body.' });
  }

  // =========================================================================
  // GET: Retrieve Transactions Registry with Multi-Currency Metrics
  // =========================================================================
  if (req.method === 'GET') {
    try {
      const { status, search, currency } = req.query || {};

      let transactions = [];
      if (process.env.DATABASE_URL) {
        try {
          const prismaModule = await import('../../server/src/prisma.js');
          const prisma = prismaModule.default || prismaModule.prisma;
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

  return res.status(405).json({ error: 'Method Not Allowed' });
}
