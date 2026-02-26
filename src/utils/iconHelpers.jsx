import React from 'react';
import { ICONS, Icon } from '../constants/icons';

// Maps activity category string to an ICONS key (for both React and Leaflet label usage)
export const getActivityIconType = (category) => {
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
export const getLodgingIconType = (category) => {
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
export const getActivityIcon = (category, size = 14) => (
  <Icon name={ICONS[getActivityIconType(category)]} size={size} className="flex-shrink-0" />
);

// Returns an Icon element for a given lodging category
export const getLodgingIcon = (category, size = 14) => (
  <Icon name={ICONS[getLodgingIconType(category)]} size={size} className="flex-shrink-0" />
);
