import 'dotenv/config';
import Razorpay from 'razorpay';

// Predefined plans for zero-downtime resilience
const fallbackPlans = [
  {
    name: "Starter Architecture",
    slug: "starter-architecture",
    price: 14999,
    description: "Ideal for early-stage startups & SMBs needing architectural blueprint, API roadmap, and MVP system design.",
  },
  {
    name: "Business Full-Stack Platform",
    slug: "business-fullstack",
    price: 49999,
    description: "Comprehensive end-to-end full-stack engineering solution. Perfect for production web applications and portals.",
  },
  {
    name: "Enterprise Custom Solution",
    slug: "enterprise-custom",
    price: 129999,
    description: "Bespoke high-scale engineering for large corporations, complex microservices, AI integration, and Oracle APEX migrations.",
  }
];

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

    // Identify Selected Plan
    const normalizedSlug = String(planSlug || '').toLowerCase().trim();
    let plan = fallbackPlans.find(
      p => p.slug === normalizedSlug || p.slug.includes(normalizedSlug) || normalizedSlug.includes(p.slug)
    );

    if (!plan) {
      plan = fallbackPlans[0];
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({
        error: 'Razorpay API credentials missing in server environment. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel settings.'
      });
    }

    const amountInPaise = Math.round(plan.price * 100);
    const receipt = 'rcpt_' + Date.now().toString().slice(-8);

    const razorpay = new Razorpay({ key_id, key_secret });

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          planName: plan.name,
          planSlug: plan.slug,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone ? customerPhone.trim() : 'N/A',
        },
      });
    } catch (rzpErr) {
      console.error('Razorpay orders.create failed:', rzpErr);
      const desc = rzpErr.error?.description || rzpErr.message || 'Razorpay order creation failed';
      return res.status(502).json({
        error: 'Razorpay Gateway Error: ' + desc
      });
    }

    // Optional non-blocking database audit log
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
                amount: plan.price,
                currency: 'INR',
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
      amount: amountInPaise,
      currency: 'INR',
      keyId: key_id,
      plan: {
        name: plan.name,
        price: plan.price,
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