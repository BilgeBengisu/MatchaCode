// UI view for MatchaCode
// Handles DOM manipulation and UI updates

import { formatStreak, formatMatchaCount, formatTimestamp, formatDateForDisplay } from '../utils/formatUtils.js';
import { getTodayKey } from '../utils/dateUtils.js';

/**
 * UI view class
 */
export class UIView {
    constructor() {
        this.elements = this.initializeElements();
    }

    /**
     * Initialize DOM elements
     * @returns {Object} DOM elements
     */
    initializeElements() {
        return {
            // Stats elements
            totalStreak: document.getElementById('totalStreak'),
            totalSolved: document.getElementById('totalSolved'),
            totalMatchaOwed: document.getElementById('totalMatchaOwed'),
            
            // Date display
            todayDate: document.getElementById('todayDate'),
            
            // User cards container
            challengeUsers: document.getElementById('challengeUsers'),
            
            // Activity list
            activityList: document.getElementById('activityList'),
            activityItemTemplate: document.getElementById('activityItemTemplate'),
            
            // Modals
            successModal: document.getElementById('successModal'),
            authModal: document.getElementById('authModal'),
            aboutModal: document.getElementById('aboutModal'),
            
            // Auth form
            authForm: document.getElementById('authForm'),
            authPassword: document.getElementById('authPassword'),
            authModalTitle: document.getElementById('authModalTitle'),
            authModalMessage: document.getElementById('authModalMessage')
        };
    }

    /**
     * Update dashboard statistics
     * @param {Object} stats - Dashboard statistics
     */
    updateDashboardStats(stats) {
        if (this.elements.totalStreak) {
            this.elements.totalStreak.textContent = stats.combinedStreak || 0;
        }
        
        if (this.elements.totalSolved) {
            this.elements.totalSolved.textContent = stats.totalSolved || 0;
        }
        
        if (this.elements.totalMatchaOwed) {
            this.elements.totalMatchaOwed.textContent = stats.totalMatchaOwed || 0;
        }
    }

    /**
     * Update user card
     * @param {string} userId - User ID
     * @param {Object} userStats - User statistics
     */
    updateUserCard(userId, userStats) {
        const elements = this.getUserElements(userId);
        
        if (elements.streak) {
            elements.streak.textContent = userStats.currentStreak || 0;
        }
        
        if (elements.solved) {
            elements.solved.textContent = userStats.totalSolved || 0;
        }
        
        if (elements.matcha) {
            elements.matcha.textContent = userStats.totalMatchaOwed || 0;
        }
        
        if (elements.status) {
            const status = userStats.todayStatus || 'pending';
            elements.status.textContent = this.getStatusText(status);
            elements.status.className = `user-checkin-status ${status}`;
        }
    }

    /**
     * Create user card HTML
     * @param {Object} user - User data
     * @returns {string} User card HTML
     */
    createUserCardHTML(user) {
        return `
            <div class="user-checkin-card" id="${user.id}CheckinCard">
                <div class="user-checkin-header">
                    <div class="user-avatar ${user.id}">
                        <img src="${user.profileImage || 'src/public/default_profile.png'}" alt="${user.name}" class="profile-image">
                    </div>
                    <div class="user-checkin-info">
                        <h4>${user.name}</h4>
                        <p class="user-checkin-status" id="${user.id}CheckinStatus">Not checked in today</p>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="user-stat">
                        <span class="stat-number" id="${user.id}Streak">0</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                    <div class="user-stat">
                        <span class="stat-number" id="${user.id}Solved">0</span>
                        <span class="stat-label">Solved</span>
                    </div>
                    <div class="user-stat">
                        <span class="stat-number" id="${user.id}Matcha">0</span>
                        <span class="stat-label">Matcha Owed</span>
                    </div>
                </div>
                <div class="user-checkin-actions">
                    <button class="btn-success" onclick="showAuthModal('${user.id}', 'complete')">
                        <i class="fas fa-check"></i>
                        Mark Complete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render user cards dynamically
     * @param {Array} users - Array of user data
     */
    renderUserCards(users) {
        if (!this.elements.challengeUsers) {
            return;
        }

        this.elements.challengeUsers.innerHTML = '';
        
        users.forEach(user => {
            const userCardHTML = this.createUserCardHTML(user);
            this.elements.challengeUsers.insertAdjacentHTML('beforeend', userCardHTML);
        });
    }

    /**
     * Get user-specific DOM elements
     * @param {string} userId - User ID
     * @returns {Object} User elements
     */
    getUserElements(userId) {
        return {
            streak: document.getElementById(`${userId}Streak`),
            solved: document.getElementById(`${userId}Solved`),
            matcha: document.getElementById(`${userId}Matcha`),
            status: document.getElementById(`${userId}CheckinStatus`),
            card: document.getElementById(`${userId}CheckinCard`)
        };
    }

    /**
     * Get status text for display
     * @param {string} status - Status value
     * @returns {string} Status text
     */
    getStatusText(status) {
        switch (status) {
            case 'completed':
                return 'Completed today!';
            case 'missed':
                return 'Missed today';
            default:
                return 'Not checked in today';
        }
    }

    /**
     * Update activity list
     * @param {Array} activities - Activities to display
     */
    updateActivityList(activities) {
        if (!this.elements.activityList || !this.elements.activityItemTemplate) {
            return;
        }

        // Clear existing activities
        this.elements.activityList.innerHTML = '';

        if (activities.length === 0) {
            this.elements.activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>Start your LeetCode journey today!</p>
                </div>
            `;
            return;
        }

