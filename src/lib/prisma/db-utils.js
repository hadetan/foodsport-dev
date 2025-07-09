import { prisma } from './client.js';

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
 * @param {Function[]} actions
 * @returns {Promise<any[]>}
 */
export async function executeTransaction(actions) {
  try {
    return await prisma.$transaction(actions);
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
