import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'spartan_impax_jwt_super_secret_2026';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = verifyToken(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized. Valid administrator session required.' });
  }

  let prisma;
  try {
    const prismaModule = await import('../../server/src/prisma.js');
    prisma = prismaModule.default || prismaModule.prisma;
  } catch (err) {
    console.error('Failed to load Prisma in admin pricing:', err.message);
  }

  // GET: Fetch all plans
  if (req.method === 'GET') {
    try {
      let plans = [];
      if (prisma) {
        plans = await prisma.pricingPlan.findMany({
          orderBy: { sortOrder: 'asc' }
        });

        // Auto-seed if database has 0 plans
        if (!plans || plans.length === 0) {
          for (const p of DEFAULT_PLANS) {
            await prisma.pricingPlan.upsert({
              where: { slug: p.slug },
              update: {},
              create: p
            });
          }
          plans = await prisma.pricingPlan.findMany({
            orderBy: { sortOrder: 'asc' }
          });
        }
      } else {
        plans = DEFAULT_PLANS;
      }

      return res.status(200).json({ success: true, count: plans.length, plans });
    } catch (err) {
      console.error('Error fetching admin pricing plans:', err);
      return res.status(500).json({ error: 'Failed to retrieve pricing plans from database.' });
    }
  }

  // POST or PATCH: Update a plan live in the database
  if (req.method === 'POST' || req.method === 'PATCH') {
    try {
      const body = req.body || {};
      const { id, slug, name, price, originalPrice, badge, description, features, deliverables, popular, active, sortOrder } = body;

      if (!id && !slug) {
        return res.status(400).json({ error: 'Plan ID or Slug is required to update pricing.' });
      }

      if (!prisma) {
        return res.status(503).json({ error: 'Database service is currently unreachable.' });
      }

      // Find existing plan
      const existing = await prisma.pricingPlan.findFirst({
        where: id ? { id } : { slug }
      });

      if (!existing) {
        return res.status(404).json({ error: 'Pricing plan not found in database.' });
      }

      // Parse and normalize updates directly in USD
      const dataToUpdate = {};
      if (price !== undefined) dataToUpdate.price = Math.max(0, parseInt(price, 10));
      if (originalPrice !== undefined) {
        dataToUpdate.originalPrice = originalPrice ? Math.max(0, parseInt(originalPrice, 10)) : null;
      }
      if (name !== undefined) dataToUpdate.name = String(name).trim();
      if (badge !== undefined) dataToUpdate.badge = badge ? String(badge).trim() : null;
      if (description !== undefined) dataToUpdate.description = String(description).trim();
      if (features !== undefined) {
        dataToUpdate.features = Array.isArray(features)
          ? features.map(f => String(f).trim()).filter(Boolean)
          : String(features).split('\n').map(f => f.trim()).filter(Boolean);
      }
      if (deliverables !== undefined) {
        dataToUpdate.deliverables = Array.isArray(deliverables)
          ? deliverables.map(d => String(d).trim()).filter(Boolean)
          : String(deliverables).split('\n').map(d => d.trim()).filter(Boolean);
      }
      if (popular !== undefined) dataToUpdate.popular = Boolean(popular);
      if (active !== undefined) dataToUpdate.active = Boolean(active);
      if (sortOrder !== undefined) dataToUpdate.sortOrder = parseInt(sortOrder, 10);

      const updatedPlan = await prisma.pricingPlan.update({
        where: { id: existing.id },
        data: dataToUpdate,
      });

      return res.status(200).json({
        success: true,
        message: `Plan "${updatedPlan.name}" updated successfully live in production database.`,
        plan: updatedPlan
      });
    } catch (err) {
      console.error('Error updating pricing plan:', err);
      return res.status(500).json({ error: err.message || 'Failed to update pricing plan.' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
