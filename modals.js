// modals.js - Modal management and interactions
// Handles all modal-related functionality for MatchaCode

class ModalManager {
    constructor() {
        this.setupModalEventListeners();
    }

    // Success Modal
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Authentication Modal
    showAuthModal(user, actionType) {
        // This will be called from the main app, but we'll handle the display
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // About Modal
    showAboutModal() {
        const modal = document.getElementById('aboutModal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('About modal opened');
        }
    }

    closeAboutModal() {
        const modal = document.getElementById('aboutModal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('About modal closed');
        }
    }

    // Setup event listeners for modal interactions
    setupModalEventListeners() {
        // Close modals on outside click
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target.id === 'successModal') {
                    this.closeSuccessModal();
                }
            });
        }

        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target.id === 'authModal') {
                    this.closeAuthModal();
                }
            });
        }

        const aboutModal = document.getElementById('aboutModal');
        if (aboutModal) {
            aboutModal.addEventListener('click', (e) => {
                if (e.target.id === 'aboutModal') {
                    this.closeAboutModal();
                }
            });
        }
    }

    // Update modal content for authentication
    updateAuthModalContent(userData, actionText) {
        const titleElement = document.getElementById('authModalTitle');
        const messageElement = document.getElementById('authModalMessage');
        const passwordInput = document.getElementById('authPassword');

        if (titleElement) {
            titleElement.textContent = `Check in for ${userData.name}`;
        }
        if (messageElement) {
            messageElement.textContent = `Enter the password to ${actionText} today's challenge.`;
        }
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

// Global functions for HTML onclick handlers
function showAboutModal() {
    if (window.modalManager) {
        window.modalManager.showAboutModal();
    }
}

function closeAboutModal() {
    if (window.modalManager) {
        window.modalManager.closeAboutModal();
    }
}

function closeAuthModal() {
    if (window.modalManager) {
        window.modalManager.closeAuthModal();
    }
}

// Global modal close function for success modal
function closeModal() {
    if (window.modalManager) {
        window.modalManager.closeSuccessModal();
    }
}

// Initialize modal manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
});
