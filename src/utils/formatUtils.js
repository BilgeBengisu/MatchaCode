// Formatting utility functions for MatchaCode
// Handles text formatting, number formatting, and display helpers

/**
 * Format a number with appropriate suffixes (K, M, etc.)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

/**
 * Format a streak number with appropriate emoji
 * @param {number} streak - Streak number
 * @returns {string} Formatted streak with emoji
 */
export const formatStreak = (streak) => {
    if (streak === 0) return '0';
    if (streak < 10) return `${streak} 🔥`;
    if (streak < 30) return `${streak} 🔥🔥`;
    if (streak < 100) return `${streak} 🔥🔥🔥`;
    return `${streak} 🔥🔥🔥🔥`;
};

/**
 * Format matcha count with appropriate emoji
 * @param {number} count - Matcha count
 * @returns {string} Formatted matcha count with emoji
 */
export const formatMatchaCount = (count) => {
    if (count === 0) return '0';
    if (count === 1) return '1 🍵';
    return `${count} 🍵`;
};

/**
 * Format a time duration in a human-readable format
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

/**
 * Format a timestamp for display
 * @param {string|Date} timestamp - Timestamp to format
 * @param {string} format - Format type ('time', 'date', 'datetime', 'relative')
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (timestamp, format = 'relative') => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    switch (format) {
        case 'time':
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'date':
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        case 'datetime':
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        case 'relative':
            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return formatTimestamp(timestamp, 'date');
        default:
            return timestamp.toString();
    }
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format a user name for display
 * @param {string} name - User name
 * @returns {string} Formatted user name
 */
export const formatUserName = (name) => {
    return capitalize(name);
};

/**
 * Format an activity message for display
 * @param {string} message - Activity message
 * @param {string} type - Activity type
 * @returns {string} Formatted activity message
 */
export const formatActivityMessage = (message, type) => {
    const emoji = getActivityEmoji(type);
    return `${emoji} ${message}`;
};

/**
 * Get emoji for activity type
 * @param {string} type - Activity type
 * @returns {string} Emoji for the activity type
 */
export const getActivityEmoji = (type) => {
    const emojiMap = {
        'completed': '✅',
        'missed': '❌',
        'streak': '🔥',
        'matcha': '🍵',
        'general': '📝',
        'error': '⚠️',
        'success': '🎉'
    };
    return emojiMap[type] || '📝';
};

/**
 * Format a percentage value
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncating
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format a file size in bytes to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
