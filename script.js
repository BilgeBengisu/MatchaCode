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
                    dailyChallenges: {},
                    activityHistory: []
                },
                domenica: {
                    name: 'Domenica',
                    currentStreak: 0,
                    totalSolved: 0,
                    dailyChallenges: {},
                    activityHistory: []
                }
            }
        };
        
        // Simple password - in a real app, this would be more secure
        this.accessPassword = 'matcha2024';
        
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
        }
    }

    saveData() {
        localStorage.setItem('matchacode_data', JSON.stringify(this.data));
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
        console.log('updateUI completed');
    }

    updateStats() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;
        
        // Calculate combined streak - only increases when both users complete on the same day
        const combinedStreak = this.calculateCombinedStreak();
        const totalSolved = bilge.totalSolved + domenica.totalSolved;

        console.log('Stats update - Bilge:', { streak: bilge.currentStreak, solved: bilge.totalSolved });
        console.log('Stats update - Domenica:', { streak: domenica.currentStreak, solved: domenica.totalSolved });
        console.log('Stats update - Combined streak:', combinedStreak);
        console.log('Stats update - Total solved:', totalSolved);

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
            totalMatchaElement.textContent = '0';
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
        
        // Sort dates in descending order (most recent first)
        bothCompletedDates.sort((a, b) => new Date(b) - new Date(a));
        
        // Calculate consecutive days from today backwards
        let streak = 0;
        const today = new Date();
        const todayKey = this.getTodayKey();
        
        for (let i = 0; i < bothCompletedDates.length; i++) {
            const date = bothCompletedDates[i];
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            const expectedDateKey = expectedDate.toISOString().split('T')[0];
            
            if (date === expectedDateKey) {
                streak++;
            } else {
                break; // Streak broken
            }
        }
        
        console.log('Combined streak calculation:', {
            bilgeDates,
            domenicaDates,
            bothCompletedDates,
            streak
        });
        
        return streak;
    }

    calculateIndividualStreak(user) {
        // Get all dates where user completed challenges
        const completedDates = Object.keys(user.dailyChallenges).filter(date => 
            user.dailyChallenges[date]?.completed
        );
        
        // Sort dates in descending order (most recent first)
        completedDates.sort((a, b) => new Date(b) - new Date(a));
        
        // Calculate consecutive days from today backwards
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < completedDates.length; i++) {
            const date = completedDates[i];
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            const expectedDateKey = expectedDate.toISOString().split('T')[0];
            
            if (date === expectedDateKey) {
                streak++;
            } else {
                break; // Streak broken
            }
        }
        
        console.log('Individual streak calculation for', user.name, ':', {
            completedDates,
            streak
        });
        
        return streak;
    }

    updateUserCards() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;
        const today = this.getTodayKey();

        // Update Bilge's stats in the check-in card
        const bilgeStreak = document.getElementById('bilgeStreak');
        const bilgeSolved = document.getElementById('bilgeSolved');
        const bilgeMatcha = document.getElementById('bilgeMatcha');
        
        if (bilgeStreak) bilgeStreak.textContent = bilge.currentStreak;
        if (bilgeSolved) bilgeSolved.textContent = bilge.totalSolved;
        if (bilgeMatcha) bilgeMatcha.textContent = '0'; // Will be calculated automatically later

        // Update Domenica's stats in the check-in card
        const domenicaStreak = document.getElementById('domenicaStreak');
        const domenicaSolved = document.getElementById('domenicaSolved');
        const domenicaMatcha = document.getElementById('domenicaMatcha');
        
        if (domenicaStreak) domenicaStreak.textContent = domenica.currentStreak;
        if (domenicaSolved) domenicaSolved.textContent = domenica.totalSolved;
        if (domenicaMatcha) domenicaMatcha.textContent = '0'; // Will be calculated automatically later
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
        
        // Check if already completed
        if (userData.dailyChallenges[today]?.completed) {
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
        return today.toISOString().split('T')[0]; // YYYY-MM-DD format
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