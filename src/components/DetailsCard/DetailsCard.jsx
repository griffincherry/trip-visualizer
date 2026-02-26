import React from 'react';
import TransitDetails from './TransitDetails';
import ActivityDetails from './ActivityDetails';
import StayDetails from './StayDetails';
import { ICONS, Icon } from '../../constants/icons';
import { COLORS } from '../../constants/colors';

const DetailsCard = ({ currentItem, currentStep, selectedIdx, selectedActivityId, selectedTimelineId, activities, handleActivitySelect, detailsMinimized, setDetailsMinimized }) => {
  if (detailsMinimized) {
    return (
      <button
        onClick={() => setDetailsMinimized(false)}
        className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center z-[1000] border border-slate-100 hover:scale-110 transition-transform"
        style={{ color: COLORS.primary }}
      >
        <Icon name={ICONS.expandPanel} size={24} />
      </button>
    );
  }

  // Resolve selected activity
  let selectedActivity = null;
  if (selectedActivityId) {
    const activity = activities.find(act => act.id === selectedActivityId);
    if (activity) {
      const isValidParent = activity.parentStepIndex === selectedIdx ||
                            activity.parentTransitId === selectedTimelineId;
      if (isValidParent) {
        selectedActivity = activity;
      }
    }
  }

  return (
    <div className="absolute bottom-10 left-10 w-[400px] bg-white p-10 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] z-[1000] border border-slate-50">
      <button
        onClick={() => setDetailsMinimized(true)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
        style={{ color: COLORS.primary }}
      >
        <Icon name={ICONS.collapsePanel} size={18} />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: COLORS.primary }} />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.3em]" style={{ color: COLORS.primary }}>
          {currentItem?.type === 'transit' ? 'Transit Details' : selectedActivityId ? 'Activity Details' : 'Location Details'}
        </span>
      </div>

      {currentItem?.type === 'transit' ? (
        <TransitDetails
          currentItem={currentItem}
          activities={activities}
          handleActivitySelect={handleActivitySelect}
        />
      ) : selectedActivity ? (
        <ActivityDetails
          activity={selectedActivity}
          currentStep={currentStep}
        />
      ) : (
        <StayDetails
          currentStep={currentStep}
          activities={activities}
          selectedIdx={selectedIdx}
          handleActivitySelect={handleActivitySelect}
        />
      )}
    </div>
  );
};

export default DetailsCard;
