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
    const { planSlug, customerName, customerEmail, customerPhone, method } = req.body || {};

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
              slug: normalizedSlug,
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

    // 2. Direct USD price from database (e.g. $1, $199, $649, $1699)
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

    // 4. Non-Blocking Database Transaction Log
    if (prisma) {
      prisma.paymentTransaction.create({
        data: {
          orderId: rzpOrder.id,
          planSlug: planData.slug,
          planName: planData.name,
          amount: Math.round(isUpiNetBanking ? (amountINR || unitPriceUSD) : unitPriceUSD),
          currency,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone ? customerPhone.trim() : null,
          status: 'PENDING',
          receipt,
        },
      }).catch(dbErr => console.warn('Prisma transaction logging skipped:', dbErr.message));
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
