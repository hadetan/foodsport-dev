# Prisma Migration Plan: Supabase Database to Prisma ORM

## Overview

This document outlines the complete migration plan from Supabase database client to Prisma ORM while keeping the PostgreSQL database hosted on Supabase. The migration will maintain Supabase authentication while moving all database operations to Prisma ORM for better type safety, migrations, and developer experience.

## Migration Goals

1. **Database Provider**: Keep Supabase PostgreSQL database
2. **ORM**: Replace Supabase client with Prisma ORM
3. **Authentication**: Keep Supabase Auth for user authentication
4. **Migrations**: Use Prisma migrations for schema management
5. **Performance**: Maintain or improve current performance
6. **Functionality**: Preserve all existing features and API endpoints

## Current Architecture Analysis

### Current Setup
- **Database**: Supabase PostgreSQL (keeping this)
- **Client**: Supabase JavaScript client (replacing with Prisma)
- **Utilities**: Custom db-utils.js with CRUD operations (replacing with Prisma)
- **Authentication**: Supabase Auth (keeping this)
- **API Routes**: 15+ API endpoints using Supabase client
- **Admin System**: Custom admin verification using Supabase

### Files to Migrate
- `src/lib/supabase/client.js` → Prisma client
- `src/lib/supabase/db-utils.js` → Prisma utilities
- `src/lib/supabase/require-admin.js` → Prisma-based admin check
- All API routes in `src/app/api/`
- Database schema from `src/lib/supabase/schema.sql` → Prisma schema

## Phase 1: Environment Setup

### 1.1 Install Dependencies
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 1.2 Environment Variables
Update `.env` file:
```env
# Keep Supabase database connection for Prisma
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Keep Supabase Auth variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 1.3 Initialize Prisma
```bash
npx prisma init
```

## Phase 2: Database Schema Migration

### 2.1 Create Prisma Schema
Convert `src/lib/supabase/schema.sql` to `prisma/schema.prisma`:

**Key Changes:**
- Convert PostgreSQL ENUMs to Prisma enums
- Map UUID fields to Prisma's `String @id @default(uuid())`
- Convert generated columns to computed fields
- Map foreign key relationships
- Handle timestamp fields with `@default(now())` and `@updatedAt`

### 2.2 Schema Mapping
```prisma
// Example mapping for Users table
model User {
  id                    String   @id @default(uuid())
  email                 String   @unique
  name                  String
  dateOfBirth           DateTime @map("date_of_birth")
  weight                Decimal? @db.Decimal(5, 2)
  height                Decimal? @db.Decimal(5, 2)
  gender                UserGender?
  activityLevel         ActivityLevel @default(medium) @map("activity_level")
  // ... other fields
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")
  
  // Relations
  referralCodes         ReferralCode[]
  activities            Activity[] @relation("OrganizerActivities")
  userActivities        UserActivity[]
  tickets               Ticket[]
  calorieSubmissions    CalorieSubmission[]
  calorieDonations      CalorieDonation[]
  userBadges            UserBadge[]
  otps                  Otp[]
  
  @@map("users")
}

enum UserGender {
  male
  female
  other
}

enum ActivityLevel {
  low
  medium
  high
}
```

### 2.3 Handle Complex Features
- **Generated Columns**: Use Prisma computed fields or handle in application
- **Indexes**: Define in Prisma schema
- **Triggers**: Remove (already removed in current schema)
- **RLS**: Remove (already removed in current schema)

## Phase 3: Prisma Client Setup

### 3.1 Create Prisma Client
```javascript
// src/lib/prisma/client.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3.2 Database Utilities Migration
Convert `src/lib/supabase/db-utils.js` to Prisma utilities:

**Functions to Migrate:**
- `getById` → Prisma's `findUnique`
- `getMany` → Prisma's `findMany` with where clause
- `insert` → Prisma's `create`
- `updateById` → Prisma's `update`
- `deleteById` → Prisma's `delete`
- `exists` → Prisma's `findFirst`
- `getCount` → Prisma's `count`
- `executeTransaction` → Prisma's `$transaction`

### 3.3 Error Handling
Update error formatting for Prisma-specific errors:
- Unique constraint violations
- Foreign key violations
- Not null violations
- Connection errors

