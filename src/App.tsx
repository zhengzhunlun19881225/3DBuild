/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewLevel, RoamPerspective, BuildingInfo, RoomData, RobotStatus, ThemeMode } from './types';
import { CampusEntity, CAMPUS_AC_TECH, CampusManager, ObjectType } from './models/campusModel';
import { ThreeCampusCanvas } from './components/ThreeCampusCanvas';
import { ImportedCampusCanvas } from './components/ImportedCampusCanvas';
import { GaussianScene } from './components/GaussianScene';
import { CesiumCampus } from './components/CesiumCampus';
import { WeatherController } from './components/WeatherController';
import { DEFAULT_WEATHER, WeatherSettings } from './types/weather';
import { Navbar } from './components/Navbar';
import { OverviewHUD } from './components/OverviewHUD';
import { BuildingHUD } from './components/BuildingHUD';
import { FloorCutControl } from './components/FloorCutControl';
import { RoomDetailModal } from './components/RoomDetailModal';
import { RoamingHUD } from './components/RoamingHUD';
import { AMapControls } from './components/AMapControls';
import { RooftopSurveillanceModal, RooftopCameraNode, ROOFTOP_CAMERAS } from './components/RooftopSurveillanceModal';
import { CampusSwitcherModal } from './components/CampusSwitcherModal';
import { ObjectExplorerModal } from './components/ObjectExplorerModal';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('campus_material_theme_v1');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Active Campus State (面向对象多园区)
  const [activeCampus, setActiveCampus] = useState<CampusEntity>(CAMPUS_AC_TECH);
  const [resetToken, setResetToken] = useState(0);
  const [weather, setWeather] = useState<WeatherSettings>({...DEFAULT_WEATHER});
  const [isCampusSwitcherOpen, setIsCampusSwitcherOpen] = useState<boolean>(false);
  const [isObjectExplorerOpen, setIsObjectExplorerOpen] = useState<boolean>(false);

  const [showAMapLabels, setShowAMapLabels] = useState<boolean>(true);
  const [showSurroundingBuildings, setShowSurroundingBuildings] = useState<boolean>(true);
  const [showRooftopSurveillance, setShowRooftopSurveillance] = useState<boolean>(true);
  const [activeSurveillanceCamera, setActiveSurveillanceCamera] = useState<RooftopCameraNode | null>(null);
  const [viewLevel, setViewLevel] = useState<ViewLevel>(location.hash === '#gis' ? 'gis' : 'overview');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(activeCampus.mainBuildingId);
  const [selectedFloor, setSelectedFloor] = useState<number>(5);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('r-501');
  const [roamPerspective, setRoamPerspective] = useState<RoamPerspective>('tpv');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isPatrolling, setIsPatrolling] = useState<boolean>(true);
  const [robotStatus, setRobotStatus] = useState<RobotStatus>(activeCampus.robotStatus);
  const [hoverObject, setHoverObject] = useState<{
    name: string;
    type: string;
    x: number;
    y: number;
  } | null>(null);

  const isLight = themeMode === 'light';

  // Toggle theme mode between light and dark
  const handleToggleTheme = () => {
    setThemeMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('campus_material_theme_v1', next);
      return next;
    });
  };

  // Selected Building Object
  const currentBuilding =
    CampusManager.getBuilding(activeCampus, selectedBuildingId) || activeCampus.buildings[0];

  // Selected Floors list
  const currentFloors =
    CampusManager.getFloors(activeCampus, currentBuilding.id);

  // Selected Floor Info
  const currentFloor =
    currentFloors.find(f => f.floorNumber === selectedFloor) || currentFloors[0];

  // Selected Room Object
  const currentRooms = currentFloor?.rooms || [];
  const currentRoom =
    currentRooms.find(r => r.id === selectedRoomId) || currentRooms[0] || null;

  // Multi-campus switch handler
  const handleSwitchCampus = (newCampus: CampusEntity) => {
    setActiveCampus(newCampus);
    setSelectedBuildingId(newCampus.mainBuildingId);
    const floors = CampusManager.getFloors(newCampus, newCampus.mainBuildingId);
    const defaultFloor = floors[0]?.floorNumber || 5;
    setSelectedFloor(defaultFloor);
    const rooms = CampusManager.getRooms(newCampus, newCampus.mainBuildingId, defaultFloor);
    if (rooms.length > 0) {
      setSelectedRoomId(rooms[0].id);
    }
    setRobotStatus(newCampus.robotStatus);
    setViewLevel('overview');
    setIsAutoRotating(false);
  };

  // Object-Oriented hierarchy selector handler
  const handleSelectObject = (target: {
    type: ObjectType;
    buildingId?: string;
    floorNumber?: number;
    roomId?: string;
  }) => {
    if (target.type === 'campus') {
      setViewLevel('overview');
      setIsAutoRotating(false);
    } else if (target.type === 'building' && target.buildingId) {
      setSelectedBuildingId(target.buildingId);
      const building = CampusManager.getBuilding(activeCampus, target.buildingId);
      if (building) setSelectedFloor(floor => Math.min(floor, building.floorsCount));
      setViewLevel('building');
      setIsAutoRotating(false);
    } else if (target.type === 'floor' && target.buildingId && target.floorNumber) {
      setSelectedBuildingId(target.buildingId);
      setSelectedFloor(target.floorNumber);
      setViewLevel('floor');
      setIsAutoRotating(false);
    } else if (target.type === 'room' && target.buildingId && target.floorNumber && target.roomId) {
      setSelectedBuildingId(target.buildingId);
      setSelectedFloor(target.floorNumber);
      setSelectedRoomId(target.roomId);
      setViewLevel('room');
      setIsAutoRotating(false);
    }
  };

  // Hierarchy Navigation Handlers
  const handleSelectBuilding = (building: BuildingInfo) => {
    if (location.hash === '#gis') history.replaceState(null, '', location.pathname);
    setSelectedBuildingId(building.id);
    setSelectedFloor(floor => Math.min(floor, building.floorsCount));
    setViewLevel('building');
    setIsAutoRotating(false);
  };

  const handleSelectFloor = (floorNum: number) => {
    setSelectedFloor(floorNum);
    setViewLevel('floor');
    setIsAutoRotating(false);
  };

  const handleSelectRoom = (room: RoomData) => {
    setSelectedRoomId(room.id);
    setSelectedFloor(room.floor);
    setViewLevel('room');
    setIsAutoRotating(false);
  };

  const handleNavigate = (level: ViewLevel) => {
    history.replaceState(null, '', level === 'gis' ? '#gis' : location.pathname);
    setViewLevel(level);
    if (level === 'roam') {
      setIsPatrolling(true);
    }
    setIsAutoRotating(false);
  };

  const handleResetView = () => {
    setResetToken(token => token + 1);
    if (viewLevel === '3dgs' || viewLevel === 'gis') return;
    setViewLevel('overview');
    setSelectedBuildingId(activeCampus.mainBuildingId);
    setSelectedFloor(5);
    setIsAutoRotating(false);
    setIsPatrolling(true);
    setRoamPerspective('tpv');
  };

  const handleUpdateRobotStatus = (partial: Partial<RobotStatus>) => {
    setRobotStatus(prev => ({ ...prev, ...partial }));
  };

  const isImportedCampus = activeCampus.modelSource === 'obj';
  const CampusCanvas = isImportedCampus ? ImportedCampusCanvas : ThreeCampusCanvas;

  return (
    <div
      id="digital-twin-app"
      className={`relative w-screen h-screen overflow-hidden font-sans select-none transition-colors duration-500 ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* 3D WebGL Digital Twin Canvas */}
      {viewLevel === 'gis' ? <CesiumCampus resetToken={resetToken} onSelectBuilding={code => {
        const building = activeCampus.buildings.find(b => b.code === code);
        if (building) handleSelectBuilding(building);
      }} /> : viewLevel === '3dgs' ? <GaussianScene resetToken={resetToken} /> : <CampusCanvas
        weather={weather}
        resetToken={resetToken}
        viewLevel={viewLevel}
        campus={activeCampus}
        selectedBuildingId={selectedBuildingId}
        selectedFloor={selectedFloor}
        selectedRoomId={selectedRoomId}
        roamPerspective={roamPerspective}
        isAutoRotating={isAutoRotating}
        isPatrolling={isPatrolling}
        themeMode={themeMode}
        showAMapLabels={showAMapLabels}
        showSurroundingBuildings={showSurroundingBuildings}
        showRooftopSurveillance={showRooftopSurveillance}
        onSelectBuilding={handleSelectBuilding}
        onSelectFloor={handleSelectFloor}
        onSelectRoom={handleSelectRoom}
        onSelectRooftopCamera={cam => setActiveSurveillanceCamera(cam)}
        onUpdateRobotStatus={handleUpdateRobotStatus}
        onHoverObject={setHoverObject}
      />}

      {/* Top Navbar Header */}
      <Navbar
        viewLevel={viewLevel}
        campus={activeCampus}
        activeBuilding={currentBuilding}
        selectedFloor={selectedFloor}
        activeRoom={currentRoom}
        themeMode={themeMode}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
        onNavigate={handleNavigate}
        onResetView={handleResetView}
        onToggleTheme={handleToggleTheme}
        onOpenCampusSwitcher={() => setIsCampusSwitcherOpen(true)}
        onOpenObjectExplorer={() => setIsObjectExplorerOpen(true)}
      />

      {/* Gaode Map (AMap) GIS Layer Controls & Scene Tools (图层、旋转、漫游) */}
      {!isImportedCampus && (viewLevel === 'overview' || viewLevel === 'roam') && (
        <AMapControls
          themeMode={themeMode}
          isAutoRotating={isAutoRotating}
          onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
          isRoaming={viewLevel === 'roam'}
          onToggleRoam={() => setViewLevel(viewLevel === 'roam' ? 'overview' : 'roam')}
          showLabels={showAMapLabels}
          showSurroundingBuildings={showSurroundingBuildings}
          showRooftopSurveillance={showRooftopSurveillance}
          onToggleLabels={() => setShowAMapLabels(prev => !prev)}
          onToggleSurroundingBuildings={() => setShowSurroundingBuildings(prev => !prev)}
          onToggleRooftopSurveillance={() => setShowRooftopSurveillance(prev => !prev)}
          onToggleTheme={handleToggleTheme}
          onResetBearing={handleResetView}
          onOpenSurveillance={() => setActiveSurveillanceCamera(ROOFTOP_CAMERAS[0])}
        />
      )}

      {isImportedCampus && (viewLevel === 'overview' || viewLevel === 'roam') && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex gap-2 rounded-xl border border-cyan-500/20 bg-slate-950/85 p-1.5 backdrop-blur text-xs text-cyan-100">
          <button className="rounded-lg px-3 py-2 hover:bg-slate-800" aria-pressed={isAutoRotating} onClick={() => setIsAutoRotating(v => !v)}>{isAutoRotating ? '停止旋转' : '自动旋转'}</button>
          <button className="rounded-lg px-3 py-2 hover:bg-slate-800" onClick={() => handleNavigate(viewLevel === 'roam' ? 'overview' : 'roam')}>{viewLevel === 'roam' ? '退出巡游' : '航拍巡游'}</button>
          <button className="rounded-lg px-3 py-2 hover:bg-slate-800" aria-pressed={showSurroundingBuildings} onClick={() => setShowSurroundingBuildings(v => !v)}>{showSurroundingBuildings ? '隐藏周边' : '显示周边'}</button>
          <WeatherController value={weather} onChange={setWeather} />
        </div>
      )}

      {/* 1. 园区总览 HUD */}
      {viewLevel === 'overview' && (
        <OverviewHUD
          campus={activeCampus}
          onSelectBuilding={handleSelectBuilding}
          hoverInfo={hoverObject}
          themeMode={themeMode}
          onOpenSurveillance={() => setActiveSurveillanceCamera(ROOFTOP_CAMERAS[0])}
        />
      )}

      {/* 2. 楼栋分析 HUD */}
      {viewLevel === 'building' && (
        <BuildingHUD
          building={currentBuilding}
          campus={activeCampus}
          isAutoRotating={isAutoRotating}
          themeMode={themeMode}
          onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
          onDrillFloor={handleSelectFloor}
          onBack={() => setViewLevel('overview')}
        />
      )}

      {/* 3. 楼层剖切 HUD */}
      {viewLevel === 'floor' && (
        <>
          {/* Top Center: 返回上一层按钮 (返回楼栋分析) */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
            <button
              id="btn-floor-back-to-building"
              onClick={() => setViewLevel('building')}
              className={`backdrop-blur-md rounded-full px-3.5 py-1.5 flex items-center space-x-1.5 text-xs font-medium shadow-lg transition-all border cursor-pointer ${
                isLight
                  ? 'bg-white/95 hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-slate-200/40 hover:text-sky-600'
                  : 'bg-slate-900/85 hover:bg-slate-800 border-sky-500/30 text-slate-200 shadow-sky-950/40 hover:text-sky-300'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回上一层</span>
            </button>
          </div>

          <FloorCutControl
            selectedFloor={selectedFloor}
            floors={currentFloors}
            themeMode={themeMode}
            onSelectFloor={handleSelectFloor}
          />
        </>
      )}

      {/* 4. 房间空间查看 HUD */}
      {viewLevel === 'room' && !isImportedCampus && (
        <RoomDetailModal
          selectedRoom={currentRoom}
          rooms={currentRooms}
          floorLabel={currentFloor?.label || `F${selectedFloor}`}
          themeMode={themeMode}
          onSelectRoom={handleSelectRoom}
          onBackToFloor={() => setViewLevel('floor')}
          hoverInfo={hoverObject}
        />
      )}

      {viewLevel === 'room' && isImportedCampus && (
        <div className="absolute top-24 right-6 z-20 w-72 rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-5 text-slate-200">
          <h3 className="font-bold text-cyan-100">{currentBuilding.code} 栋 · F{selectedFloor}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">当前模型包含楼层结构和外立面，尚未绑定房间边界与业务信息。可先查看楼层剖切。</p>
          <button className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm" onClick={() => setViewLevel('floor')}>查看楼层剖切</button>
        </div>
      )}

      {/* 5. 场景漫游 HUD */}
      {viewLevel === 'roam' && !isImportedCampus && (
        <RoamingHUD
          perspective={roamPerspective}
          isPatrolling={isPatrolling}
          robotStatus={robotStatus}
          themeMode={themeMode}
          onTogglePerspective={p => setRoamPerspective(p)}
          onTogglePatrol={() => setIsPatrolling(!isPatrolling)}
          onExitRoam={() => setViewLevel('overview')}
        />
      )}

      {viewLevel === 'roam' && isImportedCampus && (
        <div className="absolute right-6 top-24 z-20 rounded-xl border border-cyan-500/20 bg-slate-950/90 p-4 text-sm text-cyan-100">
          <div className="mb-3">园区航拍巡游 · 8 栋建筑</div>
          <button className="rounded-lg bg-cyan-600 px-4 py-2" onClick={() => setIsPatrolling(v => !v)}>{isPatrolling ? '暂停巡游' : '继续巡游'}</button>
        </div>
      )}

      {/* 6. 楼顶上方高空监控实时画面调取模态框 */}
      {activeSurveillanceCamera && (
        <RooftopSurveillanceModal
          camera={activeSurveillanceCamera}
          themeMode={themeMode}
          onClose={() => setActiveSurveillanceCamera(null)}
        />
      )}

      {/* 7. 面向对象多园区切换模态框 */}
      {isCampusSwitcherOpen && (
        <CampusSwitcherModal
          currentCampus={activeCampus}
          themeMode={themeMode}
          onSelectCampus={handleSwitchCampus}
          onClose={() => setIsCampusSwitcherOpen(false)}
        />
      )}

      {/* 8. 面向对象实体资源树模态框 */}
      {isObjectExplorerOpen && (
        <ObjectExplorerModal
          campus={activeCampus}
          activeBuildingId={currentBuilding.id}
          activeFloorNumber={selectedFloor}
          activeRoomId={currentRoom?.id || ''}
          themeMode={themeMode}
          onClose={() => setIsObjectExplorerOpen(false)}
          onSelectObject={handleSelectObject}
        />
      )}
    </div>
  );
}
