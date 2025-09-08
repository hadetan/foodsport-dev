import { prisma } from './db.js';

/**
 * Type-safe CRUD utilities for Prisma models
 * @template T - Prisma model name (e.g. 'user', 'activity')
 * @template U - Prisma model type
 */

/**
 * Get a record by ID
 * @param {keyof typeof prisma} model
 * @param {string} id
 * @param {object} [select]
 * @returns {Promise<any>}
 */
export async function getById(model, id, select) {
	try {
		return await prisma[model].findUnique({ where: { id }, select });
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Get many records with optional filters, select, and options
 * @param {keyof typeof prisma} model
 * @param {object} [where]
 * @param {object} [select]
 * @param {object} [options]
 * @returns {Promise<any[]>}
 */
export async function getMany(model, where = {}, select, options = {}) {
	try {
		return await prisma[model].findMany({
			where,
			select,
			take: options.limit,
			skip: options.skip,
			orderBy: options.orderBy,
		});
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Insert a new record
 * @param {keyof typeof prisma} model
 * @param {object} data
 * @returns {Promise<any>}
 */
export async function insert(model, data) {
	try {
		return await prisma[model].create({ data });
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Update a record by ID
 * @param {keyof typeof prisma} model
 * @param {string} id
 * @param {object} data
 * @returns {Promise<any>}
 */
export async function updateById(model, id, data) {
	try {
		return await prisma[model].update({ where: { id }, data });
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Delete a record by ID
 * @param {keyof typeof prisma} model
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function deleteById(model, id) {
	try {
		return await prisma[model].delete({ where: { id } });
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Check if a record exists
 * @param {keyof typeof prisma} model
 * @param {object} where
 * @returns {Promise<boolean>}
 */
export async function exists(model, where) {
	try {
		return (await prisma[model].findFirst({ where })) !== null;
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Get count of records
 * @param {keyof typeof prisma} model
 * @param {object} where
 * @returns {Promise<number>}
 */
export async function getCount(model, where) {
	try {
		return await prisma[model].count({ where });
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Execute a transaction
 * @param {Function|Function[]} actions - callback that receives `tx` or an array of operations
 * @param {object} [options] - transaction options: { timeout: number (ms), maxWait: number (ms), isolationLevel }
 * @returns {Promise<any[]>}
 */
export async function executeTransaction(actions, options = {}) {
	try {
		const txOptions = {
			timeout: typeof options.timeout === 'number' ? options.timeout : 120000,
			maxWait: typeof options.maxWait === 'number' ? options.maxWait : 2000,
			isolationLevel: options.isolationLevel,
		};

		// Remove undefined keys so Prisma doesn't receive unknown values
		Object.keys(txOptions).forEach((k) => txOptions[k] === undefined && delete txOptions[k]);

		return await prisma.$transaction(actions, txOptions);
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Remove a record by arbitrary where clause (supports composite keys)
 * @param {keyof typeof prisma} model
 * @param {object} where
 * @returns {Promise<any>}
 */
export async function remove(model, where) {
	try {
		return await prisma[model].delete({ where });
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Get a record by composite key (e.g. for userActivity)
 * @param {keyof typeof prisma} model
 * @param {object} where - composite key object
 * @param {object} [select]
 * @returns {Promise<any>}
 */
export async function getByIdComposite(model, where, select) {
	try {
		if (model === 'userActivity' && where.userId && where.activityId) {
			return await prisma.userActivity.findUnique({
				where: {
					userId_activityId: {
						userId: where.userId,
						activityId: where.activityId,
					},
				},
				select,
			});
		}
		return await prisma[model].findUnique({ where, select });
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Get all activities a user has joined, with full activity details
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
export async function getUserJoinedActivitiesWithDetails(userId) {
	try {
		const userActivities = await prisma.userActivity.findMany({
			where: { userId },
			include: {
				activity: {
					select: {
						id: true,
						title: true,
						description: true,
						activityType: true,
						location: true,
						startDate: true,
						endDate: true,
						startTime: true,
						endTime: true,
						status: true,
						participantLimit: true,
						organizerId: true,
						imageUrl: true,
						caloriesPerHour: true,
						isFeatured: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		});
		return userActivities.map((ua) => ua.activity).filter(Boolean);
	} catch (error) {
		return handlePrismaError(error);
	}
}

/**
 * Handle Prisma errors and return a consistent error object
 * @param {any} error
 * @returns {object}
 */
function handlePrismaError(error) {
	if (error.code === 'P2002') {
		return { error: 'Unique constraint failed', details: error.meta };
	}
	if (error.code === 'P2003') {
		return { error: 'Foreign key constraint failed', details: error.meta };
	}
	if (error.code === 'P2004') {
		return { error: 'Not null constraint failed', details: error.meta };
	}
	return { error: error.message, details: error };
}
