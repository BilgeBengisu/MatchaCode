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
create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  checkin_date date not null,
  problem_completed text check (problem_completed in ('yes', 'attempted', 'no')),
  problem_title text,
  problem_level text check (problem_level in ('easy', 'medium', 'hard')),
  is_completed boolean default false,  -- set true once user submits their daily challenge
  created_at timestamp default now(),
  unique(user_id, checkin_date)  -- one check-in per user per day
);

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

-- problems table count
CREATE OR REPLACE FUNCTION total_problem_count()
RETURNS bigint
LANGUAGE sql
AS $$
    SELECT COUNT(*)::bigint AS total_problem_count
    FROM problems
    WHERE solved = true;
$$;

-- problems insert policy 
CREATE POLICY "Problems insert allowed"
ON problems
FOR INSERT
WITH CHECK (auth.uid() = username);

-- increment user streak by 1 function
create or replace function increment_streak(p_user_id text)
returns void
language plpgsql
security definer
as $$
begin
  update users
  set streak = streak + 1,
      last_checkin = current_date
  where user_id = p_user_id;
end;
$$;

grant execute on function increment_streak(text) to authenticated;

-- 1) Function: update_daily_streaks()
CREATE OR REPLACE FUNCTION public.update_daily_streaks()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  usr RECORD;
  has_activity boolean;
  activity_date date := (now() at time zone 'utc')::date;
BEGIN
  FOR usr IN SELECT id, streak FROM public.users LOOP
    -- Check if there's any activity today in either table for this user
    SELECT EXISTS (
      SELECT 1 FROM public.problems p
      WHERE p.user_id = usr.id
        AND (p.created_at AT TIME ZONE 'utc')::date = activity_date
      UNION
      SELECT 1 FROM public.studies s
      WHERE s.user_id = usr.id
        AND (s.created_at AT TIME ZONE 'utc')::date = activity_date
    ) INTO has_activity;

    IF has_activity THEN
      -- Increment streak
      UPDATE public.users
      SET streak = COALESCE(usr.streak, 0) + 1
      WHERE id = usr.id;
    ELSE
      -- Reset streak
      UPDATE public.users
      SET streak = 0
      WHERE id = usr.id;
    END IF;
  END LOOP;
END;
$$;

-- 2) Function: decrement_matcha_owed(p_user_id text)
CREATE OR REPLACE FUNCTION decrement_matcha_owed(p_user_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET matcha_owed = GREATEST(matcha_owed - 1, 0)
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION decrement_matcha_owed(text) TO authenticated;