// MatchaCode - Daily LeetCode Challenge Tracker (Legacy DB Version)

class MatchaCodeApp {
    constructor() {
        this.pendingAction = null; 
        this.data = {
            users: {
                bilge: {
                    user_id: 'bilge',
                    username: 'Bilge',
                    currentStreak: 0,
                    totalSolved: 0,
                    totalMatchaOwed: 0,
                    activityHistory: []
                },
                domenica: {
                    user_id: 'domenica',
                    username: 'Domenica',
                    currentStreak: 0,
                    totalSolved: 0,
                    totalMatchaOwed: 0,
                    activityHistory: []
                }
            }
        };

        this.accessPassword = window.MATCHACODE_CONFIG?.accessPassword;
    }

    async init() {
        await this.loadData();
        this.updateUI();
    }

    // --- Data Management ---
    async loadData() {
        try {
            const supabaseData = await window.matchaSupabaseAPI.getAllUsers(); 
            if (supabaseData && supabaseData.users) {
                this.data.users = supabaseData.users;
            } else {
                throw new Error('No data from Supabase');
            }
        } catch (error) {
            console.error('Error loading from Supabase, falling back to localStorage:', error);
            const savedData = localStorage.getItem('matchacode_data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.data.users = { ...this.data.users, ...parsedData.users };
            }
        }
    }

    async saveData() {
        try {
            for (const userId in this.data.users) {
                const user = this.data.users[userId];
                await window.matchaSupabaseAPI.updateStreak(
                    userId, 
                    user.currentStreak, 
                    user.totalMatchaOwed
                );
            }
            console.log('Data saved to users table');
        } catch (error) {
            console.error('Error saving to Supabase, falling back to localStorage:', error);
            localStorage.setItem('matchacode_data', JSON.stringify(this.data));
        }
    }

    resetAllData() {
        localStorage.removeItem('matchacode_data');

        this.data.users = {
            bilge: { user_id: 'bilge', username: 'Bilge', currentStreak: 0, totalSolved: 0, totalMatchaOwed: 0, activityHistory: [] },
            domenica: { user_id: 'domenica', username: 'Domenica', currentStreak: 0, totalSolved: 0, totalMatchaOwed: 0, activityHistory: [] }
        };

        this.saveData();
        this.updateUI();
        console.log('All data has been reset to default state');
    }

    // --- UI Updates ---
    updateUI() {
        this.updateStats();
        this.updateUserCards();
        this.updateCheckinCards();
        this.updateActivityList();
        this.updateDate();
    }

    updateStats() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;

        const combinedStreak = this.calculateCombinedStreak();
        const totalSolved = bilge.totalSolved + domenica.totalSolved;
        const totalMatchaOwed = (bilge.totalMatchaOwed || 0) + (domenica.totalMatchaOwed || 0);

