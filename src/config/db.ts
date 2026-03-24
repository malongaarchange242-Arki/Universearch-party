import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma client is used throughout the application
 */
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to avoid recreating the client on every reload
  const globalWithPrisma = globalThis as typeof globalThis & {
    prisma: PrismaClient;
  };

  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  prisma = globalWithPrisma.prisma;
}

export default prisma;
