// auth.js - Authentication logic for MatchaCode
// Handles password authentication and user verification

class AuthManager {
    constructor() {
        this.accessPassword = window.MATCHACODE_CONFIG?.accessPassword || 'matcha'; // Default password
        this.pendingAction = null; // Stores the pending action (user, type)
        this.setupAuthEventListeners();
    }

    // Set the access password (can be called from config)
    setAccessPassword(password) {
        this.accessPassword = password;
    }

    // Show authentication modal for a specific user and action
    showAuthModal(user, actionType) {
        this.pendingAction = { user, actionType };
        
        // This will be handled by the main app to get user data
        if (window.matchaApp) {
            const userData = window.matchaApp.data.users[user];
            const today = window.matchaApp.getTodayKey();
            
            // Check if already completed
            if (userData.dailyChallenges[today]?.completed) {
                alert(`${userData.name} has already completed today's challenge!`);
                return;
            }

            const actionText = 'mark as complete';
            
            // Update modal content
            if (window.modalManager) {
                window.modalManager.updateAuthModalContent(userData, actionText);
                window.modalManager.showAuthModal(user, actionType);
            }
        }
    }

    // Authenticate password
    authenticate(password) {
        return password === this.accessPassword;
    }

    // Execute the pending action after successful authentication
    executePendingAction() {
        if (!this.pendingAction) {
            return;
        }
        
        const { user, actionType } = this.pendingAction;
        
        if (actionType === 'complete') {
            if (window.checkinManager) {
                window.checkinManager.markChallengeComplete(user).then(() => {
                    // Challenge completion saved successfully
                }).catch(error => {
                    console.error('Error completing challenge:', error);
                });
            }
        }
        
        this.pendingAction = null;
    }

    // Setup authentication form event listeners
    setupAuthEventListeners() {
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Auth form submitted');
                const password = document.getElementById('authPassword').value;
                console.log('Password entered:', password);
                
                if (this.authenticate(password)) {
                    console.log('Authentication successful');
                    if (window.modalManager) {
                        window.modalManager.closeAuthModal();
                    }
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
    }
}

// Global function for HTML onclick handlers
function showAuthModal(user, actionType) {
    if (window.authManager) {
        window.authManager.showAuthModal(user, actionType);
    }
}

// Initialize auth manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
