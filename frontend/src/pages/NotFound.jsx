import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page Not Found</p>
      <p className="mb-8 text-gray-400 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}