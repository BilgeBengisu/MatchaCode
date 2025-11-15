-- MatchaCode Database Schema
-- Supabase SQL schema for the daily LeetCode challenge tracker

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    current_streak INTEGER DEFAULT 0,
    total_solved INTEGER DEFAULT 0,
    total_matcha_owed INTEGER DEFAULT 0,
    daily_challenges JSONB DEFAULT '{}',
    activity_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems table - tracks individual problems solved
CREATE TABLE IF NOT EXISTS problems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title VARCHAR(255),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'attempted', 'not completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, title)
);

-- Check-ins table - tracks daily challenge completions
CREATE TABLE IF NOT EXISTS checkins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Matcha log table - tracks matcha payments
CREATE TABLE IF NOT EXISTS matcha_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('owed', 'paid')),
    amount INTEGER NOT NULL DEFAULT 1,
    date DATE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_user_date ON problems(user_id, date);
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_matcha_log_user_date ON matcha_log(user_id, date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get dashboard data
CREATE OR REPLACE FUNCTION get_dashboard()
RETURNS TABLE (
    user_id VARCHAR(50),
    name VARCHAR(100),
    current_streak INTEGER,
    total_solved INTEGER,
    matcha_owed INTEGER,
    recent_activities JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.name,
        u.current_streak,
        u.total_solved,
        u.total_matcha_owed as matcha_owed,
        u.activity_history as recent_activities
    FROM users u
    ORDER BY u.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate individual streak
CREATE OR REPLACE FUNCTION calculate_individual_streak(p_user_id VARCHAR(50))
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    current_date DATE := CURRENT_DATE;
    checkin_date DATE;
BEGIN
    -- Get the most recent check-in
    SELECT c.date INTO checkin_date
    FROM checkins c
    WHERE c.user_id = p_user_id AND c.completed = TRUE
    ORDER BY c.date DESC
    LIMIT 1;
    
    -- If no check-ins, return 0
    IF checkin_date IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Check if most recent check-in is today or yesterday
    IF checkin_date < current_date - INTERVAL '1 day' THEN
        RETURN 0;
    END IF;
    
    -- Calculate consecutive days
    WHILE checkin_date IS NOT NULL LOOP
        SELECT c.date INTO checkin_date
        FROM checkins c
        WHERE c.user_id = p_user_id 
        AND c.completed = TRUE 
        AND c.date = checkin_date - INTERVAL '1 day';
        
        IF checkin_date IS NOT NULL THEN
            streak_count := streak_count + 1;
        END IF;
    END LOOP;
    
    RETURN streak_count + 1; -- +1 for the most recent check-in
END;
$$ LANGUAGE plpgsql;

-- Function to calculate combined streak
CREATE OR REPLACE FUNCTION calculate_combined_streak()
RETURNS INTEGER AS $$
DECLARE
    user1_streak INTEGER;
    user2_streak INTEGER;
BEGIN
    -- Get streaks for both users
    SELECT calculate_individual_streak('bilge') INTO user1_streak;
    SELECT calculate_individual_streak('domenica') INTO user2_streak;
    
    -- Return minimum of both streaks
    RETURN LEAST(user1_streak, user2_streak);
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE matcha_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations for authenticated users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON problems
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON checkins
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON matcha_log
    FOR ALL USING (true);
