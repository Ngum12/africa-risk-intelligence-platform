import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
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
              className={({ isActive }) =>
                `px-4 py-2 rounded-md ${isActive ? 'bg-blue-600' : 'hover:bg-gray-700'}`
              }
            >
              Retrain
            </NavLink>
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
      </footer>
    </div>
  );
}