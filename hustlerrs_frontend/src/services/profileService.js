import axios from 'axios';

const API_URL = 'http://localhost:5000/api/profile';

/**
 * Gets the profile of the currently logged-in user.
 * The token is used by the backend to identify the user.
 */
export const getProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

/**
 * Gets the public profile of a specific user by their ID.
 * @param {string} userId - The ID of the user to fetch.
 */
export const getProfileById = async (userId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};


/**
 * Updates the profile of the currently logged-in user.
 * @param {object} profileData - The data to update.
 */
export const updateProfile = async (profileData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(API_URL, profileData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}; 