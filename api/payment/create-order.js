import 'dotenv/config';
import Razorpay from 'razorpay';

// Pricing catalog across international currencies
const PLAN_PRICING = {
  'starter-architecture': {
    name: 'Starter Architecture',
    slug: 'starter-architecture',
    prices: {
      INR: 14999,
      USD: 199,
      JPY: 29800,
      EUR: 185,
      GBP: 159,
      AED: 730,
      CAD: 269,
      AUD: 299,
      SGD: 269,
    },
    description: 'Ideal for early-stage startups & SMBs needing architectural blueprint, API roadmap, and MVP system design.',
  },
  'business-fullstack': {
    name: 'Business Full-Stack Platform',
    slug: 'business-fullstack',
    prices: {
      INR: 49999,
      USD: 649,
      JPY: 98000,
      EUR: 599,
      GBP: 519,
      AED: 2380,
      CAD: 879,
      AUD: 979,
      SGD: 879,
    },
    description: 'Comprehensive end-to-end full-stack engineering solution. Perfect for production web applications and portals.',
  },
  'enterprise-custom': {
    name: 'Enterprise Custom Solution',
    slug: 'enterprise-custom',
    prices: {
      INR: 129999,
      USD: 1699,
      JPY: 255000,
      EUR: 1579,
      GBP: 1359,
      AED: 6240,
      CAD: 2299,
      AUD: 2549,
      SGD: 2299,
    },
    description: 'Bespoke high-scale engineering for large corporations, complex microservices, AI integration, and Oracle APEX migrations.',
  }
};

const ZERO_DECIMAL_CURRENCIES = ['JPY'];

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

    // 1. Resolve Plan
    const normalizedSlug = String(planSlug || '').toLowerCase().trim();
    let plan = PLAN_PRICING[normalizedSlug];

    if (!plan) {
      const matchKey = Object.keys(PLAN_PRICING).find(k => k.includes(normalizedSlug) || normalizedSlug.includes(k));
      plan = matchKey ? PLAN_PRICING[matchKey] : PLAN_PRICING['starter-architecture'];
    }

    // Determine unit price
    const unitPrice = plan.prices[requestedCurrency] || plan.prices['USD'] || plan.prices['INR'];

    // 2. Razorpay Subunit Calculation
    // JPY: exact amount (zero-decimal)
    // USD, EUR, GBP, INR, etc.: cents/paise (multiply by 100)
    const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(requestedCurrency);
    const amountInSubunit = isZeroDecimal ? Math.round(unitPrice) : Math.round(unitPrice * 100);

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({
        error: 'Razorpay API credentials missing in server environment. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel settings.'
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
          planName: plan.name,
          planSlug: plan.slug,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone ? customerPhone.trim() : 'N/A',
          currency: requestedCurrency,
        },
      });
    } catch (rzpErr) {
      console.error('Razorpay orders.create failed:', rzpErr);
      const desc = rzpErr.error?.description || rzpErr.message || 'Razorpay order creation failed';
      return res.status(502).json({
        error: 'Razorpay Gateway Error: ' + desc
      });
    }

    // 3. Optional Non-Blocking Database Transaction Log
    if (process.env.DATABASE_URL) {
      (async () => {
        try {
          const { default: prisma } = await import('../../server/src/prisma.js');
          if (prisma) {
            await prisma.paymentTransaction.create({
              data: {
                orderId: rzpOrder.id,
                planSlug: plan.slug,
                planName: plan.name,
                amount: Math.round(unitPrice),
                currency: requestedCurrency,
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim().toLowerCase(),
                customerPhone: customerPhone ? customerPhone.trim() : null,
                status: 'PENDING',
                receipt,
              },
            });
          }
        } catch (dbErr) {
          console.warn('Prisma transaction logging skipped:', dbErr.message);
        }
      })().catch(() => {});
    }

    return res.status(200).json({
      success: true,
      orderId: rzpOrder.id,
      amount: amountInSubunit,
      displayPrice: unitPrice,
      currency: requestedCurrency,
      keyId: key_id,
      plan: {
        name: plan.name,
        price: unitPrice,
        currency: requestedCurrency,
        description: plan.description,
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