        document.getElementById('totalStreak').textContent = combinedStreak;
        document.getElementById('totalSolved').textContent = totalSolved;
        document.getElementById('totalMatchaOwed').textContent = totalMatchaOwed;
    }

    calculateCombinedStreak() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;

        // Assume streak is consecutive completed days in database; use stored currentStreak
        // Optional: could calculate dynamically from DB if needed
        return Math.min(bilge.currentStreak, domenica.currentStreak);
    }

    calculateIndividualStreak(user) {
        return user.currentStreak; // Already stored in database
    }

    updateUserCards() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;

        document.getElementById('bilgeStreak').textContent = bilge.currentStreak;
        document.getElementById('bilgeSolved').textContent = bilge.totalSolved;
        document.getElementById('bilgeMatcha').textContent = bilge.totalMatchaOwed || 0;

        document.getElementById('domenicaStreak').textContent = domenica.currentStreak;
        document.getElementById('domenicaSolved').textContent = domenica.totalSolved;
        document.getElementById('domenicaMatcha').textContent = domenica.totalMatchaOwed || 0;
    }

    updateCheckinCards() {
        const bilge = this.data.users.bilge;
        const domenica = this.data.users.domenica;
        const today = this.getTodayKey();

        const bilgeCard = document.getElementById('bilgeCheckinCard');
        const bilgeStatus = document.getElementById('bilgeCheckinStatus');
        if (bilgeCard && bilgeStatus) {
            if (bilge.dailyChallenges?.[today]?.completed) {
                bilgeCard.style.borderColor = '#4CAF50';
                bilgeCard.style.backgroundColor = '#f1f8e9';
                bilgeStatus.textContent = 'Completed today\'s challenge! ✅';
                bilgeStatus.className = 'user-checkin-status completed';
            } else {
                bilgeCard.style.borderColor = '#e1e8ed';
                bilgeCard.style.backgroundColor = '#f8f9fa';
                bilgeStatus.textContent = 'Not checked in today';
                bilgeStatus.className = 'user-checkin-status';
            }
        }

        const domenicaCard = document.getElementById('domenicaCheckinCard');
        const domenicaStatus = document.getElementById('domenicaCheckinStatus');
        if (domenicaCard && domenicaStatus) {
            if (domenica.dailyChallenges?.[today]?.completed) {
                domenicaCard.style.borderColor = '#4CAF50';
                domenicaCard.style.backgroundColor = '#f1f8e9';
                domenicaStatus.textContent = 'Completed today\'s challenge! ✅';
                domenicaStatus.className = 'user-checkin-status completed';
            } else {
                domenicaCard.style.borderColor = '#e1e8ed';
                domenicaCard.style.backgroundColor = '#f8f9fa';
                domenicaStatus.textContent = 'Not checked in today';
                domenicaStatus.className = 'user-checkin-status';
            }
        }
    }

    updateDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', options);
        const dateElement = document.getElementById('todayDate');
        if (dateElement) dateElement.textContent = formattedDate;
    }

    updateActivityList() {
        const activityList = document.getElementById('activityList');
        const template = document.getElementById('activityItemTemplate');
        const allActivityHistory = [];

        Object.values(this.data.users).forEach(user => {
            user.activityHistory.forEach(entry => {
                allActivityHistory.push({ ...entry, user: user.username });
            });
        });

        const emptyState = activityList.querySelector('.empty-state');
        if (!allActivityHistory.length) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }

        activityList.querySelectorAll('.activity-item').forEach(item => item.remove());

        allActivityHistory.slice(-3).reverse().forEach(entry => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.item-description').textContent = `${entry.user}: ${entry.description}`;
            clone.querySelector('.item-date').textContent = entry.date;
            activityList.appendChild(clone);
        });
    }

    // --- Authentication & Actions ---
    showAuthModal(user, actionType) {
        this.pendingAction = { user, actionType };
        const userData = this.data.users[user];
        const today = this.getTodayKey();

        if (userData.dailyChallenges?.[today]?.completed) {
            alert(`${userData.username} has already completed today's challenge!`);
            return;
        }

        document.getElementById('authModalTitle').textContent = `Check in for ${userData.username}`;
        document.getElementById('authModalMessage').textContent = `Enter the password to mark as complete today's challenge.`;
        document.getElementById('authPassword').value = '';
        document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('authPassword').focus();
    }

    authenticate(password) {
        return password === this.accessPassword;
    }

    async executePendingAction() {
        if (!this.pendingAction) return;

        const { user, actionType } = this.pendingAction;
        if (actionType === 'complete') await this.markChallengeComplete(user);

        this.pendingAction = null;
    }

    async markChallengeComplete(userId) {
        const user = this.data.users[userId];
        const today = this.getTodayKey();
        if (user.dailyChallenges?.[today]?.completed) return;

        user.dailyChallenges = user.dailyChallenges || {};
        user.dailyChallenges[today] = { completed: true, timestamp: new Date().toISOString() };
        user.totalSolved++;
        user.currentStreak = this.calculateIndividualStreak(user);

        this.addActivity(user, 'Completed today\'s LeetCode challenge!', 'completed');

        try {
            await window.matchaSupabaseAPI.updateChallenge(userId, today, true, new Date().toISOString());
            await window.matchaSupabaseAPI.updateStreak(userId, user.currentStreak, user.totalMatchaOwed);
            await window.matchaSupabaseAPI.addActivity(userId, 'Completed today\'s LeetCode challenge!', 'completed');
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            this.saveData();
        }
        this.updateUI();
        this.showSuccessModal();
    }

    // --- Helpers ---
    getTodayKey() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    addActivity(user, description, type) {
        user.activityHistory.push({
            description,
            type,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        });
    }

    showSuccessModal() {
        document.getElementById('successModal').classList.remove('hidden');
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
    }

    // --- Event Listeners ---
    setupEventListeners() {
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', e => {
                e.preventDefault();
                const password = document.getElementById('authPassword').value;
                if (this.authenticate(password)) {
                    this.closeAuthModal();
                    this.executePendingAction();
                } else {
                    alert('Incorrect password! Hint: It\'s what motivates us to code! 🍵');
                    document.getElementById('authPassword').value = '';
                    document.getElementById('authPassword').focus();
                }
            });
        }

        document.getElementById('successModal')?.addEventListener('click', e => {
            if (e.target.id === 'successModal') window.closeModal();
        });

        document.getElementById('authModal')?.addEventListener('click', e => {
            if (e.target.id === 'authModal') this.closeAuthModal();
        });

        window.addEventListener('storage', e => {
            if (e.key === 'matchacode_data') {
                this.loadData();
                this.updateUI();
            }
        });
    }
}

// --- Global Functions ---
function showAuthModal(user, actionType) { window.matchaApp.showAuthModal(user, actionType); }
function closeAuthModal() { window.matchaApp.closeAuthModal(); }
function showAboutModal() { document.getElementById('aboutModal')?.classList.remove('hidden'); }
function closeAboutModal() { document.getElementById('aboutModal')?.classList.add('hidden'); }

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    window.matchaApp = new MatchaCodeApp();
    await window.matchaApp.init();
    window.matchaApp.setupEventListeners();

    window.closeModal = () => document.getElementById('successModal')?.classList.add('hidden');

    console.log(`
        🍵 Welcome to MatchaCode! 🍵
        Daily LeetCode Challenge Tracker
        Built with ❤️ for Bilge and Domenica
        Keep up the great work! 💪
    `);

    document.addEventListener('keydown', e => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
            console.log('🎮 Konami code detected! Keep coding!');
        }
    });
});
