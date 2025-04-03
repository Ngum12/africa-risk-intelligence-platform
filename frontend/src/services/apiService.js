import axios from 'axios';
import { API_URL } from './config';

// Set base URL for API requests - handle environment variables safely for the browser
const API_BASE_URL = window.ENV_API_BASE_URL || 
                   (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) || 
                   API_URL; // Default fallback

// Safe URL encoding function
const safeEncodeURI = (uri) => {
  try {
    // First decode to ensure we don't double-encode
    const decoded = decodeURI(uri);
    return encodeURI(decoded);
  } catch (e) {
    // If there's an error, just encode the original
    return encodeURI(uri);
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout to 60 seconds for model training operations
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to properly encode URLs
api.interceptors.request.use(config => {
  // Make sure URL is properly encoded to prevent malformed URI errors
  if (config.url) {
    // Only encode the path portion, not the full URL with protocol
    const url = config.url;
    // Don't double-encode already encoded URLs
    if (!url.includes('%')) {
      config.url = url
        .split('/')
        .map(segment => segment.includes('?') 
          ? segment.split('?').map((part, i) => i === 0 ? encodeURIComponent(part) : part).join('?')
          : encodeURIComponent(segment)
        )
        .join('/');
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
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
    if (!hotspotId) {
      return Promise.reject({
        friendlyMessage: "Invalid hotspot ID"
      });
    }
    // Convert to string and ensure properly encoded
    const id = String(hotspotId).trim();
    return api.get(`/media-intelligence/${id}`);
  },

  // Get media intelligence data for multiple hotspots
  getBatchMediaIntelligence: (hotspotIds) => {
    // Send as JSON body, no need to encode
    return api.post('/media-intelligence/batch', { hotspotIds });
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
    // Encode version parameters
    const v1 = encodeURIComponent(String(version1));
    const v2 = encodeURIComponent(String(version2));
    return api.get(`/api/model/compare?v1=${v1}&v2=${v2}`);
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
  },

  // Get video analysis
  getVideoAnalysis: (videoId) => {
    if (!videoId) {
      return Promise.reject({
        friendlyMessage: "Invalid video ID"
      });
    }
    // Convert to string and trim to prevent encoding issues
    const id = String(videoId).trim();
    return api.get(`/video-analysis/${id}`);
  },
  
  // Get training log file contents
  getTrainingLogFile: (lines = 50) => {
    return api.get(`/model/training-log-file?lines=${lines}`);
  },
  
  // Get retraining history
  getRetrainingHistory: () => {
    return api.get('/model/retraining-history');
  }
};

// Create a WebSocket connection for real-time model training updates
export const createModelTrainingSocket = () => {
  try {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = API_BASE_URL.replace(/^https?:\/\//, '');
    
    return new WebSocket(`${wsProtocol}//${wsHost}/ws/model-training`);
  } catch (e) {
    console.error("Failed to create WebSocket connection:", e);
    return null;
  }
};

export default RiskApi;