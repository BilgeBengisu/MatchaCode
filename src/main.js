// Import styles
import '../styles.css';

// Import Supabase client
import supabase from './config/supabaseClient.js';
import { getTodayKey, formatDateForDisplay } from './utils/dateUtils.js';
import { renderUserCheckinCards } from './ui/checkinForm.js';
import { displayDashboard } from './ui/dashboard.js';
import './scripts/aboutModal.js';

// Main application entry point
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // console.log('MatchaCode application loaded successfully!');

        // *** dashboard
        // combined streak display
        await displayDashboard(supabase);

        // Render user check-in cards
        await renderUserCheckinCards();

        // Log when the page is fully loaded
        // console.log('DOM is ready and event listeners are attached');
    } catch (error) {
        console.error('Error initializing application:', error);
        console.error('Error stack:', error.stack);
    }
});
