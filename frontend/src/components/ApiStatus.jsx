import React, { useState, useEffect } from 'react';
import { API_URL, fetchWithTimeout } from '../config/api';

export default function ApiStatus() {
  const [status, setStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  
  async function checkApiStatus() {
    try {
      setStatus('checking');
      
      // Try to connect to the API health endpoint
      const response = await fetchWithTimeout(`${API_URL}/status`, {}, 5000);
      
      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        console.log('API connected:', data);
      } else {
        setStatus('error');
        console.error('API error:', response.status);
      }
    } catch (error) {
      setStatus('failed');
      console.error('API connection failed:', error);
    } finally {
      setLastChecked(new Date());
    }
  }
  
  useEffect(() => {
    checkApiStatus();
    
    // Check API status every 60 seconds
    const intervalId = setInterval(checkApiStatus, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="flex items-center space-x-2 text-sm">
      <div 
        className={`w-2 h-2 rounded-full ${
          status === 'connected' ? 'bg-green-500' : 
          status === 'checking' ? 'bg-yellow-500' : 
          'bg-red-500'
        }`}
      />
      
      <span>
        API: {
          status === 'connected' ? 'Connected' : 
          status === 'checking' ? 'Checking...' : 
          'Disconnected'
        }
      </span>
      
      {status !== 'connected' && (
        <button 
          onClick={checkApiStatus}
          className="text-blue-400 hover:text-blue-300 underline text-xs"
        >
          Retry
        </button>
      )}
    </div>
  );
}