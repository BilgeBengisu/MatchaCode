// MatchaCode - Daily LeetCode Challenge Tracker
// Two-user system: Bilge and Domenica with authentication

class MatchaCodeApp {
    constructor() {
        this.pendingAction = null; // Stores the pending action (user, type)
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
        
        // Get password from environment configuration
        this.accessPassword = window.MATCHACODE_CONFIG?.accessPassword || 'matcha2024';
        
        this.init();
    }

    init() {
        this.loadData();
        this.updateUI();
    }

    // Data Management
    loadData() {
        const savedData = localStorage.getItem('matchacode_data');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Merge with default structure to handle new users
            this.data.users = { ...this.data.users, ...parsedData.users };
            
            // Migrate old UTC-based date keys to local timezone format
            this.migrateDateKeys();
        }
    }

    migrateDateKeys() {
        console.log('Checking for date key migration...');
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

    saveData() {
        localStorage.setItem('matchacode_data', JSON.stringify(this.data));
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

    // UI Updates
    updateUI() {
        console.log('updateUI called');
        console.log('Updating stats...');
        this.updateStats();
        console.log('Updating user cards...');
        this.updateUserCards();
        console.log('Updating check-in cards...');
        this.updateCheckinCards();
        console.log('Updating activity list...');
        this.updateActivityList();
        console.log('Updating date...');
        this.updateDate();
        console.log('Checking for missed days...');
        this.checkForMissedDays();
        console.log('updateUI completed');
    }

    updateStats() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;
        
        // Calculate combined streak - only increases when both users complete on the same day
        const combinedStreak = this.calculateCombinedStreak();
        const totalSolved = bilge.totalSolved + domenica.totalSolved;
        
        // Calculate total matcha owed
        const totalMatchaOwed = (bilge.totalMatchaOwed || 0) + (domenica.totalMatchaOwed || 0);

        console.log('Stats update - Bilge:', { streak: bilge.currentStreak, solved: bilge.totalSolved, matchaOwed: bilge.totalMatchaOwed || 0 });
        console.log('Stats update - Domenica:', { streak: domenica.currentStreak, solved: domenica.totalSolved, matchaOwed: domenica.totalMatchaOwed || 0 });
        console.log('Stats update - Combined streak:', combinedStreak);
        console.log('Stats update - Total solved:', totalSolved);
        console.log('Stats update - Total matcha owed:', totalMatchaOwed);

        const totalStreakElement = document.getElementById('totalStreak');
        const totalSolvedElement = document.getElementById('totalSolved');
        const totalMatchaElement = document.getElementById('totalMatchaOwed');

        if (totalStreakElement) {
            totalStreakElement.textContent = combinedStreak;
            console.log('Updated totalStreak to:', combinedStreak);
        }
        if (totalSolvedElement) {
            totalSolvedElement.textContent = totalSolved;
            console.log('Updated totalSolved to:', totalSolved);
        }
        if (totalMatchaElement) {
            totalMatchaElement.textContent = totalMatchaOwed;
            console.log('Updated totalMatchaOwed to:', totalMatchaOwed);
        }
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
        
        console.log('Combined streak calculation:', {
            bilgeDates,
            domenicaDates,
            bothCompletedDates,
            mostRecentDate: this.getDateKey(mostRecentDate),
            streak
        });
        
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
        
        // Calculate consecutive days from the most recent completion backwards
        let streak = 1; // Start with 1 for the most recent completion
        const mostRecentDate = new Date(completedDates[0]);
        
        for (let i = 1; i < completedDates.length; i++) {
            const currentDate = new Date(completedDates[i]);
            const expectedDate = new Date(mostRecentDate);
            expectedDate.setDate(mostRecentDate.getDate() - i);
            
            // Check if this date is exactly one day before the previous date
            if (this.getDateKey(currentDate) === this.getDateKey(expectedDate)) {
                streak++;
            } else {
                break; // Streak broken
            }
        }
        
        console.log('Individual streak calculation for', user.name, ':', {
            completedDates,
            mostRecentDate: this.getDateKey(mostRecentDate),
            streak
        });
        
        return streak;
    }

    checkForMissedDays() {
        console.log('Checking for missed days from September 3rd, 2025 to yesterday...');
        
        // Define the start date: September 3rd, 2025
        const startDate = new Date('2025-09-03');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        console.log('Start date:', startDate.toDateString());
        console.log('Yesterday:', yesterday.toDateString());
        
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

    getImplementationDate() {
        // Find the earliest completion date across both users
        let earliestDate = null;
        
        ['bilge', 'domenica'].forEach(userId => {
            const user = this.data.users[userId];
            const completedDates = Object.keys(user.dailyChallenges).filter(date => 
                user.dailyChallenges[date]?.completed
            );
            
            if (completedDates.length > 0) {
                completedDates.sort((a, b) => new Date(a) - new Date(b));
                const userEarliestDate = new Date(completedDates[0]);
                
                if (!earliestDate || userEarliestDate < earliestDate) {
                    earliestDate = userEarliestDate;
                }
            }
        });
        
        // If no completions exist, use today as implementation date
        if (!earliestDate) {
            earliestDate = new Date();
        }
        
        return earliestDate;
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
            console.log('Set Bilge streak element to:', bilge.currentStreak);
        }
        if (bilgeSolved) bilgeSolved.textContent = bilge.totalSolved;
        if (bilgeMatcha) {
            bilgeMatcha.textContent = bilge.totalMatchaOwed || 0;
            console.log('Set Bilge matcha owed to:', bilge.totalMatchaOwed || 0);
        }

        // Update Domenica's stats in the check-in card
        const domenicaStreak = document.getElementById('domenicaStreak');
        const domenicaSolved = document.getElementById('domenicaSolved');
        const domenicaMatcha = document.getElementById('domenicaMatcha');
        
        if (domenicaStreak) {
            domenicaStreak.textContent = domenica.currentStreak;
            console.log('Set Domenica streak element to:', domenica.currentStreak);
        }
        if (domenicaSolved) domenicaSolved.textContent = domenica.totalSolved;
        if (domenicaMatcha) {
            domenicaMatcha.textContent = domenica.totalMatchaOwed || 0;
            console.log('Set Domenica matcha owed to:', domenica.totalMatchaOwed || 0);
        }
    }

    updateCheckinCards() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;
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

    updateDate() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = today.toLocaleDateString('en-US', options);
        
        // Multiple attempts to find and update the date element
        const updateDateElement = () => {
            const dateElement = document.getElementById('todayDate');
            console.log('Looking for date element:', dateElement);
            if (dateElement) {
                console.log('Found date element, setting to:', formattedDate);
                dateElement.textContent = formattedDate;
                return true;
            }
            return false;
        };
        
        // Try immediately
        if (!updateDateElement()) {
            console.log('Date element not found, trying again...');
            // Try multiple times with increasing delays
            setTimeout(() => updateDateElement(), 50);
            setTimeout(() => updateDateElement(), 100);
            setTimeout(() => updateDateElement(), 200);
            setTimeout(() => updateDateElement(), 500);
        }
    }



    updateActivityList() {
        const activityList = document.getElementById('activityList');
        const allActivityHistory = [];
        
        // Combine activity history from both users
        Object.values(this.data.users).forEach(user => {
            user.activityHistory.forEach(entry => {
                allActivityHistory.push({
                    ...entry,
                    user: user.name
                });
            });
        });

        if (allActivityHistory.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>Start your LeetCode journey today!</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = allActivityHistory
            .slice(-5) // Show last 5 entries
            .reverse()
            .map(entry => `
                <div class="activity-item">
                    <div>
                        <div class="item-description">${entry.user}: ${entry.description}</div>
                        <div class="item-date">${entry.date}</div>
                    </div>
                    <div class="item-status">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
            `).join('');
    }

    // Authentication and Actions
    showAuthModal(user, actionType) {
        console.log('showAuthModal called with:', user, actionType);
        this.pendingAction = { user, actionType };
        
        const userData = this.data.users[user];
        const today = this.getTodayKey();
        
        console.log('=== DEBUG INFO ===');
        console.log('Current time:', new Date().toString());
        console.log('Today key (local):', today);
        console.log('User challenges:', userData.dailyChallenges);
        console.log('Today challenge status:', userData.dailyChallenges[today]);
        console.log('All challenge dates:', Object.keys(userData.dailyChallenges));
        console.log('==================');
        
        // Check if already completed
        if (userData.dailyChallenges[today]?.completed) {
            console.log('User has already completed today\'s challenge');
            alert(`${userData.name} has already completed today's challenge!`);
            return;
        }

        const actionText = 'mark as complete';
        document.getElementById('authModalTitle').textContent = `Check in for ${userData.name}`;
        document.getElementById('authModalMessage').textContent = `Enter the password to ${actionText} today's challenge.`;
        document.getElementById('authPassword').value = '';
        
        document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('authPassword').focus();
        console.log('Auth modal should be visible now');
    }

    authenticate(password) {
        return password === this.accessPassword;
    }

    executePendingAction() {
        console.log('executePendingAction called with:', this.pendingAction);
        if (!this.pendingAction) {
            console.log('No pending action found');
            return;
        }
        
        const { user, actionType } = this.pendingAction;
        console.log('Executing action:', actionType, 'for user:', user);
        
        if (actionType === 'complete') {
            console.log('Calling markChallengeComplete for:', user);
            this.markChallengeComplete(user);
        }
        
        this.pendingAction = null;
    }

    markChallengeComplete(userId) {
        console.log('markChallengeComplete called for user:', userId);
        const user = this.data.users[userId];
        const today = this.getTodayKey();
        
        console.log('User data:', user);
        console.log('Today key:', today);
        console.log('Current challenges:', user.dailyChallenges);
        
        if (user.dailyChallenges[today]?.completed) {
            console.log('Already completed, returning');
            return; // Already completed
        }

        console.log('Marking as completed...');
        // Mark as completed
        user.dailyChallenges[today] = {
            completed: true,
            timestamp: new Date().toISOString()
        };

        // Update stats
        user.totalSolved++;
        user.currentStreak = this.calculateIndividualStreak(user);
        console.log('Updated stats - totalSolved:', user.totalSolved, 'currentStreak:', user.currentStreak);

        // Add to activity
        this.addActivity(user, 'Completed today\'s LeetCode challenge!', 'completed');

        // Save and update UI
        console.log('Saving data...');
        this.saveData();
        console.log('Data saved, updating UI...');
        this.updateUI();
        console.log('UI updated, showing success modal...');
        this.showSuccessModal();
        console.log('markChallengeComplete completed successfully');
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

    // Modal Functions
    showSuccessModal() {
        document.getElementById('successModal').classList.remove('hidden');
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
        // Don't clear pendingAction here - let executePendingAction handle it
    }

    // Event Listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Authentication form
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Auth form submitted');
                const password = document.getElementById('authPassword').value;
                console.log('Password entered:', password);
                
                if (this.authenticate(password)) {
                    console.log('Authentication successful');
                    this.closeAuthModal();
                    this.executePendingAction();
                } else {
                    console.log('Authentication failed');
                    alert('Incorrect password! Hint: It\'s the drink that motivates us to code! 🍵');
                    document.getElementById('authPassword').value = '';
                    document.getElementById('authPassword').focus();
                }
            });
        } else {
            console.error('Auth form not found!');
        }

        // Close modals on outside click
        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target.id === 'successModal') {
                window.closeModal();
            }
        });

        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.closeAuthModal();
            }
        });

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
    window.matchaApp.showAuthModal(user, actionType);
}

