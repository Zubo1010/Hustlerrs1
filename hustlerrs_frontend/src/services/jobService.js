import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Handle unauthorized error (e.g., redirect to login)
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ message: 'No response from server' });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({ message: error.message });
    }
  }
);

// Get all available jobs (for hustlers)
export const getJobs = async (searchTerm = '', status = '', page = 1, limit = 10) => {
  try {
    const params = {
      search: searchTerm,
      status,
      page,
      limit
    };
    const response = await api.get('/jobs', { params });
    if (!response.data || !Array.isArray(response.data.jobs)) {
      throw new Error('Invalid response format from server');
    }
    return {
      jobs: response.data.jobs,
      total: response.data.total || 0,
      pages: response.data.pages || 1,
      currentPage: response.data.page || 1
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Get jobs posted by the current user (giver)
export const getMyJobs = async (searchTerm = '', status = '', page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/jobs/my-jobs`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { searchTerm, status, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my jobs:', error.response?.data?.message || error.message);
    throw new Error('Failed to load your jobs. Please try again later.');
  }
};

// Create a new job
export const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

// Get a single job by ID
export const getJobById = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
};

// Update a job
export const updateJob = async (jobId, jobData) => {
  try {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

// Delete a job
export const deleteJob = async (jobId) => {
  try {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

export const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  } catch (error) {
    console.error('Error applying for job:', error);
    throw error;
  }
};

export const getMyApplications = async () => {
  try {
    const response = await api.get('/jobs/my-applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching my applications:', error);
    throw error;
  }
};

export const withdrawApplication = async (bidId) => {
  try {
    const response = await api.put(`/bids/${bidId}/withdraw`);
    return response.data;
  } catch (error) {
    console.error('Error withdrawing application:', error);
    throw error;
  }
};

export const getJobApplications = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}/applications`);
  return response.data;
};

/**
 * Marks a job as complete and clears its chat history.
 * @param {string} jobId The ID of the job to complete.
 * @returns {Promise<any>}
 */
export const completeJob = async (jobId) => {
    const response = await api.put(`/jobs/${jobId}/complete`);
    return response.data;
};
