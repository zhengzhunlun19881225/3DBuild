import React, { useState } from 'react';
import {
  MapPin,
  Layers,
  Eye,
  EyeOff,
  Navigation,
  Compass,
  RotateCw,
  Maximize,
  Check,
  Building,
  Info,
  Video
} from 'lucide-react';
import { ThemeMode } from '../types';

interface AMapControlsProps {
  themeMode: ThemeMode;
  showLabels: boolean;
  showSurroundingBuildings: boolean;
  showRooftopSurveillance?: boolean;
  className?: string;
  isAutoRotating?: boolean;
  onToggleAutoRotate?: () => void;
  isRoaming?: boolean;
  onToggleRoam?: () => void;
  onToggleLabels: () => void;
  onToggleSurroundingBuildings: () => void;
  onToggleRooftopSurveillance?: () => void;
  onToggleTheme: () => void;
  onResetBearing: () => void;
  onOpenSurveillance?: () => void;
}

export const AMapControls: React.FC<AMapControlsProps> = ({
  themeMode,
  showLabels,
  showSurroundingBuildings,
  showRooftopSurveillance = true,
  className = 'absolute top-20 right-[372px] z-20 pointer-events-auto flex flex-col items-end space-y-2',
  isAutoRotating = false,
  onToggleAutoRotate,
  isRoaming = false,
  onToggleRoam,
  onToggleLabels,
  onToggleSurroundingBuildings,
  onToggleRooftopSurveillance,
  onToggleTheme,
  onResetBearing,
  onOpenSurveillance
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLight = themeMode === 'light';

  return (
    <div className={className}>
      <div className="relative flex flex-col space-y-2 items-end">
        {/* 1. 图层按钮 */}
        <button
          id="btn-amap-expand"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? '收起图层控制' : '高德地图图层控制'}
          className={`w-20 backdrop-blur-md rounded-xl shadow-lg border py-2 px-2.5 flex items-center justify-center space-x-1.5 transition-all text-xs font-semibold cursor-pointer ${
            isExpanded
              ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/30'
              : isLight
              ? 'bg-white/95 border-slate-200/90 shadow-slate-200/60 text-slate-700 hover:text-sky-600 hover:bg-white'
              : 'bg-slate-950/90 border-sky-400/30 shadow-sky-950/60 text-slate-200 hover:text-sky-300 hover:bg-slate-900'
          }`}
        >
          <Layers className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-sky-500'}`} />
          <span>图层</span>
        </button>

        {/* 2. 旋转按钮 (放在图层下面，2个字) */}
        {onToggleAutoRotate && (
          <button
            id="btn-amap-rotate"
            onClick={onToggleAutoRotate}
            title={isAutoRotating ? '停止自动旋转' : '开启自动旋转'}
            className={`w-20 backdrop-blur-md rounded-xl shadow-lg border py-2 px-2.5 flex items-center justify-center space-x-1.5 transition-all text-xs font-semibold cursor-pointer ${
              isAutoRotating
                ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/30'
                : isLight
                ? 'bg-white/95 border-slate-200/90 shadow-slate-200/60 text-slate-700 hover:text-sky-600 hover:bg-white'
                : 'bg-slate-950/90 border-sky-400/30 shadow-sky-950/60 text-slate-200 hover:text-sky-300 hover:bg-slate-900'
            }`}
          >
            <RotateCw
              className={`w-4 h-4 transition-transform ${
                isAutoRotating
                  ? 'text-white animate-[spin_4s_linear_infinite]'
                  : 'text-sky-500'
              }`}
            />
            <span>旋转</span>
          </button>
        )}

        {/* 3. 漫游按钮 (放在图层下面，2个字) */}
        {onToggleRoam && (
          <button
            id="btn-amap-roam"
            onClick={onToggleRoam}
            title={isRoaming ? '退出场景漫游' : '进入场景漫游'}
            className={`w-20 backdrop-blur-md rounded-xl shadow-lg border py-2 px-2.5 flex items-center justify-center space-x-1.5 transition-all text-xs font-semibold cursor-pointer ${
              isRoaming
                ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/30 ring-1 ring-sky-300'
                : isLight
                ? 'bg-white/95 border-slate-200/90 shadow-slate-200/60 text-slate-700 hover:text-sky-600 hover:bg-white'
                : 'bg-slate-950/90 border-sky-400/30 shadow-sky-950/60 text-slate-200 hover:text-sky-300 hover:bg-slate-900'
            }`}
          >
            <Compass className={`w-4 h-4 ${isRoaming ? 'text-white' : 'text-sky-500'}`} />
            <span>漫游</span>
          </button>
        )}

        {/* Expanded AMap Layer & Feature Controls Card */}
        {isExpanded && (
          <div
            className={`absolute right-full top-0 mr-3 w-72 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border transition-all animate-in fade-in slide-in-from-right-2 duration-200 ${
              isLight
                ? 'bg-white/95 border-slate-200/90 shadow-slate-300/40 text-slate-800'
                : 'bg-slate-950/95 border-sky-500/30 shadow-sky-950/70 text-slate-100'
            }`}
          >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-xs font-bold">高德底图定制属性</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              极简无商业杂标
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* 1. Label Cleanliness Toggle */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="font-medium text-[11px] flex items-center gap-1">
                  <span>地理道路标示</span>
                  <span className="text-[10px] text-sky-600 font-mono">（无杂标）</span>
                </div>
                <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {showLabels ? '显示科技大道与园区门禁' : '已隐藏全部文本标签'}
                </div>
              </div>
              <button
                id="btn-toggle-amap-labels"
                onClick={onToggleLabels}
                className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showLabels
                    ? isLight
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                      : 'bg-sky-500 text-white border-sky-400'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* 2. Surrounding City 3D Massing Toggle */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="font-medium text-[11px] flex items-center gap-1">
                  <span>周边城区建筑白模</span>
                  <span className="text-[10px] text-cyan-600 font-mono">3D GIS</span>
                </div>
                <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {showSurroundingBuildings ? '立体展示周边产业街区' : '仅聚焦本园区5栋核心楼'}
                </div>
              </div>
              <button
                id="btn-toggle-amap-buildings"
                onClick={onToggleSurroundingBuildings}
                className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showSurroundingBuildings
                    ? isLight
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                      : 'bg-sky-500 text-white border-sky-400'
                    : isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Rooftop Surveillance Layer Toggle (E 121°36'28" · N 31°12'09") */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="font-medium text-[11px] flex items-center gap-1">
                  <span>楼顶高空监控图层</span>
                  <span className="text-[10px] text-emerald-600 font-mono">RF 鹰眼</span>
                </div>
                <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {showRooftopSurveillance ? '已挂载3路高空全景光电云台' : '已隐藏楼顶监控光锥'}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {onOpenSurveillance && showRooftopSurveillance && (
                  <button
                    id="btn-open-cctv-modal"
                    onClick={onOpenSurveillance}
                    title="调取监控实时画面"
                    className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs transition-colors shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  id="btn-toggle-cctv-layer"
                  onClick={onToggleRooftopSurveillance}
                  className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    showRooftopSurveillance
                      ? isLight
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                        : 'bg-sky-500 text-white border-sky-400'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {showRooftopSurveillance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 4. AMap Theme Style */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="font-medium text-[11px]">高德底图色彩风格</div>
                <div className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isLight ? '远山黛 Whitesmoke (清新浅色)' : '极客蓝 Midnight (夜景深色)'}
                </div>
              </div>
              <button
                id="btn-toggle-amap-theme"
                onClick={onToggleTheme}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  isLight
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-sky-950 text-sky-300 border-sky-700 hover:bg-sky-900'
                }`}
              >
                {isLight ? '切换夜景' : '切换浅色'}
              </button>
            </div>

            {/* Geographic Meta Info */}
            <div className={`p-2 rounded-xl text-[10px] border leading-relaxed ${
              isLight ? 'bg-sky-50/70 border-sky-100 text-slate-600' : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-300 mb-0.5">
                <Info className="w-3 h-3" />
                <span>高德矢量底图规范说明</span>
              </div>
              <div>符合国家测绘地理信息标准，底图已自动过滤公共商业POI与餐饮娱乐嘈杂标注，纯净呈现规划路网、生态水系与园区电子围栏。</div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
