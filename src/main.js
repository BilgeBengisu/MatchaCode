// Import Supabase client
import './config/supabaseClient.js';
import supabaseClient from './config/supabaseClient.js';

// Main application entry point
document.addEventListener('DOMContentLoaded', async function() {
    console.log('MatchaCode application loaded successfully!');
    
    // Test the getAllUsers function from SupabaseClient
    try {
        console.log('Fetching all users...');
        const result = await window.matchaSupabaseAPI.getAllUsers();
        console.log('Users fetched successfully:', result);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    
    // Add a simple click event listener to demonstrate functionality
    document.addEventListener('click', function(event) {
        console.log('Click event detected on:', event.target);
    });
    
    // Add a keydown event listener for keyboard interactions
    document.addEventListener('keydown', function(event) {
        console.log('Key pressed:', event.key);
    });
    
    // Log when the page is fully loaded
    console.log('DOM is ready and event listeners are attached');
});
