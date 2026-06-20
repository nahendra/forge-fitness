import { PrismaClient } from '@prisma/client';
import { isProd } from '../config/env.js';
import { logger } from '../config/logger.js';

// Single shared Prisma instance — re-using one client avoids exhausting the
// Postgres connection pool under load (a common Node/Prisma footgun).
export const prisma = new PrismaClient({
  log: isProd ? [{ level: 'error', emit: 'event' }] : [{ level: 'warn', emit: 'event' }],
});

prisma.$on('error', (e) => logger.error({ err: e }, 'Prisma error'));
prisma.$on('warn', (e) => logger.warn({ err: e }, 'Prisma warning'));

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
