import React, { useRef, useEffect } from 'react';
import TimelineTrack from './TimelineTrack';
import { ICONS, Icon } from '../../constants/icons';

const Timeline = ({ selectedId, onSelect, lodgingSelectedId, selectedActivityId, onActivitySelect, lodgingSteps, timelineItems, activities }) => {
  const scrollRef = useRef(null);
  // Derive trip start/end from actual timeline data
  const tripStart = timelineItems.length > 0 ? new Date(Math.min(...timelineItems.map(i => i.start.getTime()))) : new Date();
  const tripEnd = timelineItems.length > 0 ? new Date(Math.max(...timelineItems.map(i => i.end.getTime()))) : new Date();
  const totalHours = (tripEnd - tripStart) / (1000 * 60 * 60);
  const hourWidth = 8;
  const totalWidth = totalHours * hourWidth;

  const getPos = (date) => {
    return ((date - tripStart) / (1000 * 60 * 60)) * hourWidth;
  };

  useEffect(() => {
    if (scrollRef.current && lodgingSelectedId !== null) {
      const step = lodgingSteps[lodgingSelectedId];
      if (step && step.startDate) {
        const pos = getPos(new Date(step.startDate + 'T12:00:00'));
        scrollRef.current.scrollTo({ left: pos - 300, behavior: 'smooth' });
      }
    }
  }, [lodgingSelectedId]);

  const getModeIcon = (mode, isHome = false) => {
    if (isHome) return <Icon name={ICONS.locationHome} size={16} className="flex-shrink-0" />;
    switch(mode) {
      case 'flight': return <Icon name={ICONS.flight} size={16} className="flex-shrink-0" />;
      case 'train':  return <Icon name={ICONS.train}  size={16} className="flex-shrink-0" />;
      case 'drive':  return <Icon name={ICONS.drive}  size={16} className="flex-shrink-0" />;
      default:       return <Icon name={ICONS.locationPin} size={16} className="flex-shrink-0" />;
    }
  };

  const destinationSteps = lodgingSteps.filter(step => step.isDestination);
  const countryCount = new Set(destinationSteps.map(step => step.country)).size;
  const destinationCount = destinationSteps.length;

  return (
    <div className="w-full bg-gradient-to-b from-white to-slate-50 shadow-lg z-30">
      <div className="px-8 py-4 flex items-baseline justify-between">
        <div>
          <h1 className="font-serif italic text-5xl font-bold text-slate-900 tracking-tight leading-none">Europe 2026</h1>
        </div>
        <div className="text-base font-bold uppercase tracking-wider text-slate-600">
          {tripStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}–{tripEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · {destinationCount} Destinations · {countryCount} Countries
        </div>
      </div>

      <TimelineTrack
        timelineItems={timelineItems}
        selectedId={selectedId}
        onSelect={onSelect}
        lodgingSelectedId={lodgingSelectedId}
        scrollRef={scrollRef}
        getPos={getPos}
        getModeIcon={getModeIcon}
        selectedActivityId={selectedActivityId}
        onActivitySelect={onActivitySelect}
        activities={activities}
        lodgingSteps={lodgingSteps}
        totalWidth={totalWidth}
        tripStart={tripStart}
      />
    </div>
  );
};

export default Timeline;
