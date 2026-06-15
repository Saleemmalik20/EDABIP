import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const authApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach token to all requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register new user
export const register = async (userData) => {
  const response = await authApi.post('/auth/register', userData);
  return response.data;
};

// Login user
export const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);  // FastAPI OAuth2 expects 'username'
  formData.append('password', password);
  
  const response = await authApi.post('/auth/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get current logged-in user profile from the database
export const getCurrentUser = async () => {
  const response = await authApi.get('/auth/me');
  return response.data;
};

export default authApi;