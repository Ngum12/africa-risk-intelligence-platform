import React, { useState } from 'react';
import apiClient from '../services/api';

export default function DataUploader() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    
    // Check if it's a CSV file
    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Use correct port in the API endpoint
      const response = await apiClient.post('/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadStatus({
        success: true,
        message: "Model successfully retrained!"
      });
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus({
        success: false,
        message: err.response?.data?.detail || "Upload failed. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Update Model with New Data</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Upload CSV Data File</label>
          <input 
            type="file" 
            onChange={handleFileChange}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-700 rounded cursor-pointer"
            accept=".csv"
          />
          <p className="text-xs mt-1 text-gray-400">
            File should include columns for country, admin1, event_type, actor1, etc.
          </p>
        </div>
        
        <button 
          type="submit" 
          disabled={isUploading || !file}
          className={`w-full py-2 font-bold rounded ${
            isUploading || !file 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isUploading ? "Uploading & Retraining..." : "Upload & Retrain Model"}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {uploadStatus && (
        <div className={`mt-4 p-3 rounded-md ${
          uploadStatus.success 
            ? 'bg-green-900/50 border border-green-700' 
            : 'bg-red-900/50 border border-red-700'
        }`}>
          <p className={uploadStatus.success ? 'text-green-400' : 'text-red-400'}>
            {uploadStatus.message}
          </p>
        </div>
      )}
    </div>
  );
}
