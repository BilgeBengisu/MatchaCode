import { getTodayKey, formatDateForDisplay } from "../utils/dateUtils.js";
import supabase from '../config/supabaseClient.js';

export async function renderUserCheckinCards() {
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

        let user_checkin_header = `
            <div class="user-checkin-header">
                <div class="user-avatar">
                    <img src="src/public/${user.user_id}_profile.png" class="profile-image" />
                </div>
                <div class="user-checkin-info">
                    <h4>${user.username}</h4>
                    <div class="checkin-status ${checkedIn ? 'checked-in' : 'not-checked-in'}">
                        ${checkedIn ? 'Checked In Today' : 'Not Checked In'}
                    </div>
                </div>
            </div>
        `;

        let user_stats = `
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
        `;

        let user_checkin_actions = `
            <div class="user-checkin-actions">
                <button class="btn-success checkin-btn" data-user="${user.user_id}">
                    Check In
                </button>
                <button class="btn-success buy-matcha-btn" data-user="${user.user_id}">
                    Buy Matcha
                </button>
            </div>
        `;
        card.innerHTML = user_checkin_header + user_stats + user_checkin_actions;
        container.appendChild(card);
    });

    // 3. Bind event listeners for "Check In" buttons
    document.querySelectorAll(".checkin-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const userId = e.target.dataset.user;
            openAuthModal(userId);
        });
    });

    activityTypeListener();
    attachAuthModalListeners(supabase);
}

export const openAuthModal = (userId) => {
    const modal = document.getElementById("authModal");
    modal.classList.remove("hidden");
    modal.dataset.user = userId;
}

export const closeAuthModal = () => {
    const modal = document.getElementById("authModal");
    modal.classList.add("hidden");
    modal.dataset.user = "";
}

export const activityTypeListener = () => {
    const activityType = document.getElementById("activityType");
    const levelContainer = document.getElementById("levelContainer");
    const levelInput = document.getElementById("level");

    activityType.addEventListener("change", () => {
        if (activityType.value === "problem") {
            levelContainer.style.display = "block";  // Show Level
            levelInput.required = true;
        } else {
            levelContainer.style.display = "none";   // Hide Level
            levelInput.required = false;
            levelInput.value = "";
        }
    });
};

export const attachAuthModalListeners = (supabase) => {
    // Attach listeners for auth modal cancel and form submit (these elements exist in index.html)
    const authCancel = document.querySelector('#authModal .btn-secondary');
    if (authCancel) authCancel.addEventListener('click', () => closeAuthModal());

    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('authPassword').value;
            const userId = document.getElementById('authModal')?.dataset?.user;
            const {data, error} = await supabase.from('users').select('password').eq('user_id', userId).single();
            // TODO: verify password and perform check-in via Supabase here
            if (data?.password == password) {
                console.log("Password verified for user:", userId);
                // Perform check-in logic here
                closeAuthModal();
            }
            else {
                document.getElementById("authModalMessage").style.color = "red";
                document.getElementById("authModalMessage").textContent = "Incorrect password. Please try again.";
                console.log("Password incorrect for user:", userId);
            }
        });
    }
};