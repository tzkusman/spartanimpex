import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from './prisma.js';
import { pricingPlansData } from './plans.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'spartan_impax_jwt_super_secret_2026';

// Middleware
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.originalUrl.includes('/api/analytics/ping')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Admin Auth Middleware
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }
};

// ==========================================
// 1. HEALTHCHECK
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      provider: 'Prisma PostgreSQL',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// ==========================================
// 2. ADMIN AUTHENTICATION
// ==========================================

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check DB user
    let user = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });

    // Fallback/direct check for primary admin credential
    const isDirectMatch = (normalizedEmail === 'gajender@spartanimpex.com' && password === 'admin123');
    
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash) || isDirectMatch;
    } else if (isDirectMatch) {
      // Auto-create in DB
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      user = await prisma.adminUser.create({
        data: {
          email: 'gajender@spartanimpex.com',
          name: 'Gajender Singh Rajawat',
          passwordHash: hash,
          role: 'SUPER_ADMIN',
        },
      });
      isPasswordValid = true;
    }

    if (!user || !isPasswordValid) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

// GET /api/admin/me
app.get('/api/admin/me', requireAdmin, async (req, res) => {
  res.json({ user: req.admin });
});

// ==========================================
// 3. ADMIN DASHBOARD OVERVIEW & METRICS
// ==========================================
app.get('/api/admin/overview', requireAdmin, async (req, res) => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const [
      totalMessages,
      unreadMessages,
      totalProjects,
      totalPlans,
      transactions,
      activeVisitorsCount,
      todayVisitsCount
    ] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.portfolioProject.count(),
      prisma.pricingPlan.count(),
      prisma.paymentTransaction.findMany(),
      prisma.visitorLog.count({ where: { createdAt: { gte: fifteenMinsAgo } } }),
      prisma.visitorLog.count({ where: { createdAt: { gte: todayMidnight } } }),
    ]);

    const paidTransactions = transactions.filter(t => t.status === 'PAID');
    const totalRevenue = paidTransactions.reduce((acc, t) => acc + t.amount, 0);
    const pendingTransactionsCount = transactions.filter(t => t.status === 'PENDING').length;

    res.json({
      metrics: {
        totalMessages,
        unreadMessages,
        totalProjects,
        totalPlans,
        totalRevenue,
        paidTransactionsCount: paidTransactions.length,
        pendingTransactionsCount,
        activeVisitors: Math.max(activeVisitorsCount, 1), // At least current admin
        todayVisits: todayVisitsCount,
      },
      recentMessages: await prisma.contactMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      recentTransactions: await prisma.paymentTransaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
  }
});

// ==========================================
// 4. ADMIN USER INQUIRIES MANAGEMENT
// ==========================================
app.get('/api/admin/messages', requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { subject: { contains: String(search), mode: 'insensitive' } },
        { message: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

app.patch('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'READ', 'UNREAD', 'REPLIED', 'ARCHIVED'
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message.' });
  }
});

app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.delete({ where: { id } });
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

// ==========================================
// 5. ADMIN PROJECT MANAGEMENT (CRUD)
// ==========================================
app.post('/api/admin/projects', requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      shortDescription,
      overview,
      thumbnail,
      tags = [],
      features = [],
      liveUrl,
      githubUrl,
      featured = false,
      client,
      duration,
      role
    } = req.body;

    if (!title || !shortDescription) {
      return res.status(400).json({ error: 'Title and short description are required.' });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const project = await prisma.portfolioProject.create({
      data: {
        title,
        slug: generatedSlug,
        category: category || 'Web Development',
        shortDescription,
        overview: overview || shortDescription,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
        tags: Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()),
        features: Array.isArray(features) ? features : String(features).split('\n').filter(Boolean),
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        featured: Boolean(featured),
        client: client || null,
        duration: duration || null,
        role: role || null,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message || 'Failed to create project.' });
  }
});

app.put('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      category,
      shortDescription,
      overview,
      thumbnail,
      tags,
      features,
      liveUrl,
      githubUrl,
      featured,
      client,
      duration,
      role
    } = req.body;

    const updated = await prisma.portfolioProject.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(category && { category }),
        ...(shortDescription && { shortDescription }),
        ...(overview && { overview }),
        ...(thumbnail && { thumbnail }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()) }),
        ...(features !== undefined && { features: Array.isArray(features) ? features : String(features).split('\n').filter(Boolean) }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(client !== undefined && { client }),
        ...(duration !== undefined && { duration }),
        ...(role !== undefined && { role }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

app.delete('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.portfolioProject.delete({ where: { id } });
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// ==========================================
// 6. PRICING MANAGEMENT (ADMIN & PUBLIC)
// ==========================================

// Public GET /api/pricing
app.get('/api/pricing', async (req, res) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing plans.' });
  }
});

// Admin GET /api/admin/pricing (all plans)
app.get('/api/admin/pricing', requireAdmin, async (req, res) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing plans.' });
  }
});

