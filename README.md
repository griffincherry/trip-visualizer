# Trip Visualizer

An interactive map-based visualizer for a multi-city Europe trip. Built with React, Leaflet, and Tailwind CSS, powered by Airtable as a backend.

## Features

- Interactive map with multiple viewing modes (Road, Terrain, Atlas)
- Clickable timeline showing each leg of the trip
- Animated route lines (flights, trains, drives)
- Detail cards for stays, transit, and activities
- Fully dynamic — all trip data is pulled from Airtable

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` file with your Airtable credentials:

```
VITE_AIRTABLE_API_KEY=your_api_key
VITE_AIRTABLE_BASE_ID=your_base_id
```

## Docs

- [Netlify Deployment Guide](docs/NETLIFY_DEPLOY.md)
- [Quick Start](docs/QUICK_START.md)
