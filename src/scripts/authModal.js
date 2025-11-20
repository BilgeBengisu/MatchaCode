import { handleCheckin } from '../scripts/handleCheckin.js';
import supabase from '../config/supabaseClient.js';
export async function attachAuthModalListeners() {
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
                location.reload(); // Refresh to show updated dashboard and check-in status
            }
            else {
                document.getElementById("authModalMessage").style.color = "red";
                document.getElementById("authModalMessage").textContent = "Incorrect password. Please try again.";
                console.log("Password incorrect for user:", userId);
            }
        });
    }
};

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