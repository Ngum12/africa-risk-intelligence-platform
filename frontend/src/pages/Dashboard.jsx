import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { fetchDashboardData, fetchModelInfo } from '../services/api';
import { checkApiStatus } from '../services/apiStatus';
import { modelEventService } from '../services/modelEvents';
import HotspotMap from '../components/HotspotMap';
import ModelUpdateNotification from '../components/ModelUpdateNotification';
import MapControlPanel from '../components/MapControlPanel';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  // Default data structure to use when API fails
  const defaultDashboardData = {
    risk_by_country: {
      "Nigeria": { high: 65, low: 35 },
      "Somalia": { high: 78, low: 22 },
      "Ethiopia": { high: 55, low: 45 },
      "South Sudan": { high: 82, low: 18 },
      "DRC": { high: 70, low: 30 }
    },
    event_types: {
      "Protests": 120,
      "Violence against civilians": 85,
      "Armed clashes": 65,
      "Remote explosives": 40,
      "Strategic developments": 25
    },
    actor_data: {
      "State forces": 95,
      "Rebel groups": 75,
      "Political militias": 60,
      "Identity militias": 45,
      "Civilians": 40
    },
    feature_importances: {
      "Location": 0.25,
      "Actor type": 0.20,
      "Event history": 0.18,
      "Population density": 0.15,
      "Economic indicators": 0.12,
      "Seasonal factors": 0.10
    },
    trend_data: { 
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], 
      incidents: [45, 52, 49, 60, 55, 70], 
      fatalities: [23, 27, 30, 35, 25, 45] 
    },
    hotspots: [
      {"lat": 9.0820, "lng": 8.6753, "intensity": 0.8, "location": "Nigeria"},
      {"lat": 5.1521, "lng": 46.1996, "intensity": 0.9, "location": "Somalia"},
      {"lat": 7.8699, "lng": 29.6667, "intensity": 0.85, "location": "South Sudan"},
      {"lat": -0.2280, "lng": 15.8277, "intensity": 0.75, "location": "DRC"},
      {"lat": 9.1450, "lng": 40.4897, "intensity": 0.7, "location": "Ethiopia"}
    ],
    model_metrics: {
      accuracy: 0.87,
      precision: 0.83,
      recall: 0.85,
      f1: 0.84
    }
  };
  
  const defaultModelInfo = {
    type: "Random Forest",
    last_updated: "2025-04-02",
    size_mb: 48.5,
    n_estimators: 200
  };

  const [dashboardData, setDashboardData] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModelUpdate, setShowModelUpdate] = useState(false);
  const [modelUpdateTime, setModelUpdateTime] = useState(null);
  const mapRef = useRef(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Function to load dashboard data
  async function loadData() {
    setIsLoading(true);
    try {
      // Try using API status check, but don't fail if it doesn't work
      try {
        const status = await checkApiStatus();
        if (!status.ok) {
          console.warn("API status check failed - continuing anyway");
        }
      } catch (statusError) {
        console.warn("API status check failed:", statusError);
      }
      
      // Now fetch data
      const [dashboardResponse, modelInfoResponse] = await Promise.all([
        fetchDashboardData(),
        fetchModelInfo()
      ]);
      
      console.log("Dashboard data received:", dashboardResponse);
      console.log("Model info received:", modelInfoResponse);
      
      // Check if data is valid
      if (dashboardResponse && dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
        
        // Store model update time if available
        if (dashboardResponse.data?.last_model_update) {
          setModelUpdateTime(dashboardResponse.data.last_model_update);
        }
      } else {
        console.warn("Invalid dashboard data format - using defaults");
        setDashboardData(defaultDashboardData);
      }
      
      if (modelInfoResponse && modelInfoResponse.model_info) {
        setModelInfo(modelInfoResponse.model_info);
      } else {
        console.warn("Invalid model info format - using defaults");
        setModelInfo(defaultModelInfo);
      }
      
      setError(null);
    } catch (error) {
      console.error("Data loading error:", error);
      setError("Failed to load dashboard data. Using default data instead.");
      
      // Use default data instead of showing error
      setDashboardData(defaultDashboardData);
      setModelInfo(defaultModelInfo);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Initial data fetch
  useEffect(() => {
    loadData();
  }, []);
  
  // Set up model event listener for real-time updates
  useEffect(() => {
    // Handle model update events
    const handleModelEvent = (event) => {
      if (event.type === 'model_updated') {
        console.log('Model update detected:', event);
        
        // Show notification
        setShowModelUpdate(true);
        
        // Auto-refresh data
        loadData();
        
        // Auto-hide notification after 10 seconds
        setTimeout(() => {
          setShowModelUpdate(false);
        }, 10000);
      }
    };
    
    // Register event listener and get cleanup function
    const removeListener = modelEventService.addEventListener(handleModelEvent);
    
    // Cleanup
    return () => removeListener();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="bg-red-800/30 border border-red-700 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold mb-2">No Data Available</h2>
        <p>Dashboard data is not available. Please check back later.</p>
      </div>
    );
  }

  // Add safety checks for all data transformations
  const data = dashboardData || defaultDashboardData;

  // Transform country risk data for visualization
  const countryRiskData = Object.entries(data.risk_by_country || {}).map(([country, risks]) => ({
    country,
    high: risks?.high || 0,
    low: risks?.low || 0
  }));

  // Transform event type data
  const eventTypeData = Object.entries(data.event_types || {}).map(([name, value]) => ({
    name,
    value: value || 0
  }));

  // Transform actor data with safety check
  const actorData = data.actor_data 
    ? Object.entries(data.actor_data).map(([name, value]) => ({
        name,
        value: value || 0
      }))
    : Object.entries(defaultDashboardData.actor_data).map(([name, value]) => ({
        name,
        value
      }));

  // Transform feature importance data with safety check
  const featureImportanceData = data.feature_importances
    ? Object.entries(data.feature_importances).map(([name, value]) => ({
        name,
        value: (value || 0) * 100 // Convert to percentage
      })).sort((a, b) => b.value - a.value)
    : Object.entries(defaultDashboardData.feature_importances).map(([name, value]) => ({
        name,
        value: value * 100
      })).sort((a, b) => b.value - a.value);

  // Use safe access for trend data
  const trendData = data.trend_data || defaultDashboardData.trend_data;
  const chartData = trendData.months.map((month, i) => ({
    month,
    incidents: trendData.incidents[i] || 0,
    fatalities: trendData.fatalities[i] || 0
  }));

  // Use safe access for hotspots
  const hotspots = data.hotspots || defaultDashboardData.hotspots;

  // Use safe access for model metrics
  const metrics = data.model_metrics || defaultDashboardData.model_metrics;
  
  // Use safe access for model info
  const mInfo = modelInfo || defaultModelInfo;

  return (
    <div className="p-4">
      {/* Model update notification */}
      {showModelUpdate && (
        <ModelUpdateNotification 
          onDismiss={() => setShowModelUpdate(false)} 
          timestamp={modelUpdateTime}
        />
      )}
      
      <h1 className="text-3xl font-bold mb-6">Africa Risk Intelligence Dashboard</h1>
      
      {/* Warning banner if using default data */}
      {error && (
        <div className="bg-yellow-800/30 border border-yellow-700 rounded-xl p-4 mb-6 text-yellow-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Model Info Card */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Current Model Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Model Type</p>
            <p className="text-lg font-semibold">{mInfo.type}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Last Updated</p>
            <p className="text-lg font-semibold">{mInfo.last_updated}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Size</p>
            <p className="text-lg font-semibold">{mInfo.size_mb} MB</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Estimators</p>
            <p className="text-lg font-semibold">{mInfo.n_estimators}</p>
          </div>
        </div>
        
        {/* Add this button below the model info grid */}
        <div className="mt-6 flex justify-end">
          <Link
            to="/retrain"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7.805v2.205a1 1 0 01-2 0V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H16a1 1 0 110 2h-5a1 1 0 01-1-1v-5a1 1 0 112 0v2.101a7.002 7.002 0 01-8.175 3.413 1 1 0 01-.717-1.457z" clipRule="evenodd" />
            </svg>
            Retrain Model
          </Link>
        </div>
      </div>
      
      {/* Model Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-gray-400 mb-1">Accuracy</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{Math.round(metrics.accuracy * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full" 
              style={{width: `${metrics.accuracy * 100}%`}}
            ></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-gray-400 mb-1">Precision</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{Math.round(metrics.precision * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full rounded-full" 
              style={{width: `${metrics.precision * 100}%`}}
            ></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-gray-400 mb-1">Recall</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{Math.round(metrics.recall * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-yellow-500 h-full rounded-full" 
              style={{width: `${metrics.recall * 100}%`}}
            ></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-gray-400 mb-1">F1 Score</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{Math.round(metrics.f1 * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full" 
              style={{width: `${metrics.f1 * 100}%`}}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Country Risk Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Risk Distribution by Country</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={countryRiskData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Legend />
                <Bar dataKey="high" name="High Risk" fill="#ef4444" />
                <Bar dataKey="low" name="Low Risk" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Incident Trends */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Incident Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="incidents" 
                  name="Incidents" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="fatalities" 
                  name="Fatalities" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Event Type Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Event Type Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Actor Distribution */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Actor Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {actorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} incidents`, props.payload.name]}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Feature Importance */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Feature Importance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={featureImportanceData}
                margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Importance']}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: 'white' }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {featureImportanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Risk Hotspots Map */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Risk Hotspots</h2>
        <div className="h-96 rounded-lg overflow-hidden relative">
          <HotspotMap 
            hotspots={hotspots} 
            ref={mapRef}
          />
          <MapControlPanel 
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onReset={() => mapRef.current?.resetView()}
            onToggleHeatmap={() => mapRef.current?.toggleHeatmap()}
          />
        </div>
      </div>
      
      {/* Add this right before the closing div of your Dashboard component */}
      <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-6 shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-2">Improve Model Accuracy</h2>
            <p className="text-gray-300 mb-4 md:mb-0">
              Upload new training data to improve prediction accuracy and adapt to changing conflict patterns.
            </p>
          </div>
          <Link
            to="/retrain"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7.805v2.205a1 1 0 01-2 0V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H16a1 1 0 110 2h-5a1 1 0 01-1-1v-5a1 1 0 112 0v2.101a7.002 7.002 0 01-8.175 3.413 1 1 0 01-.717-1.457z" clipRule="evenodd" />
            </svg>
            Manage & Retrain Model
          </Link>
        </div>
      </div>
    </div>
  );
}
