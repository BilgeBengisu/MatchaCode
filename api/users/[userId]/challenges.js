// API endpoint to update user challenges
// POST /api/users/[userId]/challenges

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, completed, timestamp } = req.body;

    if (!date || completed === undefined) {
      return res.status(400).json({ error: 'Missing required fields: date, completed' });
    }

    // Get current user data
    const { rows: userRows } = await sql`
      SELECT daily_challenges, total_solved, current_streak
      FROM users 
      WHERE user_id = ${userId}
    `;

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];
    const dailyChallenges = user.daily_challenges || {};
    
    // Update the specific date
    dailyChallenges[date] = {
      completed: completed,
      timestamp: timestamp || new Date().toISOString()
    };

    // Calculate new totals
    const completedDates = Object.keys(dailyChallenges).filter(date => 
      dailyChallenges[date]?.completed
    );
    const newTotalSolved = completedDates.length;

    // Update user in database
    await sql`
      UPDATE users 
      SET 
        daily_challenges = ${JSON.stringify(dailyChallenges)},
        total_solved = ${newTotalSolved},
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    res.status(200).json({ 
      success: true, 
      message: 'Challenge updated successfully',
      totalSolved: newTotalSolved
    });

  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ error: 'Failed to update challenge' });
  }
}