function closeAuthModal() {
    window.matchaApp.closeAuthModal();
}

// Manual date update function for testing
function updateDateManually() {
    if (window.matchaApp) {
        window.matchaApp.updateDate();
    } else {
        console.error('MatchaCode app not found');
    }
}

// Reset all data function
function resetAllData() {
    if (window.matchaApp) {
        window.matchaApp.resetAllData();
        console.log('✅ All data has been reset! Ready to start fresh with your friend!');
    } else {
        console.error('MatchaCode app not found');
    }
}

// Debug function to clear all data (accessible from browser console)
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        if (window.matchaApp) {
            window.matchaApp.resetAllData();
            console.log('✅ All data cleared!');
        } else {
            console.error('MatchaCode app not found');
        }
    }
}

// Debug function to inspect current data
function inspectData() {
    if (window.matchaApp) {
        console.log('Current app data:', window.matchaApp.data);
        console.log('LocalStorage data:', localStorage.getItem('matchacode_data'));
    } else {
        console.error('MatchaCode app not found');
    }
}

// Function to add past challenge completions
function addPastCompletions() {
    if (!window.matchaApp) {
        console.error('MatchaCode app not found');
        return;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(today.getDate() - 2);

    const todayKey = window.matchaApp.getDateKey(today);
    const yesterdayKey = window.matchaApp.getDateKey(yesterday);
    const dayBeforeKey = window.matchaApp.getDateKey(dayBefore);

    console.log('Adding past completions for:');
    console.log('- Today:', todayKey);
    console.log('- Yesterday:', yesterdayKey);
    console.log('- Day before:', dayBeforeKey);

    // Add completions for both users for the past two days
    const users = ['bilge', 'domenica'];
    const pastDates = [yesterdayKey, dayBeforeKey];

    pastDates.forEach(dateKey => {
        users.forEach(userId => {
            const user = window.matchaApp.data.users[userId];
            if (!user.dailyChallenges[dateKey]?.completed) {
                user.dailyChallenges[dateKey] = {
                    completed: true,
                    timestamp: new Date(dateKey + 'T12:00:00').toISOString() // Midday timestamp
                };
                user.totalSolved++;
                console.log(`✅ Added completion for ${user.name} on ${dateKey}`);
            } else {
                console.log(`ℹ️ ${user.name} already completed on ${dateKey}`);
            }
        });
    });

    // Recalculate streaks
    users.forEach(userId => {
        const user = window.matchaApp.data.users[userId];
        const oldStreak = user.currentStreak;
        user.currentStreak = window.matchaApp.calculateIndividualStreak(user);
        console.log(`📊 ${user.name} streak: ${oldStreak} → ${user.currentStreak}`);
    });

    // Save and update UI
    window.matchaApp.saveData();
    window.matchaApp.updateUI();
    
    console.log('🔄 UI updated - check the day streak displays');
    
    console.log('🎉 Past completions added successfully!');
    console.log('Updated data:', window.matchaApp.data);
}

// More flexible function to add specific past completions
function addSpecificCompletions(completions) {
    if (!window.matchaApp) {
        console.error('MatchaCode app not found');
        return;
    }

    // Expected format: { date: 'YYYY-MM-DD', users: ['bilge', 'domenica'] }
    // Example: addSpecificCompletions({ date: '2024-09-01', users: ['bilge'] })
    
    if (!completions.date || !completions.users) {
        console.error('Invalid format. Use: { date: "YYYY-MM-DD", users: ["bilge", "domenica"] }');
        return;
    }

    const dateKey = completions.date;
    const users = completions.users;

    console.log(`Adding completions for ${dateKey}:`, users);

    users.forEach(userId => {
        if (['bilge', 'domenica'].includes(userId)) {
            const user = window.matchaApp.data.users[userId];
            if (!user.dailyChallenges[dateKey]?.completed) {
                user.dailyChallenges[dateKey] = {
                    completed: true,
                    timestamp: new Date(dateKey + 'T12:00:00').toISOString()
                };
                user.totalSolved++;
                console.log(`✅ Added completion for ${user.name} on ${dateKey}`);
            } else {
                console.log(`ℹ️ ${user.name} already completed on ${dateKey}`);
            }
        } else {
            console.error(`Invalid user: ${userId}. Use 'bilge' or 'domenica'`);
        }
    });

    // Recalculate streaks for affected users
    users.forEach(userId => {
        if (['bilge', 'domenica'].includes(userId)) {
            const user = window.matchaApp.data.users[userId];
            const oldStreak = user.currentStreak;
            user.currentStreak = window.matchaApp.calculateIndividualStreak(user);
            console.log(`📊 ${user.name} streak: ${oldStreak} → ${user.currentStreak}`);
        }
    });

    // Save and update UI
    window.matchaApp.saveData();
    window.matchaApp.updateUI();
    
    console.log('🔄 UI updated - check the day streak displays');
    
    console.log('🎉 Specific completions added successfully!');
}

// Function to manually check for missed days
function checkMissedDays() {
    if (window.matchaApp) {
        window.matchaApp.checkForMissedDays();
        console.log('✅ Missed days check completed!');
    } else {
        console.error('MatchaCode app not found');
    }
}

// Function to reset matcha owed count for a user
function resetMatchaOwed(userId) {
    if (!window.matchaApp) {
        console.error('MatchaCode app not found');
        return;
    }
    
    if (!['bilge', 'domenica'].includes(userId)) {
        console.error('Invalid user. Use "bilge" or "domenica"');
        return;
    }
    
    const user = window.matchaApp.data.users[userId];
    const oldCount = user.totalMatchaOwed || 0;
    user.totalMatchaOwed = 0;
    
    // Add activity
    window.matchaApp.addActivity(user, `Matcha owed count reset from ${oldCount} to 0`, 'reset');
    
    // Save and update
    window.matchaApp.saveData();
    window.matchaApp.updateUI();
    
    console.log(`✅ ${user.name}'s matcha owed count reset from ${oldCount} to 0`);
}

// Function to reset all matcha owed counts to 0
function resetAllMatchaCounts() {
    if (!window.matchaApp) {
        console.error('MatchaCode app not found');
        return;
    }
    
    console.log('Resetting all matcha owed counts to 0...');
    
    // Reset all matcha owed counts to 0
    ['bilge', 'domenica'].forEach(userId => {
        const user = window.matchaApp.data.users[userId];
        user.totalMatchaOwed = 0;
        
        // Clear all missed flags
        Object.keys(user.dailyChallenges).forEach(date => {
            if (user.dailyChallenges[date]?.missed) {
                delete user.dailyChallenges[date].missed;
            }
        });
    });
    
    // Save and update UI
    window.matchaApp.saveData();
    window.matchaApp.updateUI();
    
    console.log('✅ All matcha owed counts reset to 0!');
}

// Function to clean the activity list
function cleanActivityList() {
    if (!window.matchaApp) {
        console.error('MatchaCode app not found');
        return;
    }
    
    console.log('Cleaning activity list...');
    
    // Clear all activity history for both users
    ['bilge', 'domenica'].forEach(userId => {
        const user = window.matchaApp.data.users[userId];
        user.activityHistory = [];
    });
    
    // Save and update UI
    window.matchaApp.saveData();
    window.matchaApp.updateUI();
    
    console.log('✅ Activity list cleaned!');
}

// Function to reset and recalculate all matcha owed counts
function resetAndRecalculateMatcha() {
    if (!window.matchaApp) {
        console.error('MatchaCode app not found');
        return;
    }
    
    console.log('Resetting and recalculating matcha owed counts...');
    
    // Reset all matcha owed counts to 0
    ['bilge', 'domenica'].forEach(userId => {
        const user = window.matchaApp.data.users[userId];
        user.totalMatchaOwed = 0;
        
        // Clear all missed flags
        Object.keys(user.dailyChallenges).forEach(date => {
            if (user.dailyChallenges[date]?.missed) {
                delete user.dailyChallenges[date].missed;
            }
        });
    });
    
    // Recalculate missed days
    window.matchaApp.checkForMissedDays();
    
    // Update UI
    window.matchaApp.updateUI();
    
    console.log('✅ Matcha owed counts reset and recalculated!');
}

// Function to manually mark yesterday as missed for a user (call this at the end of each day)
function markYesterdayMissed(userId) {
    if (!window.matchaApp) {
        console.error('MatchaCode app not found');
        return;
    }
    
    if (!['bilge', 'domenica'].includes(userId)) {
        console.error('Invalid user. Use "bilge" or "domenica"');
        return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = window.matchaApp.getDateKey(yesterday);
    
    const user = window.matchaApp.data.users[userId];
    
    // Check if user completed yesterday
    if (user.dailyChallenges[yesterdayKey]?.completed) {
        console.log(`${user.name} completed yesterday's challenge - no matcha owed`);
        return;
    }
    
    // Check if already marked as missed
    if (user.dailyChallenges[yesterdayKey]?.missed) {
        console.log(`${user.name} already marked as missed for yesterday`);
        return;
    }
    
    // Mark as missed
    user.dailyChallenges[yesterdayKey] = {
        completed: false,
        missed: true,
        timestamp: new Date().toISOString()
    };
    
    // Increase matcha owed count
    user.totalMatchaOwed = (user.totalMatchaOwed || 0) + 1;
    
    // Add to activity history
    window.matchaApp.addActivity(user, `Missed LeetCode challenge on ${yesterday.toLocaleDateString()} - owes 1 matcha!`, 'missed');
    
    // Save and update
    window.matchaApp.saveData();
    window.matchaApp.updateUI();
    
    console.log(`✅ ${user.name} marked as missed for ${yesterdayKey} - now owes ${user.totalMatchaOwed} matcha(s)`);
}

// About modal functions
function showAboutModal() {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('About modal opened');
    }
}

function closeAboutModal() {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.classList.add('hidden');
        console.log('About modal closed');
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.matchaApp = new MatchaCodeApp();
    
    // Setup event listeners after DOM is ready
    window.matchaApp.setupEventListeners();
    
    // Global modal close function
    window.closeModal = () => {
        document.getElementById('successModal').classList.add('hidden');
    };
    
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