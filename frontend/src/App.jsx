import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Form from './components/Form';
import ResultCard from './components/ResultCard';
import MapView from './components/MapView';
import Dashboard from './pages/Dashboard';
import Retraining from './pages/Retraining';
import MapPage from './pages/MapPage';
import MediaSignals from './pages/MediaSignals';
import Home from './pages/Home';
import DataAnalysis from './pages/DataAnalysis';
import './App.css';

export default function App() {
  const [result, setResult] = React.useState(null);
  const [apiStatus, setApiStatus] = useState('Unknown');

  useEffect(() => {
    // Test connection to backend
    const testBackendConnection = async () => {
      try {
        // Try to access a simpler endpoint, or create one if needed
        const response = await fetch('http://localhost:8080/');
        if (response.ok) {
          setApiStatus('Connected');
        } else {
          setApiStatus(`Error: ${response.status}`);
        }
      } catch (error) {
        setApiStatus(`Connection failed: ${error.message}`);
        console.error('Backend connection error:', error);
      }
    };

    testBackendConnection();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex flex-wrap items-center justify-between">
            <div className="flex items-center flex-shrink-0 mr-6">
              <span className="font-bold text-xl tracking-tight">Africa Risk Intelligence Platform</span>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
              <div className="text-sm lg:flex-grow">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    isActive ? "block mt-4 lg:inline-block lg:mt-0 text-white mr-4" : 
                             "block mt-4 lg:inline-block lg:mt-0 text-gray-400 hover:text-white mr-4"
                  }
                >
                  Home
                </NavLink>
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    isActive ? "block mt-4 lg:inline-block lg:mt-0 text-white mr-4" : 
                             "block mt-4 lg:inline-block lg:mt-0 text-gray-400 hover:text-white mr-4"
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  to="/analysis" 
                  className={({ isActive }) => 
                    isActive ? "block mt-4 lg:inline-block lg:mt-0 text-white mr-4" : 
                             "block mt-4 lg:inline-block lg:mt-0 text-gray-400 hover:text-white mr-4"
                  }
                >
                  Data Analysis
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto py-6">
          <div style={{padding: '20px', background: '#f0f0f0', margin: '20px'}}>
            <h3>API Status: {apiStatus}</h3>
            <p>If you see "Connection failed" above, your frontend can't reach the backend.</p>
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/retraining" element={<Retraining />} />
            <Route path="/map-view" element={<MapPage />} />
            <Route path="/media" element={<MediaSignals />} />
            <Route path="/analysis" element={<DataAnalysis />} />
          </Routes>
        </div>

        <footer className="bg-gray-800 p-4 mt-8">
          <div className="container mx-auto text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Africa Risk Intelligence Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
