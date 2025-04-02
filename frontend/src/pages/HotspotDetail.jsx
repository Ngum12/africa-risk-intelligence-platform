import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaExclamationTriangle, FaInfoCircle, FaMapMarkerAlt, FaCalendarAlt, 
  FaChartLine, FaNewspaper, FaFileDownload, FaSyncAlt, FaChartBar
} from 'react-icons/fa';
import RiskApi from '../services/apiService';
import MapComponent from '../components/MapComponent';
import RiskMetricsPanel from '../components/RiskMetricsPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function HotspotDetail() {
  const { hotspotId } = useParams();
  const [hotspot, setHotspot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchHotspotData() {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        // For demo purposes, we'll simulate a delay and return mock data
        const response = await RiskApi.getHotspots();
        const foundHotspot = response.data.find(h => h.id === hotspotId);
        
        if (foundHotspot) {
          setHotspot(foundHotspot);
        } else {
          setError('Hotspot not found');
        }
      } catch (err) {
        console.error('Failed to fetch hotspot:', err);
        setError(err.friendlyMessage || 'Failed to load hotspot data');
      } finally {
        setLoading(false);
      }
    }
    
    if (hotspotId) {
      fetchHotspotData();
    }
  }, [hotspotId]);
  
  if (loading) return <LoadingSpinner message="Loading hotspot data..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!hotspot) return <ErrorMessage message="Hotspot not found" />;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {/* Header section */}
        <div className="bg-gray-800 p-6 border-b border-gray-700">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{hotspot.name}</h1>
              <div className="flex items-center text-gray-300 mb-4">
                <FaMapMarkerAlt className="mr-2" />
                {hotspot.location}
              </div>
            </div>
            <div className="flex space-x-3">
              <Link 
                to={`/media-intelligence/${hotspotId}`}
                className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow flex items-center"
              >
                <FaNewspaper className="mr-2" />
                Media Intelligence Dashboard
              </Link>
              <button className="bg-green-900 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow flex items-center">
                <FaFileDownload className="mr-2" />
                Export Report
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="bg-red-900/50 px-3 py-1 rounded-full text-sm text-white flex items-center">
              <FaExclamationTriangle className="mr-1" />
              Risk Level: {hotspot.risk_level}
            </div>
            <div className="bg-gray-700 px-3 py-1 rounded-full text-sm text-white flex items-center">
              <FaCalendarAlt className="mr-1" />
              Last Updated: {new Date(hotspot.last_updated).toLocaleDateString()}
            </div>
            <div className="bg-gray-700 px-3 py-1 rounded-full text-sm text-white flex items-center">
              <FaChartLine className="mr-1" />
              Trend: {hotspot.trend}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="p-6">
          {/* Map and metrics grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-4 h-96">
                <h2 className="text-xl font-bold mb-4">Location</h2>
                <MapComponent 
                  center={[hotspot.latitude, hotspot.longitude]} 
                  zoom={8}
                  markers={[
                    {
                      position: [hotspot.latitude, hotspot.longitude],
                      popup: hotspot.name,
                      type: 'hotspot'
                    }
                  ]}
                />
              </div>
            </div>
            <div>
              <RiskMetricsPanel metrics={hotspot.risk_metrics} />
            </div>
          </div>
          
          {/* Additional sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Overview</h2>
              <p className="text-gray-300">{hotspot.description}</p>
            </div>
            
            {/* Key Factors */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Key Risk Factors</h2>
              <ul className="space-y-2">
                {hotspot.risk_factors.map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}