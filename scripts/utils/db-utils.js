const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Database utilities for setup and seeding scripts
class DatabaseUtils {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
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

        // Test connection
        try {
            const { data, error } = await this.supabase.from('users').select('count').limit(1);
            if (error) {
                throw new Error(`Database connection failed: ${error.message}`);
            }
            this.isConnected = true;
            console.log('✅ Database connection successful');
        } catch (error) {
            throw new Error(`Database connection failed: ${error.message}`);
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

    // Execute SQL query
    async executeQuery(sql) {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call initialize() first.');
        }

        try {
            const { data, error } = await this.supabase.rpc('exec_sql', { sql_query: sql });
            if (error) {
                throw new Error(`SQL execution failed: ${error.message}`);
            }
            return data;
        } catch (error) {
            // Fallback to direct query if RPC is not available
            console.log('⚠️  RPC method not available, using direct query...');
            return this.executeDirectQuery(sql);
        }
    }

    // Execute direct query (fallback method)
    async executeDirectQuery(sql) {
        try {
            const { data, error } = await this.supabase.rpc('exec_sql_direct', { query: sql });
            if (error) {
                throw new Error(`Direct SQL execution failed: ${error.message}`);
            }
            return data;
        } catch (error) {
            throw new Error(`SQL execution failed: ${error.message}`);
        }
    }

    // Check if table exists
    async tableExists(tableName) {
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