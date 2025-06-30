import { supabase } from './client.js';

// Database utility functions for API routes

/**
 * Execute a database query with error handling
 * @param {Function} queryFn - Function that returns a Supabase query
 * @returns {Promise<{data: any, error: any}>}
 */
export async function executeQuery(queryFn) {
    try {
        const result = await queryFn();
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        return {
            data: null,
            error: {
                message: 'Database operation failed',
                details: error.message
            }
        };
    }
}

/**
 * Get a single record by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {string[]} columns - Columns to select
 * @returns {Promise<{data: any, error: any}>}
 */
export async function getById(table, id, columns = ['*']) {
    return executeQuery(() =>
        supabase
            .from(table)
            .select(columns.join(','))
            .eq('id', id)
            .single()
    );
}

/**
 * Get multiple records with optional filters
 * @param {string} table - Table name
 * @param {Object} filters - Filter conditions
 * @param {string[]} columns - Columns to select
 * @param {Object} options - Additional options (limit, order, etc.)
 * @returns {Promise<{data: any, error: any}>}
 */
export async function getMany(table, filters = {}, columns = ['*'], options = {}) {
    let query = supabase
        .from(table)
        .select(columns.join(','));

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    });

    // Apply options
    if (options.limit) {
        query = query.limit(options.limit);
    }

    if (options.orderBy) {
        query = query.order(options.orderBy.column, {
            ascending: options.orderBy.ascending !== false
        });
    }

    if (options.range) {
        query = query.range(options.range.from, options.range.to);
    }

    return executeQuery(() => query);
}

/**
 * Insert a new record
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<{data: any, error: any}>}
 */
export async function insert(table, data) {
    return executeQuery(() =>
        supabase
            .from(table)
            .insert(data)
            .select()
            .single()
    );
}

/**
 * Update a record by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {Object} data - Data to update
 * @returns {Promise<{data: any, error: any}>}
 */
export async function updateById(table, id, data) {
    return executeQuery(() =>
        supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select()
            .single()
    );
}

/**
 * Delete a record by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<{data: any, error: any}>}
 */
export async function deleteById(table, id) {
    return executeQuery(() =>
        supabase
            .from(table)
            .delete()
            .eq('id', id)
    );
}

/**
 * Check if a record exists
 * @param {string} table - Table name
 * @param {Object} conditions - Conditions to check
 * @returns {Promise<boolean>}
 */
export async function exists(table, conditions) {
    let query = supabase
        .from(table)
        .select('id')
        .limit(1);

    Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
    });

    const { data, error } = await executeQuery(() => query);
    return !error && data && data.length > 0;
}

/**
 * Get count of records
 * @param {string} table - Table name
 * @param {Object} filters - Filter conditions
 * @returns {Promise<number>}
 */
export async function getCount(table, filters = {}) {
    let query = supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            query = query.eq(key, value);
        }
    });

    const { count, error } = await executeQuery(() => query);
    return error ? 0 : count;
}

/**
 * Execute a raw SQL query (for complex operations)
 * @param {string} sql - SQL query
 * @param {Object} params - Query parameters
 * @returns {Promise<{data: any, error: any}>}
 */
export async function executeRawSql(sql, params = {}) {
    return executeQuery(() =>
        supabase.rpc('exec_sql', {
            sql_query: sql,
            params: params
        })
    );
}

/**
 * Create a transaction-like operation
 * @param {Function[]} operations - Array of database operations
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function executeTransaction(operations) {
    const results = [];

    for (const operation of operations) {
        const result = await operation();
        if (result.error) {
            return {
                data: results,
                error: result.error
            };
        }
        results.push(result.data);
    }

    return {
        data: results,
        error: null
    };
}

/**
 * Validate required fields in data object
 * @param {Object} data - Data to validate
 * @param {string[]} requiredFields - Required field names
 * @returns {Object} Validation result
 */
export function validateRequiredFields(data, requiredFields) {
    const missing = [];

    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            missing.push(field);
        }
    }

    return {
        isValid: missing.length === 0,
        missing,
        error: missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : null
    };
}

/**
 * Sanitize data for database insertion
 * @param {Object} data - Data to sanitize
 * @param {string[]} allowedFields - Allowed field names
 * @returns {Object} Sanitized data
 */
export function sanitizeData(data, allowedFields) {
    const sanitized = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            sanitized[field] = data[field];
        }
    }

    return sanitized;
}

/**
 * Generate a unique ID (UUID v4)
 * @returns {string} UUID
 */
export function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Format database error for API response
 * @param {any} error - Database error
 * @returns {Object} Formatted error
 */
export function formatDbError(error) {
    if (!error) return null;

    // Handle common Supabase errors
    if (error.code === '23505') {
        return {
            code: 'DUPLICATE_ENTRY',
            message: 'A record with this information already exists',
            details: error.detail
        };
    }

    if (error.code === '23503') {
        return {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Referenced record does not exist',
            details: error.detail
        };
    }

    if (error.code === '23502') {
        return {
            code: 'NOT_NULL_VIOLATION',
            message: 'Required field is missing',
            details: error.detail
        };
    }

    return {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: error.message
    };
} 