import React, { useState, useEffect, useRef } from 'react';
import {
  fetchAllTripData,
  getLocationById,
  getHomeLocation,
  linkRoutesToSteps,
  generateTimelineFromSteps,
  formatTravelTime
} from './services/airtableService';

// ================================================================
// ICON DEFINITIONS
// Change the Material Symbol name (right-hand value) to swap icons.
// Browse all icons at: https://fonts.google.com/icons?icon.style=Rounded
// ================================================================
const ICONS = {
  // --- Navigation & UI ---
  navigate:            'near_me',           // "Get Directions" button
  expandPanel:         'open_in_full',      // Expand details card button
  collapsePanel:       'close_fullscreen',  // Collapse details card button

  // --- Map Mode Toggle ---
  mapAtlas:            'public',            // Atlas (world map) mode button
  mapRoad:             'map',               // Road mode button
  mapTerrain:          'terrain',           // Terrain mode button

  // --- Location Markers ---
  locationPin:         'location_on',       // General destination / location marker
  locationHome:        'home',              // Home location marker

  // --- Generic UI ---
  clock:               'schedule',          // Travel time and activity duration

  // --- Transit Modes ---
  flight:              'flight',            // Flight / air travel
  train:               'train',             // Train / rail travel
  drive:               'directions_car',    // Car / driving

  // --- Lodging Types ---
  lodgingHome:         'home',              // Home stay
  lodgingAirport:      'flight',            // Airport stay
  lodgingApartment:    'key',               // Apartment
  lodgingHotel:        'hotel',             // Hotel or hostel
  lodgingHouse:        'cottage',           // House or villa
  lodgingTent:         'camping',           // Camping / tent
  lodgingDefault:      'apartment',         // Default / unrecognized lodging type
  accommodation:       'bed',              // Accommodations section header icon

  // --- Activity Categories ---
  activityHiking:      'hiking',            // Hiking, mountains, nature
  activityFood:        'restaurant',        // Food, dining, restaurants
  activityWater:       'water',             // Water, beach, swimming
  activityMuseum:      'museum',            // Museums, galleries
  activityShopping:    'shopping_bag',      // Shopping, markets
  activityHistorical:  'account_balance',   // Historical sites, monuments, castles
  activityPerformance: 'theater_comedy',    // Performances, theater, concerts
  activityNightlife:   'local_bar',         // Nightlife, bars, clubs
  activityPhotography: 'photo_camera',      // Photography, scenic viewpoints
  activityBiking:      'directions_bike',   // Biking, cycling
  activityDefault:     'star',              // Default / unrecognized activity
};

// Renders a Material Symbols Rounded icon as a React element
const Icon = ({ name, size = 16, className = '', style = {} }) => (
  <span
    className={`material-symbols-rounded map-icon ${className}`}
    style={{ fontSize: `${size}px`, ...style }}
  >
    {name}
  </span>
);

// Returns a Material Symbols icon as an HTML string for Leaflet map labels
const getIconHtml = (iconKey, color = '#000', size = 14) => {
  const name = ICONS[iconKey] || ICONS.activityDefault;
  return `<span class="material-symbols-rounded map-icon" style="font-size: ${size}px; color: ${color};">${name}</span>`;
};

/// Color values — edit the hex values in src/index.css (:root block) to change colors globally.
// These hex copies are needed for JS contexts: SVG fill attributes, Leaflet HTML strings, inline alpha variants.
const COLORS = {
  primary:        '#5a2d5a',
  primaryLight:   '#f6f0f6',
  flight:         '#4775d1',
  flightMuted:    '#7a95d9',
  train:          '#46a384',
  trainMuted:     '#6bb89d',
  drive:          '#cc5c5c',
  driveMuted:     '#d97a7a',
  home:           '#8b5a8b',
  activity:       '#f59e0b',
  activityMuted:  '#fbbf24',
  activityLight:  '#fef3c7',
};


// Generate timeline items dynamically from Airtable data
const generateTimelineItems = (transitRoutes, lodgingSteps, TRIP_METADATA) => {
  // Link routes to steps so we know which route connects which steps
  const linkedRoutes = linkRoutesToSteps(transitRoutes, lodgingSteps);

  // Generate timeline from trip data
  const timelineData = generateTimelineFromSteps(lodgingSteps, linkedRoutes, TRIP_METADATA);

  // Build lookup for routes
  const transitRouteLookup = {};
  linkedRoutes.forEach(route => {
    transitRouteLookup[route.id] = route;
  });

  // Convert timeline data to items with route references
  return timelineData.map(item => {
    if (item.type === 'transit' && item.routeId) {
      const route = transitRouteLookup[item.routeId];
      return {
        ...item,
        start: new Date(item.start),
        end: new Date(item.end),
        route: route || null
      };
    }
    return {
      ...item,
      start: new Date(item.start),
      end: new Date(item.end)
    };
  });
};

// Utility functions
const createBezierCurve = (from, to, segments = 50) => {
  const points = [];
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  
  const controlPoint = [
    midLat + (to[0] - from[0]) * 0.2,
    midLng
  ];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = Math.pow(1 - t, 2) * from[0] + 2 * (1 - t) * t * controlPoint[0] + Math.pow(t, 2) * to[0];
    const lng = Math.pow(1 - t, 2) * from[1] + 2 * (1 - t) * t * controlPoint[1] + Math.pow(t, 2) * to[1];
    points.push([lat, lng]);
  }
  
  return points;
};