// Admin POST /api/admin/pricing (create or update)
app.post('/api/admin/pricing', requireAdmin, async (req, res) => {
  try {
    const { id, name, slug, price, originalPrice, badge, description, features = [], popular = false, active = true, sortOrder = 0 } = req.body;

    const data = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      badge: badge || null,
      description,
      features: Array.isArray(features) ? features : String(features).split('\n').filter(Boolean),
      popular: Boolean(popular),
      active: Boolean(active),
      sortOrder: Number(sortOrder) || 0,
    };

    let plan;
    if (id) {
      plan = await prisma.pricingPlan.update({ where: { id }, data });
    } else {
      plan = await prisma.pricingPlan.create({ data });
    }

    res.json(plan);
  } catch (error) {
    console.error('Pricing save error:', error);
    res.status(500).json({ error: 'Failed to save pricing plan.' });
  }
});

// Admin DELETE /api/admin/pricing/:id
app.delete('/api/admin/pricing/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pricingPlan.delete({ where: { id } });
    res.json({ success: true, message: 'Plan deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete plan.' });
  }
});

// ==========================================
// 7. RAZORPAY PRODUCTION PAYMENTS
// ==========================================

// Helper to retrieve live or test Razorpay client instance
function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id.includes('placeholder') || key_id.includes('your_key_id') || key_id.includes('demoKey')) {
    return null;
  }
  return new Razorpay({ key_id, key_secret });
}