## Phase 4: API Routes Migration

### 4.1 Authentication Integration
Keep Supabase Auth but update admin verification:

```javascript
// src/lib/prisma/require-admin.js
import { prisma } from './client.js'
import { createSupabaseClient } from '@/lib/supabase/client'

export async function requireAdmin(supabase, NextResponse) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  
  const adminUser = await prisma.adminUser.findUnique({
    where: { email: user.email }
  })
  
  if (!adminUser || adminUser.status !== 'active') {
    return { error: NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 }) }
  }
  
  return { user }
}
```

### 4.2 API Routes to Update
**Priority Order:**
1. `/api/activities` - Core functionality
2. `/api/admin/activities` - Admin CRUD
3. `/api/admin/users` - User management
4. `/api/admin/dashboard` - Analytics
5. `/api/admin/login` - Admin authentication
6. `/api/admin/register` - Admin registration

**Migration Pattern:**
```javascript
// Before (Supabase)
const { data: activities, error } = await getMany('activities', filters, columns, options)

// After (Prisma)
const activities = await prisma.activity.findMany({
  where: filters,
  select: columns.reduce((acc, col) => ({ ...acc, [col]: true }), {}),
  take: options.limit,
  skip: options.range?.from || 0,
  orderBy: { [options.orderBy.column]: options.orderBy.ascending ? 'asc' : 'desc' }
})
```

### 4.3 Complex Queries
Handle complex queries that use Supabase-specific features:
- **Pagination**: Use `skip` and `take`
- **Joins**: Use Prisma relations
- **Aggregations**: Use Prisma's `_count`, `_sum`, etc.
- **Raw SQL**: Use `$queryRaw` for complex operations

## Phase 5: Data Migration

### 5.1 Database Setup
1. Keep existing Supabase PostgreSQL database
2. Run Prisma migrations to sync schema
3. Verify data integrity

### 5.2 Migration Scripts
Create migration scripts for:
- Schema validation
- Data integrity checks
- Performance testing
- Rollback procedures

### 5.3 Testing Strategy
- Unit tests for Prisma utilities
- Integration tests for API routes
- Performance benchmarks
- End-to-end testing

## Phase 6: Performance Optimization

### 6.1 Prisma Optimizations
- Use `select` to limit fields
- Implement proper indexing
- Use `include` for relations
- Optimize query patterns

### 6.2 Connection Pooling
- Configure Prisma connection pool
- Monitor connection usage
- Implement connection limits

## Migration Stories & Status Tracking

### Epic: Prisma Migration Implementation
**Epic ID**: PRISMA-001  
**Priority**: High  
**Estimated Effort**: 4 weeks  
**Status**: 🟡 In Progress

---

### Story 1: Environment Setup & Prisma Installation
**Story ID**: PRISMA-001-01  
**Priority**: High  
**Estimated Effort**: 1 day  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Install Prisma dependencies
- [ ] Initialize Prisma in project
- [ ] Configure environment variables
- [ ] Test Prisma connection to Supabase database
- [ ] Create initial Prisma client setup

**Tasks:**
- [ ] Run `npm install prisma @prisma/client`
- [ ] Run `npx prisma init`
- [ ] Update `.env` with Supabase database URL
- [ ] Create `src/lib/prisma/client.js`
- [ ] Test database connection

**Definition of Done:**
- Prisma is installed and configured
- Database connection is working
- No breaking changes to existing functionality

---

### Story 2: Schema Migration - Core Models
**Story ID**: PRISMA-001-02  
**Priority**: High  
**Estimated Effort**: 3 days  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Convert Users table to Prisma model
- [ ] Convert AdminUser table to Prisma model
- [ ] Convert Activities table to Prisma model
- [ ] Convert Tickets table to Prisma model
- [ ] Convert UserActivities table to Prisma model
- [ ] Define all relationships between models
- [ ] Create Prisma enums for custom types

**Tasks:**
- [ ] Create `prisma/schema.prisma` file
- [ ] Map Users table with all fields and relations
- [ ] Map AdminUser table (independent from Users)
- [ ] Map Activities table with organizer relationship
- [ ] Map Tickets and UserActivities tables
- [ ] Define UserGender, ActivityLevel, ActivityStatus, ActivityType enums
- [ ] Test schema generation with `npx prisma generate`