// MapComponent with Natural Earth GeoJSON and OpenRailRouting with debugging
const MapComponent = ({ selectedId, onSelect, mapMode, selectedTimelineItem, detailsMinimized, handleTimelineSelect, selectedActivityId, onActivitySelect, activities, lodgingSteps, transitRoutes, TRIP_METADATA, timelineItems }) => {
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const routeLabelsLayerRef = useRef(null);
  const mapLabelsLayerRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const geoJsonLakesRef = useRef(null);
  const atlasBaseLayerRef = useRef(null);
  const mapModeRef = useRef(mapMode);
  const prevSelectionRef = useRef(null);
  const [routeGeometries, setRouteGeometries] = useState({});
  const [currentZoom, setCurrentZoom] = useState(null);
  const [debugOpacity, setDebugOpacity] = useState({ fill: 0, stroke: 0, ocean: 0 });

  useEffect(() => {
    mapModeRef.current = mapMode;
  }, [mapMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const L = window.L;
    if (!L || mapRef.current) return;

    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
});

// Calculate bounds of all stops (including home) for initial view
const allCoords = lodgingSteps.map(step => step.coords);

if (allCoords.length > 0) {
  const bounds = L.latLngBounds(allCoords);
  map.fitBounds(bounds, { padding: [100, 100] });
}

mapRef.current = map;

    // Base tile layers
    const atlasLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    });

    const roadLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    });

    const terrainLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    // In Atlas mode (zoomed out), skip base tiles — ocean blue background shows through
    atlasBaseLayerRef.current = atlasLayer;
    if (mapMode === 'atlas') {
      map.getContainer().style.backgroundColor = 'var(--atlas-ocean)';
      // Only add base tile if already zoomed in
      if (map.getZoom() >= 10) atlasLayer.addTo(map);
    } else {
      const layers = { road: roadLayer, terrain: terrainLayer };
      layers[mapMode].addTo(map);
    }

    // Labels layer for Atlas mode
    // Labels pane above lakes
    map.createPane('atlasLabels');
    map.getPane('atlasLabels').style.zIndex = 500;
    map.getPane('atlasLabels').style.pointerEvents = 'none';

    mapLabelsLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      pane: 'atlasLabels'
    });

    if (mapMode === 'atlas') {
      mapLabelsLayerRef.current.addTo(map);
    }

    mapRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    labelsLayerRef.current = L.layerGroup().addTo(map);
    routeLabelsLayerRef.current = L.layerGroup().addTo(map);

    // Load Natural Earth GeoJSON for colored countries with improved approach
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson')
      .then(response => response.json())
      .then(data => {
        const rootStyles = getComputedStyle(document.documentElement);
        const colors = Array.from({ length: 9 }, (_, i) =>
          rootStyles.getPropertyValue(`--atlas-color-${i + 1}`).trim()
        );

        // Create GeoJSON layer for country fills + borders
        geoJsonLayerRef.current = L.geoJson(data, {
          style: (feature) => {
            // Use Natural Earth's pre-computed MAPCOLOR9 — guarantees no adjacent countries share a color
            const colorIndex = (feature.properties.MAPCOLOR9 || 1) - 1; // MAPCOLOR9 is 1-indexed
            return {
              fillColor: colors[colorIndex],
              weight: 1,
              opacity: 1,
              color: '#ffffff',
              fillOpacity: mapMode === 'atlas' ? 1.0 : 0,
              smoothFactor: 1.0
            };
          },
          pane: 'tilePane'
        }).addTo(map);
      })
      .catch(err => {
        console.warn('Failed to load Natural Earth GeoJSON:', err);
      });

      // Parse ocean RGB from CSS variable for alpha fade and lake fills
    const oceanVar = getComputedStyle(document.documentElement).getPropertyValue('--atlas-ocean').trim();
    const oceanMatch = oceanVar.match(/(\d+),\s*(\d+),\s*(\d+)/);
    const oceanRGB = oceanMatch ? `${oceanMatch[1]}, ${oceanMatch[2]}, ${oceanMatch[3]}` : '135, 195, 235';
    const oceanHex = oceanMatch
      ? '#' + [oceanMatch[1], oceanMatch[2], oceanMatch[3]].map(c => parseInt(c).toString(16).padStart(2, '0')).join('')
      : '#87c3eb';

    // Lakes pane above country fills but below labels
    map.createPane('atlasLakes');
    map.getPane('atlasLakes').style.zIndex = 450;
    map.getPane('atlasLakes').style.pointerEvents = 'none';

    // Load Natural Earth lakes to overlay on top of country fills
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson')
      .then(response => response.json())
      .then(lakesData => {
        geoJsonLakesRef.current = L.geoJson(lakesData, {
          style: () => ({
            fillColor: oceanHex,
            fillOpacity: mapMode === 'atlas' ? 1 : 0,
            weight: 1,
            opacity: mapMode === 'atlas' ? 1 : 0,
            color: '#ffffff',
            smoothFactor: 1.0
          }),
          pane: 'atlasLakes'
        }).addTo(map);
      })
      .catch(err => {
        console.warn('Failed to load Natural Earth lakes GeoJSON:', err);
      });

      // Fade Atlas overlays as zoom increases
    map.on('zoomend', () => {
      if (mapModeRef.current === 'atlas' && geoJsonLayerRef.current) {
        const z = map.getZoom();

        // Fill: 1.00 at zoom ≤7, linear fade to 0.00 at zoom 15, stays 0 after
        let fillOpacity;
        if (z <= 7) fillOpacity = 1.0;
        else if (z >= 15) fillOpacity = 0;
        else fillOpacity = 1.0 - (z - 7) / (15 - 7);

        // Stroke: 1 through zoom 15, then 0
        const strokeOpacity = z < 16 ? 1 : 0;

        // Ocean: 0.85 through zoom 15, then 0
        const oceanAlpha = z < 16 ? 0.85 : 0;

        geoJsonLayerRef.current.setStyle({ fillOpacity, opacity: strokeOpacity });
        if (geoJsonLakesRef.current) {
          geoJsonLakesRef.current.setStyle({ fillOpacity, opacity: strokeOpacity });
        }

        if (oceanAlpha > 0) {
          map.getContainer().style.backgroundColor = `rgba(${oceanRGB}, ${oceanAlpha.toFixed(2)})`;
        } else {
          map.getContainer().style.backgroundColor = '';
        }

        setDebugOpacity({ fill: fillOpacity.toFixed(2), stroke: strokeOpacity.toFixed(2), ocean: oceanAlpha.toFixed(2) });

        // Swap base tile in once fill starts fading, remove when fully opaque
        if (z > 7) {
          if (atlasBaseLayerRef.current && !map.hasLayer(atlasBaseLayerRef.current)) {
            atlasBaseLayerRef.current.addTo(map);
          }
        } else {
          if (atlasBaseLayerRef.current && map.hasLayer(atlasBaseLayerRef.current)) {
            map.removeLayer(atlasBaseLayerRef.current);
          }
        }
      }
    });

    // Check if current date is during the trip
    const checkCurrentDestination = () => {
      const now = new Date();
      
      if (now >= TRIP_METADATA.tripStart && now <= TRIP_METADATA.tripEnd) {
        const currentItem = timelineItems.find(item => {
          return item.type === 'stay' && item.start <= now && item.end >= now;
        });
        
        if (currentItem) {
          setTimeout(() => {
            handleTimelineSelect(currentItem.id, currentItem.stepIndex);
          }, 100);
        }
      }
    };

    setTimeout(checkCurrentDestination, 500);

    // Track zoom level for conditional label display
    const updateZoom = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', updateZoom);
    updateZoom(); // Set initial zoom

    return () => {
      map.off('zoomend', updateZoom);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Switch map tiles and manage layers
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

  // Fetch route geometries with detailed logging
  useEffect(() => {
    const fetchRouteGeometries = async () => {
      const geometries = {};
      
      for (const route of transitRoutes) {
        if (route.mode === 'train') {
          try {
            const allPoints = [route.fromCoords, ...route.waypoints, route.toCoords];
            const coordString = allPoints.map(p => `point=${p[0]},${p[1]}`).join('&');
            const url = `https://routing.openrailrouting.org/route?${coordString}&profile=all_tracks&points_encoded=false`;
            
            console.log(`🚂 Fetching train route ${route.id} from OpenRailRouting...`);
            console.log(`   URL: ${url}`);
            
            const railRes = await fetch(url);
            
            console.log(`   Response status: ${railRes.status}`);
            
            if (railRes.ok) {
              const railData = await railRes.json();
              console.log(`   Response data:`, railData);
              
              if (railData.paths && railData.paths[0] && railData.paths[0].points) {
                geometries[route.id] = railData.paths[0].points.coordinates.map(c => [c[1], c[0]]);
                console.log(`   ✅ SUCCESS: Got ${geometries[route.id].length} points`);
                continue;
              } else {
                console.log(`   ⚠️ No paths in response, using fallback`);
              }
            } else {
              const errorText = await railRes.text();
              console.log(`   ❌ HTTP error: ${errorText}`);
            }
          } catch (err) {
            console.error(`   ❌ Exception for ${route.id}:`, err);
          }
          
          // Fallback
          console.log(`   📍 Using waypoint fallback for ${route.id}`);
          geometries[route.id] = [route.fromCoords, ...route.waypoints, route.toCoords];
          
        } else if (route.mode === 'drive') {
          try {
            const allPoints = [route.fromCoords, ...route.waypoints, route.toCoords];
            const coords = allPoints.map(p => `${p[1]},${p[0]}`).join(';');
            const res = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
            );
            
            if (res.ok) {
              const data = await res.json();
              if (data.routes && data.routes[0]) {
                geometries[route.id] = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
              }
            }
          } catch (err) {
            geometries[route.id] = [route.fromCoords, ...route.waypoints, route.toCoords];
          }
        } else if (route.mode === 'flight') {
          geometries[route.id] = createBezierCurve(route.fromCoords, route.toCoords);
        }
      }
      
      setRouteGeometries(geometries);
    };
    
    fetchRouteGeometries();
  }, []);

  // Draw routes with highlighting and labels
  useEffect(() => {
    if (!mapRef.current || !routesLayerRef.current || !routeLabelsLayerRef.current) return;
    const L = window.L;
    const selectionChanged = prevSelectionRef.current !== selectedTimelineItem?.id;
    prevSelectionRef.current = selectedTimelineItem?.id;

    routesLayerRef.current.clearLayers();
    routeLabelsLayerRef.current.clearLayers();

    const isTransitSelected = selectedTimelineItem?.type === 'transit';
    const selectedRouteId = selectedTimelineItem?.route?.id;

    const getPolylineMidpoint = (points) => {
      if (points.length === 2) {
        return [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2];
      }
      let totalLength = 0;
      const segLengths = [];
      for (let i = 0; i < points.length - 1; i++) {
        const len = Math.sqrt(
          Math.pow(points[i+1][0] - points[i][0], 2) +
          Math.pow(points[i+1][1] - points[i][1], 2)
        );
        segLengths.push(len);
        totalLength += len;
      }
      const halfLen = totalLength / 2;
      let accumulated = 0;
      for (let i = 0; i < segLengths.length; i++) {
        if (accumulated + segLengths[i] >= halfLen) {
          const t = (halfLen - accumulated) / segLengths[i];
          return [
            points[i][0] + t * (points[i+1][0] - points[i][0]),
            points[i][1] + t * (points[i+1][1] - points[i][1])
          ];
        }
        accumulated += segLengths[i];
      }
      return points[Math.floor(points.length / 2)];
    };

    transitRoutes.forEach((route, routeIdx) => {
      const isSelected = isTransitSelected && selectedRouteId === route.id;
      let coords;

      if (mapModeRef.current === 'atlas') {
        coords = [route.fromCoords, ...route.waypoints, route.toCoords];
      } else if (routeGeometries[route.id]) {
        coords = routeGeometries[route.id];
      } else if (route.mode === 'flight') {
        coords = createBezierCurve(route.fromCoords, route.toCoords);
      } else {
        coords = [route.fromCoords, ...route.waypoints, route.toCoords];
      }

      const colorMap = {
        flight: isSelected ? COLORS.flight : COLORS.flightMuted,
        train: isSelected ? COLORS.train : COLORS.trainMuted,
        drive: isSelected ? COLORS.drive : COLORS.driveMuted
      };

      const polyline = L.polyline(coords, {
        color: colorMap[route.mode],
        weight: mapModeRef.current === 'atlas' ? 4 : (isSelected ? 4 : 3),
        opacity: isSelected ? 1.0 : 0.7,
        className: isSelected ? 'route-selected' : '',
        dashArray: route.mode === 'flight' ? '8, 12' : undefined
      });
      
      // Make route clickable to focus
      const correspondingTimelineItem = timelineItems.find(item => item.route?.id === route.id);
      if (correspondingTimelineItem) {
        polyline.on('click', () => {
          handleTimelineSelect(correspondingTimelineItem.id, correspondingTimelineItem.stepIndex);
        });
      }
      
      polyline.addTo(routesLayerRef.current);
      
      // Add endpoint circles on both ends
      const startCircle = L.circleMarker(coords[0], {
        radius: 4,
        fillColor: colorMap[route.mode],
        color: colorMap[route.mode],
        weight: 1,
        fillOpacity: 1,
        opacity: 1
      });
      startCircle.addTo(routesLayerRef.current);
      
      const endCircle = L.circleMarker(coords[coords.length - 1], {
        radius: 4,
        fillColor: colorMap[route.mode],
        color: colorMap[route.mode],
        weight: 1,
        fillOpacity: 1,
        opacity: 1
      });
      endCircle.addTo(routesLayerRef.current);
      
      // Travel time label for selected route - larger and centered on the line
      if (isSelected && route.travelTime) {
        const straightLineCoords = [route.fromCoords, ...route.waypoints, route.toCoords];
        const midPoint = mapModeRef.current === 'atlas'
          ? getPolylineMidpoint(straightLineCoords)
          : coords[Math.floor(coords.length / 2)];
        const modeIconKey = route.mode === 'flight' ? 'flight' : route.mode === 'train' ? 'train' : 'drive';
        const labelIcon = L.divIcon({
          html: `
            <div class="map-label map-label--route" style="--label-color: ${colorMap[route.mode]}">
              ${getIconHtml(modeIconKey, colorMap[route.mode], 18)}
              <span>${formatTravelTime(route.travelTime)}</span>
            </div>
          `,
          className: 'route-label',
          iconSize: null,
          iconAnchor: [0, 0]
        });

        L.marker(midPoint, { icon: labelIcon }).addTo(routeLabelsLayerRef.current);
      }
      
      // Zoom to route bounds only when selection changes (not on map mode switch)
      if (isSelected && selectionChanged) {
        const bounds = L.latLngBounds(coords);
        mapRef.current.flyToBounds(bounds, { padding: [80, 80], duration: 1.5 });
      }
    });
  }, [selectedTimelineItem, routeGeometries, mapMode]);

  // Draw markers with lodging labels
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !labelsLayerRef.current) return;
    const L = window.L;
    
    markersLayerRef.current.clearLayers();
    labelsLayerRef.current.clearLayers();
    
    const isLocationSelected = selectedTimelineItem?.type === 'stay';
    
    lodgingSteps.forEach((step, idx) => {
      if (!step.isDestination) return;
      
      const isSelected = isLocationSelected && selectedId === idx;
      
      // Different pin styles for home vs destinations
      const pinSvg = step.isHome ? `
        <svg width="35" height="35" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="24" height="24" rx="12" 
                fill="${isSelected ? COLORS.home : '#94a3b8'}" 
                stroke="white" 
                stroke-width="2"/>
          <path d="M12 3L4 9v11h5v-6h6v6h5V9l-8-6z" 
                fill="white"
                transform="translate(0, 1)"/>
        </svg>
      ` : `
        <svg width="35" height="43" viewBox="0 0 28.8 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.4 0C6.45 0 0 6.45 0 14.4c0 10.8 14.4 21.6 14.4 21.6s14.4-10.8 14.4-21.6C28.8 6.45 22.35 0 14.4 0z"
                fill="${isSelected ? COLORS.primary : '#94a3b8'}"
                stroke="white"
                stroke-width="1.5"/>
          <text x="14.4" y="16"
                text-anchor="middle"
                dominant-baseline="middle"
                font-size="${step.destinationNumber >= 10 ? '11' : '12'}"
                font-weight="bold"
                fill="white">${step.destinationNumber}</text>
        </svg>
      `;
      
      const icon = L.divIcon({
        html: pinSvg,
        className: 'custom-pin',
        iconSize: step.isHome ? [35, 35] : [35, 43],
        iconAnchor: step.isHome ? [17, 18] : [17, 43]
      });
      
      const marker = L.marker(step.coords, { icon });
      marker.on('click', () => {
        // Find the corresponding timeline stay item for this destination
        const correspondingStayItem = timelineItems.find(item => 
          item.type === 'stay' && item.stepIndex === idx
        );
        if (correspondingStayItem) {
          handleTimelineSelect(correspondingStayItem.id, idx);
        }
      });
      marker.addTo(markersLayerRef.current);
      
      // Lodging label when selected (hide if zoomed out)
      if (isSelected && currentZoom > 12) {
        const lodgingIconKey = getLodgingIconType(step.lodgingCategory);
        const labelIcon = L.divIcon({
          html: `
            <div class="map-label" style="--label-color: ${COLORS.primary}">
              ${getIconHtml(lodgingIconKey, COLORS.primary, 18)}
              <span>${step.lodging}</span>
            </div>
          `,
          className: 'lodging-label',
          iconSize: null,
          iconAnchor: [0, 70]
        });

        const labelMarker = L.marker(step.coords, { icon: labelIcon });
        labelMarker.on('click', () => {
          const correspondingStayItem = timelineItems.find(item =>
            item.type === 'stay' && item.stepIndex === idx
          );
          if (correspondingStayItem) {
            handleTimelineSelect(correspondingStayItem.id, idx);
          }
        });
        labelMarker.addTo(labelsLayerRef.current);
      }
    });

    // Activity markers - show when parent (destination or transit) is selected
    const isTransitSelected = selectedTimelineItem?.type === 'transit';
    if ((isLocationSelected || isTransitSelected) && selectedId !== null) {
      const relevantActivities = activities.filter(act => {
        if (isLocationSelected) {
          return act.parentStepIndex === selectedId;
        } else if (isTransitSelected) {
          return act.parentTransitId === selectedTimelineItem.id;
        }
        return false;
      });

      relevantActivities.forEach(activity => {
        const isActivitySelected = selectedActivityId === activity.id;

        const activityPinSvg = `
          <svg width="17" height="22" viewBox="0 0 28.8 36" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.4 0C6.45 0 0 6.45 0 14.4c0 10.8 14.4 21.6 14.4 21.6s14.4-10.8 14.4-21.6C28.8 6.45 22.35 0 14.4 0z"
                  fill="${isActivitySelected ? COLORS.activity : COLORS.activityMuted}"
                  stroke="white"
                  stroke-width="1.5"/>
          </svg>
        `;

        const activityIcon = L.divIcon({
          html: activityPinSvg,
          className: 'custom-pin',
          iconSize: [17, 22],
          iconAnchor: [9, 22]
        });

        const marker = L.marker(activity.coords, { icon: activityIcon });
        marker.on('click', () => onActivitySelect(activity.id));
        marker.addTo(markersLayerRef.current);

        // Show all activity labels when parent is selected (hide if zoomed out)
        if (currentZoom > 12) {
          const activityIconKey = getActivityIconType(activity.category);
          const labelIcon = L.divIcon({
            html: `
              <div class="map-label map-label--activity" style="--label-color: ${COLORS.activity}">
                ${getIconHtml(activityIconKey, COLORS.activity, 16)}
                <span>${activity.name}</span>
              </div>
            `,
            className: 'lodging-label',
            iconSize: null,
            iconAnchor: [0, 40]
          });

          const labelMarker = L.marker(activity.coords, { icon: labelIcon });
          labelMarker.on('click', () => onActivitySelect(activity.id));
          labelMarker.addTo(labelsLayerRef.current);
        }
      });
    }

  }, [selectedId, selectedTimelineItem, onSelect, selectedActivityId, onActivitySelect, activities, currentZoom]);

  // Separate effect for zoom - only triggers when selection actually changes via user interaction
  const prevZoomSelectionRef = useRef({ selectedId, selectedActivityId, timelineId: selectedTimelineItem?.id });
  useEffect(() => {
    if (!mapRef.current) return;

    const prev = prevZoomSelectionRef.current;
    const curTimelineId = selectedTimelineItem?.id;
    const changed = prev.selectedId !== selectedId || prev.selectedActivityId !== selectedActivityId || prev.timelineId !== curTimelineId;
    prevZoomSelectionRef.current = { selectedId, selectedActivityId, timelineId: curTimelineId };

    // Skip if nothing actually changed (initial mount, re-renders, etc.)
    if (!changed) return;

    // Zoom to activity when activity is selected
    if (selectedActivityId) {
      const activity = activities.find(act => act.id === selectedActivityId);
      if (activity && activity.coords) {
        const maxZoom = mapRef.current.getMaxZoom();
        const targetZoom = Math.max(1, maxZoom - 3);
        mapRef.current.flyTo(activity.coords, targetZoom, { duration: 1.5 });
        return;
      }
    }

    // Zoom to destination when destination is selected (and no activity)
    if (selectedTimelineItem?.type === 'stay' && selectedId !== null) {
      const step = lodgingSteps[selectedId];
      if (step && step.coords) {
        const maxZoom = mapRef.current.getMaxZoom();
        const targetZoom = Math.max(1, maxZoom - 5);
        mapRef.current.flyTo(step.coords, targetZoom, { duration: 1.5 });
      }
    }
  }, [selectedId, selectedTimelineItem, selectedActivityId]);

  return (
    <>
      <div id="map" className="w-full h-full" />
      {/* Debug: Zoom & Opacity (uncomment to re-enable)
      <div className="absolute bottom-24 right-8 p-3 bg-black/75 text-white text-xs font-mono rounded-lg z-[1000] leading-relaxed">
        <div>Zoom: {currentZoom ?? '–'}</div>
        <div>Fill: {debugOpacity.fill}</div>
        <div>Stroke: {debugOpacity.stroke}</div>
        <div>Ocean: {debugOpacity.ocean}</div>
      </div>
      */}
    </>
  );
};

