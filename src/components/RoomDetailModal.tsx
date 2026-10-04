import React from 'react';
import { RoomData, ThemeMode } from '../types';
import { B1A_FLOORS } from '../data/campusData';
import {
  Building2,
  Users,
  Maximize2,
  Thermometer,
  Droplets,
  CreditCard,
  Calendar,
  Zap,
  CheckCircle2,
  X,
  ArrowLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

interface RoomDetailModalProps {
  selectedRoom: RoomData | null;
  rooms?: RoomData[];
  floorLabel?: string;
  themeMode?: ThemeMode;
  onSelectRoom: (room: RoomData) => void;
  onBackToFloor: () => void;
  hoverInfo: { name: string; type: string; x: number; y: number } | null;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  selectedRoom,
  rooms,
  floorLabel = 'F5',
  themeMode = 'light',
  onSelectRoom,
  onBackToFloor,
  hoverInfo
}) => {
  const isLight = themeMode === 'light';
  const availableRooms = rooms && rooms.length > 0 ? rooms : B1A_FLOORS[2].rooms;
  const activeRoom = selectedRoom || availableRooms[0];

  return (
    <>
      {/* 3D Room Hover Pin Tooltip */}
      {hoverInfo && (
        <div
          id="room-hover-tooltip"
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          <div
            className={`backdrop-blur-md rounded-xl px-3 py-1.5 shadow-2xl flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-100 border ${
              isLight
                ? 'bg-white/95 border-sky-400 shadow-slate-300/40 text-slate-800'
                : 'bg-slate-900/95 border-cyan-400 shadow-cyan-500/30 text-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <div className={`text-xs font-bold ${isLight ? 'text-sky-700' : 'text-cyan-300'}`}>{hoverInfo.name}</div>
              <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{hoverInfo.type} · 点击进入深度查看</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Room Switcher Tabs */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
        <div
          className={`backdrop-blur-md rounded-full px-3 py-1.5 flex items-center space-x-1 shadow-2xl transition-colors border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50'
              : 'bg-slate-950/85 border-sky-500/30 shadow-sky-950/50'
          }`}
        >
          <button
            id="btn-back-to-floor-top"
            onClick={onBackToFloor}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs transition-colors mr-1 ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>全层俯瞰</span>
          </button>

          <div className={`h-4 w-px mx-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

          {availableRooms.map(room => {
            const isCurrent = activeRoom?.id === room.id;
            return (
              <button
                key={room.id}
                id={`btn-room-tab-${room.roomNumber}`}
                onClick={() => onSelectRoom(room)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span>{room.roomNumber}</span>
                <span className="hidden sm:inline text-[11px] opacity-80 truncate max-w-[120px]">
                  {room.enterpriseName.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDEBAR: ROOM TELEMETRY & OPERATIONS PANEL */}
      <div className="absolute right-6 top-20 bottom-4 w-88 z-20 flex flex-col pointer-events-none space-y-3 overflow-y-auto pr-1 select-none scrollbar-none">
        <div
          className={`backdrop-blur-md rounded-2xl p-4 pointer-events-auto shadow-2xl transition-colors duration-300 border flex flex-col space-y-3.5 ${
            isLight
              ? 'bg-white/95 border-slate-200/90 shadow-slate-200/60 text-slate-800'
              : 'bg-slate-950/90 border-sky-400/40 shadow-sky-950/80 text-slate-100'
          }`}
        >
          {/* Header row */}
          <div
            className={`flex items-start justify-between pb-3 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}
          >
            <div>
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
                    isLight
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  }`}
                >
                  Room {activeRoom.roomNumber}
                </span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full border font-medium ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {activeRoom.status}
                </span>
              </div>
              <h2 className={`text-sm font-bold mt-1 line-clamp-1 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                {activeRoom.enterpriseName}
              </h2>
            </div>

            <button
              id="btn-return-cut-view"
              onClick={onBackToFloor}
              title="关闭返回 F5 剖切层"
              className={`p-1.5 rounded-xl text-xs transition-colors flex items-center justify-center border cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtitle / Metadata row */}
          <div className={`text-xs space-y-1.5 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <div className="flex items-center justify-between">
              <span>空间分类:</span>
              <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{activeRoom.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>合同期至:</span>
              <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{activeRoom.contractExpiry}</span>
            </div>
          </div>

          {/* 6 Key Data Points linked dynamically (2 columns x 3 rows) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* 1. 使用面积 */}
            <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800/80'}`}>
              <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-sky-100 text-sky-600' : 'bg-sky-500/10 text-sky-400'}`}>
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>使用面积</span>
                <span className={`text-xs font-bold font-mono ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
                  {activeRoom.usableArea} <span className="text-[10px] font-normal">㎡</span>
                </span>
              </div>
            </div>

            {/* 2. 工作人数 */}
            <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800/80'}`}>
              <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-cyan-100 text-cyan-600' : 'bg-cyan-500/10 text-cyan-400'}`}>
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>工位数/在岗</span>
                <span className={`text-xs font-bold font-mono ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                  {activeRoom.headcount} <span className="text-[10px] font-normal">人</span>
                </span>
              </div>
            </div>

            {/* 3. 温度 */}
            <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800/80'}`}>
              <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <Thermometer className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>室内温度</span>
                <span className={`text-xs font-bold font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                  {activeRoom.temperature} <span className="text-[10px] font-normal">°C</span>
                </span>
              </div>
            </div>

            {/* 4. 湿度 */}
            <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800/80'}`}>
              <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                <Droplets className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>室内湿度</span>
                <span className={`text-xs font-bold font-mono ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                  {activeRoom.humidity} <span className="text-[10px] font-normal">% RH</span>
                </span>
              </div>
            </div>

            {/* 5. 租金 */}
            <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800/80'}`}>
              <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/10 text-amber-400'}`}>
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>综合租金</span>
                <span className={`text-xs font-bold font-mono ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                  ¥{activeRoom.dailyRent} <span className="text-[9px] font-normal">/㎡/天</span>
                </span>
              </div>
            </div>

            {/* 6. 日用电量 */}
            <div className={`p-2.5 rounded-xl flex items-center space-x-2.5 border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800/80'}`}>
              <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/10 text-rose-400'}`}>
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>今日能耗</span>
                <span className={`text-xs font-bold font-mono ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                  {activeRoom.powerUsage} <span className="text-[10px] font-normal">kWh</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

