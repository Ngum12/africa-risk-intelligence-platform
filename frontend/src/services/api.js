import axios from 'axios';

export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://africa-risk-api.onrender.com' 
  : 'http://localhost:8000';

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
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  // Increase delay between retries for cold starts
  const delays = [3000, 8000, 15000]; 
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      console.log(`Fetching ${url} (attempt ${i+1}/${maxRetries+1})`);
      
      // Use axios instead of fetch for better error handling
      const response = await apiClient.get(url, options);
      return response.data;
    } catch (error) {
      console.error(`Attempt ${i+1} failed:`, error);
      lastError = error;
      
      if (i < maxRetries) {
        const delay = delays[i] || 15000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Fetch dashboard data from the API
 * @returns {Promise<Object>} Dashboard data with fallback
 */
export async function fetchDashboardData() {
  try {
    console.log('Fetching dashboard data from:', `${API_URL}/dashboard-data`);
    const response = await fetch(`${API_URL}/dashboard-data`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    // Return fallback data on error
    return {
      data: {
        risk_by_country: {
          "Nigeria": {"high": 65, "low": 35},
          "Somalia": {"high": 78, "low": 22},
          "South Sudan": {"high": 82, "low": 18},
          "DRC": {"high": 70, "low": 30},
          "Ethiopia": {"high": 55, "low": 45}
        },
        event_types: {
          "Protests": 120,
          "Violence against civilians": 85,
          "Armed clashes": 65,
          "Remote explosives": 40,
          "Strategic developments": 25
        },
        actor_data: {
          "State forces": 95,
          "Rebel groups": 75,
          "Political militias": 60,
          "Identity militias": 45,
          "Civilians": 40
        },
        feature_importances: {
          "Location": 0.25,
          "Actor type": 0.20,
          "Event history": 0.18,
          "Population density": 0.15,
          "Economic indicators": 0.12,
          "Seasonal factors": 0.10
        },
        trend_data: { 
          months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], 
          incidents: [45, 52, 49, 60, 55, 70], 
          fatalities: [23, 27, 30, 35, 25, 45] 
        },
        hotspots: [
          {"lat": 9.0820, "lng": 8.6753, "intensity": 0.8, "location": "Nigeria"},
          {"lat": 5.1521, "lng": 46.1996, "intensity": 0.9, "location": "Somalia"},
          {"lat": 7.8699, "lng": 29.6667, "intensity": 0.85, "location": "South Sudan"},
          {"lat": -0.2280, "lng": 15.8277, "intensity": 0.75, "location": "DRC"},
          {"lat": 9.1450, "lng": 40.4897, "intensity": 0.7, "location": "Ethiopia"}
        ],
        model_metrics: {
          accuracy: 0.87,
          precision: 0.83,
          recall: 0.85,
          f1: 0.84
        }
      }
    };
  }
}

/**
 * Fetch model info from the API
 * @returns {Promise<Object>} Model information
 */
export async function fetchModelInfo() {
  try {
    console.log('Fetching model info from:', `${API_URL}/model-info`);
    const response = await fetch(`${API_URL}/model-info`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Model info fetch error:', error);
    // Return fallback data on error
    return {
      model_info: {
        type: "Random Forest",
        last_updated: new Date().toISOString(),
        size_mb: 5.2,
        n_estimators: 150
      }
    };
  }
}

/**
 * Fetch model retraining status
 * @returns {Promise<Object>} Retraining status
 */
export async function fetchModelStatus() {
  try {
    const response = await fetch(`${API_URL}/model/retraining-status`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching model status:', error);
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