import supabase from '../config/supabaseClient.js';
export async function attachMatchaModalListeners() {
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
                location.reload();  // Refresh to show updated matcha owed
            }
            else {
                document.getElementById("matchaAuthModalMessage").style.color = "red";
                document.getElementById("matchaAuthModalMessage").textContent = "Incorrect password. Please try again.";
                console.log("Password incorrect for user:", userId);
            }
        });
    }
};

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