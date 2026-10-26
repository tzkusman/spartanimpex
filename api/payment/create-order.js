import 'dotenv/config';
import Razorpay from 'razorpay';

// Divisors for converting base INR price to international currencies
const FX_DIVISORS = {
  INR: 1,
  USD: 75.37,
  JPY: 0.503,
  EUR: 81.07,
  GBP: 94.33,
  AED: 20.55,
  CAD: 55.76,
  AUD: 50.16,
  SGD: 55.76,
};

const ZERO_DECIMAL_CURRENCIES = ['JPY'];

const FALLBACK_PLANS = {
  'starter-architecture': {
    name: 'Starter Architecture',
    slug: 'starter-architecture',
    price: 14999,
    description: 'Ideal for early-stage startups & SMBs needing architectural blueprint, API roadmap, and MVP system design.',
  },
  'business-fullstack': {
    name: 'Business Full-Stack Platform',
    slug: 'business-fullstack',
    price: 49999,
    description: 'Comprehensive end-to-end full-stack engineering solution. Perfect for production web applications and portals.',
  },
  'enterprise-custom': {
    name: 'Enterprise Custom Solution',
    slug: 'enterprise-custom',
    price: 129999,
    description: 'Bespoke high-scale engineering for large corporations, complex microservices, AI integration, and Oracle APEX migrations.',
  }
};

function calculatePriceInCurrency(inrAmount, currencyCode) {
  const code = String(currencyCode || 'USD').toUpperCase();
  const divisor = FX_DIVISORS[code] || FX_DIVISORS['USD'];
  const amt = Number(inrAmount) || 0;
  if (amt <= 0) return 0;
  if (code === 'INR') return amt;
  if (code === 'JPY') return Math.max(100, Math.round(amt / divisor / 100) * 100);
  return Math.max(1, Math.round(amt / divisor));
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
    const { planSlug, customerName, customerEmail, customerPhone, currency = 'USD' } = req.body || {};

    if (!customerEmail || !customerName) {
      return res.status(400).json({ error: 'Full name and corporate email are required for checkout.' });
    }

    const requestedCurrency = String(currency || 'USD').toUpperCase().trim();
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

    // 2. Determine real live price in requested currency
    const inrBasePrice = planData.price !== undefined ? planData.price : 14999;
    const unitPrice = calculatePriceInCurrency(inrBasePrice, requestedCurrency);

    // 3. Razorpay Subunit Calculation
    // JPY: exact amount (zero-decimal, min 100)
    // USD, EUR, GBP, INR, etc.: multiply by 100 (min 100 cents/paise)
    const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(requestedCurrency);
    const amountInSubunit = isZeroDecimal ? Math.max(100, Math.round(unitPrice)) : Math.max(100, Math.round(unitPrice * 100));

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
        currency: requestedCurrency,
        receipt,
        notes: {
          planName: planData.name,
          planSlug: planData.slug,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone ? customerPhone.trim() : 'N/A',
          currency: requestedCurrency,
          baseINR: String(inrBasePrice),
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
          amount: Math.round(unitPrice),
          currency: requestedCurrency,
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
      displayPrice: unitPrice,
      currency: requestedCurrency,
      keyId: key_id,
      plan: {
        name: planData.name,
        price: unitPrice,
        currency: requestedCurrency,
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
