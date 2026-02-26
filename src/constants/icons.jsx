import React from 'react';

// ================================================================
// ICON DEFINITIONS
// Change the Material Symbol name (right-hand value) to swap icons.
// Browse all icons at: https://fonts.google.com/icons?icon.style=Rounded
// ================================================================
export const ICONS = {
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
export const Icon = ({ name, size = 16, className = '', style = {} }) => (
  <span
    className={`material-symbols-rounded map-icon ${className}`}
    style={{ fontSize: `${size}px`, ...style }}
  >
    {name}
  </span>
);

// Returns a Material Symbols icon as an HTML string for Leaflet map labels
export const getIconHtml = (iconKey, color = '#000', size = 14) => {
  const name = ICONS[iconKey] || ICONS.activityDefault;
  return `<span class="material-symbols-rounded map-icon" style="font-size: ${size}px; color: ${color};">${name}</span>`;
};
