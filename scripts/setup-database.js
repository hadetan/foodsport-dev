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
        } finally {
            // Close the connection pool
            await this.dbUtils.closePool();
        }
    }

    async executeSchema() {
        this.dbUtils.logProgress('Executing database schema...');

        function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

        try {
            // Read schema file
            const schemaSql = await this.dbUtils.readSqlFile('schema.sql');

            // Split SQL into individual statements
            const statements = this.splitSqlStatements(schemaSql);

            let executedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;

            console.log(`📋 Found ${statements.length} SQL statements to execute`);
            console.log('');

            for (const statement of statements) {
                const trimmedStatement = statement.trim();
                if (!trimmedStatement) {
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

                    // Execute the statement using pool
                    await this.dbUtils.executeQuery(trimmedStatement);
                    executedCount++;

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
                    } else if (trimmedStatement.toLowerCase().includes('create type')) {
                        this.dbUtils.logProgress('Created custom type');
                    } else if (trimmedStatement.toLowerCase().includes('create extension')) {
                        this.dbUtils.logProgress('Created extension');
                    } else if (trimmedStatement.toLowerCase().includes('create function')) {
                        this.dbUtils.logProgress('Created function');
                    } else if (trimmedStatement.toLowerCase().includes('alter table')) {
                        this.dbUtils.logProgress('Updated table');
                    }

                } catch (error) {
                    // Log error but continue with other statements
                    this.dbUtils.logError(`Failed to execute statement: ${error.message}`, error);
                    this.dbUtils.logProgress('Continuing with remaining statements...', 'warning');
                    errorCount++;
                }
                await delay(100); // Add delay between statements
            }

            console.log('');
            console.log('✅ Schema execution completed!');
            console.log(`   - ${executedCount} statements executed successfully`);
            console.log(`   - ${skippedCount} statements skipped (already exist)`);
            console.log(`   - ${errorCount} statements failed`);

            if (errorCount > 0) {
                console.log('');
                console.log('⚠️  Some statements failed. Check the logs above for details.');
            }

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
        // Remove block and line comments
        let cleanSql = sql
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/--[^\r\n]*/g, '')
            .replace(/^\s*[\r\n]/gm, '');

        const statements = [];
        let current = '';
        let inDollarQuote = false;
        let dollarTag = null;
        let i = 0;
        while (i < cleanSql.length) {
            // Detect start of dollar-quoted string
            if (!inDollarQuote && cleanSql[i] === '$') {
                const match = cleanSql.slice(i).match(/^\$[\w]*\$/);
                if (match) {
                    inDollarQuote = true;
                    dollarTag = match[0];
                    current += dollarTag;
                    i += dollarTag.length;
                    continue;
                }
            }
            // Detect end of dollar-quoted string
            if (inDollarQuote && cleanSql.slice(i, i + dollarTag.length) === dollarTag) {
                inDollarQuote = false;
                current += dollarTag;
                i += dollarTag.length;
                continue;
            }
            // Split on semicolon if not in dollar-quoted string
            if (!inDollarQuote && cleanSql[i] === ';') {
                statements.push(current.trim());
                current = '';
                i++;
                continue;
            }
            current += cleanSql[i];
            i++;
        }
        if (current.trim()) {
            statements.push(current.trim());
        }
        // Remove empty statements
        return statements.filter(stmt => stmt.length > 0);
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