import React, { useState } from 'react';
import apiClient from '../services/api';

export default function DataAnalysis() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await apiClient.post('/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadStatus({
        success: true,
        message: "File uploaded and processed successfully"
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        success: false,
        message: "Error uploading file"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Data Analysis</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">Upload Data</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Select CSV File</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv"
            className="w-full p-2 bg-gray-700 rounded"
          />
        </div>
        
        <button
          onClick={handleUpload}
          disabled={isUploading || !file}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
        >
          {isUploading ? "Uploading..." : "Upload and Analyze"}
        </button>
        
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-md ${
            uploadStatus.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
          }`}>
            <p className={uploadStatus.success ? 'text-green-400' : 'text-red-400'}>
              {uploadStatus.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}