// Maps activity category string to an ICONS key (for both React and Leaflet label usage)
const getActivityIconType = (category) => {
  switch(category) {
    case 'hiking':
    case 'nature':
      return 'activityHiking';
    case 'food':
    case 'dining':
    case 'restaurant':
      return 'activityFood';
    case 'water':
    case 'beach':
    case 'swimming':
      return 'activityWater';
    case 'museum':
    case 'museums':
    case 'gallery':
      return 'activityMuseum';
    case 'shopping':
    case 'market':
      return 'activityShopping';
    case 'historical':
    case 'historic':
    case 'monument':
    case 'castle':
      return 'activityHistorical';
    case 'performance':
    case 'theater':
    case 'theatre':
    case 'show':
    case 'concert':
      return 'activityPerformance';
    case 'nightlife':
    case 'bar':
    case 'drinks':
    case 'club':
      return 'activityNightlife';
    case 'photography':
    case 'scenic':
    case 'viewpoint':
      return 'activityPhotography';
    case 'biking':
    case 'cycling':
    case 'bike':
      return 'activityBiking';
    default:
      return 'activityDefault';
  }
};

// Maps lodging category string to an ICONS key (for both React and Leaflet label usage)
const getLodgingIconType = (category) => {
  switch(category) {
    case 'home':       return 'lodgingHome';
    case 'airport':    return 'lodgingAirport';
    case 'apartment':  return 'lodgingApartment';
    case 'hostel':
    case 'hotel':      return 'lodgingHotel';
    case 'house':
    case 'villa':      return 'lodgingHouse';
    case 'camping':
    case 'campground': return 'lodgingTent';
    default:           return 'lodgingDefault';
  }
};

