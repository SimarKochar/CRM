// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
  CAMPAIGNS: `${API_BASE_URL}/campaigns`,
  AUDIENCE: `${API_BASE_URL}/audience`,
  CUSTOMERS: `${API_BASE_URL}/customers`,
  ANALYTICS: `${API_BASE_URL}/analytics`,
};

export default API_BASE_URL;