import axios from 'axios';

// Get the API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log('API URL being used:', API_URL); // For debugging

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for Render cold starts
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API request failed:', error.message, 'to URL:', error.config?.url);
    return Promise.reject(error);
  }
);

export default apiClient;