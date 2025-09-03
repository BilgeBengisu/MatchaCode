-- MatchaCode Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create the users table
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  total_solved INTEGER DEFAULT 0,
  total_matcha_owed INTEGER DEFAULT 0,
  daily_challenges JSONB DEFAULT '{}',
  activity_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default users (Bilge and Domenica)
INSERT INTO users (user_id, name, current_streak, total_solved, total_matcha_owed, daily_challenges, activity_history)
VALUES 
  ('bilge', 'Bilge', 0, 0, 0, '{}', '[]'),
  ('domenica', 'Domenica', 0, 0, 0, '{}', '[]');

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "public can read users"
ON public.users
FOR SELECT TO anon
USING (true);

-- Create policy to allow public insert/update access
CREATE POLICY "public can insert users"
ON public.users
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "public can update users"
ON public.users
FOR UPDATE TO anon
USING (true);

-- Create an index for better performance
CREATE INDEX idx_users_updated_at ON users(updated_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();