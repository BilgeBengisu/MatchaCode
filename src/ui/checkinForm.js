import { getTodayKey, formatDateForDisplay } from "../utils/dateUtils.js";
import supabase from '../config/supabaseClient.js';
import { attachAuthModalListeners } from '../scripts/authModal.js';
import { attachMatchaModalListeners } from '../scripts/matchaModal.js';
import { openAuthModal, closeAuthModal } from '../scripts/authModal.js';
import { openMatchaModal, closeMatchaModal } from '../scripts/matchaModal.js';

export async function renderUserCheckinCards() {
    try {
        const container = document.getElementById("challengeUsers");
        
        if (!container) {
            console.error("Container element 'challengeUsers' not found!");
            return;
        }

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

        if (!users || users.length === 0) {
            console.warn("No users found in database");
            return;
        }

    // 2. Render each user card
    for (const user of users) {
        const { count, error: countError } = await supabase
            .from('problems')
            .select('*', { count: 'exact', head: true })  // <-- head:true prevents returning all rows
            .eq('solved', true)
            .eq('user_id', user.user_id);
        
        if (countError) {
            console.error(`Error fetching problem count for user ${user.user_id}:`, countError);
        }

        const checkedIn = user.last_checkin === todayKey;
        const dateWithWeekday = formatDateForDisplay(todayKey, 'withWeekday');
        document.getElementById('todayDate').innerText = dateWithWeekday;

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
                    <div class="stat-number">${count}</div>
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
    }

    // 3. Bind event listeners for "Check In" buttons
    document.querySelectorAll(".checkin-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const userId = e.target.dataset.user;
            openAuthModal(userId);
        });
    });

    document.querySelectorAll(".buy-matcha-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const userId = e.target.dataset.user;
            openMatchaModal(userId);
        });
    });

        activityTypeListener();
        attachAuthModalListeners();
        attachMatchaModalListeners();
    } catch (error) {
        console.error("Error rendering user check-in cards:", error);
        console.error("Error stack:", error.stack);
    }
}

export const activityTypeListener = () => {
    const activityType = document.getElementById("activityType");
    const levelContainer = document.getElementById("levelContainer");
    const levelInput = document.getElementById("level");
    const solvedContainer = document.getElementById("solvedContainer");
    const solvedInput = document.getElementById("solved");

    activityType.addEventListener("change", () => {
        if (activityType.value === "problem") {
            levelContainer.style.display = "block";  // Show Level
            levelInput.required = true;
            solvedContainer.style.display = "block";  // Show Solved
            solvedInput.required = true;
        } else {
            levelContainer.style.display = "none";   // Hide Level
            levelInput.required = false;
            levelInput.value = "";
            solvedContainer.style.display = "none";   // Hide Solved
            solvedInput.required = false;
            solvedInput.value = "";
        }
    });
};
