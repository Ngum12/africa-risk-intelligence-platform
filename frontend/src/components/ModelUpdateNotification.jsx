import React, { useState, useEffect } from 'react';

export default function ModelUpdateNotification({ onDismiss, timestamp }) {
  const [fadeOut, setFadeOut] = useState(false);
  
  // Format the timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };
  
  // Handle auto fade-out animation
  useEffect(() => {
    // Start fade out animation after 8 seconds
    const timeout = setTimeout(() => {
      setFadeOut(true);
    }, 8000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 bg-green-800/90 text-white px-6 py-4 rounded-lg shadow-lg border border-green-600 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      onTransitionEnd={() => {
        if (fadeOut) onDismiss();
      }}
    >
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <p className="font-medium">Model Updated</p>
      </div>
      <p className="text-sm text-green-300 mt-1">
        Model was successfully retrained {timestamp ? `at ${formatTime(timestamp)}` : 'recently'}
      </p>
      <button 
        className="absolute top-1 right-1 text-green-300 hover:text-white"
        onClick={onDismiss}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}