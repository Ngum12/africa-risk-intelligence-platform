// API configuration with CORS proxy

// Use CORS proxy as fallback
export const USE_CORS_PROXY = true;
export const CORS_PROXY_URL = 'https://corsproxy.io/?';

// Always use the deployed backend URL for production
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://africa-risk-api.onrender.com'
  : 'http://localhost:8000';

// Helper for API calls with timeout and error handling
export async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. The server might be under heavy load.');
    }
    throw error;
  }
}

// Helper for API calls with CORS proxy fallback
export async function fetchWithFallback(url, options = {}) {
  // Try direct fetch first
  try {
    const response = await fetch(url, options);
    if (response.ok) return response;
  } catch (error) {
    console.warn(`Direct fetch failed: ${error.message}. Trying CORS proxy...`);
  }

  // If direct fetch fails, try with CORS proxy
  if (USE_CORS_PROXY) {
    const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(url)}`;
    console.log(`Trying with CORS proxy: ${proxyUrl}`);
    return fetch(proxyUrl, options);
  }
  
  // If we get here, both attempts failed
  throw new Error('Failed to fetch data after trying with CORS proxy');
}

// Update all your API call functions
export function getDashboardData() {
  const url = `${API_URL}/dashboard-data`;
  console.log('Fetching dashboard data from:', url);
  return fetchWithFallback(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return response.json();
    })
    .catch(error => {
      console.error('Dashboard fetch error:', error);
      throw error;
    });
}

export function getModelInfo() {
  const url = `${API_URL}/model-info`;
  console.log('Fetching model info from:', url);
  return fetchWithFallback(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return response.json();
    })
    .catch(error => {
      console.error('Model info fetch error:', error);
      throw error;
    });
}

// Similarly update other API call functions that you're using