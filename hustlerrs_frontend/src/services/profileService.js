import api from './api';

/**
 * Gets the profile of the currently logged-in user.
 * The token is used by the backend to identify the user.
 */
export const getProfile = async () => {
    const response = await api.get('/profile');
    return response.data;
};

/**
 * Gets the public profile of a specific user by their ID.
 * @param {string} userId - The ID of the user to fetch.
 */
export const getProfileById = async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
};

/**
 * Updates the profile of the currently logged-in user.
 * @param {object} profileData - The data to update.
 */
export const updateProfile = async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
}; 