import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/config';

export default function Form({ onResult }) {
  const [formData, setFormData] = useState({
    country: '',
    admin1: '',
    event_type: '',
    actor1: '',
    latitude: '',
    longitude: '',
    year: new Date().getFullYear() // Default to current year
  });

  const [countryOptions, setCountryOptions] = useState([]);
  const [eventTypeOptions, setEventTypeOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        const data = await response.json();
        
        // Set the options
        setCountryOptions(data.countries || []);
        setEventTypeOptions(data.event_types || []);
        setActorOptions(data.actors || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
        setIsLoading(false);
        
        // Fallback options if API fails
        setCountryOptions(["Somalia", "Nigeria", "Sudan", "Ethiopia"]);
        setEventTypeOptions(["Violence against civilians", "Battle", "Protest", "Riot"]);
        setActorOptions(["Boko Haram", "Al-Shabaab", "Government forces", "Civilians"]);
      }
    };
    
    fetchCategories();
  }, []);

  // Update regions based on selected country
  useEffect(() => {
    const fetchRegions = async () => {
      if (!formData.country) return;
      
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) {
          throw new Error(`Failed to fetch regions: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.regions && data.regions[formData.country]) {
          setRegionOptions(data.regions[formData.country]);
        } else {
          setRegionOptions([]);
        }
      } catch (err) {
        console.error("Error fetching regions:", err);
        
        // Fallback regions mapping
        const regionMap = {
          "Nigeria": ["Borno", "Lagos", "Abuja", "Kano", "Kaduna"],
          "Somalia": ["Mogadishu", "Kismayo", "Baidoa", "Galkayo"],
          "Sudan": ["Khartoum", "Darfur", "Blue Nile", "South Kordofan"],
          "Ethiopia": ["Addis Ababa", "Tigray", "Amhara", "Oromia"],
        };
        
        setRegionOptions(regionMap[formData.country] || []);
      }
    };
    
    fetchRegions();
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }
      
      onResult(data);
    } catch (err) {
      console.error("Prediction error:", err);
      alert(`Prediction failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading form options...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading form: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-800 rounded-xl shadow-md">
      <div>
        <label className="block mb-1">Country</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-black rounded"
        >
          <option value="">Select a country</option>
          {countryOptions.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Region</label>
        <select
          name="admin1"
          value={formData.admin1}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-black rounded"
          disabled={!formData.country}
        >
          <option value="">Select a region</option>
          {regionOptions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Event Type</label>
        <select
          name="event_type"
          value={formData.event_type}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-black rounded"
        >
          <option value="">Select event type</option>
          {eventTypeOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Actor</label>
        <select
          name="actor1"
          value={formData.actor1}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-black rounded"
        >
          <option value="">Select actor</option>
          {actorOptions.map(actor => (
            <option key={actor} value={actor}>{actor}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Latitude</label>
        <input
          type="number"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          required
          step="0.0001"
          className="w-full px-3 py-2 text-black rounded"
          placeholder="e.g., 10.3833"
        />
      </div>

      <div>
        <label className="block mb-1">Longitude</label>
        <input
          type="number"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          required
          step="0.0001"
          className="w-full px-3 py-2 text-black rounded"
          placeholder="e.g., 9.75"
        />
      </div>

      <div>
        <label className="block mb-1">Year</label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
          min="2000"
          max="2030"
          className="w-full px-3 py-2 text-black rounded"
        />
      </div>

      <button type="submit" className="w-full py-2 mt-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded">
        Predict Risk
      </button>
    </form>
  );
}
