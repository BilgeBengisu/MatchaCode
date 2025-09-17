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
            console.error('Error loading from Supabase, falling back to localStorage:', error);
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
        this.updateStats();
        this.updateUserCards();
        this.updateCheckinCards();
        this.updateActivityList();
        this.updateDate();
        this.checkForMissedDays();
    }

    async updateStats() {
        const { data, error } = await supabase.rpc('get_dashboard');

        if (error) {
            console.error('Failed to fetch dashboard:', error);
            return;
        }

        // Map users by ID
        const usersMap = {};
        data.forEach(user => {
            usersMap[user.user_id.toLowerCase()] = {
                totalSolved: user.total_solved,
                totalMatchaOwed: user.matcha_owed,
                currentStreak: user.current_streak,
                recentActivities: user.recent_activities
            };
        });

        const bilge = usersMap['bilge'] || {};
        const domenica = usersMap['domenica'] || {};

        // Combined streak: take the minimum of both users' current streaks
        const combinedStreak = Math.min(bilge.currentStreak || 0, domenica.currentStreak || 0);

        // Total solved
        const totalSolved = (bilge.totalSolved || 0) + (domenica.totalSolved || 0);

        // Total matcha owed
        const totalMatchaOwed = (bilge.totalMatchaOwed || 0) + (domenica.totalMatchaOwed || 0);

        // Update DOM elements
        const totalStreakElement = document.getElementById('totalStreak');
        const totalSolvedElement = document.getElementById('totalSolved');
        const totalMatchaElement = document.getElementById('totalMatchaOwed');

        if (totalStreakElement) totalStreakElement.textContent = combinedStreak;
        if (totalSolvedElement) totalSolvedElement.textContent = totalSolved;
        if (totalMatchaElement) totalMatchaElement.textContent = totalMatchaOwed;
    }


    calculateCombinedStreak() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;
        
        // Get all dates where both users completed challenges
        const bilgeDates = Object.keys(bilge.dailyChallenges).filter(date => 
            bilge.dailyChallenges[date]?.completed
        );
        const domenicaDates = Object.keys(domenica.dailyChallenges).filter(date => 
            domenica.dailyChallenges[date]?.completed
        );
        
        // Find dates where both completed
        const bothCompletedDates = bilgeDates.filter(date => domenicaDates.includes(date));
        
        if (bothCompletedDates.length === 0) {
            return 0;
        }
        
        // Sort dates in descending order (most recent first)
        bothCompletedDates.sort((a, b) => new Date(b) - new Date(a));
        
        // Calculate consecutive days from the most recent completion backwards
        let streak = 1; // Start with 1 for the most recent completion
        const mostRecentDate = new Date(bothCompletedDates[0]);
        
        for (let i = 1; i < bothCompletedDates.length; i++) {
            const currentDate = new Date(bothCompletedDates[i]);
            const expectedDate = new Date(mostRecentDate);
            expectedDate.setDate(mostRecentDate.getDate() - i);
            
            // Check if this date is exactly one day before the previous date
            if (this.getDateKey(currentDate) === this.getDateKey(expectedDate)) {
                streak++;
            } else {
                break; // Streak broken
            }
        }
        
        
        return streak;
    }

    calculateIndividualStreak(user) {
        // Get all dates where user completed challenges
        const completedDates = Object.keys(user.dailyChallenges).filter(date => 
            user.dailyChallenges[date]?.completed
        );
        
        if (completedDates.length === 0) {
            return 0;
        }
        
        // Sort dates in descending order (most recent first)
        completedDates.sort((a, b) => new Date(b) - new Date(a));
        
        const today = this.getTodayKey();
        const yesterday = this.getDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
        
        // Check if the most recent completion is today or yesterday
        const mostRecentDate = completedDates[0];
        if (mostRecentDate !== today && mostRecentDate !== yesterday) {
            // Most recent completion is not today or yesterday, streak is 0
            return 0;
        }
        
        // Calculate consecutive days from the most recent completion backwards
        let streak = 1; // Start with 1 for the most recent completion
        const mostRecentDateObj = new Date(mostRecentDate);
        
        for (let i = 1; i < completedDates.length; i++) {
            const currentDate = new Date(completedDates[i]);
            const expectedDate = new Date(mostRecentDateObj);
            expectedDate.setDate(mostRecentDateObj.getDate() - i);
            
            // Check if this date is exactly one day before the previous date
            if (this.getDateKey(currentDate) === this.getDateKey(expectedDate)) {
                streak++;
            } else {
                break; // Streak broken
            }
        }
        
        
        return streak;
    }

    checkForMissedDays() {
        // Define the start date: September 3rd, 2025
        const startDate = new Date('2025-09-03');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        // Check each user for missed days from September 3rd to yesterday
        ['bilge', 'domenica'].forEach(userId => {
            const user = this.data.users[userId];
            let missedDays = 0;
            
            // Check each day from September 3rd to yesterday
            const checkDate = new Date(startDate);
            
            while (checkDate <= yesterday) {
                const checkDateKey = this.getDateKey(checkDate);
                
                // If this day is not completed and not already marked as missed
                if (!user.dailyChallenges[checkDateKey]?.completed && 
                    !user.dailyChallenges[checkDateKey]?.missed) {
                    
                    console.log(`${user.name} missed day: ${checkDateKey}`);
                    
                    // Mark as missed
                    user.dailyChallenges[checkDateKey] = {
                        completed: false,
                        missed: true,
                        timestamp: new Date().toISOString()
                    };
                    
                    missedDays++;
                }
                
                // Move to next day
                checkDate.setDate(checkDate.getDate() + 1);
            }
            
            // Update matcha owed count
            if (missedDays > 0) {
                user.totalMatchaOwed = (user.totalMatchaOwed || 0) + missedDays;
                console.log(`${user.name} missed ${missedDays} days - now owes ${user.totalMatchaOwed} matcha(s)`);
                
                // Add to activity history
                this.addActivity(user, `Missed ${missedDays} LeetCode challenge(s) from Sep 3rd to yesterday - owes ${missedDays} matcha!`, 'missed');
            }
        });
        
        // Save data if any changes were made
        this.saveData();
    }

    updateUserCards() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;
        const today = this.getTodayKey();

        console.log('Updating user cards with streaks:', {
            bilge: bilge.currentStreak,
            domenica: domenica.currentStreak
        });

        // Update Bilge's stats in the check-in card
        const bilgeStreak = document.getElementById('bilgeStreak');
        const bilgeSolved = document.getElementById('bilgeSolved');
        const bilgeMatcha = document.getElementById('bilgeMatcha');
        
        if (bilgeStreak) {
            bilgeStreak.textContent = bilge.currentStreak;
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