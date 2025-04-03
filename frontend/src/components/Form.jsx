import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/config';

export default function Form({ onResult }) {
  const [formData, setFormData] = useState({
    country: 'Nigeria', // Default country
    admin1: '',
    event_type: 'Violence against civilians',
    actor1: 'Boko Haram',
    latitude: 10.3833, // Default coordinates for Nigeria
    longitude: 9.75,
    year: new Date().getFullYear() // Current year
  });

  const [countryOptions, setCountryOptions] = useState([]);
  const [eventTypeOptions, setEventTypeOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch each category type separately
        console.log("Attempting to fetch countries from:", `${API_URL}/countries`);
        console.log("Attempting to fetch categories from:", `${API_URL}/categories`);
        console.log("Attempting to fetch actors from:", `${API_URL}/actors`);
        const [countriesRes, categoriesRes, actorsRes] = await Promise.all([
          fetch(`${API_URL}/countries`),
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/actors`)
        ]);
        
        if (!countriesRes.ok || !categoriesRes.ok || !actorsRes.ok) {
          throw new Error('Failed to fetch form data');
        }
        
        const countriesData = await countriesRes.json();
        const categoriesData = await categoriesRes.json();
        const actorsData = await actorsRes.json();
        
        // Set the options with proper data structure
        setCountryOptions(countriesData.countries.map(c => c.name) || []);
        setEventTypeOptions(categoriesData.categories.map(c => c.name) || []);
        setActorOptions(actorsData.actors.map(a => a.name) || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching form data:", err);
        
        // Fallback data when API fails
        setCountryOptions(["Nigeria", "Somalia", "Ethiopia", "Sudan", "South Sudan"]);
        setEventTypeOptions(["Violence against civilians", "Armed clashes", "Protests", "Remote explosives", "Strategic developments"]);
        setActorOptions(["Boko Haram", "Al-Shabaab", "Government forces", "Islamic State", "Local militias"]);
        setIsLoading(false);
      }
    };
    
    fetchFormData();
  }, []);

  // Update regions based on selected country
  useEffect(() => {
    const fetchRegions = async () => {
      if (!formData.country) {
        setRegionOptions([]);
        return;
      }
      
      try {
        console.log("Attempting to fetch regions from:", `${API_URL}/regions?country=${encodeURIComponent(formData.country)}`);
        const response = await fetch(`${API_URL}/regions?country=${encodeURIComponent(formData.country)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch regions: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if we have regions and handle the data structure
        if (data.regions && Array.isArray(data.regions)) {
          setRegionOptions(data.regions.map(r => r.name));
        } else {
          setRegionOptions([]);
        }
      } catch (err) {
        console.error("Error fetching regions:", err);
        
        // Fallback regions based on country
        const fallbackRegions = {
          "Nigeria": ["Borno", "Lagos", "Kaduna", "Abuja", "Kano"],
          "Somalia": ["Mogadishu", "Kismayo", "Baidoa", "Garowe", "Hargeisa"],
          "Ethiopia": ["Tigray", "Amhara", "Oromia", "Addis Ababa", "Afar"]
        };
        
        setRegionOptions(fallbackRegions[formData.country] || []);
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
    
    // Add validation
    if (!formData.country || !formData.admin1 || !formData.event_type || 
        !formData.actor1 || !formData.latitude || !formData.longitude || !formData.year) {
      alert("Please fill out all fields");
      return;
    }
    
    try {
      // Show loading state
      setIsLoading(true);
      
      console.log("Submitting prediction with data:", formData);
      console.log("API URL:", `${API_URL}/predict`);
      
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      console.log("Prediction response:", data);
      
      if (!response.ok) {
        throw new Error(data.detail || 'Prediction failed');
      }
      
      // Process results
      onResult(data);
    } catch (err) {
      console.error("Prediction error:", err);
      alert(`Prediction failed: ${err.message}`);
    } finally {
      setIsLoading(false);
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

      <button 
        type="submit" 
        className="w-full py-2 mt-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Predict Risk'}
      </button>
    </form>
  );
}
