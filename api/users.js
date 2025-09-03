// API endpoint to get all user data
// GET /api/users

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all users from database
    const { rows } = await sql`
      SELECT 
        user_id,
        name,
        current_streak,
        total_solved,
        total_matcha_owed,
        daily_challenges,
        activity_history,
        created_at,
        updated_at
      FROM users 
      ORDER BY created_at ASC
    `;

    // Transform data to match frontend format
    const users = {};
    rows.forEach(row => {
      users[row.user_id] = {
        name: row.name,
        currentStreak: row.current_streak,
        totalSolved: row.total_solved,
        totalMatchaOwed: row.total_matcha_owed,
        dailyChallenges: row.daily_challenges || {},
        activityHistory: row.activity_history || []
      };
    });

    // Return data in the same format as localStorage
    const response = {
      users: users
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}