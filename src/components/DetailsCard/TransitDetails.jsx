import React from 'react';
import { ICONS, Icon } from '../../constants/icons';
import { COLORS } from '../../constants/colors';
import { getActivityIcon } from '../../utils/iconHelpers';
import { formatTravelTime } from '../../services/airtableService';

const TransitDetails = ({ currentItem, activities, handleActivitySelect }) => {
  const relevantActivities = activities.filter(act => act.parentTransitId === currentItem.id);

  return (
    <>
      <h2 className="font-serif italic text-5xl mb-2 text-slate-900 tracking-tighter leading-tight">
        {currentItem.label}
      </h2>
      <div className="flex items-center gap-1.5 text-slate-400 mb-6">
        {currentItem.mode === 'flight' && <Icon name={ICONS.flight} size={13} className="text-slate-300" />}
        {currentItem.mode === 'train' && <Icon name={ICONS.train}  size={13} className="text-slate-300" />}
        {currentItem.mode === 'drive' && <Icon name={ICONS.drive}  size={13} className="text-slate-300" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {currentItem.mode}
        </span>
      </div>
      {currentItem.route?.travelTime && (
        <div className="flex items-center gap-1.5 text-slate-400 mb-6">
          <Icon name={ICONS.clock} size={13} />
          <span className="text-sm">Travel Time: {formatTravelTime(currentItem.route.travelTime)}</span>
        </div>
      )}

      {relevantActivities.length > 0 && (
        <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-200">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: COLORS.activity }}>
            Stops Along The Way
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

export default TransitDetails;
