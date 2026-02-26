import { useState, useEffect } from 'react';
import {
  fetchAllTripData,
  getLocationById,
  getHomeLocation
} from './services/airtableService';
import { generateTimelineItems } from './utils/timelineUtils';
import Timeline from './components/Timeline/Timeline';
import MapComponent from './components/Map/MapComponent';
import MapModeToggle from './components/MapModeToggle';
import DetailsCard from './components/DetailsCard/DetailsCard';

const App = () => {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(1);
  const [selectedTimelineId, setSelectedTimelineId] = useState('stay-1');
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [mapMode, setMapMode] = useState('atlas');
  const [detailsMinimized, setDetailsMinimized] = useState(false);

  useEffect(() => {
    loadTripData();
  }, []);

  const loadTripData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllTripData();
      setTripData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading trip data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-700 mb-2">Loading trip data...</div>
          <div className="text-sm text-slate-500">Fetching from Airtable</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center max-w-md p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Trip Data</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadTripData}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <p className="text-slate-600">No trip data available</p>
        </div>
      </div>
    );
  }

  const { locations, tripSteps, routes, activities } = tripData;

  const homeLoc = getHomeLocation(locations);
  const airportLoc = getLocationById(locations, 'airport-halifax');

  const TRIP_METADATA = {
    homeAddress: homeLoc?.address || '',
    homeCoords: homeLoc?.coords || [0, 0],
    homeName: homeLoc?.name || 'Home',
    airportAddress: airportLoc?.address || '',
    airportCoords: airportLoc?.coords || [0, 0],
    tripStart: tripSteps.length > 0 ? new Date(tripSteps[0].startDate + 'T00:00:00') : new Date(),
    tripEnd: tripSteps.length > 0 ? new Date(tripSteps[tripSteps.length - 1].endDate + 'T23:59:59') : new Date()
  };

  const lodgingSteps = tripSteps;
  const transitRoutes = routes;

  const timelineItems = generateTimelineItems(transitRoutes, lodgingSteps, TRIP_METADATA);

  const currentStep = lodgingSteps[selectedIdx];
  const currentItem = timelineItems.find(item => item.id === selectedTimelineId);

  const handleTimelineSelect = (timelineId, stepIndex) => {
    if (selectedTimelineId === timelineId && !selectedActivityId) return;
    setSelectedTimelineId(timelineId);
    if (stepIndex !== undefined) {
      setSelectedIdx(stepIndex);
    }
    setSelectedActivityId(null);
  };

  const handleActivitySelect = (activityId) => {
    if (selectedActivityId === activityId) return;

    const activity = activities.find(act => act.id === activityId);
    if (!activity) return;

    setSelectedActivityId(activityId);

    if (activity.parentStepIndex !== undefined) {
      const parentStayItem = timelineItems.find(item =>
        item.type === 'stay' && item.stepIndex === activity.parentStepIndex
      );
      if (parentStayItem) {
        setSelectedTimelineId(parentStayItem.id);
        setSelectedIdx(activity.parentStepIndex);
      }
    } else if (activity.parentTransitId) {
      const parentTransitItem = timelineItems.find(item => item.id === activity.parentTransitId);
      if (parentTransitItem) {
        setSelectedTimelineId(activity.parentTransitId);
        if (parentTransitItem.stepIndex !== undefined) {
          setSelectedIdx(parentTransitItem.stepIndex);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
      <Timeline
        selectedId={selectedTimelineId}
        onSelect={handleTimelineSelect}
        lodgingSelectedId={selectedIdx}
        selectedActivityId={selectedActivityId}
        onActivitySelect={handleActivitySelect}
        lodgingSteps={lodgingSteps}
        timelineItems={timelineItems}
        activities={activities}
      />

      <div className="flex-1 relative">
        <MapComponent
          selectedId={selectedIdx}
          onSelect={setSelectedIdx}
          mapMode={mapMode}
          selectedTimelineItem={currentItem}
          detailsMinimized={detailsMinimized}
          handleTimelineSelect={handleTimelineSelect}
          selectedActivityId={selectedActivityId}
          onActivitySelect={handleActivitySelect}
          activities={activities}
          lodgingSteps={lodgingSteps}
          transitRoutes={transitRoutes}
          TRIP_METADATA={TRIP_METADATA}
          timelineItems={timelineItems}
        />

        <MapModeToggle mapMode={mapMode} setMapMode={setMapMode} />

        <DetailsCard
          currentItem={currentItem}
          currentStep={currentStep}
          selectedIdx={selectedIdx}
          selectedActivityId={selectedActivityId}
          selectedTimelineId={selectedTimelineId}
          activities={activities}
          handleActivitySelect={handleActivitySelect}
          detailsMinimized={detailsMinimized}
          setDetailsMinimized={setDetailsMinimized}
        />
      </div>
    </div>
  );
};

export default App;
