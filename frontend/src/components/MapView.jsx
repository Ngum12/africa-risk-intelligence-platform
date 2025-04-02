import React, { useEffect, useRef } from 'react';
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [20, 5], // Centered on Africa
      zoom: 2.5
    });

    return () => map.remove();
  }, []);

  return (
    <div className="rounded-lg shadow overflow-hidden h-[500px] w-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
