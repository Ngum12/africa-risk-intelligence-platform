import React from 'react';

export default function MapControlPanel({ onZoomIn, onZoomOut, onReset, onToggleHeatmap }) {
  return (
    <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-800 z-20">
      <div className="p-2 flex flex-col space-y-2">
        <button 
          onClick={onZoomIn}
          className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button 
          onClick={onZoomOut}
          className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="border-t border-gray-700"></div>
        
        <button 
          onClick={onToggleHeatmap}
          className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          title="Toggle Heatmap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        
        <button 
          onClick={onReset}
          className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          title="Reset View"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7.805v2.205a1 1 0 01-2 0V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H16a1 1 0 110 2h-5a1 1 0 01-1-1v-5a1 1 0 112 0v2.101a7.002 7.002 0 01-8.175 3.413 1 1 0 01-.717-1.457z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}