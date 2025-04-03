import axios from 'axios';

// Get the API URL from environment variables or use default
const API_URL = "https://africa-risk-api.onrender.com";

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

export async function fetchDashboardData() {
  try {
    console.log("Fetching dashboard data from:", API_URL);
    const response = await fetch(`${API_URL}/dashboard-data`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API error fetching dashboard data:", error);
    throw error;
  }
}

export async function fetchModelInfo() {
  try {
    console.log("Fetching model info from:", API_URL);
    const response = await fetch(`${API_URL}/model-info`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API error fetching model info:", error);
    throw error;
  }
}

export async function fetchCategories() {
  try {
    console.log("Fetching categories from:", API_URL);
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API error fetching categories:", error);
    throw error;
  }
}

export default apiClient;