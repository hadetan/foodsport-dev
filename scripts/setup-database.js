#!/usr/bin/env node

const DatabaseUtils = require('./utils/db-utils');
require('dotenv').config();

class DatabaseSetup {
    constructor() {
        this.dbUtils = new DatabaseUtils();
        this.envInfo = this.dbUtils.getEnvironmentInfo();
    }

    async run() {
        console.log('🚀 Starting Database Setup...');
        console.log(`📋 Environment: ${this.envInfo.env}`);
        console.log(`🔗 Supabase URL: ${this.envInfo.supabaseUrl}`);
        console.log('');

        try {
            // Initialize database connection
            await this.dbUtils.initialize();

            // Execute schema
            await this.executeSchema();

            // Verify setup
            const setupComplete = await this.verifySetup();

            if (setupComplete) {
                this.dbUtils.logSuccess('Database setup completed successfully!');
                console.log('');
                console.log('📝 Next steps:');
                console.log('   1. Run "npm run seed-db" to populate with sample data (development only)');
                console.log('   2. Test your API routes');
                console.log('   3. Update your environment variables for production');
            } else {
                console.log('');
                console.log('⚠️  Database setup is incomplete');
                console.log('   Please follow the instructions above to complete the setup');
                console.log('');
                console.log('📝 After manual setup:');
                console.log('   1. Run "npm run db:setup" again to verify');
                console.log('   2. Run "npm run seed-db" to populate with sample data');
                console.log('   3. Test your API routes');
            }

        } catch (error) {
            this.dbUtils.logError('Database setup failed', error);
            process.exit(1);
        }
    }

    async executeSchema() {
        this.dbUtils.logProgress('Executing database schema...');

        try {
            // Read schema file
            const schemaSql = await this.dbUtils.readSqlFile('schema.sql');

            // Split SQL into individual statements
            const statements = this.splitSqlStatements(schemaSql);

            let executedCount = 0;
            let skippedCount = 0;
            let manualCount = 0;

            console.log('');
            console.log('📋 Database Schema Setup Instructions:');
            console.log('=====================================');
            console.log('Since Supabase doesn\'t support programmatic execution of complex SQL,');
            console.log('you need to execute the schema manually in your Supabase dashboard.');
            console.log('');
            console.log('Follow these steps:');
            console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
            console.log('2. Select your project');
            console.log('3. Go to SQL Editor (left sidebar)');
            console.log('4. Copy and paste the following SQL statements one by one:');
            console.log('');

            for (const statement of statements) {
                const trimmedStatement = statement.trim();
                if (!trimmedStatement || trimmedStatement.startsWith('--')) {
                    continue;
                }

                try {
                    // Check if this is a CREATE TABLE statement
                    if (trimmedStatement.toLowerCase().includes('create table')) {
                        const tableName = this.extractTableName(trimmedStatement);
                        if (tableName && await this.dbUtils.tableExists(tableName)) {
                            this.dbUtils.logProgress(`Table ${tableName} already exists, skipping...`, 'warning');
                            skippedCount++;
                            continue;
                        }
                    }

                    // Execute the statement
                    const result = await this.dbUtils.executeQuery(trimmedStatement);

                    if (result.message === 'Manual execution required') {
                        manualCount++;
                        console.log(`--- Statement ${manualCount} ---`);
                        console.log(trimmedStatement);
                        console.log('--- End Statement ---');
                        console.log('');
                    } else {
                        executedCount++;
                    }

                    // Log progress for major operations
                    if (trimmedStatement.toLowerCase().includes('create table')) {
                        const tableName = this.extractTableName(trimmedStatement);
                        if (tableName) {
                            this.dbUtils.logProgress(`Created table: ${tableName}`);
                        }
                    } else if (trimmedStatement.toLowerCase().includes('create index')) {
                        this.dbUtils.logProgress('Created index');
                    } else if (trimmedStatement.toLowerCase().includes('create trigger')) {
                        this.dbUtils.logProgress('Created trigger');
                    } else if (trimmedStatement.toLowerCase().includes('create policy')) {
                        this.dbUtils.logProgress('Created RLS policy');
                    }

                } catch (error) {
                    // Log error but continue with other statements
                    this.dbUtils.logError(`Failed to execute statement: ${error.message}`, error);
                    this.dbUtils.logProgress('Continuing with remaining statements...', 'warning');
                }
            }

            console.log('');
            console.log('✅ Schema analysis completed!');
            console.log(`   - ${executedCount} statements executed automatically`);
            console.log(`   - ${skippedCount} statements skipped (already exist)`);
            console.log(`   - ${manualCount} statements need manual execution`);
            console.log('');
            console.log('📝 Next steps:');
            console.log('   1. Execute the SQL statements above in your Supabase dashboard');
            console.log('   2. Run "npm run seed-db" to populate with sample data');
            console.log('   3. Test your API routes');

        } catch (error) {
            throw new Error(`Schema execution failed: ${error.message}`);
        }
    }

