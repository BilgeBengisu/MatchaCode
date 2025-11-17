// Import Supabase client
import supabaseClient from './config/supabaseClient.js';
import { createClient } from '@supabase/supabase-js';
import { getTodayKey, formatDateForDisplay } from './utils/dateUtils.js';
import { renderUserCheckinCards, openAuthModal, closeAuthModal } from './ui/checkinForm.js';
import { displayDashboard } from './ui/dashboard.js';


const supabase = await createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);


// Main application entry point
document.addEventListener('DOMContentLoaded', async function() {
    console.log('MatchaCode application loaded successfully!');

    // today's date display
    const todayDate = formatDateForDisplay(getTodayKey());
    console.log(todayDate)
    document.getElementById('todayDate').innerText = todayDate;

    // *** dashboard
    // combined streak display
    await displayDashboard(supabase);

    // Render user check-in cards
    await renderUserCheckinCards(supabase);

    // Attach listeners for auth modal cancel and form submit (these elements exist in index.html)
    const authCancel = document.querySelector('#authModal .btn-secondary');
    if (authCancel) authCancel.addEventListener('click', () => closeAuthModal());

    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('authPassword').value;
            const userId = document.getElementById('authModal')?.dataset?.user;
            console.log('Authenticating checkin for user:', userId);
            // TODO: verify password and perform check-in via Supabase here
            if (userId.password == password) {
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

    // displaying daily checkin for users
    // gettting the users
    // const bilge = await supabase.from('users').select('*').eq('username', 'Bilge').single();
    // const domenica = await supabase.from('users').select('*').eq('username', 'Domenica').single();

    // Log when the page is fully loaded
    console.log('DOM is ready and event listeners are attached');
});
