// Import Supabase client
import supabase from './config/supabaseClient.js';
import { getTodayKey, formatDateForDisplay } from './utils/dateUtils.js';
import { renderUserCheckinCards } from './ui/checkinForm.js';
import { displayDashboard } from './ui/dashboard.js';

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
    await renderUserCheckinCards();


    // displaying daily checkin for users
    // gettting the users
    // const bilge = await supabase.from('users').select('*').eq('username', 'Bilge').single();
    // const domenica = await supabase.from('users').select('*').eq('username', 'Domenica').single();

    // Log when the page is fully loaded
    console.log('DOM is ready and event listeners are attached');
});
