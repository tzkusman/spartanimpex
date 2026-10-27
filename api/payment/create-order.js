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
    const { planSlug, customerName, customerEmail, customerPhone } = req.body || {};

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

    // 3. Strictly Native USD Currency & Cents Subunit (Zero INR anywhere)
    const currency = 'USD';
    const amountInSubunit = Math.max(100, Math.round(unitPriceUSD * 100)); // Cents

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
          currency: 'USD',
          priceUSD: String(unitPriceUSD),
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
          amount: Math.round(unitPriceUSD),
          currency: 'USD',
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
      currency: 'USD',
      keyId: key_id,
      plan: {
        name: planData.name,
        priceUSD: unitPriceUSD,
        currency: 'USD',
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
