import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let adapter: any = undefined;
try {
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
  adapter = new PrismaMariaDb();
} catch (err) {

  console.warn('Prisma MariaDB adapter not available — falling back to default PrismaClient.', err?.message || err);
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
    ...(adapter ? { adapter } : {}),
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
