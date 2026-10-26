/**
 * Spartan Impax - Server Pricing Plans Data
 * Self-contained plan definitions for payment orders and fallbacks
 */

export const pricingPlansData = [
  {
    name: "Starter Architecture",
    slug: "starter-architecture",
    price: 14999,
    originalPrice: 24999,
    badge: "Quick Kickoff",
    description: "Ideal for early-stage startups & SMBs needing architectural blueprint, API roadmap, and MVP system design.",
    features: [
      "Microservice & DB Schema Architecture Blueprint",
      "API Specification & RESTful Flow Design",
      "Cloud Infrastructure & Security Audit",
      "Tech Stack & DevOps Selection Matrix",
      "7-Day Delivery & 1 Revision Round",
      "Direct Architecture Consultation (2 Hours)"
    ],
    deliverables: [
      "Figma / Miro System Topology Diagrams",
      "Postman OpenAPI 3.0 Specs",
      "AWS / GCP Cost Optimization Plan"
    ],
    popular: false,
    active: true,
    sortOrder: 1
  },
  {
    name: "Business Full-Stack Platform",
    slug: "business-fullstack",
    price: 49999,
    originalPrice: 79999,
    badge: "Most Popular Choice",
    description: "Comprehensive end-to-end full-stack engineering solution. Perfect for production web applications and portals.",
    features: [
      "Production-Ready React 19 / Next.js Frontend",
      "Scalable Node.js / Express or Python Backend",
      "Prisma ORM with PostgreSQL / MongoDB Setup",
      "JWT / OAuth2 Authentication & Role-Based Access",
      "Stripe / Razorpay Payment Gateway Integration",
      "CI/CD Pipeline Setup (Vercel / GitHub Actions)",
      "21-Day Delivery & 3 Revision Rounds",
      "30-Day Post-Launch Maintenance & SLA"
    ],
    deliverables: [
      "Complete Source Code with Full IP Transfer",
      "Automated Test Coverage Suite",
      "Dockerized Container Deployment"
    ],
    popular: true,
    active: true,
    sortOrder: 2
  },
  {
    name: "Enterprise Custom Solution",
    slug: "enterprise-custom",
    price: 129999,
    originalPrice: 199999,
    badge: "Maximum Performance",
    description: "Bespoke high-scale engineering for large corporations, complex microservices, AI integration, and Oracle APEX migrations.",
    features: [
      "Full Custom Architecture & Multi-Tenant Database",
      "Oracle APEX / Cloud ERP Modernization",
      "Generative AI / LLM Pipeline Integration (Gemini / OpenAI)",
      "Distributed Kubernetes / AWS ECS Cluster Setup",
      "High-Volume Real-Time Telemetry & WebSocket Pipelines",
      "SOC2 / GDPR Compliance Hardening",
      "Dedicated Senior Engineering Squad",
      "60-Day Delivery & Unlimited Iterations",
      "90-Day VIP Dedicated Support & 99.9% Uptime SLA"
    ],
    deliverables: [
      "Enterprise Architectural Documentation",
      "Load Testing Benchmark Reports",
      "Executive Board Presentation & Onboarding"
    ],
    popular: false,
    active: true,
    sortOrder: 3
  }
];

export default pricingPlansData;
