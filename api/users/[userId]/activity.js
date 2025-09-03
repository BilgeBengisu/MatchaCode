// API endpoint to add activity for a user
// POST /api/users/[userId]/activity

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, type, timestamp } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing required field: message' });
    }

    // Get current user data
    const { rows: userRows } = await sql`
      SELECT activity_history
      FROM users 
      WHERE user_id = ${userId}
    `;

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];
    const activityHistory = user.activity_history || [];
    
    // Add new activity
    const newActivity = {
      message: message,
      type: type || 'general',
      timestamp: timestamp || new Date().toISOString()
    };

    activityHistory.unshift(newActivity); // Add to beginning

    // Keep only last 50 activities
    if (activityHistory.length > 50) {
      activityHistory.splice(50);
    }

    // Update user in database
    await sql`
      UPDATE users 
      SET 
        activity_history = ${JSON.stringify(activityHistory)},
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    res.status(200).json({ 
      success: true, 
      message: 'Activity added successfully'
    });

  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
}