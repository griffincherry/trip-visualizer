import React, { useState, useEffect, useRef } from 'react';
import { createBezierCurve, getPolylineMidpoint } from '../../utils/mapUtils';
import { useRouteGeometries } from './useRouteGeometries';
import { useMapLayers } from './useMapLayers';
import { buildHomePinSvg, buildDestPinSvg, buildActivityPinSvg } from './mapMarkers';
import { ICONS, getIconHtml } from '../../constants/icons';
import { COLORS } from '../../constants/colors';
import { getLodgingIconType, getActivityIconType } from '../../utils/iconHelpers';
import { formatTravelTime } from '../../services/airtableService';

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
  const [currentZoom, setCurrentZoom] = useState(null);
  const [debugOpacity, setDebugOpacity] = useState({ fill: 0, stroke: 0, ocean: 0 });

  const routeGeometries = useRouteGeometries(transitRoutes);

  useMapLayers(mapRef, geoJsonLayerRef, geoJsonLakesRef, mapLabelsLayerRef, atlasBaseLayerRef, mapMode);

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
      const pinSvg = step.isHome
        ? buildHomePinSvg(isSelected, COLORS.home)
        : buildDestPinSvg(isSelected, step.destinationNumber, COLORS.primary);

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

        const activityPinSvg = buildActivityPinSvg(isActivitySelected, COLORS.activity, COLORS.activityMuted);

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

export default MapComponent;
