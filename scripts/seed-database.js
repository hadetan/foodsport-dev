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