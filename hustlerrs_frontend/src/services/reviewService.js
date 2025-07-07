import api from './api';

/**
 * Submits a review for a specific job and deletes associated messages.
 * @param {string} jobId - The ID of the job being reviewed.
 * @param {object} reviewData - The review data.
 * @param {number} reviewData.rating - The rating from 1 to 5.
 * @param {string} reviewData.comment - The review comment.
 * @returns {Promise<any>}
 */
export const submitReview = async (jobId, reviewData) => {
    const response = await api.post(`/reviews/job/${jobId}`, {
        ...reviewData,
        deleteMessages: true // Signal backend to delete messages
    });
    return response.data;
}; 