// Supabase setup for MatchaCode
// This will replace the Vercel Postgres approach

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema for Supabase
export const createTables = async () => {
  const { data, error } = await supabase.rpc('create_matchacode_tables')
  if (error) {
    console.error('Error creating tables:', error)
    return false
  }
  return true
}

// Initialize default users
export const initializeUsers = async () => {
  const { data: existingUsers } = await supabase
    .from('users')
    .select('user_id')
    .in('user_id', ['bilge', 'domenica'])

  if (existingUsers.length === 0) {
    const { error } = await supabase
      .from('users')
      .insert([
        {
          user_id: 'bilge',
          name: 'Bilge',
          current_streak: 0,
          total_solved: 0,
          total_matcha_owed: 0,
          daily_challenges: {},
          activity_history: []
        },
        {
          user_id: 'domenica',
          name: 'Domenica',
          current_streak: 0,
          total_solved: 0,
          total_matcha_owed: 0,
          daily_challenges: {},
          activity_history: []
        }
      ])

    if (error) {
      console.error('Error initializing users:', error)
      return false
    }
  }
  return true
}