// Returns an Icon element for a given activity category
const getActivityIcon = (category, size = 14) => (
  <Icon name={ICONS[getActivityIconType(category)]} size={size} className="flex-shrink-0" />
);

// Returns an Icon element for a given lodging category
const getLodgingIcon = (category, size = 14) => (
  <Icon name={ICONS[getLodgingIconType(category)]} size={size} className="flex-shrink-0" />
);

// Timeline Component
const Timeline = ({ selectedId, onSelect, lodgingSelectedId, selectedActivityId, onActivitySelect, lodgingSteps, timelineItems, activities }) => {
  const scrollRef = useRef(null);
  // Derive trip start/end from actual timeline data
  const tripStart = timelineItems.length > 0 ? new Date(Math.min(...timelineItems.map(i => i.start.getTime()))) : new Date();
  const tripEnd = timelineItems.length > 0 ? new Date(Math.max(...timelineItems.map(i => i.end.getTime()))) : new Date();
  const totalHours = (tripEnd - tripStart) / (1000 * 60 * 60);
  const hourWidth = 8;
  const totalWidth = totalHours * hourWidth;

  const getPos = (date) => {
    return ((date - tripStart) / (1000 * 60 * 60)) * hourWidth;
  };

  useEffect(() => {
    if (scrollRef.current && lodgingSelectedId !== null) {
      const step = lodgingSteps[lodgingSelectedId];
      if (step && step.startDate) {
        const pos = getPos(new Date(step.startDate + 'T12:00:00'));
        scrollRef.current.scrollTo({ left: pos - 300, behavior: 'smooth' });
      }
    }
  }, [lodgingSelectedId]);

  const getModeIcon = (mode, isHome = false) => {
    if (isHome) return <Icon name={ICONS.locationHome} size={16} className="flex-shrink-0" />;
    switch(mode) {
      case 'flight': return <Icon name={ICONS.flight} size={16} className="flex-shrink-0" />;
      case 'train':  return <Icon name={ICONS.train}  size={16} className="flex-shrink-0" />;
      case 'drive':  return <Icon name={ICONS.drive}  size={16} className="flex-shrink-0" />;
      default:       return <Icon name={ICONS.locationPin} size={16} className="flex-shrink-0" />;
    }
  };
  
  const destinationSteps = lodgingSteps.filter(step => step.isDestination);
  const countryCount = new Set(destinationSteps.map(step => step.country)).size;
  const destinationCount = destinationSteps.length;

  return (
    <div className="w-full bg-gradient-to-b from-white to-slate-50 shadow-lg z-30">
      <div className="px-8 py-4 flex items-baseline justify-between">
        <div>
          <h1 className="font-serif italic text-5xl font-bold text-slate-900 tracking-tight leading-none">Europe 2026</h1>
        </div>
        <div className="text-base font-bold uppercase tracking-wider text-slate-600">
          {tripStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}–{tripEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · {destinationCount} Destinations · {countryCount} Countries
        </div>
      </div>

      <div className="sticky top-0 bg-white z-50">
        <div className="relative h-32 overflow-x-auto custom-scrollbar" ref={scrollRef}>
          <div className="relative h-full" style={{ width: `${totalWidth + 64}px` }}>
 {/* Day tickmarks and labels — generated dynamically from trip dates */}
            {(() => {
              const dayLabels = [];
              const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              const dayWidth = 24 * hourWidth;
              // Start from the beginning of tripStart's day
              const firstDay = new Date(tripStart);
              firstDay.setHours(0, 0, 0, 0);
              const lastDay = new Date(tripEnd);
              lastDay.setHours(23, 59, 59, 999);
              const totalDays = Math.ceil((lastDay - firstDay) / (1000 * 60 * 60 * 24));

              for (let d = 0; d < totalDays; d++) {
                const currentDay = new Date(firstDay);
                currentDay.setDate(firstDay.getDate() + d);
                const dayStartX = d * dayWidth;
                const dayCenterX = dayStartX + dayWidth / 2;
                const dayEndX = dayStartX + dayWidth;
                const dayOfWeek = dayNames[currentDay.getDay()];
                const month = currentDay.getMonth() + 1;
                const dayNum = currentDay.getDate();

                dayLabels.push(
                  <React.Fragment key={`day-${d}`}>
                    {/* Start tickmark for first day */}
                    {d === 0 && (
                      <div
                        className="absolute w-0.5 bg-slate-600 opacity-50 z-40"
                        style={{ left: `${32}px`, top: '0px', height: '77px' }}
                      />
                    )}
                    {/* End tickmark */}
                    <div
                      className="absolute w-0.5 bg-slate-600 opacity-50 z-40"
                      style={{ left: `${dayEndX + 32}px`, top: '0px', height: '77px' }}
                    />
                    {/* Day label centered */}
                    <div
                      className="absolute flex flex-col items-center"
                      style={{ left: `${dayCenterX + 32}px`, top: '0px', transform: 'translateX(-50%)' }}
                    >
                      <span className="text-sm font-black text-slate-600 tabular-nums z-50" style={{ height: '29px', display: 'flex', alignItems: 'flex-end' }}>{dayOfWeek} {month}/{dayNum}</span>
                    </div>
                  </React.Fragment>
                );
              }
              return dayLabels;
            })()}

            {timelineItems.map((item) => {
              const startX = getPos(item.start);
              const endX = getPos(item.end);
              const actualWidth = endX - startX - 2;
              const displayWidth = Math.max(actualWidth, 18);
              const paddingX = 16;
              const iconWidth = 16;
              const hasRoomForIcon = displayWidth >= 40;
              const contentWidth = displayWidth - paddingX - (hasRoomForIcon ? iconWidth : 0);
              const isSelected = selectedId === item.id;
              
const baseColor = item.isHome ? COLORS.home : (item.type === 'stay' ? COLORS.primary : COLORS[item.mode]);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id, item.stepIndex)}
                  className={`absolute h-10 transition-all ${hasRoomForIcon ? 'px-4' : 'px-2'} group overflow-visible ${
                    isSelected ? 'shadow-2xl scale-105 rounded-xl' : 'rounded-lg'
                  }`}
                  style={{ 
                    left: `${startX + 32 + 1}px`,
                    top: '37px',
                    width: `${displayWidth}px`,
                    backgroundColor: isSelected ? baseColor : `${baseColor}${item.type === 'stay' ? '50' : '40'}`,
                    color: isSelected ? '#fff' : baseColor,
                    zIndex: isSelected ? 30 : 10,
                  }}
                >
                  <div className="relative flex items-center" style={{ zIndex: 50 }}>
                    {hasRoomForIcon && (item.type === 'stay' ? getLodgingIcon(lodgingSteps[item.stepIndex]?.lodgingCategory, 16) : getModeIcon(item.mode))}
                    {contentWidth > 40 && (
                      <span className={`${hasRoomForIcon ? 'ml-2' : ''} text-xs font-black truncate uppercase tracking-wide ${isSelected ? 'opacity-100' : 'opacity-90'}`}>
                        {item.type === 'stay' ? item.city : item.label}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Activity pills - secondary row - always visible */}
            {activities.map(activity => {
                const startX = getPos(new Date(activity.startTime));
                const endX = getPos(new Date(activity.endTime));
                const displayWidth = Math.max(endX - startX - 2, 60);
                const isSelected = selectedActivityId === activity.id;

                return (
                  <button
                    key={activity.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivitySelect(activity.id);
                    }}
                    className={`absolute transition-all ${
                      isSelected ? 'shadow-xl scale-105 rounded-lg' : 'rounded-md'
                    }`}
                    style={{
                      left: `${startX + 32 + 1}px`,
                      top: '82px',
                      width: `${displayWidth}px`,
                      height: '26px',
                      padding: '0 10px',
                      backgroundColor: isSelected ? COLORS.activity : COLORS.activityMuted,
                      color: isSelected ? '#fff' : '#78350f',
                      zIndex: isSelected ? 25 : 15,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {getActivityIcon(activity.category, 11)}
                      {displayWidth > 60 && (
                        <span className="font-bold truncate text-[10px]">{activity.name}</span>
                      )}
                    </div>
                  </button>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // All hooks must be declared before any early returns (React rules of hooks)
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [selectedTimelineId, setSelectedTimelineId] = useState('stay-1');
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [mapMode, setMapMode] = useState('atlas');
  const [detailsMinimized, setDetailsMinimized] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadTripData();
  }, []);

  const loadTripData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllTripData();
      setTripData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading trip data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-700 mb-2">Loading trip data...</div>
          <div className="text-sm text-slate-500">Fetching from Airtable</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center max-w-md p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Trip Data</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadTripData}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data loaded
  if (!tripData) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <p className="text-slate-600">No trip data available</p>
        </div>
      </div>
    );
  }

  // Extract data from tripData
  const { locations, tripSteps, routes, activities } = tripData;

  // Set up location helpers with loaded data
  const homeLoc = getHomeLocation(locations);
  const airportLoc = getLocationById(locations, 'airport-halifax');

  // Set up TRIP_METADATA from loaded data
  const TRIP_METADATA = {
    homeAddress: homeLoc?.address || '',
    homeCoords: homeLoc?.coords || [0, 0],
    homeName: homeLoc?.name || 'Home',
    airportAddress: airportLoc?.address || '',
    airportCoords: airportLoc?.coords || [0, 0],
    tripStart: tripSteps.length > 0 ? new Date(tripSteps[0].startDate + 'T00:00:00') : new Date(),
    tripEnd: tripSteps.length > 0 ? new Date(tripSteps[tripSteps.length - 1].endDate + 'T23:59:59') : new Date()
  };

  // Use enriched data from Airtable (same structure as before)
  const lodgingSteps = tripSteps;
  const transitRoutes = routes;

  // Generate timeline items dynamically from loaded data
  const timelineItems = generateTimelineItems(transitRoutes, lodgingSteps, TRIP_METADATA);

  const currentStep = lodgingSteps[selectedIdx];
  const currentItem = timelineItems.find(item => item.id === selectedTimelineId);
    
  const getGoogleMapsUrl = (address) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };
  
  const handleTimelineSelect = (timelineId, stepIndex) => {
    // Don't do anything if clicking the already-selected item
    if (selectedTimelineId === timelineId && !selectedActivityId) return;

    setSelectedTimelineId(timelineId);
    if (stepIndex !== undefined) {
      setSelectedIdx(stepIndex);
    }
    setSelectedActivityId(null); // Clear activity selection when changing destinations
  };

  const handleActivitySelect = (activityId) => {
    // Don't do anything if clicking the already-selected activity
    if (selectedActivityId === activityId) return;

    // Find the activity to get its parent
    const activity = activities.find(act => act.id === activityId);
    if (!activity) return;

    // Select the activity
    setSelectedActivityId(activityId);

    // Also select the parent destination or transit
    if (activity.parentStepIndex !== undefined) {
      // Find the corresponding stay timeline item for this destination
      const parentStayItem = timelineItems.find(item =>
        item.type === 'stay' && item.stepIndex === activity.parentStepIndex
      );
      if (parentStayItem) {
        setSelectedTimelineId(parentStayItem.id);
        setSelectedIdx(activity.parentStepIndex);
      }
    } else if (activity.parentTransitId) {
      // Find the corresponding transit timeline item
      const parentTransitItem = timelineItems.find(item => item.id === activity.parentTransitId);
      if (parentTransitItem) {
        setSelectedTimelineId(activity.parentTransitId);
        if (parentTransitItem.stepIndex !== undefined) {
          setSelectedIdx(parentTransitItem.stepIndex);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
      <Timeline
        selectedId={selectedTimelineId}
        onSelect={handleTimelineSelect}
        lodgingSelectedId={selectedIdx}
        selectedActivityId={selectedActivityId}
        onActivitySelect={handleActivitySelect}
        lodgingSteps={lodgingSteps}
        timelineItems={timelineItems}
        activities={activities}
      />

      <div className="flex-1 relative">
        <MapComponent
          selectedId={selectedIdx}
          onSelect={setSelectedIdx}
          mapMode={mapMode}
          selectedTimelineItem={currentItem}
          detailsMinimized={detailsMinimized}
          handleTimelineSelect={handleTimelineSelect}
          selectedActivityId={selectedActivityId}
          onActivitySelect={handleActivitySelect}
          activities={activities}
          lodgingSteps={lodgingSteps}
          transitRoutes={transitRoutes}
          TRIP_METADATA={TRIP_METADATA}
          timelineItems={timelineItems}
        />

        {/* Map Mode Toggle - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex gap-1 p-1 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl z-[1000] border border-white/50">
          {[
            { id: 'atlas',   label: 'Atlas',   iconKey: 'mapAtlas'   },
            { id: 'road',    label: 'Road',    iconKey: 'mapRoad'    },
            { id: 'terrain', label: 'Terrain', iconKey: 'mapTerrain' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setMapMode(mode.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                mapMode === mode.id ? 'text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
              }`}
              style={{ backgroundColor: mapMode === mode.id ? COLORS.primary : 'transparent' }}
            >
              <Icon name={ICONS[mode.iconKey]} size={12} /> {mode.label}
            </button>
          ))}
        </div>

        {/* Details Card */}
        {detailsMinimized ? (
          <button
            onClick={() => setDetailsMinimized(false)}
            className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center z-[1000] border border-slate-100 hover:scale-110 transition-transform"
            style={{ color: COLORS.primary }}
          >
            <Icon name={ICONS.expandPanel} size={24} />
          </button>
        ) : (
          <div className="absolute bottom-10 left-10 w-[400px] bg-white p-10 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] z-[1000] border border-slate-50">
            <button
              onClick={() => setDetailsMinimized(true)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
              style={{ color: COLORS.primary }}
            >
              <Icon name={ICONS.collapsePanel} size={18} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: COLORS.primary }} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.3em]" style={{ color: COLORS.primary }}>
                {currentItem?.type === 'transit' ? 'Transit Details' : selectedActivityId ? 'Activity Details' : 'Location Details'}
              </span>
            </div>

            {currentItem?.type === 'transit' ? (
              <>
                {/* Transit Details */}
                <h2 className="font-serif italic text-5xl mb-2 text-slate-900 tracking-tighter leading-tight">
                  {currentItem.label}
                </h2>
                <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                  {currentItem.mode === 'flight' && <Icon name={ICONS.flight} size={13} className="text-slate-300" />}
                  {currentItem.mode === 'train' && <Icon name={ICONS.train}  size={13} className="text-slate-300" />}
                  {currentItem.mode === 'drive' && <Icon name={ICONS.drive}  size={13} className="text-slate-300" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {currentItem.mode}
                  </span>
                </div>
                {currentItem.route?.travelTime && (
                  <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                    <Icon name={ICONS.clock} size={13} />
                    <span className="text-sm">Travel Time: {formatTravelTime(currentItem.route.travelTime)}</span>
                  </div>
                )}

                {/* Activities List for transit stops */}
                {(() => {
                  const relevantActivities = activities.filter(act => act.parentTransitId === currentItem.id);
                  if (relevantActivities.length === 0) return null;

                  return (
                    <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-200">
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: COLORS.activity }}>
                        Stops Along The Way
                      </p>
                      <div className="space-y-2">
                        {relevantActivities.map(activity => (
                          <button
                            key={activity.id}
                            onClick={() => handleActivitySelect(activity.id)}
                            className="w-full text-left flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-amber-100 transition-colors border border-transparent hover:border-amber-300"
                          >
                            <div className="flex-shrink-0" style={{ color: COLORS.activity }}>
                              {getActivityIcon(activity.category, 16)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-amber-900 truncate">{activity.name}</p>
                              <p className="text-xs text-amber-700">
                                {new Date(activity.startTime).toLocaleTimeString('en-US', {
                                  hour: 'numeric', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : selectedActivityId ? (() => {
              // Activity Details (standalone)
              const activity = activities.find(act => act.id === selectedActivityId);
              if (!activity) return null;
              // Validate activity belongs to current context (destination or transit)
              const isValidParent = activity.parentStepIndex === selectedIdx ||
                                    activity.parentTransitId === selectedTimelineId;
              if (!isValidParent) return null;

              return (
                <>
                  <h2 className="font-serif italic text-5xl mb-2 text-slate-900 tracking-tighter leading-tight">
                    {activity.name}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                    {getActivityIcon(activity.category, 16)}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {activity.category} <span className="mx-3 text-slate-200">|</span>
                      {currentStep.city}
                    </span>
                  </div>

                  <div className="p-7 rounded-[2rem] flex items-start gap-6 border-2 mb-4"
                       style={{
                         backgroundColor: COLORS.activityLight,
                         borderColor: COLORS.activity
                       }}>
                    <div className="bg-white p-5 rounded-2xl shadow-sm" style={{ color: COLORS.activity }}>
                      {getActivityIcon(activity.category, 24)}
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                         style={{ color: COLORS.activity }}>
                        Activity Details
                      </p>
                      <div className="flex items-center gap-1.5 mb-3" style={{ color: COLORS.activity }}>
                        <Icon name={ICONS.clock} size={13} />
                        <span className="text-xs font-bold">
                          {new Date(activity.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric', minute: '2-digit'
                          })} - {new Date(activity.endTime).toLocaleTimeString('en-US', {
                            hour: 'numeric', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-amber-800 leading-relaxed">{activity.description}</p>
                      )}
                    </div>
                  </div>
                </>
              );
            })() : (
              <>
                {/* Location Details */}
                <h2 className="font-serif italic text-5xl mb-2 text-slate-900 tracking-tighter leading-tight">
                  {currentStep.city}
                </h2>
                <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                  {currentStep.isHome ? <Icon name={ICONS.locationHome} size={13} className="text-slate-300" /> : <Icon name={ICONS.locationPin} size={13} className="text-slate-300" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {currentStep.country} <span className="mx-3 text-slate-200">|</span>
                    {currentStep.isHome ? 'Home' : currentStep.isDestination ? `Destination ${currentStep.destinationNumber}` : 'Transit'}
                  </span>
                </div>

                <div className="bg-slate-50 p-7 rounded-[2rem] flex items-center gap-6 border border-slate-100">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50" style={{ color: COLORS.primary }}>
                  <Icon name={ICONS.accommodation} size={24} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Accommodations</p>
                  <p className="font-extrabold text-slate-800 text-xl tracking-tight">{currentStep.lodging}</p>
                </div>
              </div>

              <a 
                href={getGoogleMapsUrl(currentStep.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105"
                style={{ 
                  backgroundColor: COLORS.primary,
                  color: 'white'
                }}
              >
                <Icon name={ICONS.navigate} size={18} />
                Get Directions
              </a>

                {/* Activities List */}
                {(() => {
                  const relevantActivities = activities.filter(act => act.parentStepIndex === selectedIdx);
                  if (relevantActivities.length === 0) return null;

                  return (
                    <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-200">
                      <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: COLORS.activity }}>
                        Activities
                      </p>
                      <div className="space-y-2">
                        {relevantActivities.map(activity => (
                          <button
                            key={activity.id}
                            onClick={() => handleActivitySelect(activity.id)}
                            className="w-full text-left flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-amber-100 transition-colors border border-transparent hover:border-amber-300"
                          >
                            <div className="flex-shrink-0" style={{ color: COLORS.activity }}>
                              {getActivityIcon(activity.category, 16)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-amber-900 truncate">{activity.name}</p>
                              <p className="text-xs text-amber-700">
                                {new Date(activity.startTime).toLocaleTimeString('en-US', {
                                  hour: 'numeric', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
