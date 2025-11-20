// Configuration for MatchaCode
// Contains app settings, environment variables, and constants
export const CONFIG = {
    // App Information
    APP_NAME: 'MatchaCode',
    VERSION: '2.0.0',
    DESCRIPTION: 'Daily LeetCode Challenge Tracker with Matcha Theme',
    
    // Authentication
    ACCESS_PASSWORD: import.meta.env.VITE_APP_PASSWORD,
    
    // Feature Flags
    FEATURES: {
        ENABLE_NOTIFICATIONS: true,
        ENABLE_SOUND_EFFECTS: false,
        ENABLE_ANIMATIONS: true,
        ENABLE_OFFLINE_MODE: true
    },
    
    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 3000,
        DEBOUNCE_DELAY: 300
    },
    
    // Date Settings
    DATE_FORMAT: 'YYYY-MM-DD',
    TIMEZONE: 'local', // Use local timezone
    
    // Storage Keys
    STORAGE_KEYS: {
        USER_DATA: 'matchacode_data',
        SETTINGS: 'matchacode_settings',
        CACHE: 'matchacode_cache'
    },
    
    // API Settings
    API: {
        TIMEOUT: 10000, // 10 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    }
};

// Environment-specific configuration
export const ENV = {
    DEVELOPMENT: {
        DEBUG: true,
        LOG_LEVEL: 'debug',
        API_BASE_URL: 'http://localhost:3000'
    },
    PRODUCTION: {
        DEBUG: false,
        LOG_LEVEL: 'error',
        API_BASE_URL: 'https://matchacode.vercel.app'
    }
};

// Get current environment
export const getEnvironment = () => {
    return window.location.hostname === 'localhost' ? 'DEVELOPMENT' : 'PRODUCTION';
};

// Get current config based on environment
export const getConfig = () => {
    const env = getEnvironment();
    return {
        ...CONFIG,
        ...ENV[env]
    };
};
