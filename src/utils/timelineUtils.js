import { linkRoutesToSteps, generateTimelineFromSteps } from '../services/airtableService';

// Generate timeline items dynamically from Airtable data
export const generateTimelineItems = (transitRoutes, lodgingSteps, TRIP_METADATA) => {
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
