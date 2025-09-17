// script.js - Core app logic and initialization for MatchaCode
// Main application class that coordinates all modules

class MatchaCodeApp {
    constructor() {
        this.data = {
            users: {
                bilge: {
                    name: 'Bilge',
                    currentStreak: 0,
                    totalSolved: 0,
                    totalMatchaOwed: 0,
                    dailyChallenges: {},
                    activityHistory: []
                },
                domenica: {
                    name: 'Domenica',
                    currentStreak: 0,
                    totalSolved: 0,
                    totalMatchaOwed: 0,
                    dailyChallenges: {},
                    activityHistory: []
                }
            }
        };
    }

    async init() {
        await this.loadData();
        this.updateUI();
        this.setupEventListeners();
    }

    // Data Management
    async loadData() {
        try {
            // Try to load from Supabase first
            const supabaseData = await window.matchaSupabaseAPI.getAllUsers();
            
            if (supabaseData && supabaseData.users) {
                this.data = supabaseData;
            } else {
                throw new Error('No data from Supabase');
            }
        } catch (error) {
            console.error('❌ Error loading from Supabase, falling back to localStorage:', error);
            // Fallback to localStorage
            const savedData = localStorage.getItem('matchacode_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Merge with default structure to handle new users
                this.data.users = { ...this.data.users, ...parsedData.users };
            }
        }
        
        // Migrate old UTC-based date keys to local timezone format
        this.migrateDateKeys();
    }

    migrateDateKeys() {
        let migrationNeeded = false;
        
        for (const userId in this.data.users) {
            const user = this.data.users[userId];
            const newDailyChallenges = {};
            
            for (const dateKey in user.dailyChallenges) {
                // Check if this is an old UTC-based date key
                if (dateKey.includes('T') || dateKey.length > 10) {
                    console.log('Found old date key format:', dateKey);
                    migrationNeeded = true;
                    
                    // Convert to local date
                    const date = new Date(dateKey);
                    const newDateKey = this.getDateKey(date);
                    newDailyChallenges[newDateKey] = user.dailyChallenges[dateKey];
                } else {
                    // Keep existing local date keys
                    newDailyChallenges[dateKey] = user.dailyChallenges[dateKey];
                }
            }
            
            user.dailyChallenges = newDailyChallenges;
        }
        
        if (migrationNeeded) {
            console.log('Date key migration completed, saving data...');
            this.saveData();
        }
    }

    async saveData() {
        try {
            // Save to Supabase
            for (const userId in this.data.users) {
                const user = this.data.users[userId];
                await window.matchaSupabaseAPI.updateStreak(
                    userId, 
                    user.currentStreak, 
                    user.totalMatchaOwed
                );
            }
            console.log('Data saved to Supabase');
        } catch (error) {
            console.error('Error saving to Supabase, falling back to localStorage:', error);
            // Fallback to localStorage
            localStorage.setItem('matchacode_data', JSON.stringify(this.data));
        }
    }

    resetAllData() {
        // Clear localStorage
        localStorage.removeItem('matchacode_data');
        
        // Reset to default data structure
        this.data = {
            users: {
                bilge: {
                    name: 'Bilge',
                    currentStreak: 0,
                    totalSolved: 0,
                    totalMatchaOwed: 0,
                    dailyChallenges: {},
                    activityHistory: []
                },
                domenica: {
                    name: 'Domenica',
                    currentStreak: 0,
                    totalSolved: 0,
                    totalMatchaOwed: 0,
                    dailyChallenges: {},
                    activityHistory: []
                }
            }
        };
        
        // Save the reset data
        this.saveData();
        
        // Update UI
        this.updateUI();
        
        console.log('All data has been reset to default state');
    }

    // UI Updates - delegate to UIManager
    updateUI() {
        if (window.uiManager) {
            window.uiManager.updateUI();
        }
        if (window.checkinManager) {
            window.checkinManager.checkForMissedDays();
        }
    }

    // Helper Methods
    getTodayKey() {
        const today = new Date();
        // Use local timezone instead of UTC to ensure correct daily boundaries
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone
    }

    getDateKey(date) {
        // Helper function to get date key for any date object
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Event Listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');

        // Add storage event listener for tab synchronization
        window.addEventListener('storage', (e) => {
            if (e.key === 'matchacode_data') {
                console.log('Data changed in another tab, reloading...');
                this.loadData();
                this.updateUI();
            }
        });
    }
}

// Global functions for HTML onclick handlers
function showAuthModal(user, actionType) {
    if (window.authManager) {
        window.authManager.showAuthModal(user, actionType);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    window.matchaApp = new MatchaCodeApp();
    await window.matchaApp.init();
    
    // Add some fun easter eggs
    document.addEventListener('keydown', (e) => {
        // Konami code easter egg
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            console.log('🎮 Konami code detected! Keep coding!');
        }
    });

    // Add a fun console message
    console.log(`
        🍵 Welcome to MatchaCode! 🍵
        Daily LeetCode Challenge Tracker

        Built with ❤️ for Bilge and Domenica
        Keep up the great work! 💪
    `);
});