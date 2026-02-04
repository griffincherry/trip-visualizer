import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  Globe, 
  MapPin,
  Mountain,
  Plane,
  Train,
  Car,
  Clock,
  Home,
  Maximize2,
  Minimize2
} from 'lucide-react';

const COLORS = {
  primary: '#5a2d5a', 
  primaryLight: '#f6f0f6',
  flight: '#4775d1',
  flightMuted: '#7A95D9',
  train: '#46a384',
  trainMuted: '#6BB89D',
  drive: '#cc5c5c',
  driveMuted: '#D97A7A'
};

// Data structure with actual addresses from CSV and proper destination counting
const lodgingSteps = [
  { date: "Aug 1", city: "Halifax", lodging: "Overnight Flight", coords: [44.88, -63.5], mode: 'flight', country: 'Canada', isDestination: false },
  { date: "Aug 2-3", city: "The Hague", lodging: "Apartement City Centre", coords: [52.0785, 4.2994], mode: 'train', country: 'Netherlands', isDestination: true, destinationNumber: 1 },
  { date: "Aug 4-6", city: "Ghent", lodging: "Apartment 202", coords: [51.0565, 3.7303], mode: 'train', country: 'Belgium', isDestination: true, destinationNumber: 2 },
  { date: "Aug 7", city: "Koblenz", lodging: "Schönes Apartment 4", coords: [50.3569, 7.5985], mode: 'train', country: 'Germany', isDestination: true, destinationNumber: 3 },
  { date: "Aug 8", city: "Transit", lodging: "Overnight Train", coords: [48.1351, 11.5820], mode: 'train', country: 'Germany', isDestination: false },
  { date: "Aug 9", city: "Salzburg", lodging: "a&o Salzburg Hauptbahnhof", coords: [47.8100, 13.0447], mode: 'train', country: 'Austria', isDestination: true, destinationNumber: 4 },
  { date: "Aug 10", city: "Dražice", lodging: "Apartman Dražice-Grobnik", coords: [45.3878, 14.5089], mode: 'drive', country: 'Croatia', isDestination: true, destinationNumber: 5 },
  { date: "Aug 11-12", city: "Plitvice", lodging: "Apartmani Brium", coords: [45.2931, 15.6203], mode: 'drive', country: 'Croatia', isDestination: true, destinationNumber: 6 },
  { date: "Aug 13-15", city: "Mojstrana", lodging: "Apartma Lipa", coords: [46.4774, 13.9276], mode: 'drive', country: 'Slovenia', isDestination: true, destinationNumber: 7 },
  { date: "Aug 16-17", city: "Most na Soči", lodging: "Apartment Mika", coords: [46.1880, 13.7353], mode: 'drive', country: 'Slovenia', isDestination: true, destinationNumber: 8 },
  { date: "Aug 18-20", city: "Vižinada", lodging: "Nona Nina", coords: [45.3347, 13.7628], mode: 'drive', country: 'Croatia', isDestination: true, destinationNumber: 9 },
  { date: "Aug 21", city: "Venice (Mestre)", lodging: "Ca' Vivaldi Appartamento", coords: [45.4897, 12.2451], mode: 'train', country: 'Italy', isDestination: true, destinationNumber: 10 },
  { date: "Aug 22-24", city: "Volastra", lodging: "CREUZA DE 5 TERRE", coords: [44.1175, 9.7328], mode: 'train', country: 'Italy', isDestination: true, destinationNumber: 11 },
  { date: "Aug 25", city: "Lucca", lodging: "Casa Alice Lucca centro", coords: [43.8430, 10.5024], mode: 'train', country: 'Italy', isDestination: true, destinationNumber: 12 },
  { date: "Aug 26", city: "Reykjavik", lodging: "Skólavörðustígur Apartments", coords: [64.1446, -21.9371], mode: 'flight', country: 'Iceland', isDestination: true, destinationNumber: 13 },
  { date: "Aug 27", city: "Halifax", lodging: "Flight Home", coords: [44.88, -63.5], mode: 'flight', country: 'Canada', isDestination: false }
];

