import { API_URL } from './config/api';

/**
 * Fetch dashboard data from the API
 * @returns {Promise<Object>} Dashboard data
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
        trend_data: {
          "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          "incidents": [45, 52, 49, 60, 55, 70],
          "fatalities": [23, 27, 30, 35, 25, 45]
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
        type: "RandomForest",
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