**Definition of Done:**
- All core models are defined in Prisma schema
- Relationships are properly mapped
- Schema generates without errors
- All enums are defined

---

### Story 3: Schema Migration - Supporting Models
**Story ID**: PRISMA-001-03  
**Priority**: High  
**Estimated Effort**: 2 days  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Convert CalorieSubmissions table to Prisma model
- [ ] Convert Charities table to Prisma model
- [ ] Convert CalorieDonations table to Prisma model
- [ ] Convert Badges table to Prisma model
- [ ] Convert UserBadges table to Prisma model
- [ ] Convert ReferralCodes table to Prisma model
- [ ] Convert Referrals table to Prisma model
- [ ] Convert OTPs table to Prisma model

**Tasks:**
- [ ] Map CalorieSubmissions with verification status
- [ ] Map Charities with generated is_active field
- [ ] Map CalorieDonations with user and charity relations
- [ ] Map Badges with seasonal and rarity fields
- [ ] Map UserBadges with earned values
- [ ] Map ReferralCodes and Referrals
- [ ] Map OTPs table with entity types
- [ ] Define remaining enums (TicketStatus, BadgeType, etc.)

**Definition of Done:**
- All supporting models are defined
- All enums are complete
- Schema is fully functional
- Generated columns are handled appropriately

---

### Story 4: Database Utilities Migration
**Story ID**: PRISMA-001-04  
**Priority**: High  
**Estimated Effort**: 2 days  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Create new Prisma-based database utilities
- [ ] Migrate getById function to Prisma findUnique
- [ ] Migrate getMany function to Prisma findMany
- [ ] Migrate insert function to Prisma create
- [ ] Migrate updateById function to Prisma update
- [ ] Migrate deleteById function to Prisma delete
- [ ] Migrate exists function to Prisma findFirst
- [ ] Migrate getCount function to Prisma count
- [ ] Migrate executeTransaction to Prisma $transaction
- [ ] Update error handling for Prisma errors

**Tasks:**
- [ ] Create `src/lib/prisma/db-utils.js`
- [ ] Implement all CRUD operations using Prisma
- [ ] Add proper error handling and formatting
- [ ] Maintain same function signatures for compatibility
- [ ] Add TypeScript types for better type safety
- [ ] Write unit tests for new utilities

**Definition of Done:**
- All database utilities work with Prisma
- Error handling is improved
- Function signatures remain compatible
- Unit tests pass

---

### Story 5: Authentication Integration Update
**Story ID**: PRISMA-001-05  
**Priority**: High  
**Estimated Effort**: 1 day  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Update require-admin function to use Prisma
- [ ] Maintain Supabase Auth for user authentication
- [ ] Update admin verification to use AdminUser table
- [ ] Test admin authentication flow
- [ ] Ensure backward compatibility

**Tasks:**
- [ ] Update `src/lib/prisma/require-admin.js`
- [ ] Modify admin check to query AdminUser table
- [ ] Keep Supabase Auth integration intact
- [ ] Test admin login and authorization
- [ ] Update admin registration if needed

**Definition of Done:**
- Admin authentication works with Prisma
- Supabase Auth is still functional
- Admin routes are properly protected
- No breaking changes to auth flow

---

### Story 6: Core API Routes Migration
**Story ID**: PRISMA-001-06  
**Priority**: High  
**Estimated Effort**: 3 days  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Migrate `/api/activities` GET endpoint
- [ ] Migrate `/api/activities` POST endpoint
- [ ] Update pagination logic for Prisma
- [ ] Update filtering and sorting
- [ ] Maintain API response format
- [ ] Test all activity endpoints

**Tasks:**
- [ ] Update activities route to use Prisma
- [ ] Convert Supabase queries to Prisma queries
- [ ] Update pagination using skip/take
- [ ] Update filtering using where clause
- [ ] Update sorting using orderBy
- [ ] Test GET and POST endpoints
- [ ] Verify response format compatibility

**Definition of Done:**
- Activities API works with Prisma
- All existing functionality is preserved
- Response format is unchanged
- Performance is maintained or improved

