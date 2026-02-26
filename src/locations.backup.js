// locations.js - Single source of truth for all location data
// TODO: Replace these placeholder coordinates with accurate geocoded values

export const locations = [
  // Home
  {
    id: 'home-wolfville',
    type: 'home',
    name: 'Home',
    city: 'Wolfville',
    address: '33 Highland Ave., Wolfville, NS, Canada',
    coords: [45.0914, -64.3639],
    country: 'Canada'
  },

  // Airports
  {
    id: 'airport-halifax',
    type: 'airport',
    name: 'Halifax Stanfield International Airport',
    city: 'Halifax',
    address: 'Halifax Stanfield International Airport, 1 Bell Blvd, Enfield, NS B2T 1K2, Canada',
    coords: [44.8807, -63.5086],
    country: 'Canada'
  },
  {
    id: 'airport-rome',
    type: 'airport',
    name: 'Rome Fiumicino Airport',
    city: 'Rome',
    address: 'Leonardo da Vinci–Fiumicino Airport, Fiumicino, Italy',
    coords: [41.8003, 12.2389],
    country: 'Italy'
  },
  {
    id: 'airport-keflavik',
    type: 'airport',
    name: 'Keflavík International Airport',
    city: 'Reykjavik',
    address: 'Keflavík International Airport, 235 Reykjanesbær, Iceland',
    coords: [64.1300, -21.9406],
    country: 'Iceland'
  },

  // Train Stations
  {
    id: 'station-thehague',
    type: 'station',
    name: 'Den Haag Centraal',
    city: 'The Hague',
    address: 'Den Haag Centraal, The Hague, Netherlands',
    coords: [52.0808, 4.3242],
    country: 'Netherlands'
  },
  {
    id: 'station-ghent',
    type: 'station',
    name: 'Gent-Sint-Pieters',
    city: 'Ghent',
    address: 'Gent-Sint-Pieters, Ghent, Belgium',
    coords: [51.0357, 3.7103],
    country: 'Belgium'
  },
  {
    id: 'station-antwerp',
    type: 'station',
    name: 'Antwerpen-Centraal',
    city: 'Antwerp',
    address: 'Antwerpen-Centraal, Antwerp, Belgium',
    coords: [51.2171, 4.4214],
    country: 'Belgium'
  },
  {
    id: 'station-brussels',
    type: 'station',
    name: 'Brussels Central',
    city: 'Brussels',
    address: 'Brussels Central Station, Brussels, Belgium',
    coords: [50.8353, 4.3363],
    country: 'Belgium'
  },
  {
    id: 'station-cologne',
    type: 'station',
    name: 'Köln Hauptbahnhof',
    city: 'Cologne',
    address: 'Köln Hauptbahnhof, Cologne, Germany',
    coords: [50.9430, 6.9589],
    country: 'Germany'
  },
  {
    id: 'station-koblenz',
    type: 'station',
    name: 'Koblenz Hauptbahnhof',
    city: 'Koblenz',
    address: 'Koblenz Hauptbahnhof, Koblenz, Germany',
    coords: [50.3569, 7.5989],
    country: 'Germany'
  },
  {
    id: 'station-salzburg',
    type: 'station',
    name: 'Salzburg Hauptbahnhof',
    city: 'Salzburg',
    address: 'Salzburg Hauptbahnhof, Salzburg, Austria',
    coords: [47.8128, 13.0458],
    country: 'Austria'
  },
  {
    id: 'station-trieste',
    type: 'station',
    name: 'Trieste Centrale',
    city: 'Trieste',
    address: 'Trieste Centrale, Trieste, Italy',
    coords: [45.6600, 13.7840],
    country: 'Italy'
  },
  {
    id: 'station-venice',
    type: 'station',
    name: 'Venezia Mestre',
    city: 'Venice',
    address: 'Venezia Mestre Station, Venice, Italy',
    coords: [45.4834, 12.2327],
    country: 'Italy'
  },
  {
    id: 'station-laspezia',
    type: 'station',
    name: 'La Spezia Centrale',
    city: 'La Spezia',
    address: 'La Spezia Centrale, La Spezia, Italy',
    coords: [44.1088, 9.8250],
    country: 'Italy'
  },

  // Lodging
  {
    id: 'lodging-thehague',
    type: 'lodging',
    name: 'Apartement City Centre',
    city: 'The Hague',
    address: '8 Veenkade, The Hague City Center, 2513 EE The Hague, Netherlands',
    coords: [52.0788, 4.3118],
    country: 'Netherlands',
    destinationNumber: 1
  },
  {
    id: 'lodging-ghent',
    type: 'lodging',
    name: 'Apartment 202',
    city: 'Ghent',
    address: '20 Sluizeken, 9000 Ghent, Belgium',
    coords: [51.0533, 3.7311],
    country: 'Belgium',
    destinationNumber: 2
  },
  {
    id: 'lodging-koblenz',
    type: 'lodging',
    name: 'Schönes Apartment 4',
    city: 'Koblenz',
    address: 'Löhrstraße 84, 56068 Koblenz, Germany',
    coords: [50.3548, 7.5976],
    country: 'Germany',
    destinationNumber: 3
  },
  {
    id: 'lodging-salzburg',
    type: 'lodging',
    name: 'a&o Salzburg Hauptbahnhof',
    city: 'Salzburg',
    address: 'Fanny-von-Lehnert-Straße 4, 5020 Salzburg, Austria',
    coords: [47.8137, 13.0461],
    country: 'Austria',
    destinationNumber: 4
  },
  {
    id: 'lodging-drazice',
    type: 'lodging',
    name: 'Apartman Dražice-Grobnik',
    city: 'Dražice',
    address: 'Borovička ul. 29, 51218 Dražice, Croatia',
    coords: [45.3917, 14.5131],
    country: 'Croatia',
    destinationNumber: 5
  },
  {
    id: 'lodging-plitvice',
    type: 'lodging',
    name: 'Apartmani Brium',
    city: 'Plitvice',
    address: '266 Grabovac, 47245 Rakovica, Croatia',
    coords: [44.9153, 15.6179],
    country: 'Croatia',
    destinationNumber: 6
  },
  {
    id: 'lodging-mojstrana',
    type: 'lodging',
    name: 'Apartma Lipa',
    city: 'Mojstrana',
    address: '11 Triglavska cesta, 4281 Mojstrana, Slovenia',
    coords: [46.4844, 13.9288],
    country: 'Slovenia',
    destinationNumber: 7
  },
  {
    id: 'lodging-mostnasoci',
    type: 'lodging',
    name: 'Apartment Mika',
    city: 'Most na Soči',
    address: 'Most na Soči 101, 5216 Most na Soči, Slovenia',
    coords: [46.1897, 13.6618],
    country: 'Slovenia',
    destinationNumber: 8
  },
  {
    id: 'lodging-vizinada',
    type: 'lodging',
    name: 'Nona Nina',
    city: 'Vižinada',
    address: 'BALDASI 10, 52447 Vižinada, Croatia',
    coords: [45.3339, 13.7658],
    country: 'Croatia',
    destinationNumber: 9
  },
  {
    id: 'lodging-venice',
    type: 'lodging',
    name: "Ca' Vivaldi Appartamento",
    city: 'Venice (Mestre)',
    address: '8A Via Antonio Vivaldi, 30171 Venice, Italy',
    coords: [45.4892, 12.2436],
    country: 'Italy',
    destinationNumber: 10
  },
  {
    id: 'lodging-volastra',
    type: 'lodging',
    name: 'CREUZA DE 5 TERRE',
    city: 'Volastra',
    address: '304 Via Montello, 19017 Volastra, Italy',
    coords: [44.1147, 9.7346],
    country: 'Italy',
    destinationNumber: 11
  },
  {
    id: 'lodging-lucca',
    type: 'lodging',
    name: 'Casa Alice Lucca centro',
    city: 'Lucca',
    address: '3 Via San Pierino, 55100 Lucca, Italy',
    coords: [43.8421, 10.5053],
    country: 'Italy',
    destinationNumber: 12
  },
  {
    id: 'lodging-reykjavik',
    type: 'lodging',
    name: 'Skólavörðustígur Apartments',
    city: 'Reykjavik',
    address: 'Skólavörðustígur 21A, 101 Reykjavík, Iceland',
    coords: [64.1439, -21.9334],
    country: 'Iceland',
    destinationNumber: 13
  },

  // Waypoints
  {
    id: 'waypoint-senj',
    type: 'waypoint',
    name: 'Senj',
    city: 'Senj',
    address: 'Senj, Croatia',
    coords: [44.9897, 14.9064],
    country: 'Croatia'
  },
  {
    id: 'waypoint-vrsic',
    type: 'waypoint',
    name: 'Vršič Pass',
    city: 'Vršič',
    address: 'Vršič Pass, Slovenia',
    coords: [46.4, 13.74],
    country: 'Slovenia'
  },

  // Activities / Points of Interest
  {
    id: 'activity-mauritshuis',
    type: 'activity',
    name: 'Mauritshuis Museum',
    city: 'The Hague',
    address: 'Plein 29, 2511 CS The Hague, Netherlands',
    coords: [52.0804, 4.3137],
    country: 'Netherlands',
    category: 'museum'
  },
  {
    id: 'activity-gravensteen',
    type: 'activity',
    name: 'Gravensteen Castle',
    city: 'Ghent',
    address: 'Sint-Veerleplein 11, 9000 Ghent, Belgium',
    coords: [51.0576, 3.7203],
    country: 'Belgium',
    category: 'castle'
  },
  {
    id: 'activity-plitvice-lakes',
    type: 'activity',
    name: 'Plitvice Lakes National Park',
    city: 'Plitvice',
    address: 'Plitvice Lakes National Park, Croatia',
    coords: [44.8864, 15.6122],
    country: 'Croatia',
    category: 'hiking'
  },
  {
    id: 'activity-triglav',
    type: 'activity',
    name: 'Mount Triglav',
    city: 'Mojstrana',
    address: 'Triglav Summit, Triglav National Park, Slovenia',
    coords: [46.3788, 13.8364],
    country: 'Slovenia',
    category: 'hiking'
  },
  {
    id: 'activity-truffle-tour',
    type: 'activity',
    name: 'Truffle Hunting Tour',
    city: 'Vižinada',
    address: 'Vižinada, Istria, Croatia',
    coords: [45.3347, 13.7628],
    country: 'Croatia',
    category: 'food'
  },
  {
    id: 'activity-cinque-terre-trail',
    type: 'activity',
    name: 'Cinque Terre Coastal Trail',
    city: 'Cinque Terre',
    address: 'Sentiero Azzurro, Cinque Terre, Italy',
    coords: [44.1265, 9.7120],
    country: 'Italy',
    category: 'hiking'
  },
  {
    id: 'activity-blue-lagoon',
    type: 'activity',
    name: 'Blue Lagoon',
    city: 'Grindavík',
    address: 'Norðurljósavegur 9, 240 Grindavík, Iceland',
    coords: [63.8804, -22.4495],
    country: 'Iceland',
    category: 'water'
  }
];

// Helper functions to find locations by ID or type
export const getLocationById = (id) => {
  return locations.find(loc => loc.id === id);
};

export const getLocationsByType = (type) => {
  return locations.filter(loc => loc.type === type);
};

export const getLodgingLocations = () => {
  return locations.filter(loc => loc.type === 'lodging');
};

export const getHomeLocation = () => {
  return locations.find(loc => loc.type === 'home');
};