// Transit routes with actual stations, waypoints, and travel times
const transitRoutes = [
  {
    id: 'halifax-thehague',
    mode: 'flight',
    fromCoords: [44.88, -63.5],
    toCoords: [52.0785, 4.2994],
    waypoints: [],
    travelTime: '7h 20m'
  },
  {
    id: 'thehague-ghent',
    mode: 'train',
    fromCoords: [52.0808, 4.3242], // Den Haag Centraal
    toCoords: [51.0357, 3.7103], // Gent-Sint-Pieters
    waypoints: [[51.2171, 4.4214]], // Antwerpen-Centraal
    travelTime: '2h 15m'
  },
  {
    id: 'ghent-koblenz',
    mode: 'train',
    fromCoords: [51.0357, 3.7103], // Gent-Sint-Pieters
    toCoords: [50.3569, 7.5985], // Koblenz Hbf
    waypoints: [[50.8353, 4.3363], [50.9430, 6.9589]], // Brussels, Cologne
    travelTime: 'h 30m'
  },
  {
    id: 'koblenz-salzburg',
    mode: 'train',
    fromCoords: [50.3569, 7.5985], // Koblenz Hbf
    toCoords: [47.8128, 13.0456], // Salzburg Hbf
    waypoints: [],
    travelTime: '9h 45m'
  },
  {
    id: 'salzburg-drazice',
    mode: 'drive',
    fromCoords: [47.8100, 13.0447],
    toCoords: [45.3878, 14.5089],
    waypoints: [],
    travelTime: '3h 30m'
  },
  {
    id: 'drazice-plitvice',
    mode: 'drive',
    fromCoords: [45.3878, 14.5089],
    toCoords: [45.2931, 15.6203],
    waypoints: [],
    travelTime: '1h 15m'
  },
  {
    id: 'plitvice-mojstrana',
    mode: 'drive',
    fromCoords: [45.2931, 15.6203],
    toCoords: [46.4774, 13.9276],
    waypoints: [],
    travelTime: '3h 45m'
  },
  {
    id: 'mojstrana-mostnasoci',
    mode: 'drive',
    fromCoords: [46.4774, 13.9276],
    toCoords: [46.1880, 13.7353],
    waypoints: [[46.4, 13.74]], // Via Vršič Pass
    travelTime: '1h 30m'
  },
  {
    id: 'mostnasoci-vizinada',
    mode: 'drive',
    fromCoords: [46.1880, 13.7353],
    toCoords: [45.3347, 13.7628],
    waypoints: [],
    travelTime: '2h 45m'
  },
  {
    id: 'vizinada-venice',
    mode: 'drive',
    fromCoords: [45.3347, 13.7628],
    toCoords: [45.4897, 12.2451],
    waypoints: [],
    travelTime: '2h 30m'
  },
  {
    id: 'venice-volastra',
    mode: 'train',
    fromCoords: [45.4834, 12.2327], // Venezia Mestre
    toCoords: [44.1157, 9.8250], // La Spezia Centrale
    waypoints: [],
    travelTime: '4h 30m'
  },
  {
    id: 'volastra-lucca',
    mode: 'train',
    fromCoords: [44.1157, 9.8250], // La Spezia
    toCoords: [43.8430, 10.5024],
    waypoints: [],
    travelTime: '2h 15m'
  },
  {
    id: 'lucca-reykjavik',
    mode: 'flight',
    fromCoords: [43.8430, 10.5024],
    toCoords: [64.1446, -21.9371],
    waypoints: [],
    travelTime: '5h 45m'
  },
  {
    id: 'reykjavik-halifax',
    mode: 'flight',
    fromCoords: [64.1446, -21.9371],
    toCoords: [44.88, -63.5],
    waypoints: [],
    travelTime: '4h 45m'
  }
];

