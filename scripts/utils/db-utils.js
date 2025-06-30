const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// Database utilities for setup and seeding scripts
class DatabaseUtils {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
        this.pgUrl = process.env.SUPABASE_DB_URL;
        this.pool = null;
    }

    // Initialize connection pool
    async initializePool() {
        if (!this.pgUrl) return;

        this.pool = new Pool({
            connectionString: this.pgUrl,
            max: 5, // Maximum number of connections
            idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
            connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
            maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
        });

        // Test the pool
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ PostgreSQL connection pool initialized');
    }

    // Initialize Supabase client
    async initialize() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration. Please check your environment variables.');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Test connection with a simple approach that doesn't depend on existing tables
        try {
            if (this.pgUrl) {
                // Initialize connection pool
                await this.initializePool();
                this.isConnected = true;
            } else {
                // Try to get the current timestamp from the database
                const { data, error } = await this.supabase.rpc('now');
                if (error) {
                    // If RPC doesn't work, try a simple select
                    const { error: selectError } = await this.supabase
                        .from('_dummy_table_that_doesnt_exist')
                        .select('*')
                        .limit(1);
                    if (selectError && selectError.code === 'PGRST116') {
                        this.isConnected = true;
                        console.log('✅ Database connection successful');
                    } else {
                        throw new Error(`Database connection failed: ${selectError?.message || 'Unknown error'}`);
                    }
                } else {
                    this.isConnected = true;
                    console.log('✅ Database connection successful');
                }
            }
        } catch (error) {
            if (error.message && error.message.includes('does not exist')) {
                this.isConnected = true;
                console.log('✅ Database connection successful');
            } else {
                throw new Error(`Database connection failed: ${error.message}`);
            }
        }
    }

    // Read SQL file
    async readSqlFile(filename) {
        try {
            const filePath = path.join(__dirname, '..', '..', 'src', 'lib', 'supabase', filename);
            const content = await fs.readFile(filePath, 'utf8');
            return content;
        } catch (error) {
            throw new Error(`Failed to read SQL file ${filename}: ${error.message}`);
        }
    }

    // Execute SQL query (uses pg pool if SUPABASE_DB_URL is set)
    async executeQuery(sql) {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call initialize() first.');
        }
        if (this.pool) {
            return this.executeSqlWithPool(sql);
        }
        // fallback to Supabase client (limited)
        throw new Error('Direct SQL execution is only supported with SUPABASE_DB_URL (pg).');
    }

    // Execute SQL using connection pool with retry logic
    async executeSqlWithPool(sql, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const client = await this.pool.connect();
            try {
                await client.query(sql);
                client.release();
                return { message: 'Executed with pool' };
            } catch (error) {
                client.release();

                // Ignore 'already exists' errors for tables, extensions, and types
                if (error.message && (
                    error.message.includes('already exists') ||
                    error.message.includes('duplicate key value') ||
                    error.message.match(/type ".+" already exists/)
                )) {
                    console.warn('⚠️  Warning:', error.message);
                    return { message: 'Already exists, skipped' };
                }

                // If it's a connection error and we have retries left, try again
                if (attempt < retries && (
                    error.code === 'ECONNRESET' ||
                    error.code === 'ENOTFOUND' ||
                    error.message.includes('connection') ||
                    error.message.includes('terminated')
                )) {
                    console.warn(`⚠️  Connection error (attempt ${attempt}/${retries}), retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                    continue;
                }

                throw new Error(`pg SQL execution failed: ${error.message}`);
            }
        }
    }

    // Check if table exists using pool
    async tableExists(tableName) {
        if (this.pool) {
            const client = await this.pool.connect();
            try {
                const res = await client.query(
                    `SELECT to_regclass('public.${tableName}') as exists`);
                client.release();
                return !!res.rows[0].exists;
            } catch (error) {
                client.release();
                console.log(`⚠️  Could not check if table ${tableName} exists: ${error.message}`);
                return false;
            }
        }
        // fallback to Supabase client
        try {
            const { data, error } = await this.supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public')
                .eq('table_name', tableName)
                .single();
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            return !!data;
        } catch (error) {
            console.log(`⚠️  Could not check if table ${tableName} exists: ${error.message}`);
            return false;
        }
    }

    // Close pool when done
    async closePool() {
        if (this.pool) {
            await this.pool.end();
            console.log('✅ Connection pool closed');
        }
    }

    // Execute direct query (fallback method)
    async executeDirectQuery(sql) {
        console.log('⚠️  Direct SQL execution not supported in Supabase');
        console.log('   SQL:', sql);
        console.log('   Please execute manually in Supabase dashboard > SQL Editor');
        return { message: 'Manual execution required' };
    }

    // Check if data exists in table
    async dataExists(tableName) {
        try {
            const { data, error } = await this.supabase
                .from(tableName)
                .select('count')
                .limit(1);

            if (error) {
                throw error;
            }

            return data && data.length > 0;
        } catch (error) {
            console.log(`⚠️  Could not check if data exists in ${tableName}: ${error.message}`);
            return false;
        }
    }

    // Log progress
    logProgress(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    // Log success
    logSuccess(message) {
        const timestamp = new Date().toISOString();
        console.log(`✅ [${timestamp}] ${message}`);
    }

    // Log error
    logError(message, error = null) {
        const timestamp = new Date().toISOString();
        console.error(`❌ [${timestamp}] ${message}`);
        if (error) {
            console.error(`   Details: ${error.message}`);
        }
    }

    // Get environment info
    getEnvironmentInfo() {
        const env = process.env.NODE_ENV || 'development';
        const isDev = env === 'development';
        const isProd = env === 'production';

        return {
            env,
            isDev,
            isProd,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        };
    }
}

module.exports = DatabaseUtils; 