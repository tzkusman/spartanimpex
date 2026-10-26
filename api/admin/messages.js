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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = verifyToken(req);
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    if (process.env.DATABASE_URL) {
      const { default: prisma } = await import('../../server/src/prisma.js');
      if (prisma) {
        if (req.method === 'GET') {
          const { status, search } = req.query || {};
          const where = {};
          if (status && status !== 'ALL') where.status = String(status);
          if (search) {
            where.OR = [
              { name: { contains: String(search), mode: 'insensitive' } },
              { email: { contains: String(search), mode: 'insensitive' } },
              { subject: { contains: String(search), mode: 'insensitive' } },
            ];
          }
          const messages = await prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' } });
          return res.status(200).json(messages);
        }

        if (req.method === 'PATCH') {
          const { id, status } = req.body || {};
          const updated = await prisma.contactMessage.update({ where: { id }, data: { status } });
          return res.status(200).json(updated);
        }

        if (req.method === 'DELETE') {
          const { id } = req.query || req.body || {};
          await prisma.contactMessage.delete({ where: { id } });
          return res.status(200).json({ success: true });
        }
      }
    }
    return res.status(200).json([]);
  } catch (error) {
    console.error('Admin messages error:', error);
    return res.status(500).json({ error: 'Messages action failed.' });
  }
}