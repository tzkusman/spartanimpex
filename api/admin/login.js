import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'spartan_impax_jwt_super_secret_2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Primary administrator validation
    const isDirectMatch = (normalizedEmail === 'gajender@spartanimpex.com' && password === 'admin123');

    let isValid = isDirectMatch;
    let adminName = 'Gajender Singh Rajawat';
    let adminId = 'admin_primary';

    // Optional database verification
    if (process.env.DATABASE_URL) {
      try {
        const { default: prisma } = await import('../../server/src/prisma.js');
        if (prisma) {
          const user = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
          if (user) {
            const passMatch = await bcrypt.compare(password, user.passwordHash);
            if (passMatch) {
              isValid = true;
              adminName = user.name;
              adminId = user.id;
            }
          }
        }
      } catch (dbErr) {
        console.warn('Admin DB lookup bypassed:', dbErr.message);
      }
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    // Sign JWT token valid for 7 days
    const token = jwt.sign(
      {
        id: adminId,
        email: normalizedEmail,
        name: adminName,
        role: 'SUPER_ADMIN'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: adminId,
        email: normalizedEmail,
        name: adminName,
        role: 'SUPER_ADMIN',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Authentication service encountered an error.' });
  }
}