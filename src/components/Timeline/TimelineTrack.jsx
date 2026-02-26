import React from 'react';
import TimelineSegment from './TimelineSegment';
import { COLORS } from '../../constants/colors';
import { getActivityIcon } from '../../utils/iconHelpers';

const TimelineTrack = ({ timelineItems, selectedId, onSelect, lodgingSelectedId, scrollRef, getPos, getModeIcon, selectedActivityId, onActivitySelect, activities, lodgingSteps, totalWidth, tripStart }) => {
  const hourWidth = 8;

  return (
    <div className="sticky top-0 bg-white z-50">
      <div className="relative h-32 overflow-x-auto custom-scrollbar" ref={scrollRef}>
        <div className="relative h-full" style={{ width: `${totalWidth + 64}px` }}>
          {/* Day tickmarks and labels — generated dynamically from trip dates */}
          {(() => {
            const dayLabels = [];
            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dayWidth = 24 * hourWidth;
            const tripEnd = timelineItems.length > 0 ? new Date(Math.max(...timelineItems.map(i => i.end.getTime()))) : new Date();
            // Start from the beginning of tripStart's day
            const firstDay = new Date(tripStart);
            firstDay.setHours(0, 0, 0, 0);
            const lastDay = new Date(tripEnd);
            lastDay.setHours(23, 59, 59, 999);
            const totalDays = Math.ceil((lastDay - firstDay) / (1000 * 60 * 60 * 24));

            for (let d = 0; d < totalDays; d++) {
              const currentDay = new Date(firstDay);
              currentDay.setDate(firstDay.getDate() + d);
              const dayStartX = d * dayWidth;
              const dayCenterX = dayStartX + dayWidth / 2;
              const dayEndX = dayStartX + dayWidth;
              const dayOfWeek = dayNames[currentDay.getDay()];
              const month = currentDay.getMonth() + 1;
              const dayNum = currentDay.getDate();

              dayLabels.push(
                <React.Fragment key={`day-${d}`}>
                  {/* Start tickmark for first day */}
                  {d === 0 && (
                    <div
                      className="absolute w-0.5 bg-slate-600 opacity-50 z-40"
                      style={{ left: `${32}px`, top: '0px', height: '77px' }}
                    />
                  )}
                  {/* End tickmark */}
                  <div
                    className="absolute w-0.5 bg-slate-600 opacity-50 z-40"
                    style={{ left: `${dayEndX + 32}px`, top: '0px', height: '77px' }}
                  />
                  {/* Day label centered */}
                  <div
                    className="absolute flex flex-col items-center"
                    style={{ left: `${dayCenterX + 32}px`, top: '0px', transform: 'translateX(-50%)' }}
                  >
                    <span className="text-sm font-black text-slate-600 tabular-nums z-50" style={{ height: '29px', display: 'flex', alignItems: 'flex-end' }}>{dayOfWeek} {month}/{dayNum}</span>
                  </div>
                </React.Fragment>
              );
            }
            return dayLabels;
          })()}

          {timelineItems.map((item) => (
            <TimelineSegment
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onClick={onSelect}
              getPos={getPos}
              getModeIcon={getModeIcon}
              lodgingSteps={lodgingSteps}
            />
          ))}

          {/* Activity pills - secondary row - always visible */}
          {activities.map(activity => {
            const startX = getPos(new Date(activity.startTime));
            const endX = getPos(new Date(activity.endTime));
            const displayWidth = Math.max(endX - startX - 2, 60);
            const isSelected = selectedActivityId === activity.id;

            return (
              <button
                key={activity.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onActivitySelect(activity.id);
                }}
                className={`absolute transition-all ${
                  isSelected ? 'shadow-xl scale-105 rounded-lg' : 'rounded-md'
                }`}
                style={{
                  left: `${startX + 32 + 1}px`,
                  top: '82px',
                  width: `${displayWidth}px`,
                  height: '26px',
                  padding: '0 10px',
                  backgroundColor: isSelected ? COLORS.activity : COLORS.activityMuted,
                  color: isSelected ? '#fff' : '#78350f',
                  zIndex: isSelected ? 25 : 15,
                }}
              >
                <div className="flex items-center gap-1.5">
                  {getActivityIcon(activity.category, 11)}
                  {displayWidth > 60 && (
                    <span className="font-bold truncate text-[10px]">{activity.name}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineTrack;
