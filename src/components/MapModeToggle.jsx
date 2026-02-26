import React from 'react';
import { ICONS, Icon } from '../constants/icons';
import { COLORS } from '../constants/colors';

const MapModeToggle = ({ mapMode, setMapMode }) => {
  return (
    <div className="absolute bottom-8 right-8 flex gap-1 p-1 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl z-[1000] border border-white/50">
      {[
        { id: 'atlas',   label: 'Atlas',   iconKey: 'mapAtlas'   },
        { id: 'road',    label: 'Road',    iconKey: 'mapRoad'    },
        { id: 'terrain', label: 'Terrain', iconKey: 'mapTerrain' }
      ].map((mode) => (
        <button
          key={mode.id}
          onClick={() => setMapMode(mode.id)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
            mapMode === mode.id ? 'text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
          }`}
          style={{ backgroundColor: mapMode === mode.id ? COLORS.primary : 'transparent' }}
        >
          <Icon name={ICONS[mode.iconKey]} size={12} /> {mode.label}
        </button>
      ))}
    </div>
  );
};

export default MapModeToggle;
