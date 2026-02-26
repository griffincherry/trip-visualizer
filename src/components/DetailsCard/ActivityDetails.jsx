import React from 'react';
import { ICONS, Icon } from '../../constants/icons';
import { COLORS } from '../../constants/colors';
import { getActivityIcon } from '../../utils/iconHelpers';

const ActivityDetails = ({ activity, currentStep }) => {
  return (
    <>
      <h2 className="font-serif italic text-5xl mb-2 text-slate-900 tracking-tighter leading-tight">
        {activity.name}
      </h2>
      <div className="flex items-center gap-1.5 text-slate-400 mb-6">
        {getActivityIcon(activity.category, 16)}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {activity.category} <span className="mx-3 text-slate-200">|</span>
          {currentStep.city}
        </span>
      </div>

      <div className="p-7 rounded-[2rem] flex items-start gap-6 border-2 mb-4"
           style={{
             backgroundColor: COLORS.activityLight,
             borderColor: COLORS.activity
           }}>
        <div className="bg-white p-5 rounded-2xl shadow-sm" style={{ color: COLORS.activity }}>
          {getActivityIcon(activity.category, 24)}
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
             style={{ color: COLORS.activity }}>
            Activity Details
          </p>
          <div className="flex items-center gap-1.5 mb-3" style={{ color: COLORS.activity }}>
            <Icon name={ICONS.clock} size={13} />
            <span className="text-xs font-bold">
              {new Date(activity.startTime).toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit'
              })} - {new Date(activity.endTime).toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit'
              })}
            </span>
          </div>
          {activity.description && (
            <p className="text-sm text-amber-800 leading-relaxed">{activity.description}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityDetails;
