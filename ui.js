// ui.js - DOM manipulation and rendering for MatchaCode
// Handles all UI updates, rendering, and DOM interactions

class UIManager {
    constructor() {
        // This will be initialized by the main app
    }

    // Main UI update method
    updateUI() {
        this.updateStats();
        this.updateUserCards();
        this.updateCheckinCards();
        this.updateActivityList();
        this.updateDate();
    }

    // Update overview statistics
    updateStats() {
        if (!window.matchaApp) return;

        const bilge = window.matchaApp.data.users.bilge;
        const domenica = window.matchaApp.data.users.domenica;
        
        // Calculate combined streak - only increases when both users complete on the same day
        const combinedStreak = this.calculateCombinedStreak();
        const totalSolved = bilge.totalSolved + domenica.totalSolved;
        
        // Calculate total matcha owed
        const totalMatchaOwed = (bilge.totalMatchaOwed || 0) + (domenica.totalMatchaOwed || 0);

        const totalStreakElement = document.getElementById('totalStreak');
        const totalSolvedElement = document.getElementById('totalSolved');
        const totalMatchaElement = document.getElementById('totalMatchaOwed');

        if (totalStreakElement) {
            totalStreakElement.textContent = combinedStreak;
        }
        if (totalSolvedElement) {
            totalSolvedElement.textContent = totalSolved;
        }
        if (totalMatchaElement) {
            totalMatchaElement.textContent = totalMatchaOwed;
        }
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

    // Update user cards with current stats
    updateUserCards() {
        if (!window.matchaApp) return;

        const bilge = window.matchaApp.data.users.bilge;
        const domenica = window.matchaApp.data.users.domenica;

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
        if (bilgeSolved) bilgeSolved.textContent = bilge.totalSolved;
        if (bilgeMatcha) {
            bilgeMatcha.textContent = bilge.totalMatchaOwed || 0;
        }

        // Update Domenica's stats in the check-in card
        const domenicaStreak = document.getElementById('domenicaStreak');
        const domenicaSolved = document.getElementById('domenicaSolved');
        const domenicaMatcha = document.getElementById('domenicaMatcha');
        
        if (domenicaStreak) {
            domenicaStreak.textContent = domenica.currentStreak;
        }
        if (domenicaSolved) domenicaSolved.textContent = domenica.totalSolved;
        if (domenicaMatcha) {
            domenicaMatcha.textContent = domenica.totalMatchaOwed || 0;
        }
    }

    // Update check-in cards based on completion status
    updateCheckinCards() {
        if (!window.matchaApp) return;

        const bilge = window.matchaApp.data.users.bilge;
        const domenica = window.matchaApp.data.users.domenica;
        const today = this.getTodayKey();

        console.log('updateCheckinCards - Today:', today);
        console.log('updateCheckinCards - Bilge completed:', bilge.dailyChallenges[today]?.completed);
        console.log('updateCheckinCards - Domenica completed:', domenica.dailyChallenges[today]?.completed);

        // Update Bilge's check-in card styling based on completion status
        const bilgeCheckinCard = document.getElementById('bilgeCheckinCard');
        const bilgeCheckinStatus = document.getElementById('bilgeCheckinStatus');
        
        console.log('Bilge elements found:', { card: !!bilgeCheckinCard, status: !!bilgeCheckinStatus });
        
        if (bilgeCheckinCard && bilgeCheckinStatus) {
            if (bilge.dailyChallenges[today]?.completed) {
                console.log('Updating Bilge card to completed state');
                bilgeCheckinCard.style.borderColor = '#4CAF50';
                bilgeCheckinCard.style.backgroundColor = '#f1f8e9';
                bilgeCheckinStatus.textContent = 'Completed today\'s challenge! ✅';
                bilgeCheckinStatus.className = 'user-checkin-status completed';
            } else {
                console.log('Updating Bilge card to not completed state');
                bilgeCheckinCard.style.borderColor = '#e1e8ed';
                bilgeCheckinCard.style.backgroundColor = '#f8f9fa';
                bilgeCheckinStatus.textContent = 'Not checked in today';
                bilgeCheckinStatus.className = 'user-checkin-status';
            }
        }

        // Update Domenica's check-in card styling based on completion status
        const domenicaCheckinCard = document.getElementById('domenicaCheckinCard');
        const domenicaCheckinStatus = document.getElementById('domenicaCheckinStatus');
        
        console.log('Domenica elements found:', { card: !!domenicaCheckinCard, status: !!domenicaCheckinStatus });
        
        if (domenicaCheckinCard && domenicaCheckinStatus) {
            if (domenica.dailyChallenges[today]?.completed) {
                console.log('Updating Domenica card to completed state');
                domenicaCheckinCard.style.borderColor = '#4CAF50';
                domenicaCheckinCard.style.backgroundColor = '#f1f8e9';
                domenicaCheckinStatus.textContent = 'Completed today\'s challenge! ✅';
                domenicaCheckinStatus.className = 'user-checkin-status completed';
            } else {
                console.log('Updating Domenica card to not completed state');
                domenicaCheckinCard.style.borderColor = '#e1e8ed';
                domenicaCheckinCard.style.backgroundColor = '#f8f9fa';
                domenicaCheckinStatus.textContent = 'Not checked in today';
                domenicaCheckinStatus.className = 'user-checkin-status';
            }
        }
    }

    // Update the date display
    updateDate() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = today.toLocaleDateString('en-US', options);
        
        const dateElement = document.getElementById('todayDate');
        if (dateElement) {
            dateElement.textContent = formattedDate;
        }
    }

    // Update activity list
    updateActivityList() {
        if (!window.matchaApp) return;

        const activityList = document.getElementById('activityList');
        const template = document.getElementById('activityItemTemplate');
        const allActivityHistory = [];
        
        // Combine activity history from both users
        Object.values(window.matchaApp.data.users).forEach(user => {
            user.activityHistory.forEach(entry => {
                allActivityHistory.push({
                    ...entry,
                    user: user.name
                });
            });
        });

        if (allActivityHistory.length === 0) {
            // Show empty state (already in HTML)
            const emptyState = activityList.querySelector('.empty-state');
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        // Hide empty state
        const emptyState = activityList.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Clear existing activity items
        const existingItems = activityList.querySelectorAll('.activity-item');
        existingItems.forEach(item => item.remove());

        // Create activity items using template
        const recentActivities = allActivityHistory
            .slice(-3) // Show last 3 entries
            .reverse();

        recentActivities.forEach(entry => {
            const clone = template.content.cloneNode(true);
            const description = clone.querySelector('.item-description');
            const date = clone.querySelector('.item-date');
            
            description.textContent = `${entry.user}: ${entry.description}`;
            date.textContent = entry.date;
            
            activityList.appendChild(clone);
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

// Initialize UI manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});
