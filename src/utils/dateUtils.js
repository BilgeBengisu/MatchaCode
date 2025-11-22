// Date utility functions for MatchaCode
// Handles date formatting, calculations, and timezone management

/**
 * Get today's date key in YYYY-MM-DD format (local timezone)
 * @returns {string} Today's date key
 */
export const getTodayKey = () => {
    const today = new Date();
    return formatDateKey(today);
};

/**
 * Get yesterday's date key in YYYY-MM-DD format (local timezone)
 * @returns {string} Yesterday's date key
 */
export const getYesterdayKey = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDateKey(yesterday);
};

/**
 * Format a date object to YYYY-MM-DD string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse a date key string back to a Date object
 * @param {string} dateKey - Date key in YYYY-MM-DD format
 * @returns {Date} Date object
 */
export const parseDateKey = (dateKey) => {
    return new Date(dateKey + 'T00:00:00');
};

/**
 * Check if a date is today
 * @param {string} dateKey - Date key to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateKey) => {
    return dateKey === getTodayKey();
};

/**
 * Check if a date is yesterday
 * @param {string} dateKey - Date key to check
 * @returns {boolean} True if the date is yesterday
 */
export const isYesterday = (dateKey) => {
    return dateKey === getYesterdayKey();
};

/**
 * Get the number of days between two dates
 * @param {string} startDateKey - Start date key
 * @param {string} endDateKey - End date key
 * @returns {number} Number of days between dates
 */
export const getDaysBetween = (startDateKey, endDateKey) => {
    const start = parseDateKey(startDateKey);
    const end = parseDateKey(endDateKey);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get a date key for a specific number of days ago
 * @param {number} daysAgo - Number of days ago
 * @returns {string} Date key for that many days ago
 */
export const getDateKeyDaysAgo = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return formatDateKey(date);
};

/**
 * Get all date keys between two dates (inclusive)
 * @param {string} startDateKey - Start date key
 * @param {string} endDateKey - End date key
 * @returns {string[]} Array of date keys
 */
export const getDateRange = (startDateKey, endDateKey) => {
    const dates = [];
    const start = parseDateKey(startDateKey);
    const end = parseDateKey(endDateKey);
    
    const current = new Date(start);
    while (current <= end) {
        dates.push(formatDateKey(current));
        current.setDate(current.getDate() + 1);
    }
    
    return dates;
};

/**
 * Format date for display
 * @param {string} dateKey - Date key to format
 * @param {string} format - Format type ('short', 'long', 'relative', 'withWeekday')
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (dateKey, format = 'short') => {
    const date = parseDateKey(dateKey);
    
    switch (format) {
        case 'short':
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        case 'withWeekday':
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
        case 'long':
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case 'relative':
            const today = new Date();
            const diffTime = today - date;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            return formatDateForDisplay(dateKey, 'short');
        default:
            return dateKey;
    }
};

/**
 * Check if a date is within a valid range (not too far in the future)
 * @param {string} dateKey - Date key to validate
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (dateKey) => {
    const date = parseDateKey(dateKey);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return date <= tomorrow;
};
