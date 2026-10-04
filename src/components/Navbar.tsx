import React from 'react';
import { ViewLevel, ThemeMode, BuildingInfo, RoomData } from '../types';
import { CampusEntity } from '../models/campusModel';
import {
  Building2,
  LayoutGrid,
  Scan,
  Globe2,
  RotateCcw,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Compass,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  viewLevel: ViewLevel;
  campus: CampusEntity;
  activeBuilding?: BuildingInfo;
  selectedFloor?: number;
  activeRoom?: RoomData | null;
  themeMode?: ThemeMode;
  isAutoRotating?: boolean;
  onToggleAutoRotate?: () => void;
  onNavigate: (level: ViewLevel) => void;
  onResetView: () => void;
  onToggleTheme?: () => void;
  onOpenCampusSwitcher: () => void;
  onOpenObjectExplorer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewLevel,
  campus,
  activeBuilding,
  selectedFloor = 5,
  activeRoom,
  themeMode = 'light',
  onNavigate,
  onResetView,
  onToggleTheme,
  onOpenCampusSwitcher,
  onOpenObjectExplorer
}) => {
  const isLight = themeMode === 'light';

  const navItems = [
    { id: 'overview' as ViewLevel, label: '园区总览', icon: LayoutGrid },
    { id: 'gis' as ViewLevel, label: 'GIS 园区', icon: Globe2 },
    { id: '3dgs' as ViewLevel, label: '3DGS', icon: Scan },
  ];

  return (
    <header
      id="digital-twin-navbar"
      className={`absolute top-0 left-0 right-0 z-30 pointer-events-auto h-16 backdrop-blur-md px-6 flex items-center justify-between transition-colors duration-300 shadow-md ${
        isLight
          ? 'bg-white/85 border-b border-slate-200/90 text-slate-800 shadow-slate-200/50'
          : 'bg-slate-950/80 border-b border-sky-500/20 text-slate-100 shadow-sky-950/30'
      }`}
    >
      {/* Left: Campus Selector Dropdown & Object-Oriented Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Campus Switcher Button (面向对象多园区切换) */}
        <button
          id="btn-switch-campus"
          onClick={onOpenCampusSwitcher}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer group shadow-sm ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-sky-400'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 hover:border-sky-500'
          }`}
          title="点击切换不同园区（兼容面向对象多园区模型）"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 flex items-center justify-center shrink-0">
            <div className={`w-full h-full rounded-[6px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
              <Building2 className="w-3.5 h-3.5 text-sky-500" />
            </div>
          </div>
          <span className="text-sm font-bold tracking-wide">{campus.name}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 font-bold border border-sky-500/20">
            {campus.code}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
        </button>

        {/* Object Hierarchy Breadcrumb (面向对象实体层级链路) */}
        <div className="hidden xl:flex items-center space-x-1.5 text-xs font-mono pl-2 border-l border-slate-300 dark:border-slate-800">
          <button
            onClick={() => onNavigate('overview')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              viewLevel === 'overview'
                ? 'text-sky-600 font-bold bg-sky-500/10 border border-sky-500/20'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            园区
          </button>

          {activeBuilding && !['overview', '3dgs', 'gis'].includes(viewLevel) && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <button
                onClick={() => onNavigate('building')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  viewLevel === 'building'
                    ? 'text-sky-600 font-bold bg-sky-500/10 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {activeBuilding.code} {activeBuilding.name.slice(0, 4)}
              </button>
            </>
          )}

          {(viewLevel === 'floor' || viewLevel === 'room') && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <button
                onClick={() => onNavigate('floor')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  viewLevel === 'floor'
                    ? 'text-cyan-600 font-bold bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                F{selectedFloor}
              </button>
            </>
          )}

          {viewLevel === 'room' && activeRoom && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="px-2 py-0.5 rounded-md text-sky-600 font-bold bg-sky-500/10 border border-sky-500/20">
                Room {activeRoom.roomNumber}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center: Nav Flow Tabs */}
      <nav
        className={`flex items-center space-x-1 p-1 rounded-xl border ${
          isLight
            ? 'bg-slate-100/90 border-slate-200/90'
            : 'bg-slate-900/80 border-slate-700/50'
        }`}
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = viewLevel === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 font-semibold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Object Explorer + Theme + Reset */}
      <div className="flex items-center space-x-2.5">
        {/* Object Tree / Hierarchy Explorer Button */}
        <button
          id="btn-open-object-explorer"
          onClick={onOpenObjectExplorer}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            isLight
              ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200 shadow-xs'
              : 'bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border-sky-500/30 shadow-xs'
          }`}
          title="打开面向对象空间资产资源树"
        >
          <Compass className="w-3.5 h-3.5 text-sky-500" />
          <span>对象资源树</span>
        </button>

        {/* Theme Mode Toggle (浅色皮肤 / 深色皮肤切换) */}
        {onToggleTheme && (
          <button
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            title={isLight ? '切换为深色科技皮肤' : '切换为浅色日间皮肤'}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              isLight
                ? 'bg-amber-50/80 hover:bg-amber-100/90 text-amber-800 border-amber-200/80 shadow-sm'
                : 'bg-slate-800/90 hover:bg-slate-700 text-sky-300 border-slate-700/80 shadow-sm'
            }`}
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>浅色皮肤</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-sky-400" />
                <span>深色皮肤</span>
              </>
            )}
          </button>
        )}

        {/* Reset View Button */}
        <button
          id="btn-reset-view"
          onClick={onResetView}
          title="复位三维视角"
          className={`p-2 rounded-lg transition-colors border cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
              : 'bg-slate-800/80 hover:bg-sky-600/40 text-slate-300 hover:text-sky-300 border-slate-700/50'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
