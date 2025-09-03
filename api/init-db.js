// API endpoint to initialize the database
// POST /api/init-db

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        current_streak INTEGER DEFAULT 0,
        total_solved INTEGER DEFAULT 0,
        total_matcha_owed INTEGER DEFAULT 0,
        daily_challenges JSONB DEFAULT '{}',
        activity_history JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Insert default users if they don't exist
    await sql`
      INSERT INTO users (user_id, name, current_streak, total_solved, total_matcha_owed, daily_challenges, activity_history)
      VALUES 
        ('bilge', 'Bilge', 0, 0, 0, '{}', '[]'),
        ('domenica', 'Domenica', 0, 0, 0, '{}', '[]')
      ON CONFLICT (user_id) DO NOTHING
    `;

    res.status(200).json({ 
      success: true, 
      message: 'Database initialized successfully'
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
}