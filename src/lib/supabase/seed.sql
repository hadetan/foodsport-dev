-- Foodsport Database Seeding Data
-- Insert sample data for development and testing

-- Insert sample users
INSERT INTO users (id, email, password_hash, name, date_of_birth, weight, height, gender, activity_level, phone_number, profile_picture_url, border, title, bio, level, current_streak, total_points, total_calories_burned, total_calories_donated, calorie_goal, daily_goal, weekly_goal, monthly_goal, yearly_goal, email_verified, phone_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '$2a$10$example.hash', 'John Doe', '1990-05-15', 75.5, 180.0, 'male', 'high', '+85291234567', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'gold', 'Fitness Enthusiast', 'Passionate about staying active and helping others through fitness!', 5, 12, 2500, 15000, 5000, 600, 400, 2500, 10000, 120000, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '$2a$10$example.hash', 'Jane Smith', '1988-08-22', 62.0, 165.0, 'female', 'medium', '+85291234568', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'silver', 'Yoga Master', 'Finding balance through movement and mindfulness', 8, 25, 4200, 28000, 12000, 500, 350, 2200, 9000, 100000, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'mike.wong@example.com', '$2a$10$example.hash', 'Mike Wong', '1995-03-10', 68.0, 175.0, 'male', 'high', '+85291234569', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'bronze', 'Running Champion', 'Marathon runner and fitness coach', 12, 45, 8500, 45000, 20000, 800, 500, 3000, 12000, 150000, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'sarah.lee@example.com', '$2a$10$example.hash', 'Sarah Lee', '1992-11-05', 58.0, 160.0, 'female', 'medium', '+85291234570', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'default', 'Wellness Seeker', 'Exploring different ways to stay healthy and active', 3, 8, 1200, 8000, 3000, 400, 300, 1800, 7000, 80000, true, false),
('550e8400-e29b-41d4-a716-446655440005', 'david.chen@example.com', '$2a$10$example.hash', 'David Chen', '1987-12-18', 72.0, 178.0, 'male', 'low', '+85291234571', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'default', 'Newcomer', 'Just starting my fitness journey!', 1, 2, 300, 2000, 500, 300, 200, 1200, 5000, 60000, true, true);

