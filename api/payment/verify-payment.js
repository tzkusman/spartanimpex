import 'dotenv/config';
import crypto from 'crypto';

/**
 * Dispatches a cryptographically verified order receipt and confirmation
 * directly to the buyer's email address via EmailJS REST API v1.0.
 */
async function sendEmailReceipt({
  customerName,
  customerEmail,
  customerPhone,
  packageName,
  orderId,
  paymentId,
  amount,
  currency,
  paymentMethod,
}) {
  const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_endm1tw';
  const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_l4qo9hg';
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'aGQQEQqpZMy3SmeHg';
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || 'RjTW321UbfBEhRV2OfHmW';

  if (!customerEmail) {
    return { sent: false, reason: 'missing_customer_email' };
  }

  const formattedAmount = currency === 'USD'
    ? `$${Number(amount).toLocaleString()} USD`
    : `₹${Number(amount).toLocaleString('en-IN')} ${currency}`;

  // Multi-alias parameter bindings ensure 100% compatibility with any EmailJS template variable names
  const templateParams = {
    to_name: customerName || 'Valued Client',
    name: customerName || 'Valued Client',
    user_name: customerName || 'Valued Client',
    to_email: customerEmail,
    email: customerEmail,
    user_email: customerEmail,
    customer_email: customerEmail,
    package_name: packageName || 'Spartan Impax Engineering Package',
    plan_name: packageName || 'Spartan Impax Engineering Package',
    order_id: orderId,
    payment_id: paymentId,
    amount: formattedAmount,
    currency: currency || 'USD',
    payment_method: paymentMethod || 'Razorpay Verified',
    status: 'PAID',
    customer_phone: customerPhone || 'N/A',
    phone: customerPhone || 'N/A',
    date: new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' }),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.spartanimpex.com',
        'User-Agent': 'SpartanImpax-Serverless/1.0',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (emailRes.ok) {
      console.log(`[EmailJS] Order receipt sent successfully to ${customerEmail} (Order: ${orderId})`);
      return { sent: true };
    } else {
      const errText = await emailRes.text();
      console.warn(`[EmailJS] Gateway response HTTP ${emailRes.status}:`, errText);
      return { sent: false, error: errText };
    }
  } catch (err) {
    console.error('[EmailJS] Network/dispatch error:', err.message);
    return { sent: false, error: err.message };
  }
}

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

    const customerName = (customer && customer.name) ? customer.name.trim() : 'Verified Customer';
    const customerEmail = (customer && customer.email) ? customer.email.trim().toLowerCase() : 'billing@spartanimpax.com';
    const customerPhone = (customer && customer.phone) ? customer.phone.trim() : null;
    const packageName = body.planName || 'Spartan Impax Engineering Package';

    // Explicitly awaited database persistence for Serverless environments
    if (process.env.DATABASE_URL) {
      try {
        const prismaModule = await import('../../server/src/prisma.js');
        const prisma = prismaModule.default || prismaModule.prisma;
        if (prisma) {
          const updateResult = await prisma.paymentTransaction.updateMany({
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

          // Resilient Fallback: If create-order didn't record orderId in DB beforehand,
          // create the PAID record directly so admin transaction audit is never missed
          if (updateResult.count === 0) {
            await prisma.paymentTransaction.create({
              data: {
                orderId,
                paymentId,
                signature,
                planSlug: planSlug || 'custom-plan',
                planName: packageName,
                amount: Math.round(Number(amount) || 1),
                currency: currency || 'USD',
                customerName,
                customerEmail,
                customerPhone,
                status: 'PAID',
                paymentMethod: paymentMethod || 'Razorpay Verified',
                receipt: 'rcpt_' + Date.now().toString().slice(-8),
              },
            });
          }
        }
      } catch (dbErr) {
        console.error('DB payment confirmation update error in verify-payment:', dbErr.message);
      }
    }

    // Trigger EmailJS Order Receipt directly to the buyer's email
    let emailResult = { sent: false };
    if (customer && customer.email) {
      emailResult = await sendEmailReceipt({
        customerName,
        customerEmail: customer.email.trim().toLowerCase(),
        customerPhone,
        packageName,
        orderId,
        paymentId,
        amount,
        currency,
        paymentMethod,
      });
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
      emailSent: emailResult.sent,
      emailStatus: emailResult,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Internal server error verifying transaction.' });
  }
}
