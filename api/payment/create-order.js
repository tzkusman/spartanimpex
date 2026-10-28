import 'dotenv/config';
import Razorpay from 'razorpay';

const FALLBACK_PLANS = {
  'starter-architecture': {
    name: 'Starter Architecture',
    slug: 'starter-architecture',
    price: 199,
    description: 'Ideal for early-stage startups & SMBs needing architectural blueprint, API roadmap, and MVP system design.',
  },
  'business-fullstack': {
    name: 'Business Full-Stack Platform',
    slug: 'business-fullstack',
    price: 649,
    description: 'Comprehensive end-to-end full-stack engineering solution. Perfect for production web applications and portals.',
  },
  'enterprise-custom': {
    name: 'Enterprise Custom Solution',
    slug: 'enterprise-custom',
    price: 1699,
    description: 'Bespoke high-scale engineering for large corporations, complex microservices, AI integration, and Oracle APEX migrations.',
  }
};

// In-memory cache for live FX rate with 5-minute TTL
let cachedFxRate = {
  rate: 95.27,
  timestamp: 0,
};

async function getLiveUsdToInrRate() {
  const now = Date.now();
  if (cachedFxRate.timestamp && now - cachedFxRate.timestamp < 300000) {
    return cachedFxRate.rate;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.INR && typeof data.rates.INR === 'number' && data.rates.INR > 50) {
        const liveRate = Number(data.rates.INR.toFixed(2));
        cachedFxRate = { rate: liveRate, timestamp: now };
        return liveRate;
      }
    }
  } catch (err) {
    console.warn('Primary live FX API (open.er-api) failed, attempting fallback:', err.message);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2?.rates?.INR && typeof data2.rates.INR === 'number' && data2.rates.INR > 50) {
        const liveRate2 = Number(data2.rates.INR.toFixed(2));
        cachedFxRate = { rate: liveRate2, timestamp: now };
        return liveRate2;
      }
    }
  } catch (err2) {
    console.warn('Fallback live FX API failed, using cached/safe rate:', err2.message);
  }

  return cachedFxRate.rate || 95.27;
}

/**
 * Dispatches Stage 1 (Pending Order) notification to buyer's email via EmailJS REST API
 */