    async verifySetup() {
        this.dbUtils.logProgress('Verifying database setup...');

        const requiredTables = [
            'users', 'user_sessions', 'referral_codes', 'referrals',
            'activities', 'user_activities', 'calorie_submissions',
            'charities', 'calorie_donations', 'badges', 'user_badges',
            'leaderboard_cache', 'email_verification_codes',
            'password_reset_codes', 'sms_verification_codes'
        ];

        const missingTables = [];
        const existingTables = [];

        for (const tableName of requiredTables) {
            const exists = await this.dbUtils.tableExists(tableName);
            if (!exists) {
                missingTables.push(tableName);
            } else {
                existingTables.push(tableName);
                this.dbUtils.logProgress(`✅ Table ${tableName} exists`);
            }
        }

        if (missingTables.length > 0) {
            console.log('');
            console.log('⚠️  Some tables are missing:');
            console.log(`   Missing: ${missingTables.join(', ')}`);
            console.log(`   Existing: ${existingTables.join(', ')}`);
            console.log('');
            console.log('📝 To complete the setup:');
            console.log('   1. Execute the SQL statements from the previous step in your Supabase dashboard');
            console.log('   2. Run this script again to verify the setup');
            console.log('');
            return false;
        }

        this.dbUtils.logSuccess('Database verification completed successfully');
        return true;
    }

    splitSqlStatements(sql) {
        // Split SQL by semicolon, but handle semicolons in strings and comments
        const statements = [];
        let currentStatement = '';
        let inString = false;
        let stringChar = '';
        let inComment = false;
        let commentType = '';

        for (let i = 0; i < sql.length; i++) {
            const char = sql[i];
            const nextChar = sql[i + 1];

            // Handle comments
            if (!inString && !inComment) {
                if (char === '-' && nextChar === '-') {
                    inComment = true;
                    commentType = 'line';
                    currentStatement += char;
                    i++; // Skip next char
                    continue;
                } else if (char === '/' && nextChar === '*') {
                    inComment = true;
                    commentType = 'block';
                    currentStatement += char;
                    i++; // Skip next char
                    continue;
                }
            }

            // Handle end of comments
            if (inComment) {
                currentStatement += char;
                if (commentType === 'line' && char === '\n') {
                    inComment = false;
                    commentType = '';
                } else if (commentType === 'block' && char === '*' && nextChar === '/') {
                    currentStatement += nextChar;
                    i++; // Skip next char
                    inComment = false;
                    commentType = '';
                }
                continue;
            }

            // Handle strings
            if (!inComment && (char === "'" || char === '"')) {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                    stringChar = '';
                }
            }

            // Handle statement termination
            if (!inString && !inComment && char === ';') {
                currentStatement += char;
                statements.push(currentStatement.trim());
                currentStatement = '';
            } else {
                currentStatement += char;
            }
        }

        // Add any remaining statement
        if (currentStatement.trim()) {
            statements.push(currentStatement.trim());
        }

        return statements;
    }

    extractTableName(createTableStatement) {
        const match = createTableStatement.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/i);
        return match ? match[1] : null;
    }
}

// Run the setup
if (require.main === module) {
    const setup = new DatabaseSetup();
    setup.run().catch(error => {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    });
}

module.exports = DatabaseSetup; 