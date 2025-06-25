import api from './api';

export const sendMessage = async (jobId, text, receiverId) => {
  const response = await api.post(`/chat/${jobId}/message`, { text, receiverId });
  return response.data;
};

export const getMessages = async (jobId) => {
  const response = await api.get(`/chat/${jobId}/messages`);
  return response.data;
};

export const getChatJobs = async () => {
  const response = await api.get('/chat/jobs');
  return response.data;
}; 