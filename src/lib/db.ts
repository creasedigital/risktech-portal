import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? '';
  
  // If using SQLite in /tmp on Vercel, ensure the database file is initialized on cold start
  if (dbUrl.startsWith('file:/tmp/')) {
    const dbPath = dbUrl.replace('file:', '');
    if (!fs.existsSync(dbPath)) {
      try {
        console.log('Initializing ephemeral SQLite database in /tmp...');
        execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
        execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
      } catch (error) {
        console.error('Failed to auto-initialize SQLite database:', error);
      }
    }
  }

  return globalForPrisma.prisma ?? new PrismaClient();
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
//   })

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }
