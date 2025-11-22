import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const DEFAULT_TRANSACTION_MAX_WAIT = Number(process.env.PRISMA_TRANSACTION_MAX_WAIT_MS ?? 8000);
const DEFAULT_TRANSACTION_TIMEOUT = Number(process.env.PRISMA_TRANSACTION_TIMEOUT_MS ?? 120000);

function sanitizeTransactionBoundaries() {
	const txOptions = {
		maxWait: Number.isFinite(DEFAULT_TRANSACTION_MAX_WAIT) && DEFAULT_TRANSACTION_MAX_WAIT > 0
			? DEFAULT_TRANSACTION_MAX_WAIT
			: 8000,
		timeout: Number.isFinite(DEFAULT_TRANSACTION_TIMEOUT) && DEFAULT_TRANSACTION_TIMEOUT > 0
			? DEFAULT_TRANSACTION_TIMEOUT
			: 120000,
	};

	return txOptions;
}

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ['warn', 'error'],
		transactionOptions: sanitizeTransactionBoundaries(),
	});

globalForPrisma.prisma = prisma;

// Save this for later tests.
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 
