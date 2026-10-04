import React from 'react';
import { Layers, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { B1A_FLOORS } from '../data/campusData';
import { FloorInfo, ThemeMode } from '../types';

interface FloorCutControlProps {
  selectedFloor: number;
  floors?: FloorInfo[];
  themeMode?: ThemeMode;
  onSelectFloor: (floorNum: number) => void;
}

export const FloorCutControl: React.FC<FloorCutControlProps> = ({
  selectedFloor,
  floors,
  themeMode = 'light',
  onSelectFloor
}) => {
  const isLight = themeMode === 'light';
  const floorsList = floors && floors.length > 0 ? floors : B1A_FLOORS;
  const currentFloorInfo = floorsList.find(f => f.floorNumber === selectedFloor) || floorsList[0];
  const maxFloor = Math.max(...floorsList.map(f => f.floorNumber));

  return (
    <div
      id="floor-cut-control"
      className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 pointer-events-auto flex items-center space-x-3"
    >
      {/* Active Floor BIM Inspector Bubble */}
      {currentFloorInfo && (
        <div
          className={`hidden md:block w-64 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200 border transition-colors ${
            isLight
              ? 'bg-white/95 border-slate-200/90 shadow-slate-200/50 text-slate-800'
              : 'bg-slate-950/90 border-sky-400/40 shadow-sky-950/50 text-slate-100'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className={`text-base font-black font-mono ${isLight ? 'text-sky-600' : 'text-sky-400'}`}>
                {currentFloorInfo.label}
              </span>
              <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                剖切剖面
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-semibold ${
                isLight
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              BIM 聚焦中
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className={`text-[11px] leading-snug ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              <span className={`block mb-0.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>规划定位：</span>
              <strong className={isLight ? 'text-sky-700 font-bold' : 'text-sky-300'}>{currentFloorInfo.purpose}</strong>
            </div>

            <div
              className={`grid grid-cols-2 gap-1.5 pt-1.5 border-t text-[11px] ${
                isLight ? 'border-slate-200' : 'border-slate-800/80'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isLight ? 'bg-slate-50 border border-slate-200/60' : 'bg-slate-900/60'}`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>建筑面积</span>
                <div className={`font-mono font-bold ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
                  {currentFloorInfo.area > 0 ? `${currentFloorInfo.area} ㎡` : '待绑定'}
                </div>
              </div>
              <div className={`p-1.5 rounded-lg ${isLight ? 'bg-slate-50 border border-slate-200/60' : 'bg-slate-900/60'}`}>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>入驻企事业单位</span>
                <div className={`font-mono font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                  {currentFloorInfo.area > 0 ? `${currentFloorInfo.tenantCount} 家` : '待绑定'}
                </div>
              </div>
            </div>

            {currentFloorInfo.rooms.length > 0 && (
              <div
                className={`rounded-xl p-2 mt-1 border ${
                  isLight
                    ? 'bg-sky-50/80 border-sky-200 text-slate-700'
                    : 'bg-sky-500/10 border-sky-500/30 text-slate-300'
                }`}
              >
                <div className={`text-[10px] font-semibold mb-0.5 ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                  已载入详细室内布局
                </div>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  包含 501 华东勘测设计院、实验室、会议中心及茶歇区
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floor Stack Buttons (F7 down to F1) */}
      <div
        className={`backdrop-blur-md rounded-2xl p-2 shadow-2xl flex flex-col items-center space-y-1.5 border transition-colors ${
          isLight
            ? 'bg-white/90 border-slate-200/90 shadow-slate-200/60'
            : 'bg-slate-950/85 border-sky-500/30 shadow-slate-950/80'
        }`}
      >
        <div
          className={`text-[10px] font-bold uppercase tracking-widest px-1 py-0.5 border-b flex items-center gap-1 mb-1 ${
            isLight ? 'text-sky-600 border-slate-200' : 'text-sky-400 border-slate-800'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>楼层</span>
        </div>

        {/* Quick Stepper up */}
        <button
          id="btn-floor-step-up"
          onClick={() => {
            if (selectedFloor < maxFloor) onSelectFloor(selectedFloor + 1);
          }}
          disabled={selectedFloor >= maxFloor}
          className={`p-1 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent ${
            isLight
              ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* Floor List F7 -> F1 */}
        {floorsList.map(floor => {
          const isActive = floor.floorNumber === selectedFloor;
          const isAbove = floor.floorNumber > selectedFloor;

          return (
            <button
              key={floor.floorNumber}
              id={`btn-floor-${floor.floorNumber}`}
              onClick={() => onSelectFloor(floor.floorNumber)}
              title={`${floor.label}: ${floor.purpose}`}
              className={`relative w-11 h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/40 scale-105 ring-2 ring-sky-300'
                  : isAbove
                  ? isLight
                    ? 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700'
                    : 'bg-slate-900/60 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                  : isLight
                  ? 'bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:bg-sky-950 hover:text-sky-300 border border-slate-800'
              }`}
            >
              {floor.label}
              {isActive && (
                <span className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
              )}
            </button>
          );
        })}

        {/* Quick Stepper down */}
        <button
          id="btn-floor-step-down"
          onClick={() => {
            if (selectedFloor > 1) onSelectFloor(selectedFloor - 1);
          }}
          disabled={selectedFloor <= 1}
          className={`p-1 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent ${
            isLight
              ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
