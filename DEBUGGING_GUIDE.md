# OpenRailRouting Debugging Guide

## What's Been Added

I've added **detailed console logging** to help debug the OpenRailRouting API issue. When you load the app, open your browser's Developer Console (F12) to see diagnostic messages.

## Console Output

For each train route, you'll see logs like:

```
🚂 Fetching train route thehague-ghent from OpenRailRouting...
   URL: https://routing.openrailrouting.org/route?point=52.0808,4.3242&point=51.2171,4.4214&point=51.0357,3.7103&profile=rail&points_encoded=false
   Response status: 200
   Response data: {paths: [...]}
   ✅ SUCCESS: Got 142 points
```

Or if there's an issue:

```
🚂 Fetching train route koblenz-salzburg from OpenRailRouting...
   URL: https://routing.openrailrouting.org/route?point=50.3569,7.5985&point=47.8128,13.0456&profile=rail&points_encoded=false
   Response status: 500
   ❌ HTTP error: Internal Server Error
   📍 Using waypoint fallback for koblenz-salzburg
```

## What to Look For

### 1. **API Response Status**
- `200` = Success
- `400` = Bad request (check coordinates)
- `500` = Server error (API issue)
- `CORS error` = Network/browser blocking

### 2. **Response Data**
If the API returns `200` but still falls back:
- Check if `paths` array exists
- Check if `points.coordinates` exists
- Verify coordinate format

### 3. **Network Issues**
If you see exceptions like:
- `TypeError: Failed to fetch` = Network blocked
- `CORS policy` = Cross-origin issue
- `timeout` = API too slow

## Atlas Mode Fixed! ✅

The Atlas mode now has:
- ✅ **Natural Earth GeoJSON** loaded from GitHub
- ✅ **Pastel country colors** (pink, yellow, light blue, light green, etc.)
- ✅ **Light gray base map** without labels
- ✅ **Labels layer on top** (city/country names)
- ✅ **Colors only show in Atlas mode** (hidden in Road/Terrain)

The country coloring uses a hash function to assign consistent colors to countries:
```javascript
const colors = ['#fef2f2', '#f0fdf4', '#fffbeb', '#f0f9ff', '#f5f3ff', '#fafaf9', '#f0fdfa'];
// Pastel: red, green, yellow, blue, purple, gray, cyan
```

## Timeline Interactions ✅

All working perfectly:
- ✅ Click location → zooms to maxZoom-5
- ✅ Click transit → fits entire route
- ✅ Lodging labels on selected pins
- ✅ Travel time labels on selected routes
- ✅ Route highlighting with drop shadow

## Next Steps for Train Routes

Once you check the console:

### If OpenRailRouting is working:
- You should see curved train routes following railways
- Log will show `✅ SUCCESS` for each route

### If OpenRailRouting is failing:
**Option A: API Issue**
- Check if `routing.openrailrouting.org` is down
- Try accessing the URL directly in browser
- May need to wait for API to be back online

**Option B: CORS/Network Block**
- Browser may be blocking cross-origin requests
- Check browser console for CORS errors
- May need to deploy to see if it works in production

**Option C: Coordinate Issue**
- API might not have data for those specific stations
- Try testing with a simple 2-point route first
- Example: `?point=52.08,4.32&point=51.03,3.71&profile=rail`

## Testing in Browser

Open DevTools (F12), then:

1. **Go to Console tab**
2. **Reload the page**
3. **Look for train route logs** (🚂 emoji)
4. **Share the console output** if you see errors

## Files Changed

- `src/App.jsx` - Added detailed logging in `fetchRouteGeometries()`
- Natural Earth GeoJSON integration for Atlas mode
- Bézier curves for flights working
- All timeline zoom/label features preserved

Let me know what the console shows and we can troubleshoot from there! 🚀
