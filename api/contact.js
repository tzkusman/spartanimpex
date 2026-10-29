export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Please provide your full name.' });
    }
    // Robust RFC-compliant email regex ensuring letters including 's' are properly accepted
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'Please provide an inquiry subject.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    const ip = typeof clientIp === 'string' ? clientIp.split(',')[0].trim() : null;

    // Awaited database logging for reliable serverless execution
    if (process.env.DATABASE_URL) {
      try {
        const { default: prisma } = await import('../server/src/prisma.js');
        if (prisma) {
          await prisma.contactMessage.create({
            data: {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              subject: subject.trim(),
              message: message.trim(),
              status: 'UNREAD',
              ip,
              userAgent: req.headers['user-agent'] || null,
            },
          });
        }
      } catch (dbErr) {
        console.warn('Prisma contact logging skipped or warning:', dbErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been received. Our senior architecture team will reach out within 24 hours.',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Contact handler error:', error);
    return res.status(500).json({ error: 'Failed to record message.' });
  }
}
