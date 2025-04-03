import React, { useState, useEffect } from 'react';

export default function ApiDebug() {
  const [apiUrl, setApiUrl] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setApiUrl(import.meta.env.VITE_API_URL || 'Not set');
  }, []);

  const testApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      const data = await response.json();
      setTestResult({ success: true, status: response.status, data });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl mb-4">API Debugging</h2>
      <div className="mb-4">
        <strong>API URL:</strong> {apiUrl}
      </div>
      <button 
        onClick={testApi}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-700 rounded">
          <h3>Test Results:</h3>
          {testResult.success ? (
            <div className="text-green-400">
              Success! Status: {testResult.status}
              <pre className="mt-2">{JSON.stringify(testResult.data, null, 2)}</pre>
            </div>
          ) : (
            <div className="text-red-400">
              Error: {testResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}