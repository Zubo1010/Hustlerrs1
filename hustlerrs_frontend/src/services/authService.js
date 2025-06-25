import api from './api';

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const register = async (userData) => {
  return await api.post('/auth/register', userData);
};

const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
};

export default {
  login,
  register,
  getCurrentUser,
  logout,
};
