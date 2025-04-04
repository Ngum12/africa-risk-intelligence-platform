import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Country code mapping for flags
const countryCodeMap = {
  'Nigeria': 'ng',
  'Somalia': 'so',
  'Ethiopia': 'et',
  'South Sudan': 'ss',
  'DRC': 'cd',
  'Kenya': 'ke',
  'Mali': 'ml',
  'Niger': 'ne',
  'Chad': 'td',
  'Cameroon': 'cm',
  'Central African Republic': 'cf',
  'Sudan': 'sd',
  'Burkina Faso': 'bf',
  'Libya': 'ly',
  'Egypt': 'eg',
  'Algeria': 'dz',
  'Tunisia': 'tn',
  'Morocco': 'ma',
};

// Custom Div Icon for flags with animations
const createFlagIcon = (country, intensity) => {
  const countryCode = countryCodeMap[country] || 'africa';
  const size = 30 + Math.round(intensity * 20);
  const riskLevel = Math.round(intensity * 100);
  const riskColor = getIntensityColor(intensity);
  
  return L.divIcon({
    className: 'custom-flag-icon',
    html: `
      <div class="flag-marker-container">
        <div class="flag-pulse" style="background-color: ${riskColor}"></div>
        <div class="flag-icon">
          <img src="https://flagcdn.com/48x36/${countryCode}.png" 
               alt="${country}" 
               width="${size}" 
               height="auto"
               class="shadow-lg"
          />
          <span class="accuracy-badge" style="background-color: ${riskColor}">${riskLevel}%</span>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
  });
};

// Helper function to get color based on intensity
function getIntensityColor(intensity) {
  if (intensity > 0.8) return '#ef4444';       // High risk - red
  if (intensity > 0.6) return '#f97316';       // Medium-high - orange
  if (intensity > 0.4) return '#eab308';       // Medium - yellow
  if (intensity > 0.2) return '#84cc16';       // Medium-low - lime
  return '#22c55e';                            // Low - green
}

export default function HotspotMap({ hotspots }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const clusterGroupRef = useRef(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Add necessary CSS for animations
  useEffect(() => {
    // Add custom CSS styles for animations
    const style = document.createElement('style');
    style.textContent = `
      .flag-marker-container {
        position: relative;
        display: flex;
        justify-content: center;
        transform: translateY(-100%);  /* Offset for bottom-center positioning */
      }
      
      .flag-icon {
        position: relative;
        z-index: 10;
        animation: bounce-in 0.5s ease-out;
        transform-origin: bottom center;
      }
      
      .flag-pulse {
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 16px;
        border-radius: 50%;
        opacity: 0.8;
        z-index: 5;
        animation: pulse 2s infinite;
      }
      
      .accuracy-badge {
        position: absolute;
        bottom: -10px;
        right: -10px;
        font-size: 11px;
        color: white;
        padding: 2px 5px;
        border-radius: 10px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      @keyframes bounce-in {
        0% {
          opacity: 0;
          transform: scale(0.3) translateY(-100px);
        }
        50% {
          opacity: 1;
          transform: scale(1.1);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
        }
      }
      
      @keyframes pulse {
        0% {
          transform: translateX(-50%) scale(1);
          opacity: 0.8;
        }
        70% {
          transform: translateX(-50%) scale(2);
          opacity: 0;
        }
        100% {
          transform: translateX(-50%) scale(1);
          opacity: 0;
        }
      }
      
      /* Custom cluster styles */
      .marker-cluster {
        background-color: rgba(59, 130, 246, 0.6);
        border: 2px solid #3b82f6;
        color: white;
        font-weight: bold;
      }
      
      .marker-cluster div {
        background-color: rgba(59, 130, 246, 0.8);
        color: white;
      }

      /* Animation for risk area */
      .risk-area {
        animation: area-fade-in 1s ease-out forwards;
        stroke-dasharray: 10, 5;
        stroke-width: 2;
      }
      
      @keyframes area-fade-in {
        from {
          opacity: 0;
          stroke-dashoffset: 100;
        }
        to {
          opacity: 0.7;
          stroke-dashoffset: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      // Center on Africa
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([7.1881, 21.0938], 3);
      
      // Add the dark map style
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Create marker cluster group with custom styling
      clusterGroupRef.current = L.markerClusterGroup({
        showCoverageOnHover: true,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 6,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
          return L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: L.point(40, 40)
          });
        }
      });
      
      mapInstanceRef.current.addLayer(clusterGroupRef.current);
      setIsMapInitialized(true);
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        clusterGroupRef.current = null;
        markersRef.current = [];
      }
    };
  }, []);

  // Add markers and risk areas when the map is initialized or hotspots change
  useEffect(() => {
    if (!isMapInitialized || !mapInstanceRef.current || !clusterGroupRef.current) return;
    
    // Clear previous markers and areas
    clusterGroupRef.current.clearLayers();
    markersRef.current = [];
    
    if (mapInstanceRef.current._layers) {
      // Remove any existing circles
      Object.keys(mapInstanceRef.current._layers).forEach(layerId => {
        if (mapInstanceRef.current._layers[layerId]._path && 
            mapInstanceRef.current._layers[layerId]._path.classList.contains('risk-area')) {
          mapInstanceRef.current.removeLayer(mapInstanceRef.current._layers[layerId]);
        }
      });
    }
    
    // Add new markers and risk areas with staggered animations
    if (hotspots && hotspots.length) {
      hotspots.forEach((hotspot, index) => {
        const { lat, lng, intensity, location } = hotspot;
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
        
        // Add marker with flag and animation
        setTimeout(() => {
          if (mapInstanceRef.current) {
            // Create marker with flag icon
            const marker = L.marker([lat, lng], {
              icon: createFlagIcon(location, intensity)
            });

            // Create popup with information
            const popup = L.popup({
              className: 'custom-popup',
              closeButton: false,
              offset: [0, -20]
            }).setContent(`
              <div class="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700 text-white">
                <h3 class="font-bold text-lg mb-1">${location}</h3>
                <div class="text-sm grid grid-cols-2 gap-2">
                  <div>
                    <span class="text-gray-400">Risk Level:</span>
                    <span class="font-bold ml-1 ${intensity > 0.7 ? 'text-red-400' : intensity > 0.4 ? 'text-yellow-400' : 'text-green-400'}">
                      ${Math.round(intensity * 100)}%
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">Lat/Long:</span>
                    <span class="font-bold ml-1">${lat.toFixed(2)}°, ${lng.toFixed(2)}°</span>
                  </div>
                </div>
              </div>
            `);

            marker.bindPopup(popup);
            
            // Add hover effect
            marker.on('mouseover', function (e) {
              this.openPopup();
            });
            
            marker.on('mouseout', function (e) {
              this.closePopup();
            });
            
            // Add to cluster group
            clusterGroupRef.current.addLayer(marker);
            markersRef.current.push(marker);
            
            // Create risk area circle with animation
            const circle = L.circle([lat, lng], {
              radius: (intensity * 100000) + 50000,
              color: getIntensityColor(intensity),
              fillColor: getIntensityColor(intensity),
              fillOpacity: 0.15,
              opacity: 0.5,
              weight: 2,
              className: 'risk-area'
            }).addTo(mapInstanceRef.current);
            
          }
        }, index * 150); // Stagger animations by 150ms per hotspot
      });
      
      // Fit bounds after all markers are added
      setTimeout(() => {
        if (mapInstanceRef.current && markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
        }
      }, hotspots.length * 150 + 100);
    }
  }, [hotspots, isMapInitialized]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg z-10" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-800 z-20">
        <h4 className="text-sm font-bold mb-2 text-gray-300">Risk Intensity</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
            <span>High (80-100%)</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>
            <span>Medium-High (60-80%)</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
            <span>Medium (40-60%)</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-lime-500 mr-2"></span>
            <span>Medium-Low (20-40%)</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            <span>Low (0-20%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}