import React, { useState, useEffect, useRef } from 'react';
import HotspotMap from '../components/HotspotMap';
import ModelTrainingMonitor from '../components/ModelTrainingMonitor';
import { FaExclamationTriangle, FaNewspaper, FaChartLine, FaInfoCircle, FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaSatellite, FaGlobeAfrica, FaSearch, FaShieldAlt, FaDatabase, FaBrain, FaVideo } from 'react-icons/fa';
import RiskApi from '../services/apiService';
import MediaIntelligencePanel from '../components/MediaIntelligencePanel';
import VideoAnalysisPanel from '../components/VideoAnalysisPanel';

export default function MapPage() {
  const mapContainerRef = useRef(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterIntensity, setFilterIntensity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mapMode, setMapMode] = useState('default');
  const [pulseEffect, setPulseEffect] = useState(true);
  const [animatedTransition, setAnimatedTransition] = useState(false);
  const [hotspots, setHotspots] = useState([]);
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 0,
    precision: 0,
    recall: 0,
    lastUpdated: null
  });
  const [refreshingData, setRefreshingData] = useState(false);
  const [showModelMonitor, setShowModelMonitor] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState(null);
  const [showVideoAnalysis, setShowVideoAnalysis] = useState(false);
  
  // Fetch hotspot data from the model API
  useEffect(() => {
    const fetchHotspotData = async () => {
      try {
        setIsLoading(true);
        
        // Making API call to your ML model endpoint using the RiskApi service
        const response = await RiskApi.getHotspots();
        
        // Process the data from the model
        const processedData = response.data.hotspots.map(spot => ({
          id: spot.id,
          lat: spot.latitude,
          lng: spot.longitude,
          country: spot.country,
          region: spot.region,
          intensity: spot.risk_score / 100, // Assuming risk_score is 0-100, convert to 0-1
          eventType: spot.event_classification,
          actor: spot.primary_actor,
          incidents: spot.incident_count,
          trend: spot.trend_direction,
          population: spot.affected_population.toLocaleString(),
          updated: new Date(spot.last_updated).toISOString().split('T')[0]
        }));
        
        setHotspots(processedData);
        
        // Update model metrics
        setModelMetrics({
          accuracy: response.data.model_metrics.accuracy,
          precision: response.data.model_metrics.precision,
          recall: response.data.model_metrics.recall,
          lastUpdated: new Date(response.data.model_metrics.last_trained).toLocaleString()
        });
        
      } catch (error) {
        console.error('Error fetching hotspot data:', error);
        // Fallback to sample data if API fails
        setHotspots(sampleHotspots);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHotspotData();
    
    // Set up polling for real-time updates (every 5 minutes)
    const pollingInterval = setInterval(() => {
      fetchHotspotData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(pollingInterval);
  }, []);
  
  // Function to manually refresh data
  const refreshData = async () => {
    setRefreshingData(true);
    try {
      const response = await RiskApi.getHotspots(true); // Pass true to force refresh
      
      const processedData = response.data.hotspots.map(spot => ({
        id: spot.id,
        lat: spot.latitude,
        lng: spot.longitude,
        country: spot.country,
        region: spot.region,
        intensity: spot.risk_score / 100,
        eventType: spot.event_classification,
        actor: spot.primary_actor,
        incidents: spot.incident_count,
        trend: spot.trend_direction,
        population: spot.affected_population.toLocaleString(),
        updated: new Date(spot.last_updated).toISOString().split('T')[0]
      }));
      
      setHotspots(processedData);
      
      // Update model metrics
      setModelMetrics({
        accuracy: response.data.model_metrics.accuracy,
        precision: response.data.model_metrics.precision,
        recall: response.data.model_metrics.recall,
        lastUpdated: new Date(response.data.model_metrics.last_trained).toLocaleString()
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshingData(false);
    }
  };
  
  // Update the retrainModel function

const retrainModel = async () => {
  try {
    setModelLoading(true);
    
    // API call to trigger model retraining
    const response = await RiskApi.retrainModel();
    
    // Show model monitor dialog to show training progress
    setShowModelMonitor(true);
    
    // Create a timer to check training status every 2 seconds
    const statusCheckInterval = setInterval(async () => {
      try {
        const statusResponse = await RiskApi.getModelTrainingStatus();
        
        // If training has completed...
        if (!statusResponse.data.isTraining && statusResponse.data.progress === 100) {
          clearInterval(statusCheckInterval);
          
          // Verify the model was actually retrained
          const verifyResponse = await RiskApi.verifyModelRetraining();
          
          if (verifyResponse.data.model_exists) {
            // After successful retraining, refresh the data
            await refreshData();
            toast.success("Model training completed successfully!");
          } else {
            toast.error("Model training appears to have failed. Check logs for details.");
          }
          
          setModelLoading(false);
        }
      } catch (error) {
        console.error('Error checking training status:', error);
      }
    }, 2000);
    
    // Clear interval after 5 minutes to prevent indefinite polling
    setTimeout(() => {
      clearInterval(statusCheckInterval);
      setModelLoading(false);
    }, 5 * 60 * 1000);
    
  } catch (error) {
    console.error('Error retraining model:', error);
    alert('Error retraining model: ' + (error.friendlyMessage || 'Please try again later.'));
    setModelLoading(false);
  }
};

  // Fetch media items when a hotspot is selected
  useEffect(() => {
    if (selectedHotspot) {
      setIsLoading(true);
      setShowDetails(true);
      setAnimatedTransition(true);
      
      const fetchMediaData = async () => {
        try {
          // API call to get media intelligence related to the selected hotspot
          const response = await RiskApi.getMediaIntelligence(selectedHotspot.id);
          setMediaItems(response.data.media_items);
        } catch (error) {
          console.error('Error fetching media data:', error);
          setMediaItems([]);
        } finally {
          setIsLoading(false);
          
          // Reset the animation flag after transition
          setTimeout(() => setAnimatedTransition(false), 1000);
        }
      };
      
      fetchMediaData();
    } else {
      setMediaItems([]);
    }
  }, [selectedHotspot]);
  
  // Filter hotspots based on user selections
  const filteredHotspots = hotspots.filter(spot => {
    if (filterType !== 'all' && spot.eventType !== filterType) return false;
    
    if (filterIntensity === 'high' && spot.intensity < 0.7) return false;
    if (filterIntensity === 'medium' && (spot.intensity < 0.4 || spot.intensity >= 0.7)) return false;
    if (filterIntensity === 'low' && spot.intensity >= 0.4) return false;
    
    return true;
  });

  // Get unique event types for the filter dropdown
  const eventTypes = [...new Set(hotspots.map(h => h.eventType))];

  // Add this method to fetch video analysis
  const fetchVideoAnalysis = async (videoId) => {
    setIsLoading(true);
    try {
      const response = await RiskApi.getVideoAnalysis(videoId);
      setVideoAnalysis(response.data);
    } catch (error) {
      console.error("Failed to fetch video analysis:", error);
      toast.error("Failed to load video analysis");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Dramatic visual overlay for aesthetic effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900/30 to-gray-900/40 z-10 pointer-events-none"></div>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full absolute border-4 border-gray-700"></div>
            <div className="w-16 h-16 rounded-full animate-spin absolute border-4 border-transparent border-t-blue-400"></div>
            <div className="w-16 h-16 rounded-full animate-pulse absolute border-4 border-transparent border-blue-400/20"></div>
          </div>
          <p className="mt-6 text-blue-400">Loading intelligence data...</p>
        </div>
      )}
      
      {/* Interactive globe with hotspots */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0">
        <HotspotMap 
          hotspots={filteredHotspots} 
          onHotspotSelect={setSelectedHotspot}
          selectedHotspot={selectedHotspot?.id}
          mapMode={mapMode}
          pulseEffect={pulseEffect}
          isLoading={isLoading}
        />
      </div>
      
      {/* Futuristic controls overlay */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-900/90 to-transparent z-20 backdrop-blur-sm">
        <div className="container mx-auto h-full px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-blue-900/50 p-1 rounded-full">
              <FaGlobeAfrica className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              AFRICA RISK INTELLIGENCE
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm">High ({filteredHotspots.filter(h => h.intensity >= 0.7).length})</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-sm">Medium ({filteredHotspots.filter(h => h.intensity >= 0.4 && h.intensity < 0.7).length})</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Low ({filteredHotspots.filter(h => h.intensity < 0.4).length})</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={refreshData} 
                disabled={refreshingData}
                className={`p-2 rounded-full text-sm ${refreshingData ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50'} transition-all duration-300`}
                title="Refresh Data"
              >
                <svg className={`w-4 h-4 ${refreshingData ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`flex items-center px-3 py-1.5 rounded-full text-sm ${showFilters ? 'bg-blue-600' : 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/50'} transition-all duration-300`}
              >
                <FaFilter className="mr-1" /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map mode selection with cool interface */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20">
        <div className="flex flex-col space-y-2 bg-gray-900/80 backdrop-blur-md p-2 rounded-full border border-gray-800/70">
          <button 
            className={`p-2 rounded-full transition-all ${mapMode === 'default' ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}
            onClick={() => setMapMode('default')}
            title="Standard View"
          >
            <FaGlobeAfrica />
          </button>
          <button 
            className={`p-2 rounded-full transition-all ${mapMode === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}
            onClick={() => setMapMode('satellite')}
            title="Satellite View"
          >
            <FaSatellite />
          </button>
          <button 
            className={`p-2 rounded-full transition-all ${mapMode === 'heatmap' ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}
            onClick={() => setMapMode('heatmap')}
            title="Risk Heatmap"
          >
            <FaShieldAlt />
          </button>
          <div className="w-full h-px bg-gray-700 my-1"></div>
          <button 
            className={`p-2 rounded-full transition-all ${pulseEffect ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}
            onClick={() => setPulseEffect(!pulseEffect)}
            title="Toggle Pulse Effect"
          >
            <div className={`w-3 h-3 rounded-full mx-auto ${pulseEffect ? 'bg-red-500 animate-ping' : 'bg-gray-500'}`}></div>
          </button>
          
          {/* Model Training button */}
          <button 
            className={`p-2 rounded-full transition-all ${showModelMonitor ? 'bg-blue-600 text-white' : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'}`}
            onClick={() => setShowModelMonitor(!showModelMonitor)}
            title="Model Training"
          >
            <FaBrain />
          </button>
        </div>
      </div>

      {/* Model metrics and controls panel */}
      <div className="fixed top-20 right-4 z-20 bg-gray-900/90 backdrop-blur-md p-4 rounded-lg border border-gray-800/70 max-w-xs">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-blue-400">ML MODEL METRICS</h3>
          <button
            onClick={retrainModel}
            disabled={modelLoading}
            className={`text-xs px-2 py-1 rounded ${modelLoading ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-600/80 hover:bg-blue-700'}`}
            title="Retrain model with latest data"
          >
            {modelLoading ? 'Training...' : 'Retrain Model'}
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-gray-800/50 p-2 rounded text-center">
            <div className="text-xs text-gray-400">Accuracy</div>
            <div className="text-sm font-bold">{(modelMetrics.accuracy * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded text-center">
            <div className="text-xs text-gray-400">Precision</div>
            <div className="text-sm font-bold">{(modelMetrics.precision * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-800/50 p-2 rounded text-center">
            <div className="text-xs text-gray-400">Recall</div>
            <div className="text-sm font-bold">{(modelMetrics.recall * 100).toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Model last trained: {modelMetrics.lastUpdated || 'Loading...'}
        </div>
      </div>
      
      {/* Model Training Monitor Panel */}
      {showModelMonitor && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50">
          <div className="relative">
            <button 
              className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full z-10"
              onClick={() => setShowModelMonitor(false)}
            >
              <FaTimes />
            </button>
            <ModelTrainingMonitor />
          </div>
        </div>
      )}
      
      {/* Status bar at the bottom with real-time indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-gray-900/90 border-t border-gray-800/50 z-20 backdrop-blur-sm flex items-center px-4 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Live Model Data</span>
          </div>
          <div>Monitoring {filteredHotspots.length} hotspots</div>
          <div>Updated {new Date().toLocaleString()}</div>
        </div>
      </div>
      
      {/* Your existing filter panels, info panels, etc. */}
      {/* ... */}

      {/* Add this to your JSX in the details panel when a hotspot is selected */}
      {showDetails && selectedHotspot && (
        <div className="absolute right-0 top-0 w-96 h-full z-10 flex flex-col bg-gray-900/90 backdrop-blur-sm overflow-auto">
          <div className="flex justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold">Hotspot Details</h2>
            <button 
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex-grow p-4 overflow-auto">
            {/* Existing hotspot details here */}
            
            {/* Add the Media Intelligence Panel */}
            <div className="mt-6">
              <MediaIntelligencePanel hotspotId={selectedHotspot.id} />
            </div>
          </div>
        </div>
      )}

      {/* Add a button to the media items to show video analysis */}
      {mediaItems.map((item, index) => (
        <div key={index} className="mb-4 bg-gray-800/70 rounded overflow-hidden">
          <div className="p-3">
            <h3 className="text-lg font-bold">{item.title}</h3>
            <div className="text-sm text-gray-400">{item.source} • {item.date}</div>
            
            <p className="mt-2 text-sm">{item.content}</p>
            
            {/* Add condition to show video analysis button for videos */}
            {item.type === 'video' && (
              <button
                onClick={() => {
                  fetchVideoAnalysis(item.id);
                  setShowVideoAnalysis(true);
                }}
                className="mt-3 text-sm bg-blue-900/60 hover:bg-blue-800 px-3 py-1 rounded flex items-center"
              >
                <FaVideo className="mr-1" /> View Video Analysis
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add a modal for showing the video analysis */}
      {showVideoAnalysis && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">Video Analysis</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowVideoAnalysis(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4">
              <VideoAnalysisPanel videoData={videoAnalysis} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback sample data in case the API is not available during development
const sampleHotspots = [
  { 
    id: "ng1", 
    lat: 9.0820, 
    lng: 8.6753, 
    country: "Nigeria", 
    region: "Borno State",
    intensity: 0.92, 
    eventType: "Violence against civilians",
    actor: "Boko Haram",
    incidents: 14,
    trend: "increasing",
    population: "320,000",
    updated: "2025-03-28"
  },
  // Add more sample hotspots here
];