// Generate timeline items
const generateTimelineItems = () => {
  const items = [];
  const transitRouteLookup = {};
  
  transitRoutes.forEach(route => {
    transitRouteLookup[route.id] = route;
  });
  
  const timelineData = [
    { id: 'stay-0', type: 'stay', city: 'Halifax', label: 'Home', start: '2026-08-01T00:00:00', end: '2026-08-01T18:00:00', coords: [44.88, -63.5], country: 'Canada', stepIndex: 0 },
    { id: 'transit-0', type: 'transit', mode: 'flight', label: 'Overnight Flight', start: '2026-08-01T18:00:00', end: '2026-08-02T14:00:00', routeId: 'halifax-thehague', stepIndex: 0 },
    { id: 'stay-1', type: 'stay', city: 'The Hague', label: 'Apartement City Centre', start: '2026-08-02T14:00:00', end: '2026-08-04T10:00:00', coords: [52.0785, 4.2994], country: 'Netherlands', stepIndex: 1 },
    { id: 'transit-1', type: 'transit', mode: 'train', label: 'To Ghent', start: '2026-08-04T10:00:00', end: '2026-08-04T14:00:00', routeId: 'thehague-ghent', stepIndex: 2 },
    { id: 'stay-2', type: 'stay', city: 'Ghent', label: 'Apartment 202', start: '2026-08-04T14:00:00', end: '2026-08-07T10:00:00', coords: [51.0565, 3.7303], country: 'Belgium', stepIndex: 2 },
    { id: 'transit-2', type: 'transit', mode: 'train', label: 'To Koblenz', start: '2026-08-07T10:00:00', end: '2026-08-07T16:00:00', routeId: 'ghent-koblenz', stepIndex: 3 },
    { id: 'stay-3', type: 'stay', city: 'Koblenz', label: 'Schönes Apartment 4', start: '2026-08-07T16:00:00', end: '2026-08-08T18:00:00', coords: [50.3569, 7.5985], country: 'Germany', stepIndex: 3 },
    { id: 'transit-3', type: 'transit', mode: 'train', label: 'Overnight Train', start: '2026-08-08T18:00:00', end: '2026-08-09T08:00:00', routeId: 'koblenz-salzburg', stepIndex: 4 },
    { id: 'stay-4', type: 'stay', city: 'Salzburg', label: 'a&o Salzburg Hauptbahnhof', start: '2026-08-09T08:00:00', end: '2026-08-10T10:00:00', coords: [47.8100, 13.0447], country: 'Austria', stepIndex: 5 },
    { id: 'transit-4', type: 'transit', mode: 'drive', label: 'To Trieste', start: '2026-08-10T10:00:00', end: '2026-08-10T14:00:00', routeId: 'salzburg-trieste', stepIndex: 6 },
    { id: 'stay-5', type: 'stay', city: 'Trieste', label: 'Vista&Capriccio', start: '2026-08-10T14:00:00', end: '2026-08-11T10:00:00', coords: [45.6503, 13.7784], country: 'Italy', stepIndex: 6 },
    { id: 'transit-5', type: 'transit', mode: 'drive', label: 'To Pula', start: '2026-08-11T10:00:00', end: '2026-08-11T13:00:00', routeId: 'trieste-pula', stepIndex: 7 },
    { id: 'stay-6', type: 'stay', city: 'Pula', label: 'Pula City Center', start: '2026-08-11T13:00:00', end: '2026-08-13T10:00:00', coords: [44.8694, 13.8467], country: 'Croatia', stepIndex: 7 },
    { id: 'transit-6', type: 'transit', mode: 'drive', label: 'To Plitvice', start: '2026-08-13T10:00:00', end: '2026-08-13T13:00:00', routeId: 'pula-plitvice', stepIndex: 8 },
    { id: 'stay-7', type: 'stay', city: 'Plitvice', label: 'Plitvice ZG', start: '2026-08-13T13:00:00', end: '2026-08-15T10:00:00', coords: [44.8854, 15.6214], country: 'Croatia', stepIndex: 8 },
    { id: 'transit-7', type: 'transit', mode: 'drive', label: 'To Kranjska Gora', start: '2026-08-15T10:00:00', end: '2026-08-15T14:00:00', routeId: 'plitvice-kranjska', stepIndex: 9 },
    { id: 'stay-8', type: 'stay', city: 'Kranjska Gora', label: 'Apartma Anastasija', start: '2026-08-15T14:00:00', end: '2026-08-17T10:00:00', coords: [46.4859, 13.7860], country: 'Slovenia', stepIndex: 9 },
    { id: 'transit-8', type: 'transit', mode: 'drive', label: 'To Most na Soči', start: '2026-08-17T10:00:00', end: '2026-08-17T12:00:00', routeId: 'kranjska-mostnasoci', stepIndex: 10 },
    { id: 'stay-9', type: 'stay', city: 'Most na Soči', label: 'Apartment Mika', start: '2026-08-17T12:00:00', end: '2026-08-19T10:00:00', coords: [46.1880, 13.7353], country: 'Slovenia', stepIndex: 10 },
    { id: 'transit-9', type: 'transit', mode: 'drive', label: 'To Cerknica', start: '2026-08-19T10:00:00', end: '2026-08-19T12:30:00', routeId: 'mostnasoci-cerknica', stepIndex: 11 },
    { id: 'stay-10', type: 'stay', city: 'Cerknica', label: 'Apartment Knap', start: '2026-08-19T12:30:00', end: '2026-08-20T10:00:00', coords: [45.8018, 14.3644], country: 'Slovenia', stepIndex: 11 },
    { id: 'transit-10', type: 'transit', mode: 'drive', label: 'To Vižinada', start: '2026-08-20T10:00:00', end: '2026-08-20T12:30:00', routeId: 'cerknica-vizinada', stepIndex: 12 },
    { id: 'stay-11', type: 'stay', city: 'Vižinada', label: 'Nona Nina', start: '2026-08-20T12:30:00', end: '2026-08-21T10:00:00', coords: [45.3347, 13.7628], country: 'Croatia', stepIndex: 12 },
    { id: 'transit-11', type: 'transit', mode: 'drive', label: 'Return to Trieste', start: '2026-08-21T10:00:00', end: '2026-08-21T12:00:00', routeId: 'vizinada-trieste2', stepIndex: 13 },
    { id: 'transit-12', type: 'transit', mode: 'train', label: 'To Venice', start: '2026-08-21T12:00:00', end: '2026-08-21T14:30:00', routeId: 'trieste-venice', stepIndex: 14 },
    { id: 'stay-12', type: 'stay', city: 'Venice (Mestre)', label: 'Ca\' Vivaldi Appartamento', start: '2026-08-21T14:30:00', end: '2026-08-22T10:00:00', coords: [45.4897, 12.2451], country: 'Italy', stepIndex: 14 },
    { id: 'transit-13', type: 'transit', mode: 'train', label: 'To Cinque Terre', start: '2026-08-22T10:00:00', end: '2026-08-22T15:00:00', routeId: 'venice-volastra', stepIndex: 15 },
    { id: 'stay-13', type: 'stay', city: 'Volastra', label: 'CREUZA DE 5 TERRE', start: '2026-08-22T15:00:00', end: '2026-08-24T10:00:00', coords: [44.1175, 9.7328], country: 'Italy', stepIndex: 15 },
    { id: 'transit-14', type: 'transit', mode: 'train', label: 'To Lucca', start: '2026-08-24T10:00:00', end: '2026-08-24T12:30:00', routeId: 'volastra-lucca', stepIndex: 16 },
    { id: 'stay-14', type: 'stay', city: 'Lucca', label: 'Casa Alice Lucca centro', start: '2026-08-24T12:30:00', end: '2026-08-26T10:00:00', coords: [43.8430, 10.5024], country: 'Italy', stepIndex: 16 },
    { id: 'transit-15', type: 'transit', mode: 'flight', label: 'To Reykjavik', start: '2026-08-26T10:00:00', end: '2026-08-26T18:00:00', routeId: 'lucca-rome', stepIndex: 17 },
    { id: 'stay-15', type: 'stay', city: 'Reykjavik', label: 'Skólavörðustígur Apartments', start: '2026-08-26T18:00:00', end: '2026-08-27T12:00:00', coords: [64.1446, -21.9371], country: 'Iceland', stepIndex: 18 },
    { id: 'transit-16', type: 'transit', mode: 'flight', label: 'Flight Home', start: '2026-08-27T12:00:00', end: '2026-08-27T18:00:00', routeId: 'reykjavik-halifax', stepIndex: 19 },
  ];
  
  return timelineData.map(item => {
    if (item.type === 'transit' && item.routeId) {
      return {
        ...item,
        start: new Date(item.start),
        end: new Date(item.end),
        route: transitRouteLookup[item.routeId]
      };
    }
    return {
      ...item,
      start: new Date(item.start),
      end: new Date(item.end)
    };
  });
};

