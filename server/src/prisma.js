import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  try {
    const client = new PrismaClient({
      log: ['warn', 'error'],
    });
    // In serverless, caching prisma on globalThis is essential across function invocations
    globalForPrisma.prisma = client;
    return client;
  } catch (err) {
    console.error('Warning: PrismaClient failed to initialize:', err.message);
    return null;
  }
}

export const prisma = getPrismaClient();

export default prisma;
