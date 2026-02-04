import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

function getPrismaClient() {
  if (global.prisma) {
    console.log('[PrismaDB] Reusing cached PrismaClient');
    return global.prisma;
  }
  
  try {
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
    
    const dbUrl = process.env.DATABASE_URL || '';
    if (!dbUrl) {
      throw new Error('[PrismaDB] DATABASE_URL is not set!');
    }
    
    // Replace localhost with 127.0.0.1 to avoid IPv6 issues
    const fixedUrl = dbUrl.replace('localhost', '127.0.0.1');
    
    console.log('[PrismaDB] Creating new PrismaClient with adapter...');
    
    // Pass the URL string directly to the adapter (not a pool)
    const adapter = new PrismaMariaDb(fixedUrl);
    
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      adapter,
    });
    
    global.prisma = client;
    console.log('[PrismaDB] PrismaClient created successfully');
    return client;
  } catch (err: any) {
    console.error('[PrismaDB] Could not initialize Prisma:', err?.message || err);
    throw err;
  }
}

export const prisma = getPrismaClient();
