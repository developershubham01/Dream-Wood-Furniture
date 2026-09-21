import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Dev-mode self-heal: if a cached client predates the current schema (e.g. a new
// model was pushed while the dev server was running), drop it and re-instantiate.
if (globalForPrisma.prisma && !(globalForPrisma.prisma as unknown as { faq?: unknown }).faq) {
  void globalForPrisma.prisma.$disconnect().catch(() => {})
  globalForPrisma.prisma = undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
