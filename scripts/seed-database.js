#!/usr/bin/env node

const DatabaseUtils = require('./utils/db-utils');
require('dotenv').config();

class DatabaseSeeder {
    constructor() {
        this.dbUtils = new DatabaseUtils();
        this.envInfo = this.dbUtils.getEnvironmentInfo();
    }

    async run() {
        console.log('🌱 Starting Database Seeding...');
        console.log(`📋 Environment: ${this.envInfo.env}`);
        console.log(`🔗 Supabase URL: ${this.envInfo.supabaseUrl}`);
        console.log('');

        // Safety check for production
        if (this.envInfo.isProd) {
            console.log('⚠️  WARNING: You are in PRODUCTION environment!');
            console.log('   Seeding is typically only for development.');
            console.log('   If you really want to seed production, set NODE_ENV=development temporarily.');
            console.log('');

            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                rl.question('Do you want to continue? (yes/no): ', resolve);
            });
            rl.close();

            if (answer.toLowerCase() !== 'yes') {
                console.log('❌ Seeding cancelled.');
                process.exit(0);
            }
        }

        try {
            // Initialize database connection
            await this.dbUtils.initialize();

            // Check if data already exists
            await this.checkExistingData();

            // Execute seeding
            await this.executeSeeding();

            // Verify seeding
            await this.verifySeeding();

            this.dbUtils.logSuccess('Database seeding completed successfully!');
            console.log('');
            console.log('📝 Next steps:');
            console.log('   1. Test your API routes with the seeded data');
            console.log('   2. Check the sample users and activities');
            console.log('   3. Verify the gamification features work');

        } catch (error) {
            this.dbUtils.logError('Database seeding failed', error);
            process.exit(1);
        } finally {
            // Close the connection pool
            await this.dbUtils.closePool();
        }
    }

    async checkExistingData() {
        this.dbUtils.logProgress('Checking for existing data...');

        const tablesToCheck = ['users', 'activities', 'charities', 'badges'];
        const existingData = [];

        for (const tableName of tablesToCheck) {
            const hasData = await this.dbUtils.dataExists(tableName);
            if (hasData) {
                existingData.push(tableName);
            }
        }

        if (existingData.length > 0) {
            this.dbUtils.logProgress(`Found existing data in: ${existingData.join(', ')}`, 'warning');

            if (!this.envInfo.isDev) {
                throw new Error('Cannot seed database with existing data in non-development environment');
            }

            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                rl.question('Do you want to continue and potentially duplicate data? (yes/no): ', resolve);
            });
            rl.close();

            if (answer.toLowerCase() !== 'yes') {
                console.log('❌ Seeding cancelled.');
                process.exit(0);
            }
        }
    }

    async executeSeeding() {
        this.dbUtils.logProgress('Executing database seeding...');

        try {
            // Read seed file
            const seedSql = await this.dbUtils.readSqlFile('seed.sql');

            // Split SQL into individual statements
            const statements = this.splitSqlStatements(seedSql);

            let executedCount = 0;
            let skippedCount = 0;

            for (const statement of statements) {
                const trimmedStatement = statement.trim();
                if (!trimmedStatement || trimmedStatement.startsWith('--')) {
                    continue;
                }

                try {
                    // Execute the statement
                    await this.dbUtils.executeQuery(trimmedStatement);
                    executedCount++;

                    // Log progress for major operations
                    if (trimmedStatement.toLowerCase().includes('insert into users')) {
                        this.dbUtils.logProgress('Inserted sample users');
                    } else if (trimmedStatement.toLowerCase().includes('insert into activities')) {
                        this.dbUtils.logProgress('Inserted sample activities');
                    } else if (trimmedStatement.toLowerCase().includes('insert into charities')) {
                        this.dbUtils.logProgress('Inserted sample charities');
                    } else if (trimmedStatement.toLowerCase().includes('insert into badges')) {
                        this.dbUtils.logProgress('Inserted sample badges');
                    } else if (trimmedStatement.toLowerCase().includes('insert into')) {
                        this.dbUtils.logProgress('Inserted sample data');
                    }

                } catch (error) {
                    // Log error but continue with other statements
                    this.dbUtils.logError(`Failed to execute statement: ${error.message}`, error);
                    this.dbUtils.logProgress('Continuing with remaining statements...', 'warning');
                }
            }

            this.dbUtils.logSuccess(`Seeding completed: ${executedCount} statements executed, ${skippedCount} skipped`);

        } catch (error) {
            throw new Error(`Seeding execution failed: ${error.message}`);
        }
    }

    async verifySeeding() {
        this.dbUtils.logProgress('Verifying seeded data...');

        const expectedData = [
            { table: 'users', minCount: 5 },
            { table: 'activities', minCount: 3 },
            { table: 'charities', minCount: 2 },
            { table: 'badges', minCount: 5 }
        ];

        for (const { table, minCount } of expectedData) {
            try {
                const { data, error } = await this.dbUtils.supabase
                    .from(table)
                    .select('count')
                    .limit(1);

                if (error) {
                    this.dbUtils.logError(`Could not verify ${table}: ${error.message}`);
                    continue;
                }

                // Get actual count
                const { count } = await this.dbUtils.supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });

                if (count >= minCount) {
                    this.dbUtils.logProgress(`✅ ${table}: ${count} records (expected ≥${minCount})`);
                } else {
                    this.dbUtils.logProgress(`⚠️  ${table}: ${count} records (expected ≥${minCount})`, 'warning');
                }

            } catch (error) {
                this.dbUtils.logError(`Failed to verify ${table}: ${error.message}`);
            }
        }

        this.dbUtils.logSuccess('Data verification completed');
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
                    current += cleanSql[i];
                    i++;
                    continue;
                }
            }

            // Detect end of dollar-quoted string
            if (inDollarQuote && cleanSql[i] === '$') {
                const remaining = cleanSql.slice(i);
                if (remaining.startsWith(dollarTag)) {
                    current += cleanSql.slice(i, i + dollarTag.length);
                    i += dollarTag.length;
                    inDollarQuote = false;
                    dollarTag = null;
                    continue;
                }
            }

            // Handle statement termination (only when not in dollar-quoted string)
            if (!inDollarQuote && cleanSql[i] === ';') {
                current += cleanSql[i];
                const trimmed = current.trim();
                if (trimmed) {
                    statements.push(trimmed);
                }
                current = '';
            } else {
                current += cleanSql[i];
            }
            i++;
        }

        // Add any remaining statement
        const trimmed = current.trim();
        if (trimmed) {
            statements.push(trimmed);
        }

        return statements.filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    }
}

// Run the seeder
if (require.main === module) {
    const seeder = new DatabaseSeeder();
    seeder.run().catch(error => {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    });
}

module.exports = DatabaseSeeder; 