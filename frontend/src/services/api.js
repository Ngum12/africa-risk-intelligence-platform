import axios from 'axios';

// Hardcode the API URL to ensure it works correctly
const API_URL = "https://africa-risk-api.onrender.com";
console.log("Using API URL:", API_URL);

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

// Add retry logic for slow cold starts on Render's free tier
async function fetchWithRetry(url, options = {}, maxRetries = 2) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      console.log(`Fetching ${url} (attempt ${i+1}/${maxRetries+1})`);
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${i+1} failed:`, error);
      lastError = error;
      if (i < maxRetries) {
        // Wait longer between retries (3s, then 6s)
        const delay = (i + 1) * 3000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

export async function fetchDashboardData() {
  try {
    console.log("Fetching dashboard data from:", `${API_URL}/dashboard-data`);
    const response = await fetch(`${API_URL}/dashboard-data`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Dashboard data response:", data);
    return data;
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    throw error;
  }
}

export async function fetchModelInfo() {
  try {
    console.log("Fetching model info from:", `${API_URL}/model-info`);
    const response = await fetch(`${API_URL}/model-info`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Model info response:", data);
    return data;
  } catch (error) {
    console.error("Model info fetch error:", error);
    throw error;
  }
}

export async function fetchCategories() {
  return fetchWithRetry(`${API_URL}/categories`);
}

export default {
  fetchDashboardData,
  fetchModelInfo,
  fetchCategories,
  apiClient
};