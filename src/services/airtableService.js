// src/services/airtableService.js
// Airtable service for single-user, single-trip app

import Airtable from 'airtable';

// Initialize Airtable with environment variables
const base = new Airtable({
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY
}).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

/**
 * Fetch all locations from Airtable
 * This replaces your locations.js file
 */
export const fetchLocations = async () => {
  try {
    const records = await base('Locations').select({
      view: 'Grid view'
    }).all();

    return records.map(record => {
      const images = record.get('images') || [];

      return {
        id: record.get('id'),
        type: record.get('type'),
        name: record.get('name'),
        city: record.get('city'),
        country: record.get('country'),
        address: record.get('address') || '',
        coords: [
          parseFloat(record.get('latitude')),
          parseFloat(record.get('longitude'))
        ],
        category: record.get('category') || '',
        description: record.get('description') || '',
        images: images.map(img => ({
          url: img.url,
          filename: img.filename,
          thumbnails: img.thumbnails
        }))
      };
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }
};

/**
 * Fetch trip steps from Airtable
 * This replaces your lodgingStepsBase array
 */
export const fetchTripSteps = async () => {
  try {
    const records = await base('Trip Steps').select({
      view: 'Grid view',
      sort: [{ field: 'step_order', direction: 'asc' }]
    }).all();

    return records.map(record => {
      // Generate date display from start and end dates
      const startDate = record.get('start_date');
      const endDate = record.get('end_date');
      const dateDisplay = formatDateRange(startDate, endDate);

      return {
        locationId: record.get('location_id'),
        stepOrder: record.get('step_order'),
        date: dateDisplay,
        startDate: startDate,
        endDate: endDate,
        lodgingCategory: record.get('lodging_category') || 'apartment',
        mode: record.get('arrival_mode') || 'train',
        isDestination: record.get('is_destination') || false,
        destinationNumber: record.get('destination_number') || null,
        isHome: record.get('is_home') || false,
        notes: record.get('notes') || ''
      };
    });
  } catch (error) {
    console.error('Error fetching trip steps:', error);
    throw new Error(`Failed to fetch trip steps: ${error.message}`);
  }
};

/**
 * Fetch routes from Airtable
 * This replaces your transitRoutesBase array
 */
export const fetchRoutes = async () => {
  try {
    const records = await base('Routes').select({
      view: 'Grid view'
    }).all();

    return records.map(record => {
      // Parse waypoint IDs (comma-separated string)
      const waypointIdsStr = record.get('waypoint_ids') || '';
      const waypointIds = waypointIdsStr
        ? waypointIdsStr.split(',').map(id => id.trim()).filter(Boolean)
        : [];

      return {
        id: record.get('id'),
        mode: record.get('mode'),
        fromLocationId: record.get('from_location_id'),
        toLocationId: record.get('to_location_id'),
        waypointIds: waypointIds,
        travelTime: record.get('travel_time') || 0,
        notes: record.get('notes') || ''
      };
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw new Error(`Failed to fetch routes: ${error.message}`);
  }
};

/**
 * Fetch activities from Airtable
 * This replaces your activitiesBase array
 */
export const fetchActivities = async () => {
  try {
    const records = await base('Activities').select({
      view: 'Grid view',
      sort: [{ field: 'start_time', direction: 'asc' }]
    }).all();

    return records.map(record => ({
      id: record.get('id'),
      locationId: record.get('location_id'),
      parentStepIndex: record.get('parent_step_order'),
      startTime: record.get('start_time'),
      endTime: record.get('end_time') || null,
      description: record.get('description') || ''
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }
};

/**
 * Fetch all trip data at once
 * Returns object with locations, tripSteps, routes, and activities
 */
export const fetchAllTripData = async () => {
  try {
    const [locations, tripSteps, routes, activities] = await Promise.all([
      fetchLocations(),
      fetchTripSteps(),
      fetchRoutes(),
      fetchActivities()
    ]);

    // Enrich trip steps with location data (like your current code does)
    const enrichedTripSteps = tripSteps.map(step => {
      const location = locations.find(loc => loc.id === step.locationId);
      if (!location) {
        console.warn(`Location not found for step: ${step.locationId}`);
        return step;
      }

      return {
        ...step,
        city: location.city,
        lodging: location.name,
        address: location.address,
        coords: location.coords,
        country: location.country
      };
    });

    // Enrich routes with coordinate data (like your current code does)
    const enrichedRoutes = routes.map(route => {
      const fromLocation = locations.find(loc => loc.id === route.fromLocationId);
      const toLocation = locations.find(loc => loc.id === route.toLocationId);

      if (!fromLocation || !toLocation) {
        console.warn(`Location not found for route: ${route.id}`);
        return route;
      }

      // Get waypoint coordinates
      const waypoints = route.waypointIds
        .map(id => {
          const loc = locations.find(l => l.id === id);
          return loc ? loc.coords : null;
        })
        .filter(Boolean);

      return {
        ...route,
        fromCoords: fromLocation.coords,
        toCoords: toLocation.coords,
        fromCity: fromLocation.city,
        toCity: toLocation.city,
        waypoints
      };
    });

    // Enrich activities with location data
    const enrichedActivities = activities.map(activity => {
      const location = locations.find(loc => loc.id === activity.locationId);
      if (!location) {
        console.warn(`Location not found for activity: ${activity.locationId}`);
        return activity;
      }

      return {
        ...activity,
        name: location.name,
        city: location.city,
        address: location.address,
        coords: location.coords,
        country: location.country,
        category: location.category,
        description: activity.description || location.description
      };
    });

    return {
      locations,
      tripSteps: enrichedTripSteps,
      routes: enrichedRoutes,
      activities: enrichedActivities
    };
  } catch (error) {
    console.error('Error fetching trip data:', error);
    throw error;
  }
};

/**
 * Helper function: Get home location
 */
export const getHomeLocation = (locations) => {
  return locations.find(loc => loc.type === 'home');
};

/**
 * Helper function: Get location by ID
 */
export const getLocationById = (locations, id) => {
  return locations.find(loc => loc.id === id);
};

/**
 * Helper function: Get locations by type
 */
export const getLocationsByType = (locations, type) => {
  return locations.filter(loc => loc.type === type);
};

/**
 * Helper function: Format date range for display
 * Converts dates like "2026-08-02" to "2026-08-04" into "Aug 2-3"
 */
function formatDateRange(startDate, endDate) {
  if (!startDate) return '';

  const start = new Date(startDate + 'T00:00:00'); // Force local timezone
  const end = endDate ? new Date(endDate + 'T00:00:00') : null;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const startMonth = monthNames[start.getMonth()];
  const startDay = start.getDate();

  if (!end || startDate === endDate) {
    // Single day
    return `${startMonth} ${startDay}`;
  }

  const endMonth = monthNames[end.getMonth()];
  const endDay = end.getDate();

  // Calculate nights (not days)
  const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));

  if (nights === 1) {
    // One night stay, just show start date
    return `${startMonth} ${startDay}`;
  }

  // Multi-night stay
  if (startMonth === endMonth) {
    // Same month: "Aug 2-3" (showing nights, not checkout day)
    return `${startMonth} ${startDay}-${endDay - 1}`;
  } else {
    // Different months: "Aug 30-Sep 1"
    const lastNightDay = new Date(end);
    lastNightDay.setDate(lastNightDay.getDate() - 1);
    const lastNightMonth = monthNames[lastNightDay.getMonth()];
    const lastNightDayNum = lastNightDay.getDate();
    return `${startMonth} ${startDay}-${lastNightMonth} ${lastNightDayNum}`;
  }
}

/**
 * Helper function: Format travel time from minutes to display string
 * e.g. 135 → "2h 15m", 45 → "45m", 120 → "2h"
 */
export const formatTravelTime = (minutes) => {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Helper function: Calculate nights between dates
 */
export const calculateNights = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, nights);
};

/**
 * Link routes to trip steps based on location IDs
 * This creates the fromStepOrder and toStepOrder references
 */
export const linkRoutesToSteps = (routes, tripSteps) => {
  return routes.map(route => {
    // Find which trip step this route departs from
    const fromStep = tripSteps.find(step =>
      step.locationId === route.fromLocationId
    );

    // Find which trip step this route arrives at
    const toStep = tripSteps.find(step =>
      step.locationId === route.toLocationId
    );

    return {
      ...route,
      fromStepOrder: fromStep ? fromStep.stepOrder : null,
      toStepOrder: toStep ? toStep.stepOrder : null
    };
  });
};

/**
 * Find the chain of routes connecting two cities.
 * Handles direct routes (A→B) and one-hop chains (A→C→B).
 */
const findRouteChain = (routes, fromCity, toCity) => {
  // Try direct route first
  const direct = routes.find(r => r.fromCity === fromCity && r.toCity === toCity);
  if (direct) return [direct];

  // Try two-hop chain: fromCity → intermediate → toCity
  const fromRoutes = routes.filter(r => r.fromCity === fromCity);
  for (const first of fromRoutes) {
    const second = routes.find(r => r.fromCity === first.toCity && r.toCity === toCity);
    if (second) return [first, second];
  }

  return [];
};

/**
 * Generate timeline items dynamically from trip data
 * This replaces the hardcoded timelineData array
 */
export const generateTimelineFromSteps = (tripSteps, routes, metadata) => {
  const items = [];
  let transitCounter = 0;

  // Sort steps by step_order to ensure correct sequence
  const sortedSteps = [...tripSteps].sort((a, b) => a.stepOrder - b.stepOrder);

  sortedSteps.forEach((step, index) => {
    // Create stay item for this step
    const stayStart = new Date(step.startDate + 'T00:00:00');
    const stayEnd = new Date(step.endDate + 'T23:59:59');

    // Smart defaults for check-in/check-out times
    if (index === 0) {
      stayStart.setHours(0, 0, 0);
      stayEnd.setHours(8, 0, 0);
    } else if (index === sortedSteps.length - 1) {
      stayStart.setHours(18, 0, 0);
      stayEnd.setHours(23, 59, 59);
    } else {
      stayStart.setHours(14, 0, 0);
      stayEnd.setHours(10, 0, 0);
    }

    items.push({
      id: `stay-${index}`,
      type: 'stay',
      city: step.city,
      label: step.lodging,
      start: stayStart.toISOString(),
      end: stayEnd.toISOString(),
      coords: step.coords,
      country: step.country,
      stepIndex: index,
      isHome: step.isHome || false
    });

    // Add transit items between this step and next
    if (index < sortedSteps.length - 1) {
      const nextStep = sortedSteps[index + 1];
      const routeChain = findRouteChain(routes, step.city, nextStep.city);

      if (routeChain.length === 0) {
        console.warn(`No route found from ${step.city} to ${nextStep.city}`);
      }

      // Calculate total transit duration across all routes in chain
      const totalMinutes = routeChain.reduce((sum, r) => sum + (r.travelTime || 0), 0);
      const chainTransitStart = new Date(stayEnd);
      const chainTransitEnd = new Date(nextStep.startDate + 'T00:00:00');

      // Set arrival time
      if (step.endDate === nextStep.startDate) {
        chainTransitEnd.setHours(index === 0 ? 9 : 14, index === 0 ? 15 : 0, 0);
      } else {
        chainTransitEnd.setHours(14, 0, 0);
      }

      const totalChainMs = chainTransitEnd - chainTransitStart;

      // Distribute time across route chain proportionally by travelTime
      let elapsed = 0;
      routeChain.forEach((route, routeIdx) => {
        const proportion = totalMinutes > 0
          ? (route.travelTime || 0) / totalMinutes
          : 1 / routeChain.length;
        const segmentMs = totalChainMs * proportion;

        const segStart = new Date(chainTransitStart.getTime() + elapsed);
        const segEnd = new Date(chainTransitStart.getTime() + elapsed + segmentMs);
        elapsed += segmentMs;

        // Label logic
        let label;
        if (route.mode === 'flight') {
          label = route.travelTime && route.travelTime > 360
            ? 'Overnight Flight'
            : `Flight to ${route.toCity}`;
        } else if (routeIdx === routeChain.length - 1) {
          label = `To ${nextStep.city}`;
        } else {
          label = `To ${route.toCity}`;
        }

        items.push({
          id: `transit-${transitCounter}`,
          type: 'transit',
          mode: route.mode,
          label,
          start: segStart.toISOString(),
          end: segEnd.toISOString(),
          routeId: route.id,
          stepIndex: index
        });
        transitCounter++;
      });
    }
  });

  return items;
};
