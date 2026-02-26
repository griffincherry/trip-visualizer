import React from 'react';
import { ICONS, Icon } from '../../constants/icons';
import { COLORS } from '../../constants/colors';
import { getActivityIcon } from '../../utils/iconHelpers';
import { getGoogleMapsUrl } from '../../utils/formatters';

const StayDetails = ({ currentStep, activities, selectedIdx, handleActivitySelect }) => {
  const relevantActivities = activities.filter(act => act.parentStepIndex === selectedIdx);

  return (
    <>
      <h2 className="font-serif italic text-5xl mb-2 text-slate-900 tracking-tighter leading-tight">
        {currentStep.city}
      </h2>
      <div className="flex items-center gap-1.5 text-slate-400 mb-6">
        {currentStep.isHome ? <Icon name={ICONS.locationHome} size={13} className="text-slate-300" /> : <Icon name={ICONS.locationPin} size={13} className="text-slate-300" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {currentStep.country} <span className="mx-3 text-slate-200">|</span>
          {currentStep.isHome ? 'Home' : currentStep.isDestination ? `Destination ${currentStep.destinationNumber}` : 'Transit'}
        </span>
      </div>

      <div className="bg-slate-50 p-7 rounded-[2rem] flex items-center gap-6 border border-slate-100">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50" style={{ color: COLORS.primary }}>
          <Icon name={ICONS.accommodation} size={24} />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Accommodations</p>
          <p className="font-extrabold text-slate-800 text-xl tracking-tight">{currentStep.lodging}</p>
        </div>
      </div>

      <a
        href={getGoogleMapsUrl(currentStep.address)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-105"
        style={{
          backgroundColor: COLORS.primary,
          color: 'white'
        }}
      >
        <Icon name={ICONS.navigate} size={18} />
        Get Directions
      </a>

      {relevantActivities.length > 0 && (
        <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-200">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: COLORS.activity }}>
            Activities
          </p>
          <div className="space-y-2">
            {relevantActivities.map(activity => (
              <button
                key={activity.id}
                onClick={() => handleActivitySelect(activity.id)}
                className="w-full text-left flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-amber-100 transition-colors border border-transparent hover:border-amber-300"
              >
                <div className="flex-shrink-0" style={{ color: COLORS.activity }}>
                  {getActivityIcon(activity.category, 16)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-900 truncate">{activity.name}</p>
                  <p className="text-xs text-amber-700">
                    {new Date(activity.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit'
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default StayDetails;
