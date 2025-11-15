// Supabase client configuration for MatchaCode
// Handles all database operations and API calls

// Supabase configuration - using environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Create a simple Supabase client using fetch API
 */
class SupabaseClient {
    constructor() {
        this.url = SUPABASE_URL;
        this.key = SUPABASE_KEY;
    }

    /**
     * Make a request to Supabase
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        // Check if we have the required configuration
        if (!this.url) {
            throw new Error('Supabase url missing. Please check your VITE_SUPABASE_URL env variables.');
        }
        if (!this.key) {
            throw new Error('Supabase key missing. Please check your VITE_SUPABASE_KEY env variables.');
        }

        const url = `${this.url}/rest/v1/${endpoint}`;
        const headers = {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        console.log('Making Supabase request to:', url);
        console.log('Headers:', headers);

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                // Try to get error details
                let errorData;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    const text = await response.text();
                    console.error('Non-JSON error response:', text);
                    errorData = { message: `HTTP error! status: ${response.status}`, details: text };
                }
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);
            return data;
        } catch (error) {
            console.error('Supabase request failed:', error);
            throw error;
        }
    }

    /**
     * Get data from a table
     * @param {string} table - Table name
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Table data
     */
    async from(table, options = {}) {
        const { select = '*', filters = [], order = null, limit = null } = options;
        
        let endpoint = `${table}?select=${select}`;
        
        // Add filters
        filters.forEach(filter => {
            endpoint += `&${filter.column}=${filter.operator}.${filter.value}`;
        });
        
        // Add ordering
        if (order) {
            endpoint += `&order=${order.column}.${order.ascending ? 'asc' : 'desc'}`;
        }
        
        // Add limit
        if (limit) {
            endpoint += `&limit=${limit}`;
        }

        return await this.request(endpoint);
    }

    /**
     * Insert data into a table
     * @param {string} table - Table name
     * @param {Object} data - Data to insert
     * @returns {Promise<Object>} Inserted data
     */
    async insert(table, data) {
        return await this.request(table, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Update data in a table
     * @param {string} table - Table name
     * @param {Object} data - Data to update
     * @param {Object} filter - Filter conditions
     * @returns {Promise<Object>} Updated data
     */
    async update(table, data, filter) {
        const endpoint = `${table}?${filter.column}=${filter.operator}.${filter.value}`;
        return await this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * Delete data from a table
     * @param {string} table - Table name
     * @param {Object} filter - Filter conditions
     * @returns {Promise<Object>} Deletion result
     */
    async delete(table, filter) {
        const endpoint = `${table}?${filter.column}=${filter.operator}.${filter.value}`;
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Call a stored procedure
     * @param {string} functionName - Function name
     * @param {Object} params - Parameters
     * @returns {Promise<Object>} Function result
     */
    async rpc(functionName, params = {}) {
        return await this.request(`rpc/${functionName}`, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }
}

// Create and export global instance
const supabaseClient = new SupabaseClient();

export default supabaseClient;
