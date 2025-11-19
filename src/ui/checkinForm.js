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
    await Promise.all(users.map(async (user) => {
        const { count, error } = await supabase
            .from('problems')
            .select('*', { count: 'exact', head: true })  // <-- head:true prevents returning all rows
            .eq('solved', true)
            .eq('user_id', user.user_id);

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
    }));

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
    attachAuthModalListeners(supabase);
    attachMatchaModalListeners(supabase);
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

export const openMatchaModal = async (userId) => {
    const modal = document.getElementById("matchaModal");
    modal.classList.remove("hidden");
    modal.dataset.user = userId;

    // Fetch owed matcha dynamically
    const { data, error } = await supabase
        .from('users')
        .select('matcha_owed')
        .eq('user_id', userId)
        .single();
    const owed = data?.matcha_owed || 0;

    const msg = document.getElementById('matchaModalMessage');

    if (error) {
        msg.textContent = "Could not load matcha data.";
        msg.style.color = "red";
        return;
    }

    if (owed == 0) {
        msg.textContent = "You don't owe any matcha!";
        msg.style.color = "green";
        document.getElementById('matchaOweForm').classList.add("hidden");
    } else {
        msg.textContent = `You owe ${owed} matcha(s).`;
        msg.style.color = "white";
        document.getElementById('matchaOweForm').classList.remove("hidden");
    }
}

export const closeMatchaModal = () => {
    const modal = document.getElementById("matchaModal");
    modal.classList.add("hidden");
    modal.dataset.user = "";
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

async function attachMatchaModalListeners(supabase) {
    // Attach listeners for matcha modal cancel and form submit (these elements exist in index.html)
    const matchaCancel = document.querySelector('#matchaModal .btn-secondary');
    if (matchaCancel) matchaCancel.addEventListener('click', () => closeMatchaModal());

    const matchaBuyForm = document.getElementById('matchaOweForm');
    if (matchaBuyForm) {
        matchaBuyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('matchaAuthPassword').value;
            const userId = document.getElementById('matchaModal')?.dataset?.user;
            const {data, error} = await supabase.from('users').select('*').eq('user_id', userId).single();
            const user = data;
            if (user?.password == password) {
                // Perform matcha count decrement logic here
                if (user.matcha_owed > 0) {
                    const { data, error } = await supabase.rpc('decrement_matcha_owed', { p_user_id: userId });
                    if (error) console.error("Failed to decrement matcha:", error);
                }

                closeMatchaModal();
            }
            else {
                document.getElementById("matchaAuthModalMessage").style.color = "red";
                document.getElementById("matchaAuthModalMessage").textContent = "Incorrect password. Please try again.";
                console.log("Password incorrect for user:", userId);
            }
        });
    }
};

async function attachAuthModalListeners(supabase) {
    // Attach listeners for auth modal cancel and form submit (these elements exist in index.html)
    const authCancel = document.querySelector('#authModal .btn-secondary');
    if (authCancel) authCancel.addEventListener('click', () => closeAuthModal());

    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('authPassword').value;
            const userId = document.getElementById('authModal')?.dataset?.user;
            const {data, error} = await supabase.from('users').select('*').eq('user_id', userId).single();
            console.log("Auth query data:", data, "error:", error);
            const user = data;
            // TODO: verify password and perform check-in via Supabase here
            if (user?.password == password) {
                // Perform check-in logic here

                const activity = await handleCheckin(user.user_id);
                console.log("Activity data for check-in:", activity);


                const activityType = document.getElementById("activityType").value;
                const { data, error } = await supabase.from('checkins').insert([
                    {
                        user_id: user.user_id,
                        checkin_activity: activityType,
                        completed: true,
                        activity_id: activity.id,
                    }
                ])
                .select()
                .maybeSingle();

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

async function handleCheckin(user_id) {
    const activityType = document.getElementById("activityType").value;

    let result = null;

    if (activityType == "problem") {
        const topic = document.getElementById("topic").value;
        const level = document.getElementById("level").value.toLowerCase();
        const status = document.getElementById("solved").value;
        console.log("Status value:", status);
        const solved = status === "completed" ? true : false;

        const { data, error } = await supabase.from('problems').insert([
            {
                user_id,
                topic,
                difficulty: level,
                solved
            }
        ])
        .select()
        .single();

        console.log("Problem insert data:", data, "error:", error);

        result = data;
    }
    if (activityType == "study") {
        const topic = document.getElementById("topic").value;
        const { data, error } = await supabase.from('study').insert([
            {
                user_id,
                topic: topic
            }
        ])
        .select()
        .single();

        console.log("Study insert data:", data, "error:", error);

        result = data;
    }

    const { data: streakData, error: streakError } = await supabase.rpc("increment_streak", {
        p_user_id: user_id
    });

    if (streakError) console.error("STREAK RPC ERROR:", streakError);

    return result;
};

