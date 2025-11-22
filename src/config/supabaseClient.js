// Supabase client configuration for MatchaCode
// Handles all database operations and API calls

import { createClient } from '../../node_modules/@supabase/supabase-js/dist/module/index.js';

// Supabase configuration - using environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// createClient is synchronous, no await needed
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;