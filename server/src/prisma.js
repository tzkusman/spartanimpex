import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  try {
    const client = new PrismaClient({
      log: ['warn', 'error'],
    });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client;
    }
    return client;
  } catch (err) {
    console.error('⚠️ Warning: PrismaClient failed to initialize:', err.message);
    return null;
  }
}

export const prisma = getPrismaClient();

export default prisma;
