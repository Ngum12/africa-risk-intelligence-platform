import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// This component handles focusing the map on the selected hotspot
function MapOperations({ selectedHotspot, hotspots }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedHotspot) {
      const hotspot = hotspots.find(h => h.id === selectedHotspot);
      if (hotspot) {
        map.setView([hotspot.lat, hotspot.lng], 6, {
          animate: true,
          duration: 1
        });
      }
    }
  }, [selectedHotspot, map, hotspots]);
  
  return null;
}

export default function HotspotMap({ 
  hotspots = [], 
  onHotspotSelect, 
  selectedHotspot, 
  mapMode = 'default', 
  pulseEffect = true,
  isLoading = false 
}) {
  // Center the map on Africa
  const position = [5, 20]; // Roughly center of Africa
  const [dynamicHotspots, setDynamicHotspots] = useState(hotspots);
  
  // Update hotspots with animation effect when data changes
  useEffect(() => {
    if (!isLoading) {
      // Add any new hotspots first with a highlighted effect
      const newHotspots = hotspots.filter(
        newSpot => !dynamicHotspots.some(oldSpot => oldSpot.id === newSpot.id)
      ).map(spot => ({
        ...spot,
        isNew: true // Flag to highlight new hotspots
      }));
      
      // Mix in existing hotspots
      if (newHotspots.length > 0) {
        setDynamicHotspots([...dynamicHotspots, ...newHotspots]);
        
        // After a delay, remove the highlight effect
        setTimeout(() => {
          setDynamicHotspots(hotspots.map(spot => ({...spot, isNew: false})));
        }, 3000);
      } else {
        setDynamicHotspots(hotspots);
      }
    }
  }, [hotspots, isLoading]);
  
  // This function calculates the color based on intensity
  const getColor = (intensity, isNew = false) => {
    if (isNew) return "#10b981"; // Highlight new hotspots in teal
    if (intensity >= 0.7) return "#ef4444"; // High risk - red
    if (intensity >= 0.4) return "#f97316"; // Medium risk - orange
    return "#eab308"; // Low risk - yellow
  };

  // Get the map tile layer based on the selected mode
  const getTileLayer = () => {
    switch (mapMode) {
      case 'satellite':
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        );
      case 'heatmap':
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="heatmap-filter"
          />
        );
      default:
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          />
        );
    }
  };
  
  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={position} 
        zoom={3.5} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
        className={`${mapMode === 'heatmap' ? 'heatmap-mode' : ''}`}
      >
        {getTileLayer()}
        
        <MapOperations selectedHotspot={selectedHotspot} hotspots={dynamicHotspots} />
        
        {dynamicHotspots.map((hotspot) => (
          <CircleMarker 
            key={hotspot.id || `${hotspot.lat}-${hotspot.lng}`}
            center={[hotspot.lat, hotspot.lng]}
            radius={mapMode === 'heatmap' ? 25 * (hotspot.intensity || 0.5) : 15 * (hotspot.intensity || 0.5)}
            fillColor={getColor(hotspot.intensity || 0.5, hotspot.isNew)}
            color={selectedHotspot === hotspot.id ? "#ffffff" : hotspot.isNew ? "#10b981" : "#000000"}
            weight={selectedHotspot === hotspot.id ? 3 : hotspot.isNew ? 2 : 1}
            opacity={0.9}
            fillOpacity={mapMode === 'heatmap' ? 0.4 : 0.6}
            className={hotspot.isNew ? 'new-hotspot' : pulseEffect ? 'pulse-marker' : ''}
            eventHandlers={{
              click: () => {
                if (onHotspotSelect) {
                  onHotspotSelect(hotspot);
                }
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -5]} opacity={0.95} permanent={selectedHotspot === hotspot.id} className={`custom-tooltip ${hotspot.isNew ? 'new-tooltip' : ''}`}>
              <div className="text-center">
                <div className="font-bold text-sm">
                  {hotspot.region || hotspot.country}
                </div>
                {hotspot.eventType && (
                  <div className="text-xs opacity-80">{hotspot.eventType}</div>
                )}
                <div className="text-xs mt-1 font-semibold">
                  Risk: {Math.round((hotspot.intensity || 0.5) * 100)}%
                </div>
                {selectedHotspot === hotspot.id && (
                  <div className="text-xs mt-1 opacity-80">{hotspot.incidents} incidents</div>
                )}
                {hotspot.isNew && (
                  <div className="text-xs mt-1 text-emerald-300 font-bold">NEW ALERT</div>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Country border overlay effect */}
      <div className="absolute inset-0 pointer-events-none border-overlay"></div>

      {/* Add pulsing effect and other styling */}
      <style jsx global>{`
        .leaflet-container {
          background: #111827;
        }
        
        .heatmap-filter {
          filter: hue-rotate(180deg) invert(1) contrast(1.5) saturate(0.5);
        }
        
        .heatmap-mode:before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(30, 41, 59, 0.7);
          z-index: 1000;
          pointer-events: none;
        }
        
        .leaflet-tooltip.custom-tooltip {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
          color: white;
          border-radius: 8px;
          padding: 8px 12px;
          backdrop-filter: blur(8px);
        }
        
        .leaflet-tooltip.new-tooltip {
          border: 1px solid rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }
        
        .leaflet-tooltip-top.custom-tooltip:before {
          border-top-color: rgba(59, 130, 246, 0.3);
        }
        
        .leaflet-tooltip-top.new-tooltip:before {
          border-top-color: rgba(16, 185, 129, 0.5);
        }
        
        .pulse-marker {
          animation: pulse-size 2s infinite;
        }
        
        .new-hotspot {
          animation: new-hotspot-pulse 1s infinite alternate;
        }
        
        @keyframes pulse-size {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.06);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes new-hotspot-pulse {
          0% {
            stroke-width: 2;
            stroke-opacity: 1;
          }
          100% {
            stroke-width: 5;
            stroke-opacity: 0.8;
          }
        }
        
        .border-overlay {
          background-image: url('https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json');
          background-size: cover;
          opacity: 0.1;
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  );
}