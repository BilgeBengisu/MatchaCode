import { getTodayKey, formatDateForDisplay } from "../utils/dateUtils.js";

export async function renderUserCheckinCards(supabase) {
    const container = document.getElementById("challengeUsers");

    const todayKey = getTodayKey();  // "2025-11-15" format

    // 1. Fetch all users
    const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .order("username");

    if (error) {
        console.error("Failed to load users:", error);
        return;
    }

    // 2. Render each user card
    users.forEach(user => {
        const checkedIn = user.last_checkin === todayKey;

        const card = document.createElement("div");
        card.classList.add("user-checkin-card");
        if (checkedIn) card.classList.add("completed");

        card.innerHTML = `
            <div class="user-checkin-header">
                <div class="user-avatar">
                    <img src="src/public/${user.user_id}_profile.png" class="profile-image" />
                </div>
                <div class="user-checkin-info">
                    <h4>${user.username}</h4>
                    <p class="user-checkin-status completed">To be coded</p>
                </div>
            </div>

            <div class="user-stats">
                <div class="user-stat">
                    <div class="stat-number">${user.streak}</div>
                    <div class="stat-label">Streak</div>
                </div> 
                <div class="user-stat">
                    <div class="stat-number">${user.problems_solved}</div>
                    <div class="stat-label">Problems Solved</div>
                </div> 
                <div class="user-stat">
                    <div class="stat-number">${user.matcha_owed}</div>
                    <div class="stat-label">Matcha Owed</div>
                </div>
            </div>

            <div class="user-checkin-actions">
                <button class="btn-success">
                    Check In
                </button>
                <button class="btn-success">
                    Buy Matcha
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    // 3. Bind event listeners for "Check In" buttons
    document.querySelectorAll(".checkin-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const userId = e.target.dataset.user;
            openAuthModal(userId);
        });
    });
}