import React from 'react';
import { RoamPerspective, RobotStatus, ThemeMode } from '../types';
import {
  Compass,
  Gauge,
  BatteryCharging,
  Wifi,
  Eye,
  Video,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  ShieldCheck,
  Radio,
  Sliders,
  X
} from 'lucide-react';
import { PATROL_WAYPOINTS } from '../data/campusData';

interface RoamingHUDProps {
  perspective: RoamPerspective;
  isPatrolling: boolean;
  robotStatus: RobotStatus;
  themeMode?: ThemeMode;
  onTogglePerspective: (p: RoamPerspective) => void;
  onTogglePatrol: () => void;
  onExitRoam: () => void;
}

export const RoamingHUD: React.FC<RoamingHUDProps> = ({
  perspective,
  isPatrolling,
  robotStatus,
  themeMode = 'light',
  onTogglePerspective,
  onTogglePatrol,
  onExitRoam
}) => {
  const isLight = themeMode === 'light';

  return (
    <>
      {/* TOP RIGHT TELEMETRY HUD: 罗盘 + 当前速度 (e.g. 4.78 km/h) */}
      <div className="absolute right-6 top-20 z-30 pointer-events-auto flex flex-col items-end space-y-3">
        {/* Futuristic Tech Compass & Speed Card */}
        <div
          className={`backdrop-blur-md rounded-2xl p-4 shadow-2xl w-72 transition-colors duration-300 border ${
            isLight
              ? 'bg-white/95 border-slate-200/90 shadow-slate-200/60 text-slate-800'
              : 'bg-slate-950/90 border-sky-400/50 shadow-sky-950/60 text-slate-100'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
              <h3 className={`text-xs font-bold font-mono tracking-wider ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                {robotStatus.model}
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                isLight
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              巡检就绪
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {/* Realtime 360° Compass Dial */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer compass ring */}
              <div
                className={`absolute inset-0 rounded-full border transition-transform duration-300 ${
                  isLight ? 'border-sky-400/60' : 'border-sky-500/40'
                }`}
                style={{ transform: `rotate(${-robotStatus.heading}deg)` }}
              >
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-rose-500 font-mono">N</span>
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 font-mono">S</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 font-mono">W</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 font-mono">E</span>
              </div>

              {/* Inner crosshair radar */}
              <div className={`w-14 h-14 rounded-full border border-dashed flex items-center justify-center ${isLight ? 'border-cyan-500/50' : 'border-cyan-400/40'}`}>
                <Navigation
                  className="w-6 h-6 text-cyan-500 transform transition-transform duration-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                  style={{ transform: `rotate(${robotStatus.heading}deg)` }}
                />
              </div>

              {/* Heading numeric */}
              <div className={`absolute -bottom-2 px-2 py-0.5 rounded border text-[9px] font-mono ${isLight ? 'bg-slate-100 border-sky-300 text-sky-800' : 'bg-slate-900 border-sky-500/30 text-sky-300'}`}>
                {robotStatus.heading}°
              </div>
            </div>

            {/* Speed & Battery metrics */}
            <div className="flex-1 pl-4 space-y-2">
              <div>
                <span className={`text-[10px] block font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>当前巡航航速</span>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-2xl font-black font-mono tracking-tight ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                    {robotStatus.speed}
                  </span>
                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>km/h</span>
                </div>
              </div>

              <div className={`pt-1.5 border-t space-y-1 text-[11px] font-mono ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1 font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <BatteryCharging className="w-3 h-3 text-emerald-500" />
                    动力电池
                  </span>
                  <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{robotStatus.battery}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1 font-sans ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Wifi className="w-3 h-3 text-sky-500" />
                    网联状态
                  </span>
                  <span className={`font-bold ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>{robotStatus.signal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Waypoint notice */}
          <div className={`mt-3.5 pt-2.5 border-t text-[11px] ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
            <div className={`flex items-center justify-between mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>巡检站点</span>
              <span className={`font-mono ${isLight ? 'text-sky-700 font-bold' : 'text-sky-400'}`}>8 节点闭环</span>
            </div>
            <div className={`font-medium truncate flex items-center gap-1.5 ${isLight ? 'text-sky-800' : 'text-sky-200'}`}>
              <Radio className="w-3 h-3 text-cyan-500 animate-pulse" />
              <span>{robotStatus.currentWaypoint}</span>
            </div>
          </div>
        </div>

        {/* Roam Perspective & Patrol Controls */}
        <div
          className={`backdrop-blur-md rounded-2xl p-3 shadow-xl w-72 flex flex-col space-y-2 border transition-colors ${
            isLight
              ? 'bg-white/95 border-slate-200/90 shadow-slate-200/60 text-slate-800'
              : 'bg-slate-950/90 border-sky-500/30 shadow-slate-950/60 text-slate-100'
          }`}
        >
          <div className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>视角切换模式</div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-roam-perspective-tpv"
              onClick={() => onTogglePerspective('tpv')}
              className={`py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                perspective === 'tpv'
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>第三人称跟随</span>
            </button>

            <button
              id="btn-roam-perspective-fpv"
              onClick={() => onTogglePerspective('fpv')}
              className={`py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                perspective === 'fpv'
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30 ring-1 ring-sky-300'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>第一视角漫游</span>
            </button>
          </div>

          <div className={`pt-2 border-t flex items-center space-x-2 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
            <button
              id="btn-toggle-patrol"
              onClick={onTogglePatrol}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                isPatrolling
                  ? isLight
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
              }`}
            >
              {isPatrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPatrolling ? '暂停自动巡检' : '恢复自动巡航'}</span>
            </button>

            <button
              id="btn-exit-roam"
              onClick={onExitRoam}
              title="退出漫游模式"
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200'
                  : 'bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FPV Mode Crosshair Overlay */}
      {perspective === 'fpv' && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="relative w-16 h-16 opacity-70">
            <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-cyan-400 -translate-y-1/2" />
            <div className="absolute right-0 top-1/2 w-4 h-0.5 bg-cyan-400 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 h-4 w-0.5 bg-cyan-400 -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 h-4 w-0.5 bg-cyan-400 -translate-x-1/2" />
            <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/60 animate-spin" style={{ animationDuration: '10s' }} />
          </div>

          <div className={`absolute top-20 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border text-[11px] font-mono ${
            isLight
              ? 'bg-white/90 border-cyan-500 text-cyan-800 shadow-md'
              : 'bg-slate-950/80 border-cyan-500/40 text-cyan-300'
          }`}>
            WALKTHROUGH FPV SENSOR LINK ACTIVE · 激光雷达扫描中
          </div>
        </div>
      )}
    </>
  );
};

