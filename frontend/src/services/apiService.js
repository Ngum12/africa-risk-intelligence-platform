import axios from 'axios';

// Set base URL for API requests - handle environment variables safely for the browser
const API_BASE_URL = window.ENV_API_BASE_URL || 
                    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) || 
                    'http://localhost:8080'; // Default fallback

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout to 60 seconds for model training operations
  headers: {
    'Content-Type': 'application/json'
  }
});

// Custom error handling for API responses
api.interceptors.response.use(
  response => response,
  error => {
    // Log API errors
    console.error('API Error:', error.response || error);
    
    // Create more user-friendly error message
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'An unknown error occurred';
      
    return Promise.reject({
      ...error,
      friendlyMessage: errorMessage
    });
  }
);

export const RiskApi = {
  // Get all risk hotspots
  getHotspots: (refresh = false) => {
    return api.get(`/api/risk-hotspots${refresh ? '?refresh=true' : ''}`);
  },
  
  // Get media intelligence for a specific hotspot
  getMediaIntelligence: (hotspotId) => {
    return api.get(`/api/media-intelligence/${hotspotId}`);
  },
  
  // Get model metrics
  getModelMetrics: () => {
    return api.get('/api/model/metrics');
  },
  
  // Trigger model retraining with additional options
  retrainModel: (options = {}) => {
    return api.post('/api/model/retrain', options);
  },
  
  // Get model training logs and history
  getModelTrainingLogs: (limit = 50) => {
    return api.get(`/api/model/training-logs?limit=${limit}`);
  },
  
  // Get model training status
  getModelTrainingStatus: () => {
    return api.get('/api/model/training-status');
  },
  
  // Generate risk report for a hotspot or region
  generateRiskReport: (params) => {
    return api.post('/api/reports/generate', params);
  },
  
  // Upload new training data
  uploadTrainingData: (formData) => {
    return axios.post(`${API_BASE_URL}/api/model/upload-training-data`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Get model version history
  getModelVersionHistory: () => {
    return api.get('/api/model/versions');
  },
  
  // Compare model versions
  compareModelVersions: (version1, version2) => {
    return api.get(`/api/model/compare?v1=${version1}&v2=${version2}`);
  },
  
  // Get detailed model performance metrics
  getDetailedModelMetrics: () => {
    return api.get('/api/model/detailed-metrics');
  },
  
  // Fix data issues in training set
  fixDataIssues: (issues) => {
    return api.post('/api/model/fix-data-issues', { issues });
  },

  // Verify that model retraining was successful
  verifyModelRetraining: () => {
    return api.get('/model/verify-retraining');
  }
};

// Create a WebSocket connection for real-time model training updates
export const createModelTrainingSocket = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = API_BASE_URL.replace(/^https?:\/\//, '');
  
  return new WebSocket(`${wsProtocol}//${wsHost}/ws/model-training`);
};

export default RiskApi;