const timelineItems = generateTimelineItems();

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
const MapComponent = ({ selectedId, onSelect, mapMode, selectedTimelineItem, detailsMinimized, handleTimelineSelect }) => {
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const routeLabelsLayerRef = useRef(null);
  const mapLabelsLayerRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const [routeGeometries, setRouteGeometries] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const L = window.L;
    if (!L || mapRef.current) return;

    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([48, 10], 5);

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

    const layers = { atlas: atlasLayer, road: roadLayer, terrain: terrainLayer };
    layers[mapMode].addTo(map);
    
    // Labels layer for Atlas mode
    mapLabelsLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      zIndex: 1000
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
        const colors = [
          '#fef2f2', // light red
          '#f0fdf4', // light green  
          '#fffbeb', // light yellow
          '#f0f9ff', // light blue
          '#f5f3ff', // light purple
          '#fef7ff', // light pink
          '#f0fdfa', // light cyan
          '#fffbf0'  // light orange
        ];
        
        // Better color distribution using multiple hash factors
        const getColorForCountry = (name) => {
          if (!name) return colors[0];
          
          // Use multiple characteristics to spread colors
          const firstChar = name.charCodeAt(0);
          const length = name.length;
          const vowelCount = (name.match(/[aeiou]/gi) || []).length;
          
          // Combine factors to get more varied distribution
          const colorIndex = (firstChar + length * 3 + vowelCount * 7) % colors.length;
          return colors[colorIndex];
        };
        
        // Create GeoJSON layer with very subtle styling
        geoJsonLayerRef.current = L.geoJson(data, {
          style: (feature) => {
            const name = feature.properties.NAME || feature.properties.name;
            return {
              fillColor: getColorForCountry(name),
              weight: 0.3,       // Very thin borders
              opacity: 0.2,      // Very transparent borders
              color: '#94a3b8',  
              fillOpacity: mapMode === 'atlas' ? 0.70 : 0,  // Much more transparent
              smoothFactor: 1.0
            };
          },
          pane: 'tilePane'  // Put in tile pane to keep under labels
        }).addTo(map);
      })
      .catch(err => {
        console.warn('Failed to load Natural Earth GeoJSON:', err);
      });

    return () => {
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

    const layers = { atlas: atlasLayer, road: roadLayer, terrain: terrainLayer };
    layers[mapMode].addTo(map);
    
    // Manage labels and country colors based on map mode
    if (mapMode === 'atlas') {
      if (mapLabelsLayerRef.current) {
        mapLabelsLayerRef.current.addTo(map);
      }
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.setStyle({ 
          fillOpacity: 0.35,  // Much more transparent
          weight: 0.3,        // Very thin borders
          opacity: 0.2        // Very transparent borders
        });
      }
    } else {
      if (mapLabelsLayerRef.current && map.hasLayer(mapLabelsLayerRef.current)) {
        map.removeLayer(mapLabelsLayerRef.current);
      }
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.setStyle({ fillOpacity: 0, weight: 0, opacity: 0 });
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
    
    routesLayerRef.current.clearLayers();
    routeLabelsLayerRef.current.clearLayers();
    
    const isTransitSelected = selectedTimelineItem?.type === 'transit';
    const selectedRouteId = selectedTimelineItem?.route?.id;
    
    transitRoutes.forEach((route, routeIdx) => {
      const isSelected = isTransitSelected && selectedRouteId === route.id;
      let coords;
      
      if (routeGeometries[route.id]) {
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
        weight: isSelected ? 4 : 3,
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
        const midPoint = coords[Math.floor(coords.length / 2)];
        const labelIcon = L.divIcon({
          html: `
            <div style="background: white; padding: 8px 16px; border-radius: 20px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: bold;
                        color: ${colorMap[route.mode]}; border: 2px solid ${colorMap[route.mode]};
                        white-space: nowrap; font-size: 13px;
                        transform: translate(-50%, -50%);">
              ${route.travelTime}
            </div>
          `,
          className: 'route-label',
          iconSize: null,
          iconAnchor: [0, 0]
        });
        
        L.marker(midPoint, { icon: labelIcon }).addTo(routeLabelsLayerRef.current);
      }
      
      // Zoom to route bounds when selected
      if (isSelected) {
        const bounds = L.latLngBounds(coords);
        mapRef.current.flyToBounds(bounds, { padding: [80, 80], duration: 1.5 });
      }
    });
  }, [selectedTimelineItem, routeGeometries]);

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
      
      const pinSvg = `
        <svg width="34.56" height="43.2" viewBox="0 0 28.8 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.4 0C6.45 0 0 6.45 0 14.4c0 10.8 14.4 21.6 14.4 21.6s14.4-10.8 14.4-21.6C28.8 6.45 22.35 0 14.4 0z" 
                fill="${isSelected ? COLORS.primary : '#94a3b8'}" 
                stroke="white" 
                stroke-width="1.5"/>
          <text x="14.4" y="16" 
                text-anchor="middle" 
                dominant-baseline="middle"
                font-size="${step.destinationNumber >= 10 ? '10.8' : '11.6'}" 
                font-weight="bold" 
                fill="white">${step.destinationNumber}</text>
        </svg>
      `;
      
      const icon = L.divIcon({
        html: pinSvg,
        className: 'custom-pin',
        iconSize: [34.56, 43.2],
        iconAnchor: [17.28, 43.2]
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
      
      // Lodging label when selected
      if (isSelected) {
        const labelIcon = L.divIcon({
          html: `
            <div style="background: white; padding: 8px 16px; border-radius: 20px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-weight: bold;
                        color: ${COLORS.primary}; border: 2px solid ${COLORS.primary};
                        white-space: nowrap; font-size: 13px;">
              ${step.lodging}
            </div>
          `,
          className: 'lodging-label',
          iconSize: null,
          iconAnchor: [0, 70]
        });
        
        L.marker(step.coords, { icon: labelIcon }).addTo(labelsLayerRef.current);
      }
    });
    
    // Zoom to location when selected
    if (isLocationSelected && selectedId !== null) {
      const step = lodgingSteps[selectedId];
      if (step && step.coords) {
        const maxZoom = mapRef.current.getMaxZoom();
        const targetZoom = Math.max(1, maxZoom - 5);
        mapRef.current.flyTo(step.coords, targetZoom, { duration: 1.5 });
      }
    }
  }, [selectedId, selectedTimelineItem, onSelect]);

  return <div id="map" className="w-full h-full" />;
};

