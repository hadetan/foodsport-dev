import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ['warn', 'error'],
	});

globalForPrisma.prisma = prisma;

// Save this for later tests.
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 
