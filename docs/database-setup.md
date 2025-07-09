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
- Create all tables, indexes, and foreign key constraints
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
| `users` | User profiles and authentication | Email, profile data, goals, streaks, points |
| `admin_user` | Admin user management | Independent admin accounts with roles |
| `activities` | Fitness activities | Types, locations, participant limits, points |
| `tickets` | Activity tickets | Ticket codes, status tracking, usage |
| `user_activities` | Activity participation | User-activity relationships |
| `calorie_submissions` | Calorie tracking | Photo uploads, verification status |
| `charities` | Charity organizations | Donation goals, mission, featured status |
| `calorie_donations` | Donation tracking | User donations to charities |
| `badges` | Achievement system | Streak, calorie, seasonal, achievement badges |
| `user_badges` | User badge assignments | Earned badges, dates, earned values |
| `referral_codes` | Referral system | Code generation, expiration |
| `referrals` | Referral tracking | User referrals, rewards |
| `otps` | OTP management | Email verification, mobile verification, password reset |

### Custom Types

The database uses several custom ENUM types for data consistency:

- `user_gender`: 'male', 'female', 'other'
- `activity_level`: 'low', 'medium', 'high'
- `activity_status`: 'upcoming', 'active', 'closed', 'completed', 'cancelled', 'draft'
- `activity_type`: 'kayak', 'hiking', 'yoga', 'fitness', 'running', 'cycling', 'swimming', 'dancing', 'boxing', 'other'
- `ticket_status`: 'active', 'expired', 'used', 'cancelled'
- `badge_type`: 'streak', 'calorie', 'seasonal', 'achievement', 'referral'
- `notification_method`: 'email'
- `verification_status`: 'pending', 'approved', 'rejected'
- `otp_entity_type`: 'mobile_verification', 'email_verification', 'password_reset'

### Key Features

1. **Foreign Key Constraints**: Proper relationships between tables
2. **Indexes**: Optimized for common query patterns
3. **Generated Columns**: Dynamic fields like `is_active` in charities table
4. **UUID Primary Keys**: All tables use UUID primary keys for security
5. **Manual Timestamp Management**: `updated_at` fields must be managed in application code

### Table Relationships

- **Users** → **Referral Codes** (one-to-many)
- **Users** → **Activities** (organizer relationship)
- **Users** → **User Activities** (participation)
- **Activities** → **Tickets** (one-to-many)
- **Users** → **Tickets** (one-to-many)
- **Users** → **Calorie Submissions** (one-to-many)
- **Users** → **Calorie Donations** (one-to-many)
- **Charities** → **Calorie Donations** (one-to-many)
- **Users** → **User Badges** (one-to-many)
- **Badges** → **User Badges** (one-to-many)
- **Users** → **OTPs** (one-to-many)

**Note**: `admin_user` table is independent and has no relationships with the `users` table.

## Database Schema Details

### Users Table
- Primary key: `id` (UUID)
- Unique constraints: `email`, `google_id`
- Profile fields: name, date_of_birth, weight, height, gender
- Activity tracking: total_activities, total_donations, badge_count, level
- Streak and points: current_streak, total_points, total_calories_burned
- Goals: calorie_goal, daily_goal, weekly_goal, monthly_goal, yearly_goal
- Verification: email_verified, phone_verified
- Timestamps: created_at, updated_at

### Admin User Table
- Primary key: `id` (UUID)
- Unique constraint: `email`
- Fields: name, role, status, reason
- Independent from users table
- Timestamps: created_at, updated_at

### Activities Table
- Primary key: `id` (UUID)
- Activity details: title, description, activity_type, location
- Scheduling: start_date, end_date, start_time, end_time
- Management: status, participant_limit, current_participants
- Organizer: organizer_name, organizer_id (references users)
- Rewards: points_per_participant, calories_per_hour
- Features: is_featured, image_url
- Timestamps: created_at, updated_at

### Tickets Table
- Primary key: `id` (UUID)
- Unique constraint: `ticket_code`
- Relationships: activity_id, user_id
- Status tracking: status, ticket_sent, used_at, revoked
- Timestamps: created_at, updated_at

### Calorie Submissions Table
- Primary key: `id` (UUID)
- Relationships: user_id, activity_id, verified_by
- Content: photo_url, submitted_calories, verified_calories
- Verification: verification_status, verified_at, points_earned
- Date tracking: submission_date
- Timestamps: created_at, updated_at

### Charities Table
- Primary key: `id` (UUID)
- Information: name, description, mission, website_url
- Media: image_url
- Goals: current_goal, current_donations
- Generated column: is_active (based on donations vs goal)
- Features: featured
- Timestamps: created_at, updated_at

### Badges Table
- Primary key: `id` (UUID)
- Information: name, image_url, badge_type
- Criteria: criteria_value, is_seasonal, seasonal_start_date, seasonal_end_date
- Rarity: rarity (common, rare, epic, legendary)
- Status: is_active
- Timestamp: created_at

### OTPs Table
- Primary key: `id` (UUID)
- Relationships: user_id
- Entity information: entity_type, entity_name (email or mobile)
- OTP details: code, expiry_time
- Usage tracking: is_used, used_at
- Timestamp: created_at

## Indexes

The database includes optimized indexes for performance:

- `idx_users_email`: User email lookups
- `idx_users_google_id`: Google OAuth user lookups
- `idx_users_phone_number`: Phone number searches
- `idx_admin_user_email`: Admin email lookups
- `idx_activities_status`: Activity status filtering
- `idx_activities_type`: Activity type filtering
- `idx_activities_date`: Date range queries on activities
- `idx_user_activities_user_id`: User activity relationships
- `idx_user_activities_activity_id`: Activity participation queries
- `idx_calorie_submissions_user_id`: User submission lookups
- `idx_calorie_submissions_date`: Date-based submission queries
- `idx_calorie_donations_user_id`: User donation lookups
- `idx_calorie_donations_charity_id`: Charity donation queries
- `idx_user_badges_user_id`: User badge lookups
- `idx_otps_user_id`: OTP user lookups
- `idx_otps_entity_name`: OTP entity (email/mobile) lookups
- `idx_otps_entity_type`: OTP type filtering
- `idx_otps_expiry_time`: OTP expiration queries

## Database Commands

### Development Commands

```bash
# Setup database schema
npm run setup-db

# Seed with sample data
npm run seed-db

# Complete database reset
npm run db:reset
```

## Database Extensions

The schema uses the following PostgreSQL extensions:

- `uuid-ossp`: For UUID generation
- `pgcrypto`: For cryptographic functions

**Last Updated**: December 2024  
**Version**: 2.1.0 