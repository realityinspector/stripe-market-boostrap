// API service for making requests to the backend

// Base URL for API requests
const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint to request
 * @param {string} token - JWT token for authentication (optional)
 * @returns {Promise<any>} Response data
 */
export const get = async (endpoint, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return await response.json();
  } catch (error) {
    console.error(`API GET Error (${endpoint}):`, error);
    return {
      success: false,
      message: 'Network request failed. Please check your connection.',
    };
  }
};

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint to request
 * @param {object} data - Data to send in the request body
 * @param {string} token - JWT token for authentication (optional)
 * @returns {Promise<any>} Response data
 */
export const post = async (endpoint, data = {}, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error(`API POST Error (${endpoint}):`, error);
    return {
      success: false,
      message: 'Network request failed. Please check your connection.',
    };
  }
};

/**
 * Make a PUT request to the API
 * @param {string} endpoint - API endpoint to request
 * @param {object} data - Data to send in the request body
 * @param {string} token - JWT token for authentication (optional)
 * @returns {Promise<any>} Response data
 */
export const put = async (endpoint, data = {}, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error(`API PUT Error (${endpoint}):`, error);
    return {
      success: false,
      message: 'Network request failed. Please check your connection.',
    };
  }
};

/**
 * Make a PATCH request to the API
 * @param {string} endpoint - API endpoint to request
 * @param {object} data - Data to send in the request body
 * @param {string} token - JWT token for authentication (optional)
 * @returns {Promise<any>} Response data
 */
export const patch = async (endpoint, data = {}, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error(`API PATCH Error (${endpoint}):`, error);
    return {
      success: false,
      message: 'Network request failed. Please check your connection.',
    };
  }
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - API endpoint to request
 * @param {string} token - JWT token for authentication (optional)
 * @returns {Promise<any>} Response data
 */
export const del = async (endpoint, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return await response.json();
  } catch (error) {
    console.error(`API DELETE Error (${endpoint}):`, error);
    return {
      success: false,
      message: 'Network request failed. Please check your connection.',
    };
  }
};
