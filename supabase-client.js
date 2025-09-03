// Supabase client for MatchaCode
// Browser-compatible version using fetch API

// Supabase configuration
const supabaseUrl = 'https://snuczmeitmylhxdlabhb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudWN6bWVpdG15bGh4ZGxhYmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTYzNTksImV4cCI6MjA3MjQ5MjM1OX0.pfgQ3Q-vWfp1ODB9YIxnygtA4MvnnZE0HXrlHgeBJRM'

// Create a simple Supabase client
const supabase = {
  supabaseUrl: supabaseUrl,
  supabaseKey: supabaseKey,
  
  async from(table) {
    return {
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: async () => {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Request failed')
            return { data: data[0], error: null }
          }
        }),
        order: (column, options = {}) => ({
          async then(callback) {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&order=${column}.${options.ascending ? 'asc' : 'desc'}`, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Request failed')
            return callback({ data, error: null })
          }
        }),
        async then(callback) {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          })
          const data = await response.json()
          if (!response.ok) throw new Error(data.message || 'Request failed')
          return callback({ data, error: null })
        }
      }),
      update: (updates) => ({
        eq: (column, value) => ({
          async then(callback) {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updates)
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Request failed')
            return callback({ data, error: null })
          }
        })
      })
    }
  }
}

// MatchaCode API functions using Supabase
class MatchaCodeSupabaseAPI {
    constructor() {
        this.supabase = supabase
    }

    // Get all user data
    async getAllUsers() {
        try {
            const result = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: true })

            const { data, error } = result

            if (error) {
                throw error
            }

            // Transform data to match frontend format
            const users = {}
            data.forEach(row => {
                users[row.user_id] = {
                    name: row.name,
                    currentStreak: row.current_streak,
                    totalSolved: row.total_solved,
                    totalMatchaOwed: row.total_matcha_owed,
                    dailyChallenges: row.daily_challenges || {},
                    activityHistory: row.activity_history || []
                }
            })

            return { users }
        } catch (error) {
            console.error('Error fetching users:', error)
            // Fallback to localStorage
            return this.getFallbackData()
        }
    }

    // Update user challenge
    async updateChallenge(userId, date, completed, timestamp) {
        try {
            // Get current user data
            const fetchResult = await this.supabase
                .from('users')
                .select('daily_challenges, total_solved')
                .eq('user_id', userId)
                .single()

            const { data: userData, error: fetchError } = fetchResult

            if (fetchError) {
                throw fetchError
            }

            const dailyChallenges = userData.daily_challenges || {}
            
            // Update the specific date
            dailyChallenges[date] = {
                completed: completed,
                timestamp: timestamp || new Date().toISOString()
            }

            // Calculate new totals
            const completedDates = Object.keys(dailyChallenges).filter(date => 
                dailyChallenges[date]?.completed
            )
            const newTotalSolved = completedDates.length

            // Update user in database
            const updateResult = await this.supabase
                .from('users')
                .update({
                    daily_challenges: dailyChallenges,
                    total_solved: newTotalSolved,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)

            const { error: updateError } = updateResult

            if (updateError) {
                throw updateError
            }

            return { 
                success: true, 
                message: 'Challenge updated successfully',
                totalSolved: newTotalSolved
            }
        } catch (error) {
            console.error('Error updating challenge:', error)
            throw error
        }
    }

    // Update user streak
    async updateStreak(userId, currentStreak, totalMatchaOwed) {
        try {
            const result = await this.supabase
                .from('users')
                .update({
                    current_streak: currentStreak || 0,
                    total_matcha_owed: totalMatchaOwed || 0,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)

            const { error } = result

            if (error) {
                throw error
            }

            return { 
                success: true, 
                message: 'Streak updated successfully'
            }
        } catch (error) {
            console.error('Error updating streak:', error)
            throw error
        }
    }

    // Add activity
    async addActivity(userId, message, type, timestamp) {
        try {
            // Get current user data
            const fetchResult = await this.supabase
                .from('users')
                .select('activity_history')
                .eq('user_id', userId)
                .single()

            const { data: userData, error: fetchError } = fetchResult

            if (fetchError) {
                throw fetchError
            }

            const activityHistory = userData.activity_history || []
            
            // Add new activity
            const newActivity = {
                message: message,
                type: type || 'general',
                timestamp: timestamp || new Date().toISOString()
            }

            activityHistory.unshift(newActivity) // Add to beginning

            // Keep only last 50 activities
            if (activityHistory.length > 50) {
                activityHistory.splice(50)
            }

            // Update user in database
            const updateResult = await this.supabase
                .from('users')
                .update({
                    activity_history: activityHistory,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)

            const { error: updateError } = updateResult

            if (updateError) {
                throw updateError
            }

            return { 
                success: true, 
                message: 'Activity added successfully'
            }
        } catch (error) {
            console.error('Error adding activity:', error)
            throw error
        }
    }

    // Fallback to localStorage if Supabase fails
    getFallbackData() {
        const stored = localStorage.getItem('matchacode_data')
        if (stored) {
            return JSON.parse(stored)
        }
        return {
            users: {
                bilge: { name: 'Bilge', currentStreak: 0, totalSolved: 0, totalMatchaOwed: 0, dailyChallenges: {}, activityHistory: [] },
                domenica: { name: 'Domenica', currentStreak: 0, totalSolved: 0, totalMatchaOwed: 0, dailyChallenges: {}, activityHistory: [] }
            }
        }
    }
}

// Create global instance
window.matchaSupabaseAPI = new MatchaCodeSupabaseAPI()