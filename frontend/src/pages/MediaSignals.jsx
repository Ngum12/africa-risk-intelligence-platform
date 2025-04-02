import React, { useState } from 'react';
import apiClient from '../services/api';

export default function MediaSignals() {
  const [country, setCountry] = useState('');
  const [actor, setActor] = useState('');
  const [signals, setSignals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchSignals = async () => {
    if (!country || !actor) {
      setError("Please enter both country and actor");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the apiClient to make the request
      const response = await apiClient.get('http://localhost:8080/media-signals', {
        params: { country, actor }
      });
      
      setSignals(response.data);
    } catch (err) {
      console.error("Error fetching media signals:", err);
      setError("Failed to fetch media signals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Media Signals Analysis</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-1">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 text-black rounded"
            placeholder="e.g., Nigeria"
          />
        </div>
        
        <div className="flex-1">
          <label className="block mb-1">Actor</label>
          <input
            type="text"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="w-full px-3 py-2 text-black rounded"
            placeholder="e.g., Boko Haram"
          />
        </div>
      </div>
      
      <button
        onClick={searchSignals}
        disabled={loading}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
      >
        {loading ? "Searching..." : "Analyze Media Signals"}
      </button>
      
      {error && <div className="mt-4 text-red-500">{error}</div>}
      
      {signals && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Results for: {signals.query}</h3>
          <div className="divide-y divide-gray-700">
            {signals.results.map((item, index) => (
              <div key={index} className="py-3">
                <div className="flex justify-between">
                  <span className="font-medium">{item.source}</span>
                  <span className={`text-sm ${
                    item.sentiment === 'positive' ? 'text-green-400' : 
                    item.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {item.sentiment}
                  </span>
                </div>
                <div className="text-sm mt-1">{item.title}</div>
                <div className="text-xs text-gray-400 mt-1">Relevance: {item.relevance_score} • {item.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
