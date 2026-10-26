import 'dotenv/config';

const DEFAULT_PLANS = [
  {
    name: 'Starter Architecture',
    slug: 'starter-architecture',
    price: 199,
    originalPrice: 299,
    badge: 'Quick Launch',
    currency: 'USD',
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
    price: 649,
    originalPrice: 999,
    badge: 'Most Popular Choice',
    currency: 'USD',
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
    price: 1699,
    originalPrice: 2599,
    badge: 'Maximum Performance',
    currency: 'USD',
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

    // Clean pure USD format
    const formattedPlans = plans.map((p) => {
      const planObj = typeof p.toJSON === 'function' ? p.toJSON() : { ...p };
      return {
        ...planObj,
        currency: 'USD',
        price: Number(planObj.price),
        originalPrice: planObj.originalPrice ? Number(planObj.originalPrice) : null,
      };
    });

    return res.status(200).json(formattedPlans);
  } catch (error) {
    console.error('Pricing API error:', error);
    return res.status(200).json(DEFAULT_PLANS);
  }
}
