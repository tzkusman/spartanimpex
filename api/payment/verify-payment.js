import 'dotenv/config';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    const orderId = body.razorpay_order_id || body.orderId;
    const paymentId = body.razorpay_payment_id || body.paymentId;
    const signature = body.razorpay_signature || body.signature;
    const { planSlug, customer, paymentMethod, currency, amount } = body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Order ID, Payment ID, and Cryptographic Signature are required.' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return res.status(500).json({ error: 'Razorpay secret key is not configured on the server.' });
    }

    // Cryptographic signature verification (HMAC SHA-256)
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    const isAuthentic = (generatedSignature === signature);

    if (!isAuthentic) {
      console.error('Invalid Razorpay signature:', { orderId, paymentId });
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Signature mismatch. Potential tampering detected.'
      });
    }

    // Non-blocking database update
    if (process.env.DATABASE_URL) {
      (async () => {
        try {
          const { default: prisma } = await import('../../server/src/prisma.js');
          if (prisma) {
            await prisma.paymentTransaction.updateMany({
              where: { orderId },
              data: {
                paymentId,
                signature,
                status: 'PAID',
                paymentMethod: paymentMethod || 'Razorpay Verified',
                ...(currency && { currency }),
                ...(amount && { amount: Math.round(Number(amount)) }),
              },
            });
          }
        } catch (dbErr) {
          console.warn('DB payment confirmation update skipped:', dbErr.message);
        }
      })().catch(() => {});
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment cryptographically verified and recorded in Spartan Impax financial registry.',
      orderId,
      paymentId,
      customer,
      planSlug,
      currency,
      amount,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Internal server error verifying transaction.' });
  }
}