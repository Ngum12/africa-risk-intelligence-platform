import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import apiClient from '../services/api';
import HotspotMap from '../components/HotspotMap';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [dashboardResponse, modelInfoResponse] = await Promise.all([
          apiClient.get('/dashboard-data'),
          apiClient.get('/model-info')
        ]);
        
        setDashboardData(dashboardResponse.data.data);
        setModelInfo(modelInfoResponse.data.model_info);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
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

  // Transform country risk data for visualization
  const countryRiskData = Object.entries(dashboardData.risk_by_country).map(([country, risks]) => ({
    country,
    high: risks.high,
    low: risks.low
  }));

  // Transform event type data
  const eventTypeData = Object.entries(dashboardData.event_types).map(([name, value]) => ({
    name,
    value
  }));

  // Transform actor data
  const actorData = Object.entries(dashboardData.actor_data).map(([name, value]) => ({
    name,
    value
  }));

  // Transform feature importance data
  const featureImportanceData = Object.entries(dashboardData.feature_importances).map(([name, value]) => ({
    name,
    value: value * 100 // Convert to percentage
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Africa Risk Intelligence Dashboard</h1>
      
      {/* Model Info Card */}
      {modelInfo && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Current Model Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Model Type</p>
              <p className="text-lg font-semibold">{modelInfo.type}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Last Updated</p>
              <p className="text-lg font-semibold">{modelInfo.last_updated}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Size</p>
              <p className="text-lg font-semibold">{modelInfo.size_mb} MB</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Estimators</p>
              <p className="text-lg font-semibold">{modelInfo.n_estimators}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Model Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-gray-400 mb-1">Accuracy</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{Math.round(dashboardData.model_metrics.accuracy * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full" 
              style={{width: `${dashboardData.model_metrics.accuracy * 100}%`}}
            ></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-gray-400 mb-1">Precision</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{Math.round(dashboardData.model_metrics.precision * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full rounded-full" 
              style={{width: `${dashboardData.model_metrics.precision * 100}%`}}
            ></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-gray-400 mb-1">Recall</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{Math.round(dashboardData.model_metrics.recall * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-yellow-500 h-full rounded-full" 
              style={{width: `${dashboardData.model_metrics.recall * 100}%`}}
            ></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 shadow-md">
          <h3 className="text-gray-400 mb-1">F1 Score</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold">{Math.round(dashboardData.model_metrics.f1 * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full" 
              style={{width: `${dashboardData.model_metrics.f1 * 100}%`}}
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
                data={dashboardData.trend_data.months.map((month, i) => ({
                  month,
                  incidents: dashboardData.trend_data.incidents[i],
                  fatalities: dashboardData.trend_data.fatalities[i]
                }))}
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
        <div className="h-96 rounded-lg overflow-hidden">
          <HotspotMap hotspots={dashboardData.hotspots} />
        </div>
      </div>
    </div>
  );
}
