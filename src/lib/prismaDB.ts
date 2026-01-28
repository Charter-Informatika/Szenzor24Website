import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let adapter: any = undefined;
try {
  // require dynamically so missing package doesn't crash startup
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
  adapter = new PrismaMariaDb();
} catch (err) {
  // If adapter fails (missing/incompatible), log and fall back to default client
  // eslint-disable-next-line no-console
  console.warn('Prisma MariaDB adapter not available — falling back to default PrismaClient.', err?.message || err);
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
    ...(adapter ? { adapter } : {}),
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
