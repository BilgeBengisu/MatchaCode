// API Service for MatchaCode
// Handles all database operations through Vercel API endpoints

class MatchaCodeAPI {
    constructor() {
        this.baseURL = '/api';
    }

    // Get all user data
    async getAllUsers() {
        try {
            const response = await fetch(`${this.baseURL}/users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to localStorage if API fails
            return this.getFallbackData();
        }
    }

    // Update user challenge
    async updateChallenge(userId, date, completed, timestamp) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/challenges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date,
                    completed: completed,
                    timestamp: timestamp
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating challenge:', error);
            throw error;
        }
    }

    // Update user streak
    async updateStreak(userId, currentStreak, totalMatchaOwed) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/streak`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentStreak: currentStreak,
                    totalMatchaOwed: totalMatchaOwed
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating streak:', error);
            throw error;
        }
    }

    // Add activity
    async addActivity(userId, message, type, timestamp) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    type: type,
                    timestamp: timestamp
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error adding activity:', error);
            throw error;
        }
    }

    // Initialize database
    async initializeDatabase() {
        try {
            const response = await fetch(`${this.baseURL}/init-db`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }

    // Fallback to localStorage if API fails
    getFallbackData() {
        const stored = localStorage.getItem('matchacode_data');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            users: {
                bilge: { name: 'Bilge', currentStreak: 0, totalSolved: 0, totalMatchaOwed: 0, dailyChallenges: {}, activityHistory: [] },
                domenica: { name: 'Domenica', currentStreak: 0, totalSolved: 0, totalMatchaOwed: 0, dailyChallenges: {}, activityHistory: [] }
            }
        };
    }
}

// Create global instance
window.matchaAPI = new MatchaCodeAPI();