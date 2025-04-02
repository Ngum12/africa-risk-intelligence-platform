import axios from 'axios';

// Use port 8080 instead of 8000
const API_BASE_URL = 'http://localhost:8080'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default apiClient;