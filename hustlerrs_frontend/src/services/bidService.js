import api from './api';

export const createBid = async (jobId, bidData) => {
  return await api.post(`/bids/job/${jobId}`, bidData);
};

export const getJobBids = async (jobId) => {
  const response = await api.get(`/bids/job/${jobId}`);
  return response.data;
};

export const getHustlerBids = async () => {
  const response = await api.get('/bids/my-bids');
  return response.data;
};

export const withdrawBid = async (bidId) => {
  return await api.put(`/bids/${bidId}/withdraw`);
};

export const updateBidStatus = async (bidId, { status }) => {
  return await api.put(`/bids/${bidId}/status`, { status });
};

export const getBidDetails = async (bidId) => {
  const response = await api.get(`/bids/${bidId}`);
  return response.data;
};
