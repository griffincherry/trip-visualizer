import { useEffect } from 'react';

// Custom hook: manages tile layers, GeoJSON, atlas mode
export const useMapLayers = (mapRef, geoJsonLayerRef, geoJsonLakesRef, mapLabelsLayerRef, atlasBaseLayerRef, mapMode) => {
  useEffect(() => {
    if (!mapRef.current) return;
    const L = window.L;
    const map = mapRef.current;

    // Remove all tile layers
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const atlasLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { maxZoom: 19 });
    const roadLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 });
    const terrainLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });

    // Atlas mode: no base tile at zoomed-out, blue background shows as ocean
    if (mapMode === 'atlas') {
      atlasBaseLayerRef.current = atlasLayer;
      map.getContainer().style.backgroundColor = 'var(--atlas-ocean)';
      // Add base tile only if already zoomed in
      if (map.getZoom() >= 10) {
        atlasLayer.addTo(map);
        map.getContainer().style.backgroundColor = '';
      }
    } else {
      map.getContainer().style.backgroundColor = '';
      const layers = { road: roadLayer, terrain: terrainLayer };
      layers[mapMode].addTo(map);
    }

    // Manage labels and country colors based on map mode
    if (mapMode === 'atlas') {
      if (mapLabelsLayerRef.current) {
        mapLabelsLayerRef.current.addTo(map);
      }
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.setStyle({ fillOpacity: 1.0, weight: 1, opacity: 1 });
      }
      if (geoJsonLakesRef.current) {
        geoJsonLakesRef.current.setStyle({ fillOpacity: 1.0, opacity: 1 });
      }
    } else {
      if (mapLabelsLayerRef.current && map.hasLayer(mapLabelsLayerRef.current)) {
        map.removeLayer(mapLabelsLayerRef.current);
      }
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.setStyle({ fillOpacity: 0, weight: 0, opacity: 0 });
      }
      if (geoJsonLakesRef.current) {
        geoJsonLakesRef.current.setStyle({ fillOpacity: 0, opacity: 0 });
      }
    }
  }, [mapMode]);
};
