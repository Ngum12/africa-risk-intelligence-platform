import React, { useState } from 'react';
import { FaVideo, FaRegPlayCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function VideoAnalysisPanel({ videoData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  if (!videoData) {
    return (
      <div className="bg-gray-900/95 border border-gray-800/50 rounded-lg p-4">
        <div className="text-center text-gray-400">
          <FaVideo className="mx-auto text-3xl mb-2" />
          <p>No video analysis available</p>
        </div>
      </div>
    );
  }
  
  const { 
    title, 
    source_url, 
    thumbnail_url, 
    analysis_results, 
    verification_status 
  } = videoData;
  
  return (
    <div className="bg-gray-900/95 border border-gray-800/50 rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        
        {/* Video Player */}
        <div className="relative mb-4">
          {isPlaying ? (
            <iframe
              src={source_url}
              className="w-full aspect-video rounded"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div 
              className="relative w-full aspect-video rounded overflow-hidden cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              <img 
                src={thumbnail_url || 'https://via.placeholder.com/640x360?text=Video+Thumbnail'} 
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/40 transition-colors">
                <FaRegPlayCircle className="text-white text-5xl" />
              </div>
            </div>
          )}
        </div>
        
        {/* Verification Status */}
        <div className={`mb-4 p-2 rounded flex items-center ${
          verification_status === 'verified' ? 'bg-green-900/30 border border-green-800/50' : 
          verification_status === 'unverified' ? 'bg-yellow-900/30 border border-yellow-800/50' :
          'bg-red-900/30 border border-red-800/50'
        }`}>
          {verification_status === 'verified' ? (
            <FaCheckCircle className="text-green-500 mr-2" />
          ) : (
            <FaExclamationTriangle className="text-yellow-500 mr-2" />
          )}
          <div>
            <div className="font-medium">
              {verification_status === 'verified' ? 'Verified Content' : 
               verification_status === 'unverified' ? 'Unverified Content' : 
               'Potentially Misleading Content'}
            </div>
            <div className="text-sm text-gray-400">
              {verification_status === 'verified' ? 'This video has been verified by our analysts' : 
               verification_status === 'unverified' ? 'This video has not been independently verified' :
               'This video contains potentially misleading content'}
            </div>
          </div>
        </div>
        
        {/* Analysis Results */}
        {analysis_results && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-300">Video Analysis</h4>
            
            {/* Objects Detected */}
            {analysis_results.objects_detected && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Objects Detected</div>
                <div className="flex flex-wrap gap-1">
                  {analysis_results.objects_detected.map((object, i) => (
                    <span key={i} className="bg-blue-900/40 text-xs px-2 py-1 rounded">
                      {object.name} ({object.confidence.toFixed(0)}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Location Verification */}
            {analysis_results.location_verification && (
              <div className="bg-gray-800/50 p-2 rounded text-sm">
                <div className="flex justify-between">
                  <span>Location Match:</span>
                  <span className={
                    analysis_results.location_verification.match_confidence > 0.7 ? "text-green-400" : 
                    analysis_results.location_verification.match_confidence > 0.4 ? "text-yellow-400" : 
                    "text-red-400"
                  }>
                    {(analysis_results.location_verification.match_confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {analysis_results.location_verification.details}
                </div>
              </div>
            )}
            
            {/* Timestamp Analysis */}
            {analysis_results.timestamp_analysis && (
              <div className="bg-gray-800/50 p-2 rounded text-sm">
                <div className="flex justify-between">
                  <span>Claimed Date:</span>
                  <span>{analysis_results.timestamp_analysis.claimed_date}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Actual Date (est.):</span>
                  <span className={
                    analysis_results.timestamp_analysis.is_consistent ? "text-green-400" : "text-red-400"
                  }>
                    {analysis_results.timestamp_analysis.estimated_date}
                  </span>
                </div>
              </div>
            )}
            
            {/* Analyst Notes */}
            {analysis_results.analyst_notes && (
              <div className="bg-gray-800/30 border-l-4 border-blue-600 p-3 rounded text-sm italic mt-3">
                <div className="text-xs text-gray-400 mb-1">Analyst Notes:</div>
                <div>{analysis_results.analyst_notes}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}