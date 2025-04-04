import { API_URL } from './api';

/**
 * Check API status
 * @returns {Promise<Object>} Status object with ok boolean
 */
export async function checkApiStatus() {
  try {
    console.log('Checking API status:', `${API_URL}/status`);
    const response = await fetch(`${API_URL}/status`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API connected:', data);
      return { ok: true, data };
    } else {
      console.error('API error:', response.status);
      return { ok: false, status: response.status };
    }
  } catch (error) {
    console.error('API connection failed:', error);
    return { ok: false, error: error.message };
  }
}