-- Insert sample activities
INSERT INTO activities (id, title, description, chinese_title, english_description, activity_type, location, start_date, end_date, start_time, end_time, status, participant_limit, current_participants, organizer_name, image_url, points_per_participant, calories_per_hour, is_featured) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Morning Yoga Session', 'Start your day with energizing yoga flow', '晨間瑜伽課程', 'April_FOODSPORT Wednesday Online Calories Drive', 'yoga', 'Hong Kong, Central', '2024-01-15', '2024-01-15', '07:00:00', '08:00:00', 'upcoming', 20, 15, 'Yoga Studio Central', 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHlvZ2F8ZW58MHx8MHx8fDI%3D', 15, 250, true),
('660e8400-e29b-41d4-a716-446655440002', 'Victoria Peak Hiking', 'Scenic hike to Victoria Peak', '太平山遠足', 'April_FOODSPORT Wednesday Online Calories Drive', 'hiking', 'Hong Kong, Victoria Peak', '2024-01-20', '2024-01-20', '09:00:00', '12:00:00', 'upcoming', 15, 8, 'HK Hiking Club', 'https://images.unsplash.com/photo-1465311440653-ba9b1d9b0f5b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGhpa2luZ3xlbnwwfHwwfHx8Mg%3D%3D', 20, 400, true),
('660e8400-e29b-41d4-a716-446655440003', 'Cycling Around Lantau', 'Bike tour around Lantau Island', '大嶼山單車遊', 'April_FOODSPORT Wednesday Online Calories Drive', 'cycling', 'Hong Kong, Lantau Island', '2024-01-25', '2024-01-25', '08:00:00', '16:00:00', 'upcoming', 25, 12, 'Cycling HK', 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3ljbGluZ3xlbnwwfHwwfHx8Mg%3D%3D', 25, 500, false),
('660e8400-e29b-41d4-a716-446655440004', 'Kowloon Bay Kayaking', 'Kayaking adventure in Kowloon Bay', '九龍灣獨木舟', 'April_FOODSPORT Wednesday Online Calories Drive', 'kayak', 'Hong Kong, Kowloon Bay', '2024-01-18', '2024-01-18', '14:00:00', '17:00:00', 'active', 10, 10, 'Water Sports HK', 'https://images.unsplash.com/photo-1440993443326-9e9f5aea703a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8a2F5YWt8ZW58MHx8MHx8fDI%3D', 30, 350, true),
('660e8400-e29b-41d4-a716-446655440005', 'Evening Fitness Class', 'High-intensity interval training', '晚間健身課', 'April_FOODSPORT Wednesday Online Calories Drive', 'fitness', 'Hong Kong, Kwun Tong', '2024-01-16', '2024-01-16', '19:00:00', '20:00:00', 'open', 30, 18, 'Fitness First', 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8RklUTkVTU3xlbnwwfHwwfHx8Mg%3D%3D', 18, 450, false),
('660e8400-e29b-41d4-a716-446655440006', 'Morning Run in Stanley', 'Scenic running route in Stanley', '赤柱晨跑', 'April_FOODSPORT Wednesday Online Calories Drive', 'running', 'Hong Kong, Stanley', '2024-01-22', '2024-01-22', '06:30:00', '08:00:00', 'upcoming', 20, 5, 'Running Club HK', 'https://images.unsplash.com/photo-1590333748338-d629e4564ad9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cnVubmluZ3xlbnwwfHwwfHx8Mg%3D%3D', 22, 600, false);

-- Insert sample charities
INSERT INTO charities (id, name, description, mission, image_url, website_url, current_goal, current_donations, featured) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Hong Kong Food Bank', 'Providing food assistance to families in need', 'To eliminate hunger in Hong Kong by providing food assistance to families in need and promoting food security.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', 'https://www.foodbank.org.hk', 1000000, 750000, true),
('770e8400-e29b-41d4-a716-446655440002', 'Children''s Cancer Foundation', 'Supporting children with cancer and their families', 'To improve the quality of life for children with cancer and their families through comprehensive support services.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop', 'https://www.ccf.org.hk', 2000000, 1200000, true),
('770e8400-e29b-41d4-a716-446655440003', 'Hong Kong Dog Rescue', 'Rescuing and rehoming abandoned dogs', 'To rescue, rehabilitate, and rehome abandoned dogs in Hong Kong, promoting responsible pet ownership.', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop', 'https://www.hongkongdogrescue.com', 500000, 300000, false),
('770e8400-e29b-41d4-a716-446655440004', 'Elderly Care Foundation', 'Supporting elderly care and services', 'To provide comprehensive care and support services for elderly individuals in Hong Kong.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop', 'https://www.elderlycare.hk', 800000, 450000, false),
('770e8400-e29b-41d4-a716-446655440005', 'Environmental Protection Society', 'Protecting Hong Kong''s environment', 'To protect and preserve Hong Kong''s natural environment through education and conservation efforts.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', 'https://www.epshk.org', 300000, 180000, false);

-- Insert sample badges
INSERT INTO badges (id, name, description, image_url, badge_type, criteria_value, is_seasonal, seasonal_start_date, seasonal_end_date, rarity) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'First Steps', 'Complete your first activity', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop', 'achievement', 1, false, NULL, NULL, 'common'),
('880e8400-e29b-41d4-a716-446655440002', 'Streak Master', 'Maintain a 7-day activity streak', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop', 'streak', 7, false, NULL, NULL, 'rare'),
('880e8400-e29b-41d4-a716-446655440003', 'Calorie Crusher', 'Burn 1000 calories in a single day', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop', 'calorie', 1000, false, NULL, NULL, 'epic'),
('880e8400-e29b-41d4-a716-446655440004', 'Christmas Spirit', 'Participate in activities during Christmas season', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop', 'seasonal', NULL, true, '2024-12-20', '2024-12-26', 'rare'),
('880e8400-e29b-41d4-a716-446655440005', 'Halloween Hero', 'Complete activities during Halloween', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop', 'seasonal', NULL, true, '2024-10-25', '2024-11-01', 'rare'),
('880e8400-e29b-41d4-a716-446655440006', 'Referral Champion', 'Successfully refer 5 friends', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop', 'referral', 5, false, NULL, NULL, 'epic'),
('880e8400-e29b-41d4-a716-446655440007', 'Marathon Runner', 'Complete 10 running activities', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=100&h=100&fit=crop', 'achievement', 10, false, NULL, NULL, 'legendary'),
('880e8400-e29b-41d4-a716-446655440008', 'Yoga Master', 'Complete 20 yoga sessions', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop', 'achievement', 20, false, NULL, NULL, 'legendary'),
('880e8400-e29b-41d4-a716-446655440009', 'Charity Hero', 'Donate 5000 calories to charities', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop', 'achievement', 5000, false, NULL, NULL, 'epic'),
('880e8400-e29b-41d4-a716-446655440010', '30-Day Warrior', 'Maintain a 30-day activity streak', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop', 'streak', 30, false, NULL, NULL, 'legendary');

-- Insert sample user activities (tickets)
-- (Add more as needed for your test cases)
INSERT INTO user_activities (id, user_id, activity_id, ticket_code, status, notification_preference, ticket_sent, expires_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'TICKET-001', 'active', 'email', true, '2024-01-15 08:00:00+08'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'TICKET-002', 'active', 'sms', false, '2024-01-20 12:00:00+08');

-- Insert sample calorie submissions
INSERT INTO calorie_submissions (id, user_id, activity_id, photo_url, submitted_calories, verified_calories, verification_status, points_earned, submission_date) VALUES
('a10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', 300, 300, 'approved', 30, '2024-01-15'),
('a10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop', 400, 400, 'approved', 40, '2024-01-20');

-- Insert sample calorie donations
INSERT INTO calorie_donations (id, user_id, charity_id, calories_donated, donation_date, donation_time) VALUES
('b10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 500, '2024-01-16', '10:00:00'),
('b10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 800, '2024-01-21', '11:00:00');

-- Insert sample user badges
INSERT INTO user_badges (id, user_id, badge_id, earned_at, earned_value) VALUES
('c10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '2024-01-15 08:10:00+08', 1),
('c10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '2024-01-22 09:00:00+08', 7);

-- Insert sample leaderboard cache
INSERT INTO leaderboard_cache (id, user_id, global_rank, community_rank, friends_rank, total_calories, total_badges, total_calories_donated, last_updated) VALUES
('d10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1, 1, 1, 15000, 3, 5000, '2024-01-22 10:00:00+08'),
('d10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 2, 2, 2, 12000, 2, 8000, '2024-01-22 10:00:00+08');

-- Insert sample referral codes
INSERT INTO referral_codes (id, user_id, code, is_active, expires_at) VALUES
('e10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'REF-JOHN123', true, '2024-12-31'),
('e10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'REF-JANE456', true, '2024-12-31');

-- Insert sample referrals
INSERT INTO referrals (id, referrer_id, referred_id, referral_code_id, is_successful, reward_given) VALUES
('f10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'e10e8400-e29b-41d4-a716-446655440001', true, true),
('f10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'e10e8400-e29b-41d4-a716-446655440002', true, false);

-- Insert sample email verification codes
INSERT INTO email_verification_codes (id, user_id, email, code, expires_at, used) VALUES
('g10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '123456', '2024-01-31 23:59:59+08', false),
('g10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '654321', '2024-01-31 23:59:59+08', false);

-- Insert sample password reset codes
INSERT INTO password_reset_codes (id, user_id, email, code, expires_at, used) VALUES
('h10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'RESET1', '2024-01-31 23:59:59+08', false),
('h10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'RESET2', '2024-01-31 23:59:59+08', false);

-- Insert sample SMS verification codes
INSERT INTO sms_verification_codes (id, user_id, phone_number, code, expires_at, used) VALUES
('i10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '+85291234567', '111111', '2024-01-31 23:59:59+08', false),
('i10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '+85291234568', '222222', '2024-01-31 23:59:59+08', false); 