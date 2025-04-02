import React, { useState, useEffect, useRef } from 'react';
import RiskApi, { createModelTrainingSocket } from '../services/apiService';
import { FaChevronDown, FaChevronRight, FaExclamationTriangle, FaCheckCircle, FaCog, FaHistory, FaChartLine, FaTable } from 'react-icons/fa';

export default function ModelTrainingMonitor() {
  const [trainingStatus, setTrainingStatus] = useState({
    isTraining: false,
    progress: 0,
    stage: '',
    startTime: null,
    estimatedCompletion: null,
    error: null
  });
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [expandedLogs, setExpandedLogs] = useState(false);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [modelVersions, setModelVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [dataIssues, setDataIssues] = useState([]);
  const [fixingIssues, setFixingIssues] = useState(false);
  const [columnMapping, setColumnMapping] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [retrainingHistory, setRetrainingHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  const socketRef = useRef(null);
  const logsEndRef = useRef(null);
  
  // Connect to WebSocket for real-time updates
  useEffect(() => {
    socketRef.current = createModelTrainingSocket();
    
    socketRef.current.onopen = () => {
      console.log('Connected to model training WebSocket');
    };
    
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'status_update') {
        setTrainingStatus(prev => ({
          ...prev,
          isTraining: data.isTraining,
          progress: data.progress,
          stage: data.stage,
          startTime: data.startTime,
          estimatedCompletion: data.estimatedCompletion,
          error: data.error
        }));
      } else if (data.type === 'log') {
        setTrainingLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: data.message,
          level: data.level || 'info'
        }]);
      } else if (data.type === 'data_issue') {
        setDataIssues(prev => [...prev, data.issue]);
      } else if (data.type === 'completed') {
        // Fetch the updated metrics and version history
        fetchModelMetrics();
        fetchModelVersions();
        
        // Clear any data issues if training completed successfully
        if (!data.error) {
          setDataIssues([]);
        }
      }
    };
    
    socketRef.current.onclose = () => {
      console.log('Disconnected from model training WebSocket');
    };
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);
  
  // Fetch initial data
  useEffect(() => {
    fetchTrainingStatus();
    fetchTrainingLogs();
    fetchModelMetrics();
    fetchModelVersions();
    fetchRetrainingHistory();
    
    // Poll for updates every 5 seconds while visible
    const interval = setInterval(() => {
      fetchTrainingStatus();
      if (expandedLogs) {
        fetchTrainingLogs();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [expandedLogs]);
  
  // Scroll to bottom of logs when new logs arrive
  useEffect(() => {
    if (expandedLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [trainingLogs, expandedLogs]);
  
  const fetchTrainingStatus = async () => {
    try {
      const response = await RiskApi.getModelTrainingStatus();
      setTrainingStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch training status:', error);
    }
  };
  
  const fetchTrainingLogs = async () => {
    try {
      const response = await RiskApi.getModelTrainingLogs();
      setTrainingLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch training logs:', error);
    }
  };
  
  const fetchModelMetrics = async () => {
    try {
      const response = await RiskApi.getDetailedModelMetrics();
      setModelMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch model metrics:', error);
    }
  };
  
  const fetchModelVersions = async () => {
    try {
      const response = await RiskApi.getModelVersionHistory();
      setModelVersions(response.data.versions);
      
      // Set the latest version as selected
      if (response.data.versions.length > 0) {
        setSelectedVersion(response.data.versions[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch model versions:', error);
    }
  };

  const fetchRetrainingHistory = async () => {
    try {
      const response = await RiskApi.getRetrainingHistory();
      setRetrainingHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to fetch retraining history:', error);
    }
  };
  
  const handleFixDataIssues = async () => {
    if (dataIssues.length === 0) return;
    
    setFixingIssues(true);
    try {
      await RiskApi.fixDataIssues(dataIssues);
      setDataIssues([]);
      // Restart training after fixing issues
      await RiskApi.retrainModel();
    } catch (error) {
      console.error('Failed to fix data issues:', error);
    } finally {
      setFixingIssues(false);
    }
  };
  
  const startTraining = async () => {
    try {
      await RiskApi.retrainModel();
      // Training status will be updated via WebSocket
    } catch (error) {
      console.error('Failed to start model training:', error);
    }
  };
  
  const stopTraining = async () => {
    try {
      await RiskApi.retrainModel({ stop: true });
      // Training status will be updated via WebSocket
    } catch (error) {
      console.error('Failed to stop model training:', error);
    }
  };
  
  const verifyModelRetraining = async () => {
    setVerifying(true);
    try {
      const response = await RiskApi.verifyModelRetraining();
      setVerificationData(response.data);
      
      // Add a verification log
      const success = response.data.model_exists;
      setTrainingLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: success 
          ? `Model verification successful: Trained on ${response.data.samples_trained_on} samples` 
          : "Model verification failed: Model file not found",
        level: success ? "info" : "error"
      }]);
      
      return success;
    } catch (error) {
      console.error('Model verification failed:', error);
      setTrainingLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: `Model verification error: ${error.friendlyMessage || error.message}`,
        level: "error"
      }]);
      return false;
    } finally {
      setVerifying(false);
    }
  };

  // Helper function to format the timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Helper function to get log level style
  const getLogLevelStyle = (level) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
      default:
        return 'text-blue-400';
    }
  };
  
  return (
    <div className="bg-gray-900/95 border border-gray-800/50 rounded-lg overflow-hidden backdrop-blur-lg">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaCog className={`mr-2 ${trainingStatus.isTraining ? 'animate-spin text-blue-400' : 'text-gray-400'}`} />
          Model Training System
        </h2>
        
        {/* Training Status */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {trainingStatus.isTraining ? (
                <span className="flex items-center text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></div>
                  Training in progress
                </span>
              ) : trainingStatus.error ? (
                <span className="flex items-center text-red-400">
                  <FaExclamationTriangle className="mr-2" />
                  Training failed
                </span>
              ) : (
                <span className="flex items-center text-green-400">
                  <FaCheckCircle className="mr-2" />
                  Model ready
                </span>
              )}
            </div>
            <div>
              {trainingStatus.isTraining ? (
                <button 
                  onClick={stopTraining}
                  className="px-3 py-1 bg-red-600/80 hover:bg-red-700 rounded text-sm"
                >
                  Stop Training
                </button>
              ) : (
                <button 
                  onClick={startTraining}
                  className="px-3 py-1 bg-blue-600/80 hover:bg-blue-700 rounded text-sm"
                  disabled={dataIssues.length > 0}
                >
                  Start Training
                </button>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          {trainingStatus.isTraining && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{trainingStatus.stage || 'Processing'}</span>
                <span>{trainingStatus.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  style={{ width: `${trainingStatus.progress}%` }}
                ></div>
              </div>
              {trainingStatus.estimatedCompletion && (
                <div className="text-xs text-gray-500 mt-1 text-right">
                  Est. completion: {new Date(trainingStatus.estimatedCompletion).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Training Completion Status */}
        {!trainingStatus.isTraining && trainingStatus.progress === 100 && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-800/50 rounded">
            <h3 className="text-sm font-bold text-green-400 mb-2 flex items-center">
              <FaCheckCircle className="mr-2" />
              Model Retraining Completed
            </h3>
            <div className="text-xs">
              <p>The model was successfully retrained on {formatTimestamp(trainingStatus.startTime, true)}.</p>
              <p className="mt-1">New accuracy: <span className="font-bold text-green-300">{(modelMetrics?.accuracy * 100).toFixed(1)}%</span></p>
              <p className="mt-1">Training samples: <span className="font-bold">{modelMetrics?.numSamples || 'N/A'}</span></p>
            </div>
            <button
              onClick={fetchModelMetrics}
              className="mt-2 w-full py-1 bg-green-700 hover:bg-green-600 rounded text-sm"
            >
              View Updated Model Metrics
            </button>
          </div>
        )}
        
        {/* Data Issues */}
        {dataIssues.length > 0 && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded">
            <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Data Issues Detected ({dataIssues.length})
            </h3>
            <ul className="text-xs space-y-1 mb-3 max-h-24 overflow-y-auto">
              {dataIssues.slice(0, 3).map((issue, i) => (
                <li key={i} className="text-red-300">
                  {issue.message} at {issue.location}
                </li>
              ))}
              {dataIssues.length > 3 && (
                <li className="text-gray-400">
                  ...and {dataIssues.length - 3} more issues
                </li>
              )}
            </ul>
            <button
              onClick={handleFixDataIssues}
              disabled={fixingIssues}
              className="w-full py-1 bg-red-700 hover:bg-red-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fixingIssues ? 'Fixing Issues...' : 'Auto-Fix Issues & Restart Training'}
            </button>
          </div>
        )}
        
        {/* Recent Model Metrics */}
        {modelMetrics && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-300 flex items-center">
                <FaChartLine className="mr-2 text-blue-400" />
                Model Performance
              </h3>
              <span className="text-xs text-gray-500">
                Last updated: {formatTimestamp(modelMetrics.lastUpdated)}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
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
              <div className="bg-gray-800/50 p-2 rounded text-center">
                <div className="text-xs text-gray-400">F1 Score</div>
                <div className="text-sm font-bold">{(modelMetrics.f1Score * 100).toFixed(1)}%</div>
              </div>
            </div>
            
            {modelMetrics.featureImportance && (
              <div className="mt-2 pt-2 border-t border-gray-800/50">
                <div className="text-xs text-gray-400 mb-1">Top Predictive Factors</div>
                <div className="space-y-1">
                  {Object.entries(modelMetrics.featureImportance)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([feature, importance]) => (
                      <div key={feature} className="flex items-center text-xs">
                        <div className="w-1/4 text-gray-300 truncate">{feature}</div>
                        <div className="w-3/4 flex items-center">
                          <div 
                            className="h-1.5 bg-blue-600 rounded-full" 
                            style={{ width: `${importance * 100}%` }}
                          ></div>
                          <span className="ml-2 text-blue-300">{(importance * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Version History */}
        {modelVersions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-300 flex items-center">
                <FaHistory className="mr-2 text-blue-400" />
                Version History
              </h3>
            </div>
            
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {modelVersions.slice(0, 3).map((version) => (
                <div 
                  key={version.id}
                  className={`p-2 rounded text-xs ${
                    selectedVersion === version.id ? 'bg-blue-900/30 border border-blue-800/50' : 'bg-gray-800/50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{version.name || `Version ${version.id}`}</span>
                    <span className="text-gray-400">{formatTimestamp(version.created)}</span>
                  </div>
                  <div className="flex mt-1">
                    <div className="flex items-center mr-3">
                      <span className="text-gray-400 mr-1">Acc:</span>
                      <span>{(version.metrics.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">F1:</span>
                      <span>{(version.metrics.f1Score * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Column Mapping Guide */}
        {columnMapping && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-800/50 rounded">
            <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center">
              <FaTable className="mr-2" />
              CSV Column Guide
            </h3>
            <div className="text-xs mb-2">
              Your CSV file should have these columns (or rename your current columns):
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-left border-b border-gray-800">Required</th>
                  <th className="p-1 text-left border-b border-gray-800">Alternatives</th>
                  <th className="p-1 text-left border-b border-gray-800">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 border-b border-gray-800">LATITUDE</td>
                  <td className="p-1 border-b border-gray-800">latitude, lat, y</td>
                  <td className="p-1 border-b border-gray-800">Geographical latitude</td>
                </tr>
                <tr>
                  <td className="p-1 border-b border-gray-800">LONGITUDE</td>
                  <td className="p-1 border-b border-gray-800">longitude, long, lon, lng, x</td>
                  <td className="p-1 border-b border-gray-800">Geographical longitude</td>
                </tr>
                <tr>
                  <td className="p-1 border-b border-gray-800">ACTOR1</td>
                  <td className="p-1 border-b border-gray-800">actor1, actor_1, primary_actor, side_a</td>
                  <td className="p-1 border-b border-gray-800">Primary conflict actor</td>
                </tr>
                <tr>
                  <td className="p-1 border-b border-gray-800">EVENT_TYPE</td>
                  <td className="p-1 border-b border-gray-800">event_type, eventtype, conflict_type</td>
                  <td className="p-1 border-b border-gray-800">Type of conflict event</td>
                </tr>
                <tr>
                  <td className="p-1 border-b border-gray-800 text-gray-400">FATALITIES</td>
                  <td className="p-1 border-b border-gray-800 text-gray-400">fatalities, deaths, casualties</td>
                  <td className="p-1 border-b border-gray-800 text-gray-400">Number of deaths (optional)</td>
                </tr>
                <tr>
                  <td className="p-1 border-b border-gray-800 text-gray-400">CONFLICT_RISK</td>
                  <td className="p-1 border-b border-gray-800 text-gray-400">conflict_risk, risk_level, risk</td>
                  <td className="p-1 border-b border-gray-800 text-gray-400">Risk category (0-2, optional)</td>
                </tr>
              </tbody>
            </table>
            {columnMapping.available && (
              <div className="mt-2 text-xs">
                <div className="text-gray-400 mb-1">Available columns in your CSV:</div>
                <div className="flex flex-wrap gap-1">
                  {columnMapping.available.map((col, index) => (
                    <span 
                      key={index} 
                      className={`px-1 rounded ${
                        ['LATITUDE', 'LONGITUDE', 'ACTOR1', 'EVENT_TYPE'].includes(col.toUpperCase()) 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Model Verification */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-300">Model Verification</h3>
            <button
              onClick={verifyModelRetraining}
              disabled={verifying}
              className="px-2 py-1 text-xs bg-blue-700 hover:bg-blue-600 rounded disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify Model'}
            </button>
          </div>
          
          {verificationData && (
            <div className="bg-gray-800/50 p-2 rounded text-xs">
              <div className="flex justify-between">
                <span>Model File:</span>
                <span className={verificationData.model_exists ? "text-green-400" : "text-red-400"}>
                  {verificationData.model_exists ? "✓ Found" : "✗ Missing"}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Last Modified:</span>
                <span>{formatTimestamp(verificationData.model_last_modified, true)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Model Size:</span>
                <span>{verificationData.model_file_size_kb} KB</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Training Samples:</span>
                <span>{verificationData.samples_trained_on}</span>
              </div>
            </div>
          )}
        </div>

        {/* Retraining History */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between text-sm cursor-pointer mb-2"
            onClick={() => setShowHistory(!showHistory)}
          >
            <h3 className="font-bold text-gray-300 flex items-center">
              {showHistory ? <FaChevronDown className="mr-1" /> : <FaChevronRight className="mr-1" />}
              Retraining History
            </h3>
          </div>
          
          {showHistory && retrainingHistory.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {retrainingHistory.map((entry, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-xs ${
                    entry.success ? 'bg-green-900/20 border border-green-800/30' : 
                                 'bg-red-900/20 border border-red-800/30'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className={entry.success ? "text-green-400" : "text-red-400"}>
                      {entry.success ? "Successful" : "Failed"}
                    </span>
                    <span className="text-gray-400">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  {entry.success ? (
                    <div className="mt-1 text-gray-300">
                      Trained on {entry.num_samples} samples
                      {entry.metrics && ` (Accuracy: ${(entry.metrics.accuracy * 100).toFixed(1)}%)`}
                    </div>
                  ) : (
                    <div className="mt-1 text-red-300 truncate" title={entry.error}>
                      Error: {entry.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {showHistory && retrainingHistory.length === 0 && (
            <div className="text-xs text-gray-400 italic">
              No retraining history available
            </div>
          )}
        </div>

        {/* Training Logs */}
        <div>
          <div 
            className="flex items-center justify-between text-sm cursor-pointer"
            onClick={() => setExpandedLogs(!expandedLogs)}
          >
            <h3 className="font-bold text-gray-300 flex items-center">
              {expandedLogs ? <FaChevronDown className="mr-1" /> : <FaChevronRight className="mr-1" />}
              Training Logs
            </h3>
            <span className="text-xs text-gray-500">
              {trainingLogs.length} entries
            </span>
          </div>
          
          {expandedLogs && (
            <div className="mt-2 bg-gray-950 border border-gray-800/50 rounded p-2 max-h-64 overflow-y-auto text-xs font-mono">
              {trainingLogs.map((log, i) => (
                <div key={i} className={`${getLogLevelStyle(log.level)}`}>
                  <span className="text-gray-500 mr-2">[{formatTimestamp(log.timestamp)}]</span>
                  {log.message}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
        
        {/* Connection Status */}
        <div className="mt-4 text-xs text-gray-500 flex items-center">
          <div className={`w-2 h-2 rounded-full mr-1 ${trainingStatus.isTraining ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          API Connection: {trainingStatus.error ? 'Error' : 'Connected'}
        </div>

        {/* Debug Panel - Hidden by default */}
        <div className="mt-4 border-t border-gray-800 pt-2">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            {showDebugPanel ? "Hide Technical Details" : "Show Technical Details"}
          </button>
          
          {showDebugPanel && (
            <div className="mt-2 bg-gray-900 border border-gray-800 rounded p-2 text-xs">
              <h4 className="font-bold mb-1 text-gray-400">Model Training Debug Info</h4>
              
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-500">Training Status:</div>
                <div>{JSON.stringify(trainingStatus.isTraining)}</div>
                
                <div className="text-gray-500">Progress:</div>
                <div>{trainingStatus.progress}%</div>
                
                <div className="text-gray-500">Current Stage:</div>
                <div>{trainingStatus.stage || "N/A"}</div>
                
                <div className="text-gray-500">Error:</div>
                <div className="text-red-400">{trainingStatus.error || "None"}</div>
                
                <div className="text-gray-500">WebSocket:</div>
                <div>{socketRef.current?.readyState === 1 ? "Connected" : "Disconnected"}</div>
                
                <div className="text-gray-500">Features Used:</div>
                <div>{verificationData?.features_used?.join(", ") || "Unknown"}</div>
              </div>
              
              <div className="mt-2">
                <div className="text-gray-500 mb-1">Recent File Changes:</div>
                <div className="bg-gray-950 p-1 rounded font-mono text-xs max-h-20 overflow-y-auto">
                  {verificationData && (
                    <>
                      <div>Model File: {verificationData.model_exists ? "✓" : "✗"}</div>
                      <div>Last Modified: {verificationData.model_last_modified}</div>
                      <div>File Size: {verificationData.model_file_size_kb} KB</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}