        // Add activities
        activities.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            this.elements.activityList.appendChild(activityElement);
        });
    }

    /**
     * Create activity element
     * @param {Object} activity - Activity data
     * @returns {HTMLElement} Activity element
     */
    createActivityElement(activity) {
        const template = this.elements.activityItemTemplate;
        const clone = template.content.cloneNode(true);
        
        const description = clone.querySelector('.item-description');
        const date = clone.querySelector('.item-date');
        
        if (description) {
            description.textContent = activity.message || activity.description || '';
        }
        
        if (date) {
            date.textContent = formatTimestamp(activity.timestamp, 'relative');
        }
        
        return clone;
    }

    /**
     * Get icon class for activity type
     * @param {string} type - Activity type
     * @returns {string} Icon class
     */
    getActivityIconClass(type) {
        const iconMap = {
            'completed': 'fas fa-check-circle',
            'missed': 'fas fa-times-circle',
            'streak': 'fas fa-fire',
            'matcha': 'fas fa-coffee',
            'general': 'fas fa-info-circle',
            'error': 'fas fa-exclamation-triangle',
            'success': 'fas fa-star'
        };
        return iconMap[type] || 'fas fa-info-circle';
    }

    /**
     * Update today's date display
     */
    updateDateDisplay() {
        if (this.elements.todayDate) {
        const today = new Date();
            this.elements.todayDate.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
            });
        }
    }

    /**
     * Show modal
     * @param {string} modalId - Modal ID
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Hide modal
     * @param {string} modalId - Modal ID
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Update auth modal content
     * @param {string} userName - User name
     * @param {string} actionText - Action text
     */
    updateAuthModalContent(userName, actionText) {
        if (this.elements.authModalTitle) {
            this.elements.authModalTitle.textContent = `Check in for ${userName}`;
        }
        
        if (this.elements.authModalMessage) {
            this.elements.authModalMessage.textContent = `Enter the password to ${actionText} today's challenge.`;
        }
        
        if (this.elements.authPassword) {
            this.elements.authPassword.value = '';
            this.elements.authPassword.focus();
        }
    }

    /**
     * Show loading state
     * @param {boolean} isLoading - Loading state
     */
    showLoading(isLoading) {
        // Add loading indicators as needed
        if (isLoading) {
            document.body.classList.add('loading');
        } else {
            document.body.classList.remove('loading');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        // Simple alert for now - can be enhanced with toast notifications
        alert(`Error: ${message}`);
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        // Simple alert for now - can be enhanced with toast notifications
        alert(`Success: ${message}`);
    }

    /**
     * Update all UI elements
     * @param {Object} data - Application data
     */
    updateUI(data) {
        this.updateDateDisplay();
        this.updateDashboardStats(data.dashboardStats);
        
        // Render user cards dynamically
        if (data.users) {
            const userList = Object.keys(data.users).map(userId => ({
                id: userId,
                name: data.users[userId].name || userId,
                profileImage: data.users[userId].profileImage || `src/public/${userId}_profile.png`
            }));
            
            this.renderUserCards(userList);
            
            // Update user card data
            Object.keys(data.users).forEach(userId => {
                this.updateUserCard(userId, data.users[userId]);
            });
        }
        
        // Update activity list
        if (data.activities) {
            this.updateActivityList(data.activities);
        }
    }
}