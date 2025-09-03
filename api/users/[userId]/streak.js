// API endpoint to update user streak
// POST /api/users/[userId]/streak

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentStreak, totalMatchaOwed } = req.body;

    // Update user streak in database
    await sql`
      UPDATE users 
      SET 
        current_streak = ${currentStreak || 0},
        total_matcha_owed = ${totalMatchaOwed || 0},
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    res.status(200).json({ 
      success: true, 
      message: 'Streak updated successfully'
    });

  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
}