async function sendPendingOrderEmail({
  customerName,
  customerEmail,
  customerPhone,
  packageName,
  orderId,
  amount,
  currency,
  paymentMethod,
}) {
  const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_endm1tw';
  const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_l4qo9hg';
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'aGQQEQqpZMy3SmeHg';
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || 'RjTW321UbfBEhRV2OfHmW';

  if (!customerEmail) return { sent: false, reason: 'missing_email' };

  const formattedAmount = currency === 'USD'
    ? `$${Number(amount).toLocaleString()} USD`
    : `₹${Number(amount).toLocaleString('en-IN')} ${currency}`;

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
    payment_id: 'Pending Payment',
    amount: formattedAmount,
    currency: currency || 'USD',
    payment_method: paymentMethod || 'Razorpay Order Initiated',
    status: 'PENDING',
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
      console.log(`[EmailJS] Stage 1 (PENDING) order email dispatched to ${customerEmail} (Order: ${orderId})`);
      return { sent: true };
    } else {
      const errText = await emailRes.text();
      console.warn(`[EmailJS] Stage 1 dispatch response HTTP ${emailRes.status}:`, errText);
      return { sent: false, error: errText };
    }
  } catch (err) {
    console.error('[EmailJS] Stage 1 dispatch error:', err.message);
    return { sent: false, error: err.message };
  }
}

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    const { planId, planSlug, customerName, customerEmail, customerPhone, method } = req.body || {};

    if (!customerEmail || !customerName) {
      return res.status(400).json({ error: 'Full name and corporate email are required for checkout.' });
    }

    const normalizedSlug = String(planSlug || '').toLowerCase().trim();

    // 1. Fetch live plan from database
    let planData = null;
    let prisma = null;

    if (process.env.DATABASE_URL) {
      try {
        const prismaModule = await import('../../server/src/prisma.js');
        prisma = prismaModule.default || prismaModule.prisma;
        if (prisma) {
          planData = await prisma.pricingPlan.findFirst({
            where: {
              OR: [
                ...(planId ? [{ id: planId }] : []),
                { slug: normalizedSlug },
              ],
              active: true,
            },
          });
        }
      } catch (dbErr) {
        console.warn('Prisma lookup failed in create-order, using fallback:', dbErr.message);
      }
    }

    if (!planData) {
      planData = FALLBACK_PLANS[normalizedSlug] || FALLBACK_PLANS['starter-architecture'];
    }

    // 2. Direct USD price from database (e.g. $1, $200, $550, or default)
    const unitPriceUSD = planData.price !== undefined ? Number(planData.price) : 199;

    // 3. Routing: UPI & NetBanking (INR via live FX) vs Card & Apple Pay (USD)
    const isUpiNetBanking = (method === 'UPI' || method === 'INR');
    let currency = 'USD';
    let amountInSubunit = 0;
    let liveRate = 1;
    let amountINR = null;

    if (isUpiNetBanking) {
      currency = 'INR';
      liveRate = await getLiveUsdToInrRate();
      amountINR = Math.max(1, Math.round(unitPriceUSD * liveRate));
      amountInSubunit = amountINR * 100; // Paise
    } else {
      currency = 'USD';
      amountInSubunit = Math.max(100, Math.round(unitPriceUSD * 100)); // Cents
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({
        error: 'Razorpay API credentials missing in server environment. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
      });
    }

    const receipt = 'rcpt_' + Date.now().toString().slice(-8);
    const razorpay = new Razorpay({ key_id, key_secret });

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInSubunit,
        currency,
        receipt,
        notes: {
          planName: planData.name,
          planSlug: planData.slug,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone ? customerPhone.trim() : 'N/A',
          currency,
          priceUSD: String(unitPriceUSD),
          method: isUpiNetBanking ? 'UPI_NETBANKING' : 'CARD_USD',
          amountINR: isUpiNetBanking ? String(amountINR) : 'N/A',
          liveRate: isUpiNetBanking ? String(liveRate) : '1.0',
        },
      });
    } catch (rzpErr) {
      console.error('Razorpay orders.create failed:', rzpErr);
      const desc = rzpErr.error?.description || rzpErr.message || 'Razorpay order creation failed';
      return res.status(502).json({
        error: 'Razorpay Gateway Error: ' + desc
      });
    }

    // 4. Synchronously Awaited Database Transaction Log (Prevents serverless freeze dropping records)
    const transactionAmount = Math.round(isUpiNetBanking ? (amountINR || unitPriceUSD) : unitPriceUSD);
    if (prisma) {
      try {
        await prisma.paymentTransaction.create({
          data: {
            orderId: rzpOrder.id,
            planSlug: planData.slug,
            planName: planData.name,
            amount: transactionAmount,
            currency,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim().toLowerCase(),
            customerPhone: customerPhone ? customerPhone.trim() : null,
            status: 'PENDING',
            receipt,
          },
        });
      } catch (dbErr) {
        console.warn('Prisma transaction logging warning in create-order:', dbErr.message);
      }
    }

    // 5. Stage 1 Email Notification: Dispatch PENDING Order Details to Buyer's Email
    let pendingEmailResult = { sent: false };
    if (customerEmail) {
      pendingEmailResult = await sendPendingOrderEmail({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone ? customerPhone.trim() : null,
        packageName: planData.name,
        orderId: rzpOrder.id,
        amount: transactionAmount,
        currency,
        paymentMethod: isUpiNetBanking ? 'UPI / NetBanking (INR)' : 'Credit / Debit Card (USD)',
      });
    }

    return res.status(200).json({
      success: true,
      orderId: rzpOrder.id,
      amount: amountInSubunit,
      displayPrice: unitPriceUSD,
      currency,
      amountINR: isUpiNetBanking ? amountINR : null,
      liveRate: isUpiNetBanking ? liveRate : 1,
      method: isUpiNetBanking ? 'UPI' : 'CARD_USD',
      keyId: key_id,
      pendingEmailSent: pendingEmailResult.sent,
      plan: {
        name: planData.name,
        priceUSD: unitPriceUSD,
        currency,
        description: planData.description,
      },
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      isLiveRazorpay: !key_id.startsWith('rzp_test'),
    });
  } catch (error) {
    console.error('Unhandled order creation error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error processing payment order.'
    });
  }
}