---

### Story 7: Admin API Routes Migration
**Story ID**: PRISMA-001-07  
**Priority**: High  
**Estimated Effort**: 4 days  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Migrate `/api/admin/activities` endpoints
- [ ] Migrate `/api/admin/users` endpoints
- [ ] Migrate `/api/admin/dashboard` endpoint
- [ ] Migrate `/api/admin/login` endpoint
- [ ] Migrate `/api/admin/register` endpoint
- [ ] Update admin CRUD operations
- [ ] Update admin analytics queries

**Tasks:**
- [ ] Update admin activities CRUD
- [ ] Update admin users management
- [ ] Update dashboard analytics queries
- [ ] Update admin authentication
- [ ] Update admin registration
- [ ] Test all admin functionality
- [ ] Verify admin permissions

**Definition of Done:**
- All admin API routes work with Prisma
- Admin functionality is fully operational
- Analytics and reporting work correctly
- Admin permissions are properly enforced

---

### Story 8: Complex Queries Migration
**Story ID**: PRISMA-001-08  
**Priority**: Medium  
**Estimated Effort**: 2 days  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Migrate complex joins and relations
- [ ] Update aggregation queries
- [ ] Handle computed fields
- [ ] Optimize query performance
- [ ] Update dashboard analytics
- [ ] Handle raw SQL queries if needed

**Tasks:**
- [ ] Identify complex queries in existing code
- [ ] Convert joins to Prisma relations
- [ ] Update aggregation queries
- [ ] Handle computed fields appropriately
- [ ] Optimize query patterns
- [ ] Test performance improvements

**Definition of Done:**
- All complex queries work with Prisma
- Performance is maintained or improved
- Relations are properly handled
- Aggregations work correctly

---

### Story 9: Testing & Validation
**Story ID**: PRISMA-001-09  
**Priority**: High  
**Estimated Effort**: 2 days  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Write unit tests for Prisma utilities
- [ ] Write integration tests for API routes
- [ ] Test all CRUD operations
- [ ] Test error handling
- [ ] Performance benchmarking
- [ ] Data integrity validation

**Tasks:**
- [ ] Create test suite for Prisma utilities
- [ ] Create integration tests for API routes
- [ ] Test all database operations
- [ ] Test error scenarios
- [ ] Run performance benchmarks
- [ ] Validate data integrity

**Definition of Done:**
- All tests pass
- Performance meets requirements
- Data integrity is maintained
- Error handling works correctly

---

### Story 10: Documentation & Cleanup
**Story ID**: PRISMA-001-10  
**Priority**: Medium  
**Estimated Effort**: 1 day  
**Status**: 🟢 Not Started  
**Assignee**: TBD

**Acceptance Criteria:**
- [ ] Update API documentation
- [ ] Update database setup documentation
- [ ] Remove unused Supabase database code
- [ ] Update README with Prisma information
- [ ] Create migration guide for team

**Tasks:**
- [ ] Update API documentation
- [ ] Update database setup docs
- [ ] Remove old Supabase database files
- [ ] Update project README
- [ ] Create team migration guide

**Definition of Done:**
- Documentation is updated
- Unused code is removed
- Team has migration guide
- Project is ready for production

---

## Questions for Clarification

1. **Authentication Strategy**: Should we keep Supabase Auth or migrate to a different auth provider?
2. **File Storage**: How should we handle file uploads (currently using Supabase Storage)?
3. **Real-time Features**: Are there any real-time features that need alternative implementation?
4. **Admin Interface**: Does the admin interface need updates for the new data structure?
5. **Testing Environment**: Should we set up a separate testing database?
6. **Migration Strategy**: Should we do a gradual migration or big-bang approach?
7. **Monitoring Tools**: What monitoring and logging tools should we use?
8. **Performance Requirements**: What are the specific performance benchmarks we need to meet?

## Next Steps

1. Review and approve this migration plan
2. Assign team members to stories
3. Set up development environment
4. Begin with Story 1 (Environment Setup)
5. Create detailed task breakdown for each story
6. Set up testing and validation procedures

---

**Document Version**: 2.0  
**Last Updated**: December 2024  
**Status**: Planning Phase 