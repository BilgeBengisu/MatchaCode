// checkins.js - Check-in logic for MatchaCode
// Handles challenge completion, streak calculations, and activity tracking

class CheckinManager {
    constructor() {
        // This will be initialized by the main app
    }

    // Mark a challenge as complete for a specific user
    async markChallengeComplete(userId) {
        if (!window.matchaApp) {
            console.error('Main app not available');
            return;
        }

        const user = window.matchaApp.data.users[userId];
        const today = window.matchaApp.getTodayKey();
        
        if (user.dailyChallenges[today]?.completed) {
            return; // Already completed
        }

        // Mark as completed
        user.dailyChallenges[today] = {
            completed: true,
            timestamp: new Date().toISOString()
        };

        // Update stats
        user.totalSolved++;
        user.currentStreak = this.calculateIndividualStreak(user);

        // Add to activity
        this.addActivity(user, 'Completed today\'s LeetCode challenge!', 'completed');

        // Save to Supabase
        try {
            await window.matchaSupabaseAPI.updateChallenge(userId, today, true, new Date().toISOString());
            await window.matchaSupabaseAPI.updateStreak(userId, user.currentStreak, user.totalMatchaOwed);
            await window.matchaSupabaseAPI.addActivity(userId, 'Completed today\'s LeetCode challenge!', 'completed');
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            // Fallback to localStorage
            if (window.matchaApp) {
                window.matchaApp.saveData();
            }
        }

        // Update UI
        if (window.uiManager) {
            window.uiManager.updateUI();
        }

        // Show success modal
        if (window.modalManager) {
            window.modalManager.showSuccessModal();
        }
    }

    // Calculate individual streak for a user
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

    // Calculate combined streak (both users complete on same day)
    calculateCombinedStreak() {
        if (!window.matchaApp) return 0;

        const bilge = window.matchaApp.data.users.bilge;
        const domenica = window.matchaApp.data.users.domenica;
        
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

    // Check for missed days and update matcha owed
    checkForMissedDays() {
        if (!window.matchaApp) return;

        // Define the start date: September 3rd, 2025
        const startDate = new Date('2025-09-03');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        // Check each user for missed days from September 3rd to yesterday
        ['bilge', 'domenica'].forEach(userId => {
            const user = window.matchaApp.data.users[userId];
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
        if (window.matchaApp) {
            window.matchaApp.saveData();
        }
    }

    // Add activity to user's history
    addActivity(user, description, type) {
        user.activityHistory.push({
            description,
            type,
            date: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        });
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
}

// Initialize checkin manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.checkinManager = new CheckinManager();
});
