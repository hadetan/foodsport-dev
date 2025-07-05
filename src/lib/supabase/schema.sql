-- Foodsport Database Schema
-- Supabase PostgreSQL Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE activity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE activity_status AS ENUM ('upcoming', 'active', 'closed', 'completed', 'cancelled');
CREATE TYPE activity_type AS ENUM ('kayak', 'hiking', 'yoga', 'fitness', 'running', 'cycling', 'swimming', 'dancing', 'boxing', 'other');
CREATE TYPE ticket_status AS ENUM ('active', 'expired', 'used', 'cancelled');
CREATE TYPE badge_type AS ENUM ('streak', 'calorie', 'seasonal', 'achievement', 'referral');
CREATE TYPE notification_method AS ENUM ('email');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    gender user_gender,
    activity_level activity_level DEFAULT 'medium',
    phone_number VARCHAR(20),
    profile_picture_url TEXT,
    border VARCHAR(50) DEFAULT 'default',
    title VARCHAR(100) DEFAULT 'Newcomer',
    bio TEXT,
    total_activities INTEGER DEFAULT 0,
    total_donations INTEGER DEFAULT 0,
    badge_count INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    total_calories_donated INTEGER DEFAULT 0,
    calorie_goal INTEGER DEFAULT 500,
    daily_goal INTEGER DEFAULT 300,
    weekly_goal INTEGER DEFAULT 2000,
    monthly_goal INTEGER DEFAULT 8000,
    yearly_goal INTEGER DEFAULT 100000,
    google_id VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    has_referred_before BOOLEAN DEFAULT FALSE, -- If the user has referred someone before then we do not send them the reward again.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'admin',
    status VARCHAR(20) DEFAULT 'active',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (We do not need to handle user sessions I suppose)
-- CREATE TABLE IF NOT EXISTS user_sessions (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--     token_hash VARCHAR(255) NOT NULL,
--     refresh_token_hash VARCHAR(255),
--     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral tracking table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code_id UUID REFERENCES referral_codes(id) ON DELETE CASCADE,
    is_successful BOOLEAN DEFAULT FALSE,
    reward_given BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    activity_type activity_type NOT NULL,
    location VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status activity_status DEFAULT 'draft',
    participant_limit INTEGER,
    current_participants INTEGER DEFAULT 0,
    organizer_name VARCHAR(100),
    organizer_id UUID REFERENCES users(id),
    image_url TEXT,
    points_per_participant INTEGER DEFAULT 10,
    calories_per_hour INTEGER DEFAULT 300,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status ticket_status DEFAULT 'active',
    ticket_sent BOOLEAN DEFAULT FALSE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activities (tickets) table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_id)
);

-- Calorie submissions table
CREATE TABLE IF NOT EXISTS calorie_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id),
    photo_url TEXT NOT NULL,
    submitted_calories INTEGER,
    verified_calories INTEGER,
    verification_status verification_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    points_earned INTEGER DEFAULT 0,
    submission_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charities table
CREATE TABLE IF NOT EXISTS charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    mission TEXT,
    image_url TEXT,
    website_url TEXT,
    current_goal INTEGER DEFAULT 1000000,
    current_donations INTEGER DEFAULT 0,
    is_active BOOLEAN GENERATED ALWAYS AS (current_donations < current_goal) STORED -- This will dynamically return true or false depending on current_donation value is equal to or larger than current_goal which will make this false and inactive once then goal has been reached is_active BOOLEAN DEFAULT TRUE,or passed accidentally.
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calorie donations table
CREATE TABLE IF NOT EXISTS calorie_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
    calories_donated INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    image_url TEXT,
    badge_type badge_type NOT NULL,
    criteria_value INTEGER, -- e.g., streak days, calories burned, etc.
    is_seasonal BOOLEAN DEFAULT FALSE,
    seasonal_start_date DATE,
    seasonal_end_date DATE,
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    earned_value INTEGER, -- the actual value when badge was earned
    UNIQUE(user_id, badge_id)
);

-- Leaderboard cache table (for performance) 
-- WELL LET'S NOT GO THIS WAY.
-- CREATE TABLE IF NOT EXISTS leaderboard_cache (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--     global_rank INTEGER,
--     community_rank INTEGER,
--     friends_rank INTEGER,
--     total_calories INTEGER DEFAULT 0,
--     total_badges INTEGER DEFAULT 0,
--     total_calories_donated INTEGER DEFAULT 0,
--     last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     UNIQUE(user_id)
-- );

-- Email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset codes table
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS verification codes table
-- WE WILL NOT HAVE SMS SUPPORT I SUPPOSE
-- CREATE TABLE IF NOT EXISTS sms_verification_codes (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--     phone_number VARCHAR(20) NOT NULL,
--     code VARCHAR(6) NOT NULL,
--     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
--     used BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_date ON activities(start_date, end_date);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_id ON user_activities(activity_id);
CREATE INDEX idx_calorie_submissions_user_id ON calorie_submissions(user_id);
CREATE INDEX idx_calorie_submissions_date ON calorie_submissions(submission_date);
CREATE INDEX idx_calorie_donations_user_id ON calorie_donations(user_id);
CREATE INDEX idx_calorie_donations_charity_id ON calorie_donations(charity_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
-- CREATE INDEX idx_leaderboard_cache_global_rank ON leaderboard_cache(global_rank);
-- CREATE INDEX idx_leaderboard_cache_community_rank ON leaderboard_cache(community_rank);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calorie_submissions_updated_at BEFORE UPDATE ON calorie_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON charities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calorie_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calorie_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Activities are publicly readable
CREATE POLICY "Activities are publicly readable" ON activities FOR SELECT USING (true);

-- Users can only see their own submissions
CREATE POLICY "Users can view own calorie submissions" ON calorie_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calorie submissions" ON calorie_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Charities are publicly readable
CREATE POLICY "Charities are publicly readable" ON charities FOR SELECT USING (true);

-- Users can only see their own donations
CREATE POLICY "Users can view own donations" ON calorie_donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own donations" ON calorie_donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own badges
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
