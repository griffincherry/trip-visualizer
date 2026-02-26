import React from 'react';
import { COLORS } from '../../constants/colors';
import { getLodgingIcon } from '../../utils/iconHelpers';

const TimelineSegment = ({ item, isSelected, onClick, getPos, getModeIcon, lodgingSteps }) => {
  const startX = getPos(item.start);
  const endX = getPos(item.end);
  const actualWidth = endX - startX - 2;
  const displayWidth = Math.max(actualWidth, 18);
  const paddingX = 16;
  const iconWidth = 16;
  const hasRoomForIcon = displayWidth >= 40;
  const contentWidth = displayWidth - paddingX - (hasRoomForIcon ? iconWidth : 0);

  const baseColor = item.isHome ? COLORS.home : (item.type === 'stay' ? COLORS.primary : COLORS[item.mode]);

  return (
    <button
      onClick={() => onClick(item.id, item.stepIndex)}
      className={`absolute h-10 transition-all ${hasRoomForIcon ? 'px-4' : 'px-2'} group overflow-visible ${
        isSelected ? 'shadow-2xl scale-105 rounded-xl' : 'rounded-lg'
      }`}
      style={{
        left: `${startX + 32 + 1}px`,
        top: '37px',
        width: `${displayWidth}px`,
        backgroundColor: isSelected ? baseColor : `${baseColor}${item.type === 'stay' ? '50' : '40'}`,
        color: isSelected ? '#fff' : baseColor,
        zIndex: isSelected ? 30 : 10,
      }}
    >
      <div className="relative flex items-center" style={{ zIndex: 50 }}>
        {hasRoomForIcon && (item.type === 'stay' ? getLodgingIcon(lodgingSteps[item.stepIndex]?.lodgingCategory, 16) : getModeIcon(item.mode))}
        {contentWidth > 40 && (
          <span className={`${hasRoomForIcon ? 'ml-2' : ''} text-xs font-black truncate uppercase tracking-wide ${isSelected ? 'opacity-100' : 'opacity-90'}`}>
            {item.type === 'stay' ? item.city : item.label}
          </span>
        )}
      </div>
    </button>
  );
};

export default TimelineSegment;
