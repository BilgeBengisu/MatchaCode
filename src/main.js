// Import Supabase client
import supabaseClient from './config/supabaseClient.js';

// Main application entry point
document.addEventListener('DOMContentLoaded', async function() {
    console.log('MatchaCode application loaded successfully!');

    const supabase = supabaseClient;
    
    // problem solved display
    //console.log(await supabase.rpc('total_problem_count'));
    document.getElementById('totalSolved').innerText = await supabase.rpc('total_problem_count');

    // Add a simple click event listener to demonstrate functionality
    document.addEventListener('click', function(event) {
        console.log('Click event detected on:', event.target);
    });
    
    // Log when the page is fully loaded
    console.log('DOM is ready and event listeners are attached');
});
