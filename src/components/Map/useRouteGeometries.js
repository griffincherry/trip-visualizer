import { useState, useEffect } from 'react';
import { createBezierCurve } from '../../utils/mapUtils';

// Custom hook: fetches train/drive/flight geometries
export const useRouteGeometries = (transitRoutes) => {
  const [routeGeometries, setRouteGeometries] = useState({});

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

  return routeGeometries;
};
