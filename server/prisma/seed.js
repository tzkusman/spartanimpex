import prisma from '../src/prisma.js';
import bcrypt from 'bcryptjs';
import { projectsData, skillsData, servicesData, blogArticlesData, pricingPlansData } from '../../src/data/portfolioData.js';

async function main() {
  console.log('🌱 Starting comprehensive database seed for Spartan Impax Portfolio...');

  // 1. Admin User (gajender@spartanimpex.com / admin123)
  console.log('Setting up Admin credentials...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  await prisma.adminUser.upsert({
    where: { email: 'gajender@spartanimpex.com' },
    update: {
      name: 'Gajender Singh Rajawat',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'gajender@spartanimpex.com',
      name: 'Gajender Singh Rajawat',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Admin user created/updated: gajender@spartanimpex.com');

  // 2. Pricing Plans
  console.log(`Seeding ${pricingPlansData.length} pricing plans...`);
  for (const plan of pricingPlansData) {
    await prisma.pricingPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        price: plan.price,
        originalPrice: plan.originalPrice,
        badge: plan.badge,
        description: plan.description,
        features: plan.features,
        deliverables: plan.deliverables,
        popular: plan.popular,
        active: plan.active,
        sortOrder: plan.sortOrder,
      },
      create: {
        name: plan.name,
        slug: plan.slug,
        price: plan.price,
        originalPrice: plan.originalPrice,
        badge: plan.badge,
        description: plan.description,
        features: plan.features,
        deliverables: plan.deliverables,
        popular: plan.popular,
        active: plan.active,
        sortOrder: plan.sortOrder,
      },
    });
  }

  // 3. Real Projects
  console.log(`Clearing & Seeding ${projectsData.length} real portfolio projects...`);
  await prisma.portfolioProject.deleteMany({});
  for (const p of projectsData) {
    await prisma.portfolioProject.create({
      data: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        shortDescription: p.shortDescription,
        overview: p.overview || p.shortDescription,
        client: p.client || null,
        duration: p.duration || null,
        role: p.role || null,
        liveUrl: p.liveUrl || null,
        githubUrl: p.githubUrl || null,
        thumbnail: p.thumbnail,
        tags: p.tags || [],
        features: p.keyFeatures || p.features || [],
        featured: Boolean(p.featured),
      },
    });
  }

  // 4. Skills
  console.log('Seeding categorized skills...');
  await prisma.portfolioSkill.deleteMany({});
  for (const cat of skillsData) {
    for (const s of cat.skills) {
      await prisma.portfolioSkill.create({
        data: {
          category: cat.category,
          name: s.name,
          level: s.level === 'Expert' ? 95 : s.level === 'Advanced' ? 85 : 75,
          experienceYears: s.years || '3+ yrs',
          icon: s.icon || null,
        },
      });
    }
  }

  // 5. Services
  console.log(`Seeding ${servicesData.length} services...`);
  await prisma.portfolioService.deleteMany({});
  for (const s of servicesData) {
    await prisma.portfolioService.create({
      data: {
        title: s.title,
        icon: s.icon,
        shortDescription: s.shortDesc || s.shortDescription || 'Professional IT service offering.',
        deliverables: s.features || s.deliverables || [],
        tags: s.tags || [],
      },
    });
  }

  // 6. Blog Articles
  console.log(`Seeding ${blogArticlesData.length} articles...`);
  await prisma.portfolioArticle.deleteMany({});
  for (const a of blogArticlesData) {
    await prisma.portfolioArticle.create({
      data: {
        slug: a.slug,
        title: a.title,
        category: a.category,
        excerpt: a.excerpt,
        readTime: a.readTime,
        publishedDate: a.date || a.publishedDate || 'Oct 2026',
        tags: a.tags || [],
        content: Array.isArray(a.content) ? a.content.join('\n\n') : (a.content || a.excerpt),
      },
    });
  }

  // 7. Seed Sample Razorpay Payment Transactions (so admin has real data to view)
  const countTx = await prisma.paymentTransaction.count();
  if (countTx === 0) {
    console.log('Seeding demo payment transactions...');
    await prisma.paymentTransaction.createMany({
      data: [
        {
          orderId: 'order_RZP_' + Date.now() + '_1',
          paymentId: 'pay_live_denim_crafts_9921',
          planSlug: 'enterprise-custom',
          planName: 'Enterprise Custom Solution',
          amount: 129999,
          currency: 'INR',
          customerName: 'DenimCrafts International',
          customerEmail: 'finance@denimcrafts.com',
          customerPhone: '+91 98765 11223',
          status: 'PAID',
          paymentMethod: 'UPI / NetBanking',
          receipt: 'receipt_dc_001',
        },
        {
          orderId: 'order_RZP_' + Date.now() + '_2',
          paymentId: 'pay_live_bleach_8812',
          planSlug: 'business-fullstack',
          planName: 'Business Full-Stack Platform',
          amount: 49999,
          currency: 'INR',
          customerName: 'Bleach Resistant Apparel LLC',
          customerEmail: 'orders@bleachresistant.com',
          customerPhone: '+1 555 432 1098',
          status: 'PAID',
          paymentMethod: 'Credit Card (3D Secure)',
          receipt: 'receipt_br_002',
        },
        {
          orderId: 'order_RZP_' + Date.now() + '_3',
          paymentId: null,
          planSlug: 'starter-architecture',
          planName: 'Starter Architecture',
          amount: 14999,
          currency: 'INR',
          customerName: 'Alpha Fintech Labs',
          customerEmail: 'founder@alphalabs.io',
          customerPhone: '+91 98111 22334',
          status: 'PENDING',
          paymentMethod: 'Awaiting Confirmation',
          receipt: 'receipt_al_003',
        }
      ],
    });
  }

  // 8. Seed Sample Visitor Logs
  const countVis = await prisma.visitorLog.count();
  if (countVis === 0) {
    await prisma.visitorLog.createMany({
      data: [
        { path: '/', ip: '192.168.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        { path: '/projects', ip: '192.168.1.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        { path: '/pricing', ip: '192.168.1.2', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' },
        { path: '/contact', ip: '192.168.1.3', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' },
      ],
    });
  }

  console.log('🎉 Comprehensive database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
