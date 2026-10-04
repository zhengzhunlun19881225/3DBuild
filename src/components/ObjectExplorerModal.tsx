import React, { useState } from 'react';
import { CampusEntity, ObjectType } from '../models/campusModel';
import { BuildingInfo, FloorInfo, RoomData, ThemeMode } from '../types';
import {
  Building2,
  Layers,
  Box,
  Compass,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Maximize2,
  Users
} from 'lucide-react';

interface ObjectExplorerModalProps {
  campus: CampusEntity;
  activeBuildingId: string;
  activeFloorNumber: number;
  activeRoomId: string;
  themeMode?: ThemeMode;
  onClose: () => void;
  onSelectObject: (target: {
    type: ObjectType;
    buildingId?: string;
    floorNumber?: number;
    roomId?: string;
  }) => void;
}

export const ObjectExplorerModal: React.FC<ObjectExplorerModalProps> = ({
  campus,
  activeBuildingId,
  activeFloorNumber,
  activeRoomId,
  themeMode = 'light',
  onClose,
  onSelectObject
}) => {
  const isLight = themeMode === 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({
    [activeBuildingId]: true
  });
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({
    [`${activeBuildingId}-F${activeFloorNumber}`]: true
  });

  const toggleBuilding = (bId: string) => {
    setExpandedBuildings(prev => ({ ...prev, [bId]: !prev[bId] }));
  };

  const toggleFloor = (floorKey: string) => {
    setExpandedFloors(prev => ({ ...prev, [floorKey]: !prev[floorKey] }));
  };

  const filteredBuildings = campus.buildings.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchBuilding = b.name.toLowerCase().includes(term) || b.code.toLowerCase().includes(term);
    const floors = campus.floorsMap[b.id] || [];
    const matchFloors = floors.some(f =>
      f.label.toLowerCase().includes(term) ||
      f.purpose.toLowerCase().includes(term) ||
      f.rooms.some(r => r.roomNumber.includes(term) || r.enterpriseName.toLowerCase().includes(term))
    );
    return matchBuilding || matchFloors;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border transition-all ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
            : 'bg-slate-950/95 border-sky-500/30 text-slate-100 shadow-sky-950/80'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-md">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
                <Compass className="w-5 h-5 text-sky-500" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                面向对象 · 空间资产数字资源树
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/20">
                  {campus.name}
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                逐级展开浏览园区实体对象：园区 → 建筑 → 楼层 → 空间房间
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className={`px-6 py-3 border-b ${isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-800/80 bg-slate-900/30'}`}>
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索园区建筑、楼层、空间房间号或企业名称..."
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border outline-none transition-all ${
                isLight
                  ? 'bg-white border-slate-200 focus:border-sky-400 text-slate-800 focus:ring-2 focus:ring-sky-100'
                  : 'bg-slate-900/90 border-slate-700 focus:border-sky-400 text-slate-100 focus:ring-2 focus:ring-sky-900/30'
              }`}
            />
          </div>
        </div>

        {/* Object Tree Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin">
          {/* Root Level: Campus Object */}
          <div
            onClick={() => {
              onSelectObject({ type: 'campus' });
              onClose();
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
              isLight
                ? 'bg-sky-50/50 hover:bg-sky-50 border-sky-200 text-slate-800 shadow-sm'
                : 'bg-sky-950/20 hover:bg-sky-950/40 border-sky-500/30 text-slate-100 shadow-sky-950/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
              <div>
                <div className="font-bold text-sm text-sky-600 flex items-center gap-2">
                  <span>[园区根对象] {campus.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-700">
                    {campus.code}
                  </span>
                </div>
                <div className={`text-xs mt-0.5 flex items-center gap-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>{campus.city} · {campus.district}</span>
                  <span>·</span>
                  <span>总面积: {campus.totalArea}</span>
                  <span>·</span>
                  <span>建筑: {campus.buildings.length} 栋</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              聚焦全园 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Second Level: Buildings */}
          <div className="space-y-2.5 pl-4 border-l-2 border-dashed border-sky-500/20">
            {filteredBuildings.map(b => {
              const isCurrentBuilding = activeBuildingId === b.id;
              const isExpanded = expandedBuildings[b.id] ?? isCurrentBuilding;
              const floors = campus.floorsMap[b.id] || campus.floorsMap[campus.mainBuildingId] || [];

              return (
                <div
                  key={b.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isLight
                      ? isCurrentBuilding
                        ? 'border-sky-300 bg-white shadow-md'
                        : 'border-slate-200 bg-slate-50/60'
                      : isCurrentBuilding
                      ? 'border-sky-500/50 bg-slate-900/90 shadow-md'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  {/* Building Item Header */}
                  <div className="p-3 flex items-center justify-between">
                    <button
                      onClick={() => toggleBuilding(b.id)}
                      className="flex items-center space-x-2.5 flex-1 text-left cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-sky-500" />
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                      )}
                      <Building2 className={`w-4 h-4 ${isCurrentBuilding ? 'text-sky-500' : isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-2">
                          <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>{b.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20">
                            {b.code}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
                            {b.floorsCount}层 · {b.area}
                          </span>
                        </div>
                        <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {b.type} · 负荷率: {b.occupancyRate}%
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSelectObject({ type: 'building', buildingId: b.id });
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-white transition-all cursor-pointer ml-2 shrink-0"
                    >
                      3D楼栋分析
                    </button>
                  </div>

                  {/* Third Level: Floors */}
                  {isExpanded && (
                    <div className={`px-3 pb-3 pt-1 space-y-1.5 border-t ${isLight ? 'border-slate-100 bg-slate-50/40' : 'border-slate-800/60 bg-slate-950/40'}`}>
                      {floors.map(floor => {
                        const floorKey = `${b.id}-F${floor.floorNumber}`;
                        const isCurrentFloor = isCurrentBuilding && activeFloorNumber === floor.floorNumber;
                        const isFloorExpanded = expandedFloors[floorKey] ?? isCurrentFloor;
                        const hasRooms = floor.rooms && floor.rooms.length > 0;

                        return (
                          <div
                            key={floor.floorNumber}
                            className={`rounded-xl border transition-all ${
                              isCurrentFloor
                                ? isLight
                                  ? 'border-cyan-300 bg-cyan-50/40'
                                  : 'border-cyan-500/40 bg-cyan-950/20'
                                : isLight
                                ? 'border-slate-200/60 bg-white'
                                : 'border-slate-800/80 bg-slate-900/60'
                            }`}
                          >
                            <div className="p-2.5 flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                {hasRooms ? (
                                  <button
                                    onClick={() => toggleFloor(floorKey)}
                                    className="cursor-pointer text-cyan-500 hover:scale-110 transition-transform"
                                  >
                                    {isFloorExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="w-3.5 h-3.5" />
                                )}
                                <Layers className={`w-3.5 h-3.5 shrink-0 ${isCurrentFloor ? 'text-cyan-500' : isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                                <div className="truncate">
                                  <div className="text-xs font-semibold flex items-center gap-1.5">
                                    <span className="font-mono text-cyan-600 font-bold">{floor.label}</span>
                                    <span className="truncate text-[11px] opacity-90">{floor.purpose}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  onSelectObject({
                                    type: 'floor',
                                    buildingId: b.id,
                                    floorNumber: floor.floorNumber
                                  });
                                  onClose();
                                }}
                                className="text-[11px] px-2 py-0.5 rounded font-medium bg-cyan-500/10 hover:bg-cyan-500 text-cyan-600 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                              >
                                剖切透视
                              </button>
                            </div>

                            {/* Fourth Level: Rooms */}
                            {hasRooms && isFloorExpanded && (
                              <div className="px-3 pb-2.5 pt-1 space-y-1">
                                {floor.rooms.map(room => {
                                  const isCurrentRoom = isCurrentFloor && activeRoomId === room.id;
                                  return (
                                    <div
                                      key={room.id}
                                      onClick={() => {
                                        onSelectObject({
                                          type: 'room',
                                          buildingId: b.id,
                                          floorNumber: floor.floorNumber,
                                          roomId: room.id
                                        });
                                        onClose();
                                      }}
                                      className={`p-2 rounded-lg border flex items-center justify-between text-xs transition-all cursor-pointer group ${
                                        isCurrentRoom
                                          ? isLight
                                            ? 'bg-sky-100/70 border-sky-300 text-sky-900 font-bold shadow-xs'
                                            : 'bg-sky-900/40 border-sky-500 text-sky-200 font-bold shadow-xs'
                                          : isLight
                                          ? 'bg-slate-50 hover:bg-sky-50/40 border-slate-200/80 text-slate-700'
                                          : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 truncate">
                                        <Box className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                        <span className="font-mono font-bold text-sky-600">{room.roomNumber}</span>
                                        <span className="truncate">{room.enterpriseName}</span>
                                      </div>
                                      <div className="flex items-center space-x-2 shrink-0 text-[10px] opacity-80 font-mono">
                                        <span>{room.usableArea}㎡</span>
                                        <span className="hidden sm:inline">| {room.headcount}人</span>
                                        <ArrowRight className="w-3 h-3 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-slate-900 text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>面向对象空间资产模型已就绪 · 点击任意实体即可 3D 聚焦定位</span>
          </div>
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
