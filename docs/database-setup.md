# Database Setup and Integration Guide

## Overview

This guide covers the complete setup and integration of Supabase database with the Foodsport Next.js application.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **Environment Variables**: Configure your `.env` file

## Environment Configuration

### 1. Create Environment File

Copy `env.example` to `.env` and configure your Supabase credentials:

```bash
cp env.example .env
```

### 2. Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Environment
NODE_ENV=development

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY`

## Database Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database Schema

```bash
npm run setup-db
```

This command will:
- Connect to your Supabase database
- Execute the schema from `src/lib/supabase/schema.sql`
- Create all tables, indexes, triggers, and RLS policies
- Verify the setup

### 3. Seed Database (Development Only)

```bash
npm run seed-db
```

This command will:
- Populate the database with sample data
- Create test users, activities, charities, and badges
- Verify the seeded data

### 4. Complete Database Reset

```bash
npm run db:reset
```

This command will run both setup and seed in sequence.

## Database Architecture

### Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User profiles and authentication | Email, profile data, goals |
| `user_sessions` | Session management | JWT tokens, expiration |
| `activities` | Fitness activities | Types, locations, participant limits |
| `user_activities` | Activity participation | Tickets, status tracking |
| `calorie_submissions` | Calorie tracking | Photo uploads, verification |
| `charities` | Charity organizations | Donation goals, descriptions |
| `calorie_donations` | Donation tracking | User donations to charities |
| `badges` | Achievement system | Streak, calorie, seasonal badges |
| `user_badges` | User badge assignments | Earned badges, dates |
| `referral_codes` | Referral system | Code generation, expiration |
| `referrals` | Referral tracking | User referrals, rewards |
| `leaderboard_cache` | Performance optimization | Cached leaderboard data |

### Key Features

1. **Row Level Security (RLS)**: All tables have RLS policies for data protection
2. **Automatic Timestamps**: `created_at` and `updated_at` fields are automatically managed
3. **Foreign Key Constraints**: Proper relationships between tables
4. **Indexes**: Optimized for common query patterns
5. **Triggers**: Automatic data updates and calculations

## API Integration

### Database Client Setup

The application uses two Supabase clients:

1. **Server Client** (`src/lib/supabase/client.js`):
   - Used in API routes
   - Has full database access
   - Uses service role key

2. **Client Client** (`src/lib/supabase/client.js`):
   - Used in React components
   - Limited by RLS policies
   - Uses anon key

### Database Utilities

Common database operations are abstracted in `src/lib/supabase/db-utils.js`:

```javascript
import { 
  getById, 
  getMany, 
  insert, 
  updateById, 
  deleteById,
  validateRequiredFields,
  sanitizeData,
  formatDbError 
} from '@/lib/supabase/db-utils';

// Example usage in API route
export async function GET(request) {
  const { data, error } = await getMany('activities', 
    { status: 'active' }, 
    ['id', 'title', 'description']
  );
  
  if (error) {
    return Response.json({ error: formatDbError(error) }, { status: 500 });
  }
  
  return Response.json({ activities: data });
}
```

### Error Handling

The database utilities provide consistent error handling:

```javascript
// Validation
const validation = validateRequiredFields(data, ['title', 'description']);
if (!validation.isValid) {
  return Response.json({ error: validation.error }, { status: 400 });
}

// Database errors
if (error) {
  const formattedError = formatDbError(error);
  return Response.json({ error: formattedError }, { status: 400 });
}
```

## Security Features

### Row Level Security (RLS)

All tables have RLS policies that ensure:

1. **Users can only access their own data**
2. **Public data is readable by all authenticated users**
3. **Sensitive operations require proper authentication**

### Authentication

- JWT-based authentication
- Session management with expiration
- Secure password handling
- Email verification system

### Data Validation

- Input sanitization
- Required field validation
- Type checking
- SQL injection prevention

## Development Workflow

### 1. Local Development

```bash
# Start development server
npm run dev

# Setup database (first time only)
npm run setup-db

# Seed with sample data
npm run seed-db
```

### 2. Database Changes

When making schema changes:

1. Update `src/lib/supabase/schema.sql`
2. Run `npm run setup-db` to apply changes
3. Update seed data if needed
4. Test API routes

### 3. Testing Database Connection

```bash
# Test connection
curl http://localhost:3000/api/activities
```

## Production Deployment

### 1. Environment Setup

1. Create production Supabase project
2. Update environment variables for production
3. Set `NODE_ENV=production`

### 2. Database Migration

```bash
# Setup production database
NODE_ENV=production npm run setup-db

# Do NOT run seed-db in production unless specifically needed
```

### 3. Verification

1. Test all API endpoints
2. Verify RLS policies work correctly
3. Check database performance
4. Monitor error logs

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check environment variables
   - Verify Supabase project is active
   - Check network connectivity

2. **Permission Denied**
   - Verify RLS policies
   - Check user authentication
   - Review service role key

3. **Schema Errors**
   - Check SQL syntax in schema.sql
   - Verify table dependencies
   - Review foreign key constraints

### Debug Commands

```bash
# Check environment
echo $NODE_ENV
echo $NEXT_PUBLIC_SUPABASE_URL

# Test database connection
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('users').select('count').then(console.log).catch(console.error);
"
```

## Performance Optimization

### 1. Connection Pooling

Supabase handles connection pooling automatically.

### 2. Query Optimization

- Use indexes for frequently queried columns
- Limit result sets with pagination
- Use specific column selection

### 3. Caching

- Leaderboard data is cached
- Consider implementing Redis for additional caching

## Monitoring

### 1. Supabase Dashboard

- Monitor database performance
- Check query logs
- Review error rates

### 2. Application Logs

- Database errors are logged
- API request/response logging
- Performance metrics

## Backup and Recovery

### 1. Automatic Backups

Supabase provides automatic daily backups.

### 2. Manual Backups

```sql
-- Export data (run in Supabase SQL editor)
COPY (SELECT * FROM users) TO 'users_backup.csv' WITH CSV HEADER;
```

### 3. Restore Process

1. Create new Supabase project
2. Run schema setup
3. Import backup data
4. Update environment variables

## Support

For database-related issues:

1. Check this documentation
2. Review Supabase documentation
3. Check application logs
4. Contact development team

---

**Last Updated**: December 2024  
**Version**: 1.0.0 