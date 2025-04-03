import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/config';

export default function RiskAssessment() {
  const [formData, setFormData] = useState({
    country: 'Nigeria',
    admin1: '',
    event_type: 'Violence against civilians',
    actor1: 'Boko Haram',
    latitude: 10.3833,
    longitude: 9.75,
    year: new Date().getFullYear()
  });
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [actors, setActors] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load country data
    fetch(`${API_URL}/countries`)
      .then(res => res.json())
      .then(data => setCountries(data.countries))
      .catch(err => console.error("Error loading countries:", err));
    
    // Load event types
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => setEventTypes(data.categories))
      .catch(err => console.error("Error loading categories:", err));
  }, []);

  // Load regions when country changes
  useEffect(() => {
    if (formData.country) {
      fetch(`${API_URL}/regions?country=${formData.country}`)
        .then(res => res.json())
        .then(data => setRegions(data.regions))
        .catch(err => console.error("Error loading regions:", err));

      // Load actors for this country
      fetch(`${API_URL}/actors?country=${formData.country}`)
        .then(res => res.json())
        .then(data => setActors(data.actors))
        .catch(err => console.error("Error loading actors:", err));
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error submitting prediction:", err);
      setError("Failed to get prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Risk Assessment</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Country</label>
            <select 
              name="country" 
              value={formData.country} 
              onChange={handleChange}
              className="w-full bg-gray-700 text-white py-2 px-3 rounded-md"
            >
              {countries.map(c => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Region/Province</label>
            <select 
              name="admin1" 
              value={formData.admin1} 
              onChange={handleChange}
              className="w-full bg-gray-700 text-white py-2 px-3 rounded-md"
            >
              {regions.map(r => (
                <option key={r.code} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Event Type</label>
            <select 
              name="event_type" 
              value={formData.event_type} 
              onChange={handleChange}
              className="w-full bg-gray-700 text-white py-2 px-3 rounded-md"
            >
              {eventTypes.map(et => (
                <option key={et.id} value={et.name}>{et.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Actor</label>
            <select 
              name="actor1" 
              value={formData.actor1} 
              onChange={handleChange}
              className="w-full bg-gray-700 text-white py-2 px-3 rounded-md"
            >
              {actors.map(a => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Latitude</label>
            <input 
              type="number" 
              step="0.0001"
              name="latitude" 
              value={formData.latitude} 
              onChange={handleChange}
              className="w-full bg-gray-700 text-white py-2 px-3 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Longitude</label>
            <input 
              type="number" 
              step="0.0001"
              name="longitude" 
              value={formData.longitude} 
              onChange={handleChange}
              className="w-full bg-gray-700 text-white py-2 px-3 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Year</label>
            <input 
              type="number" 
              name="year" 
              value={formData.year} 
              onChange={handleChange}
              className="w-full bg-gray-700 text-white py-2 px-3 rounded-md"
            />
          </div>
        </div>

        <div className="mt-6">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            disabled={loading}
          >
            {loading ? "Processing..." : "Predict Risk"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-800 text-white p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Prediction Results</h2>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Risk Level:</span>
              <span className={`font-bold ${
                result.prediction === "High Risk" ? "text-red-500" : 
                result.prediction === "Medium Risk" ? "text-yellow-500" : "text-green-500"
              }`}>
                {result.prediction}
              </span>
            </div>
            
            <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  result.prediction === "High Risk" ? "bg-red-500" : 
                  result.prediction === "Medium Risk" ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{width: `${result.confidence}%`}}
              ></div>
            </div>
            <div className="text-right text-sm mt-1">
              Confidence: {result.confidence}%
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-md mb-4">
            <h3 className="font-bold mb-2">AI Recommendation</h3>
            <p>{result.ai_recommendation}</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="font-bold mb-2">If No Action Taken</h3>
            <p>{result.if_no_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}