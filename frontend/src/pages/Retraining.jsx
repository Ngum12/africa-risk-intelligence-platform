import React, { useState, useEffect } from 'react';
import { API_URL, fetchWithTimeout } from '../config/api';

export default function Retraining() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch model status on component mount
  useEffect(() => {
    fetchModelStatus();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchModelStatus, 30000);
    return () => clearInterval(intervalId);
  }, []);

  async function fetchModelStatus() {
    try {
      setIsLoading(true);
      const response = await fetchWithTimeout(`${API_URL}/model/retraining-status`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      setModelStatus(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching model status:", err);
      setError(err.message || "Failed to connect to API");
      
      // Set default model status so UI can still render
      setModelStatus({
        status: "unknown",
        message: "Cannot connect to backend",
        model_size_mb: 0,
        last_modified: null,
        metadata: null,
        last_attempts: []
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError("Please select a CSV file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload-csv`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        // Start polling more frequently to catch the model update quickly
        modelEventService.startPolling(5000);  // Poll every 5 seconds
        
        // Reset to normal polling after 2 minutes
        setTimeout(() => {
          modelEventService.startPolling();  // Back to default interval
        }, 120000);
      }
      
      // Refresh model status after upload
      await fetchModelStatus();
      
    } catch (err) {
      console.error("Upload failed:", err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Format date for display
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Model Retraining</h1>
      
      {error && (
        <div className="bg-red-800/30 border border-red-700 rounded-xl p-4 mb-6 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}
      
      {/* Model Status */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Current Model Status</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : modelStatus ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <span 
                className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  modelStatus.status === "ready" ? "bg-green-500" : "bg-yellow-500"
                }`}>
              </span>
              <span className="text-lg">
                {modelStatus.status === "ready" ? "Model Ready" : "Model Not Ready"} 
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Last Modified</p>
                <p className="text-lg">{formatDate(modelStatus.last_modified)}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Model Size</p>
                <p className="text-lg">{modelStatus.model_size_mb} MB</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Training Samples</p>
                <p className="text-lg">
                  {modelStatus.metadata?.num_samples || "Unknown"}
                </p>
              </div>
            </div>
            
            {modelStatus.metadata?.metrics && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Model Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-xs">Accuracy</p>
                    <p className="text-xl">{(modelStatus.metadata.metrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-xs">Precision</p>
                    <p className="text-xl">{(modelStatus.metadata.metrics.precision * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-xs">Recall</p>
                    <p className="text-xl">{(modelStatus.metadata.metrics.recall * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-gray-400 text-xs">F1 Score</p>
                    <p className="text-xl">{(modelStatus.metadata.metrics.f1 * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">No model status available</p>
        )}
      </div>
      
      {/* Upload Form */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Upload Training Data</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              CSV Training File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv"
              className="block w-full text-sm border rounded-lg cursor-pointer bg-gray-700 border-gray-600 placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              disabled={isUploading}
            />
            <p className="mt-1 text-sm text-gray-400">
              Upload a CSV file containing training data. Your CSV file must include:
              <ul className="list-disc pl-5 mt-1">
                <li>All required feature columns: <code className="bg-gray-900 px-1 rounded">COUNTRY, ADMIN1, EVENT_TYPE, ACTOR1, LATITUDE, LONGITUDE, YEAR, FATALITIES</code></li>
                <li>A target column named <code className="bg-gray-900 px-1 rounded">TARGET</code> or <code className="bg-gray-900 px-1 rounded">CONFLICT_RISK</code> with values of 0 (low risk) or 1 (high risk)</li>
              </ul>
            </p>
            <div className="mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <a 
                href="/sample_training_data.csv" 
                download 
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Download sample CSV template
              </a>
            </div>
          </div>
          <button
            type="submit"
            disabled={!file || isUploading}
            className={`px-4 py-2 text-white rounded-lg ${
              !file || isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Start Retraining'}
          </button>
        </form>
        
        {uploadResult && (
          <div className={`mt-4 p-4 rounded-lg ${uploadResult.success ? 'bg-green-800/30 border border-green-700' : 'bg-orange-800/30 border border-orange-700'}`}>
            <h3 className="font-semibold mb-1">{uploadResult.success ? 'Success!' : 'Warning'}</h3>
            <p>{uploadResult.message || 'File uploaded successfully.'}</p>
            {uploadResult.details && (
              <div className="mt-2 text-sm">
                <pre className="bg-gray-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(uploadResult.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {uploadResult && !uploadResult.success && (
          <div className="mt-4 p-4 rounded-lg bg-orange-800/30 border border-orange-700">
            <h3 className="font-semibold mb-1 text-orange-400">Training Failed</h3>
            <p>{uploadResult.error || 'Unknown error occurred'}</p>
            
            {uploadResult.error?.includes("target column") && (
              <div className="mt-3 text-sm">
                <p className="text-yellow-300 font-medium">CSV Format Requirements:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Must include a target column named "target" or "CONFLICT_RISK"</li> 
                  <li>Target values must be 0 (low risk) or 1 (high risk)</li>
                  <li>Include feature columns like: country, admin1, latitude, longitude</li>
                  <li><a href="/sample_training_data.csv" download className="text-blue-400 hover:underline">Download a sample CSV</a></li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Recent Retraining History */}
      {modelStatus?.last_attempts && modelStatus.last_attempts.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Retraining Attempts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {modelStatus.last_attempts.map((attempt, idx) => (
                  <tr key={idx} className={attempt.success ? "bg-green-900/10" : "bg-red-900/10"}>
                    <td className="py-2 px-4">{formatDate(attempt.timestamp)}</td>
                    <td className="py-2 px-4">
                      {attempt.success ? (
                        <span className="text-green-500">Success</span>
                      ) : (
                        <span className="text-red-500">Failed</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {attempt.success 
                        ? `Trained on ${attempt.num_samples || '?'} samples` 
                        : attempt.error || 'Unknown error'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-gray-800 rounded-xl p-4 mt-6 border border-yellow-600">
          <h3 className="text-lg font-semibold text-yellow-500">Connection Diagnostics</h3>
          <p className="text-sm text-gray-400 mt-2">Backend URL: {API_URL}</p>
          <p className="text-sm text-gray-400">Error: {error}</p>
          <div className="mt-4">
            <h4 className="font-medium text-gray-300">Troubleshooting Steps:</h4>
            <ul className="list-disc pl-5 mt-2 text-sm text-gray-400">
              <li>Ensure the backend server is running</li>
              <li>Check if the port in api.js matches your backend port</li>
              <li>Verify there are no CORS issues in your backend configuration</li>
              <li>Check your browser's network tab for specific error details</li>
            </ul>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => fetchModelStatus()} 
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
