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
import MediaIntelligenceDashboard from './pages/MediaIntelligenceDashboard';
import AuthPage from './pages/AuthPage';
import './App.css';

export default function App() {
  const [result, setResult] = React.useState(null);
  const [apiStatus, setApiStatus] = useState('Unknown');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(checkAuth === 'true');
    
    // Test connection to backend
    const testBackendConnection = async () => {
      try {
        // Try to access a simpler endpoint, or create one if needed
        const response = await fetch('http://localhost:8080/api/status', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout to prevent long wait times
          signal: AbortSignal.timeout(5000)
        });
        
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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    // In a real app, you would call an API to invalidate the session
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {isAuthenticated && (
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
                  <NavLink 
                    to="/media-intelligence" 
                    className={({ isActive }) => 
                      isActive ? "block mt-4 lg:inline-block lg:mt-0 text-white mr-4" : 
                               "block mt-4 lg:inline-block lg:mt-0 text-gray-400 hover:text-white mr-4"
                    }
                  >
                    Media Intelligence
                  </NavLink>
                </div>
                <div>
                  <button 
                    onClick={handleLogout}
                    className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-gray-800 hover:bg-white mt-4 lg:mt-0"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <div className={isAuthenticated ? "container mx-auto py-6" : ""}>
          {isAuthenticated && (
            <div style={{padding: '20px', background: '#f0f0f0', margin: '20px'}}>
              <h3>API Status: {apiStatus}</h3>
              <p>If you see "Connection failed" above, your frontend can't reach the backend.</p>
            </div>
          )}
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            
            {/* Protected routes - in a real app, you would add proper auth checks */}
            <Route path="/" element={isAuthenticated ? <Home /> : <AuthPage />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <AuthPage />} />
            <Route path="/analysis" element={isAuthenticated ? <DataAnalysis /> : <AuthPage />} />
            <Route path="/map" element={isAuthenticated ? <MapPage /> : <AuthPage />} />
            <Route path="/media-signals" element={isAuthenticated ? <MediaSignals /> : <AuthPage />} />
            <Route path="/retrain" element={isAuthenticated ? <Retraining /> : <AuthPage />} />
            <Route path="/media-intelligence/:hotspotId?" element={isAuthenticated ? <MediaIntelligenceDashboard /> : <AuthPage />} />
          </Routes>
        </div>

        {isAuthenticated && (
          <footer className="bg-gray-800 p-4 mt-8">
            <div className="container mx-auto text-center text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} Africa Risk Intelligence Platform. All rights reserved.</p>
            </div>
          </footer>
        )}
      </div>
    </Router>
  );
}
