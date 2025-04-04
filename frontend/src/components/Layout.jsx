import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import ApiStatus from './ApiStatus';
import { modelEventService } from '../services/modelEvents';

export default function Layout() {
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);
  
  useEffect(() => {
    const handleModelEvent = (event) => {
      if (event.type === 'model_updated') {
        // Show the indicator for 2 hours after a model update
        setRecentlyUpdated(true);
        
        setTimeout(() => {
          setRecentlyUpdated(false);
        }, 7200000); // 2 hours
      }
    };
    
    const removeListener = modelEventService.addEventListener(handleModelEvent);
    return () => removeListener();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Africa Risk Intelligence Platform</h1>
          </div>
          <div className="flex space-x-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) => 
                `px-4 py-2 rounded-md ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/predict"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              Predict
            </NavLink>
            <NavLink
              to="/retrain"
              className={({ isActive }) => {
                const baseClasses = `px-4 py-2 rounded-md relative ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`;
                return baseClasses;
              }}
            >
              Retrain
              {recentlyUpdated && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </NavLink>
          </div>
          <div className="flex justify-end items-center text-sm text-gray-400 px-4">
            <ApiStatus />
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Africa Risk Intelligence Platform | Developed by AI Research Team
        </div>
        <div className="flex justify-end items-center text-sm text-gray-400 px-4">
          <ApiStatus />
        </div>
      </footer>
    </div>
  );
}