// Timeline Component
const Timeline = ({ selectedId, onSelect, lodgingSelectedId }) => {
  const scrollRef = useRef(null);
  const tripStart = new Date('2026-08-01T00:00:00');
  const tripEnd = new Date('2026-08-27T23:59:59');
  const totalHours = (tripEnd - tripStart) / (1000 * 60 * 60);
  const hourWidth = 8;
  const totalWidth = totalHours * hourWidth;

  const getPos = (date) => {
    return ((date - tripStart) / (1000 * 60 * 60)) * hourWidth;
  };

  useEffect(() => {
    if (scrollRef.current && lodgingSelectedId !== null) {
      const step = lodgingSteps[lodgingSelectedId];
      if (step) {
        const dateMatch = step.date.match(/Aug (\d+)/);
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const pos = getPos(new Date(`2026-08-${day.toString().padStart(2, '0')}T12:00:00`));
          scrollRef.current.scrollTo({ left: pos - 300, behavior: 'smooth' });
        }
      }
    }
  }, [lodgingSelectedId]);

  const getModeIcon = (mode) => {
    const props = { size: 16, className: "flex-shrink-0" };
    switch(mode) {
      case 'flight': return <Plane {...props} />;
      case 'train': return <Train {...props} />;
      case 'drive': return <Car {...props} />;
      default: return <MapPin {...props} />;
    }
  };
  
  const getDayOfWeek = (dayNum) => {
    const date = new Date(`2026-08-${dayNum.toString().padStart(2, '0')}`);
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
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
          August 1–27 · {destinationCount} Destinations · {countryCount} Countries
        </div>
      </div>

      <div className="sticky top-0 bg-white z-50">
        <div className="relative h-24 overflow-x-auto custom-scrollbar" ref={scrollRef}>
          <div className="relative h-full" style={{ width: `${totalWidth + 64}px` }}>
            {Array.from({ length: 27 }, (_, i) => {
              const day = i + 1;
              const dayWidth = 24 * hourWidth;
              return (
                <div
                  key={day}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${(day - 1) * dayWidth + 32}px`, top: '0px' }}
                >
                  <span className="text-sm font-black text-slate-600 tabular-nums z-50" style={{ height: '29px', display: 'flex', alignItems: 'flex-end' }}>{getDayOfWeek(day)} 8/{day}</span>
                  <div className="h-10 w-0.5 bg-slate-200 z-40" style={{ marginTop: '8px' }} />
                </div>
              );
            })}

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
              
              const baseColor = item.type === 'stay' ? COLORS.primary : COLORS[item.mode];

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
                    {hasRoomForIcon && (item.type === 'stay' ? <MapPin size={16} className="flex-shrink-0" strokeWidth={2.5} /> : getModeIcon(item.mode))}
                    {contentWidth > 40 && (
                      <span className={`${hasRoomForIcon ? 'ml-2' : ''} text-xs font-black truncate uppercase tracking-wide ${isSelected ? 'opacity-100' : 'opacity-90'}`}>
                        {item.type === 'stay' ? item.city : item.label}
                      </span>
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
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [selectedTimelineId, setSelectedTimelineId] = useState('stay-1');
  const [mapMode, setMapMode] = useState('atlas');
  const [detailsMinimized, setDetailsMinimized] = useState(false);
  
  const currentStep = lodgingSteps[selectedIdx];
  const currentItem = timelineItems.find(item => item.id === selectedTimelineId);
  
  const handleTimelineSelect = (timelineId, stepIndex) => {
    setSelectedTimelineId(timelineId);
    if (stepIndex !== undefined) {
      setSelectedIdx(stepIndex);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@400;500;600;700;800&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .route-selected { filter: drop-shadow(0 0 8px rgba(0,0,0,0.4)); }
        .custom-pin { background: none !important; border: none !important; }
        .lodging-label { background: none !important; border: none !important; }
        .route-label { background: none !important; border: none !important; }
      `}</style>

      <Timeline 
        selectedId={selectedTimelineId} 
        onSelect={handleTimelineSelect} 
        lodgingSelectedId={selectedIdx} 
      />

      <div className="flex-1 relative">
        <MapComponent 
          selectedId={selectedIdx} 
          onSelect={setSelectedIdx} 
          mapMode={mapMode}
          selectedTimelineItem={currentItem}
          detailsMinimized={detailsMinimized}
          handleTimelineSelect={handleTimelineSelect}
        />

        {/* Map Mode Toggle - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex gap-1 p-1 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl z-[1000] border border-white/50">
          {[
            { id: 'atlas', label: 'Atlas', icon: Globe }, 
            { id: 'road', label: 'Road', icon: Navigation }, 
            { id: 'terrain', label: 'Terrain', icon: Mountain }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setMapMode(mode.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                mapMode === mode.id ? 'text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
              }`}
              style={{ backgroundColor: mapMode === mode.id ? COLORS.primary : 'transparent' }}
            >
              <mode.icon size={12} /> {mode.label}
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
            <Maximize2 size={24} />
          </button>
        ) : (
          <div className="absolute bottom-10 left-10 w-[400px] bg-white p-10 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] z-[1000] border border-slate-50">
            <button
              onClick={() => setDetailsMinimized(true)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
              style={{ color: COLORS.primary }}
            >
              <Minimize2 size={18} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: COLORS.primary }} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.3em]" style={{ color: COLORS.primary }}>
                {currentItem?.type === 'transit' ? 'Transit Details' : 'Location Details'}
              </span>
            </div>
            
            {currentItem?.type === 'transit' ? (
              <>
                <h2 className="font-serif italic text-5xl mb-2 text-slate-900 tracking-tighter leading-tight">
                  {currentItem.label}
                </h2>
                <div className="flex items-center gap-1.5 text-slate-400 mb-6">
                  {currentItem.mode === 'flight' && <Plane size={13} className="text-slate-300" />}
                  {currentItem.mode === 'train' && <Train size={13} className="text-slate-300" />}
                  {currentItem.mode === 'drive' && <Car size={13} className="text-slate-300" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {currentItem.mode}
                  </span>
                </div>
                {currentItem.route?.travelTime && (
                  <div className="flex items-center gap-1.5 text-slate-400 mb-10">
                    <Clock size={13} />
                    <span className="text-sm">Travel Time: {currentItem.route.travelTime}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="font-serif italic text-5xl mb-2 text-slate-900 tracking-tighter leading-tight">
                  {currentStep.city}
                </h2>
                <div className="flex items-center gap-1.5 text-slate-400 mb-10">
                  <MapPin size={13} className="text-slate-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {currentStep.country} <span className="mx-3 text-slate-200">|</span> 
                    {currentStep.isDestination ? `Destination ${currentStep.destinationNumber}` : 'Transit'}
                  </span>
                </div>

                <div className="bg-slate-50 p-7 rounded-[2rem] flex items-center gap-6 border border-slate-100">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50" style={{ color: COLORS.primary }}>
                    <Home size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Accommodations</p>
                    <p className="font-extrabold text-slate-800 text-xl tracking-tight">{currentStep.lodging}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
