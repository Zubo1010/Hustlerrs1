import api from './api';

export const sendMessage = async (jobId, text, receiverId) => {
  try {
    const response = await api.post(`/chat/${jobId}/message`, { text, receiverId });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    throw error;
  }
};

export const getMessages = async (jobId) => {
  try {
    const response = await api.get(`/chat/${jobId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error getting messages:', error.response?.data || error.message);
    throw error;
  }
};

export const getChatJobs = async () => {
  try {
    const response = await api.get('/chat/jobs');
    console.log('Debug - Chat jobs response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat jobs:', error);
    throw error;
  }
};

export const submitJobReview = async (jobId, reviewData) => {
  try {
    console.log('Debug - Submitting review for job:', jobId);
    console.log('Debug - Review data:', reviewData);
    
    const response = await api.post(`/reviews/job/${jobId}`, reviewData);
    console.log('Debug - Review submission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting job review:', error);
    throw error;
  }
}; 