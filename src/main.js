// Import Supabase client
import supabaseClient from './config/supabaseClient.js';
import { getTodayKey, formatDateForDisplay } from './utils/dateUtils.js';

// Main application entry point
document.addEventListener('DOMContentLoaded', async function() {
    console.log('MatchaCode application loaded successfully!');

    // today's date display
    const todayKey = formatDateForDisplay(getTodayKey());
    document.getElementById('todayDate').innerText = todayKey;

    const supabase = supabaseClient;
    
    // problem solved display
    //console.log(await supabase.rpc('total_problem_count'));
    document.getElementById('totalSolved').innerText = await supabase.rpc('total_problem_count');
    
    // Log when the page is fully loaded
    console.log('DOM is ready and event listeners are attached');
});