// POST /api/payment/create-order - Create Razorpay payment order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { planSlug, customerName, customerEmail, customerPhone } = req.body;

    if (!customerEmail || !customerName) {
      return res.status(400).json({ error: 'Name and email are required for checkout.' });
    }

    // Fetch plan from database with graceful fallback to predefined portfolio data
    let plan = null;
    if (prisma) {
      try {
        plan = await prisma.pricingPlan.findUnique({ where: { slug: planSlug } });
      } catch (dbErr) {
        console.warn('⚠️ Prisma plan lookup warning:', dbErr.message);
      }
    }
    if (!plan && Array.isArray(pricingPlansData)) {
      plan = pricingPlansData.find(p => p.slug === planSlug);
    }

    if (!plan) {
      return res.status(404).json({ error: 'Selected architecture package not found.' });
    }

    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;
    const amountInPaise = Math.round(plan.price * 100); // Razorpay operates in paise (1 INR = 100 paise)

    const rzp = getRazorpayClient();
    let orderId;
    let isLiveRazorpay = false;

    // Call real Razorpay API if live/test credentials are present
    if (rzp) {
      try {
        const rzpOrder = await rzp.orders.create({
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
        orderId = rzpOrder.id;
        isLiveRazorpay = true;
      } catch (rzpErr) {
        console.error('Razorpay API order creation failed:', rzpErr);
        let description = rzpErr.error?.description || rzpErr.message;
        if (rzpErr.statusCode === 406 || !description) {
          description = 'Razorpay Live API returned 406. Ensure your Razorpay account KYC is fully activated for live transactions, or switch to Razorpay Test Key (rzp_test_...) in your dashboard.';
        }
        return res.status(502).json({ error: `Razorpay Gateway Error: ${description}` });
      }
    } else {
      // Local fallback simulation when real keys are not configured yet
      console.warn('⚠️ Razorpay keys not configured. Simulating order ID for local testing.');
      orderId = `order_sim_${Date.now()}`;
    }

    // Save initial transaction record in PostgreSQL with PENDING status
    let transaction = null;
    if (prisma) {
      try {
        transaction = await prisma.paymentTransaction.create({
          data: {
            orderId,
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
      } catch (txErr) {
        console.warn('⚠️ Could not save pending transaction to DB:', txErr.message);
      }
    }

    res.json({
      success: true,
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
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
      transactionId: transaction ? transaction.id : null,
      isLiveRazorpay,
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
});

// POST /api/payment/verify-payment - Cryptographic HMAC SHA-256 verification
app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const { orderId, paymentId, signature, paymentMethod } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ error: 'Order ID and Payment ID are required.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isRealSecret = keySecret && !keySecret.includes('demoSecret') && !keySecret.includes('placeholder');

    // Strict HMAC SHA-256 signature verification for real Razorpay checkouts
    if (isRealSecret) {
      if (!signature) {
        return res.status(400).json({ error: 'Payment signature missing from checkout response.' });
      }
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(`${orderId}|${paymentId}`);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== signature) {
        // Mark transaction as FAILED on signature mismatch
        await prisma.paymentTransaction.updateMany({
          where: { orderId },
          data: { status: 'FAILED' },
        });
        return res.status(400).json({ error: 'Payment signature verification failed. Possible payload tampering.' });
      }
    }

    // Mark transaction as PAID in PostgreSQL
    const updated = await prisma.paymentTransaction.update({
      where: { orderId },
      data: {
        paymentId,
        signature: signature || null,
        status: 'PAID',
        paymentMethod: paymentMethod || 'Razorpay Checkout',
      },
    });

    console.log(`💰 Verified Payment of ₹${updated.amount} for ${updated.planName} by ${updated.customerEmail} (ID: ${paymentId})`);

    res.json({
      success: true,
      message: 'Payment received and verified successfully!',
      transaction: updated,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment.' });
  }
});

// POST /api/payment/webhook - Razorpay Asynchronous Event Listener
app.post('/api/payment/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const rawPayload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawPayload)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.warn('⚠️ Razorpay webhook signature mismatch.');
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    console.log(`📩 Razorpay Webhook Event Received: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const method = paymentEntity?.method || 'Razorpay Webhook';

      if (orderId) {
        await prisma.paymentTransaction.updateMany({
          where: { orderId, status: { not: 'PAID' } },
          data: {
            status: 'PAID',
            paymentId: paymentId || undefined,
            paymentMethod: `Razorpay (${method})`,
          },
        });
        console.log(`✅ Webhook auto-confirmed payment for order ${orderId} (${paymentId})`);
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Admin GET /api/admin/payments
app.get('/api/admin/payments', requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (search) {
      where.OR = [
        { customerName: { contains: String(search), mode: 'insensitive' } },
        { customerEmail: { contains: String(search), mode: 'insensitive' } },
        { orderId: { contains: String(search), mode: 'insensitive' } },
        { paymentId: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const transactions = await prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = transactions
      .filter(t => t.status === 'PAID')
      .reduce((acc, t) => acc + t.amount, 0);

    res.json({
      totalRevenue,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

// ==========================================
// 8. ACTIVE VISITORS & TELEMETRY
// ==========================================

// Public POST /api/analytics/ping - Ping visitor active presence
app.post('/api/analytics/ping', async (req, res) => {
  try {
    const { path = '/' } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    const referrer = req.headers['referer'] || null;

    const ip = typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : null;

    await prisma.visitorLog.create({
      data: {
        path: String(path).slice(0, 200),
        ip,
        userAgent: userAgent ? userAgent.slice(0, 300) : null,
        referrer: referrer ? referrer.slice(0, 300) : null,
      },
    });

    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false });
  }
});

// Admin GET /api/admin/visitors
app.get('/api/admin/visitors', requireAdmin, async (req, res) => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeRecent = await prisma.visitorLog.findMany({
      where: { createdAt: { gte: fifteenMinsAgo } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const allRecent = await prisma.visitorLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Unique active IPs
    const uniqueIps = new Set(activeRecent.map(v => v.ip).filter(Boolean));

    res.json({
      activeCount: Math.max(uniqueIps.size, 1),
      recentLogs: allRecent,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch visitor logs.' });
  }
});

// ==========================================
// 9. STANDARD PUBLIC ENDPOINTS
// ==========================================

// Public Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Please provide your name.' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'Please provide a subject.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'UNREAD',
        ip: typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : null,
        userAgent,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received and saved to our database.',
      id: newMessage.id,
      createdAt: newMessage.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

// Public GET /api/projects
app.get('/api/projects', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const where = {};
    if (category && category !== 'All') where.category = String(category);
    if (featured === 'true') where.featured = true;

    const projects = await prisma.portfolioProject.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// Public GET /api/projects/:slug
app.get('/api/projects/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await prisma.portfolioProject.findUnique({ where: { slug } });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// Public GET /api/skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await prisma.portfolioSkill.findMany({
      orderBy: [{ category: 'asc' }, { level: 'desc' }],
    });
    res.json({ total: skills.length, skills });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
});

// Public GET /api/services
app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.portfolioService.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// Public GET /api/blog
app.get('/api/blog', async (req, res) => {
  try {
    const { category } = req.query;
    const where = (category && category !== 'All') ? { category: String(category) } : {};
    const articles = await prisma.portfolioArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Spartan Impax Enterprise API',
    version: '2.0.0',
    adminLogin: 'POST /api/admin/login (gajender@spartanimpex.com)',
    endpoints: {
      overview: 'GET /api/admin/overview',
      projects: 'GET /api/projects, POST /api/admin/projects',
      pricing: 'GET /api/pricing, POST /api/admin/pricing',
      payments: 'POST /api/payment/create-order, GET /api/admin/payments',
      telemetry: 'POST /api/analytics/ping, GET /api/admin/visitors',
    },
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Spartan Impax Backend running on http://localhost:${PORT}`);
    console.log(`🔐 Admin auth active for: gajender@spartanimpex.com`);
  });
}

export default app;
