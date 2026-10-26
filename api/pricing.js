import 'dotenv/config';

// Standard international currency exchange rate divisors against base INR
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

const DEFAULT_PLANS = [
  {
    name: 'Starter Architecture',
    slug: 'starter-architecture',
    price: 14999,
    originalPrice: 24999,
    badge: 'Quick Launch',
    description: 'Ideal for early-stage startups & SMBs needing architectural blueprint, API roadmap, and MVP system design.',
    features: [
      'Microservice & DB Schema Architecture Blueprint',
      'API Specification & RESTful Flow Design',
      'Cloud Infrastructure & Security Audit',
      'Tech Stack & DevOps Selection Matrix',
      '7-Day Delivery & 1 Revision Round',
      'Direct Architecture Consultation (2 Hours)'
    ],
    deliverables: [
      'Figma / Miro System Topology Diagrams',
      'Postman OpenAPI 3.0 Specs',
      'AWS / GCP Cost Optimization Plan'
    ],
    popular: false,
    active: true,
    sortOrder: 1
  },
  {
    name: 'Business Full-Stack Platform',
    slug: 'business-fullstack',
    price: 49999,
    originalPrice: 79999,
    badge: 'Most Popular Choice',
    description: 'Comprehensive end-to-end full-stack engineering solution. Perfect for production web applications and portals.',
    features: [
      'Production-Ready React 19 / Next.js Frontend',
      'Scalable Node.js / Express or Python Backend',
      'Prisma ORM with PostgreSQL Setup',
      'JWT / OAuth2 Authentication & Role-Based Access',
      'Stripe / Razorpay Payment Gateway Integration',
      'CI/CD Pipeline Setup (Vercel / GitHub Actions)',
      '21-Day Delivery & 3 Revision Rounds',
      '30-Day Post-Launch Maintenance & SLA'
    ],
    deliverables: [
      'Complete Source Code with Full IP Transfer',
      'Automated Test Coverage Suite',
      'Dockerized Container Deployment'
    ],
    popular: true,
    active: true,
    sortOrder: 2
  },
  {
    name: 'Enterprise Custom Solution',
    slug: 'enterprise-custom',
    price: 129999,
    originalPrice: 199999,
    badge: 'Maximum Performance',
    description: 'Bespoke high-scale engineering for large corporations, complex microservices, AI integration, and Oracle APEX migrations.',
    features: [
      'Full Custom Architecture & Multi-Tenant Database',
      'Oracle APEX / Cloud ERP Modernization',
      'Generative AI / LLM Pipeline Integration (Gemini / OpenAI)',
      'Distributed Kubernetes / AWS ECS Cluster Setup',
      'High-Volume Real-Time Telemetry & WebSocket Pipelines',
      'SOC2 / GDPR Compliance Hardening',
      'Dedicated Senior Engineering Squad',
      '60-Day Delivery & Unlimited Iterations',
      '90-Day VIP Dedicated Support & 99.9% Uptime SLA'
    ],
    deliverables: [
      'Enterprise Architectural Documentation',
      'Load Testing Benchmark Reports',
      'Executive Board Presentation & Onboarding'
    ],
    popular: false,
    active: true,
    sortOrder: 3
  }
];

// Helper to compute prices map for each currency with minimum 1 unit floor
function computeMultiCurrencyPrices(inrAmount) {
  if (inrAmount === undefined || inrAmount === null) return {};
  const amount = Number(inrAmount);
  if (amount <= 0) return {};

  const prices = {};
  for (const [curr, divisor] of Object.entries(FX_DIVISORS)) {
    if (curr === 'INR') {
      prices[curr] = amount;
    } else if (curr === 'JPY') {
      // JPY: If amount > 0, at least ¥100 for zero-decimal minimum, clean rounded to hundreds
      prices[curr] = Math.max(100, Math.round(amount / divisor / 100) * 100);
    } else {
      // USD, EUR, GBP, AED, CAD, AUD, SGD:
      // If amount > 0, at least 1 unit so payment gateway can charge real money
      prices[curr] = Math.max(1, Math.round(amount / divisor));
    }
  }
  return prices;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  // Disable all caching so admin updates reflect in real time for public visitors
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    let plans = [];

    if (process.env.DATABASE_URL) {
      try {
        const prismaModule = await import('../server/src/prisma.js');
        const prisma = prismaModule.default || prismaModule.prisma;
        if (prisma) {
          plans = await prisma.pricingPlan.findMany({
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
          });
        }
      } catch (dbErr) {
        console.warn('Prisma query in /api/pricing skipped:', dbErr.message);
      }
    }

    if (!plans || plans.length === 0) {
      plans = DEFAULT_PLANS;
    }

    // Augment with computed multi-currency rates
    const augmentedPlans = plans.map((p) => {
      const planObj = typeof p.toJSON === 'function' ? p.toJSON() : { ...p };
      return {
        ...planObj,
        prices: computeMultiCurrencyPrices(planObj.price),
        originalPrices: planObj.originalPrice ? computeMultiCurrencyPrices(planObj.originalPrice) : {},
      };
    });

    return res.status(200).json(augmentedPlans);
  } catch (error) {
    console.error('Pricing API error:', error);
    // Always return fallback data to prevent broken UI
    const augmentedDefault = DEFAULT_PLANS.map((p) => ({
      ...p,
      prices: computeMultiCurrencyPrices(p.price),
      originalPrices: computeMultiCurrencyPrices(p.originalPrice),
    }));
    return res.status(200).json(augmentedDefault);
  }
}
