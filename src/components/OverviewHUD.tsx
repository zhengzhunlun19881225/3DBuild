import React from 'react';
import {
  ShieldAlert,
  Users,
  Video,
  Activity,
  AlertTriangle,
  Cpu,
  Zap,
  TrendingUp,
  Droplets,
  Gauge,
  Wind,
  SunMedium,
  CheckCircle2,
  Building2,
  Radio
} from 'lucide-react';
import { CAMPUS_BUILDINGS } from '../data/campusData';
import { BuildingInfo, ThemeMode } from '../types';
import { CampusEntity, CAMPUS_AC_TECH } from '../models/campusModel';

interface OverviewHUDProps {
  campus?: CampusEntity;
  onSelectBuilding: (building: BuildingInfo) => void;
  hoverInfo: { name: string; type: string; x: number; y: number } | null;
  themeMode?: ThemeMode;
  onOpenSurveillance?: () => void;
}

export const OverviewHUD: React.FC<OverviewHUDProps> = ({
  campus,
  onSelectBuilding,
  hoverInfo,
  themeMode = 'light',
  onOpenSurveillance
}) => {
  const isLight = themeMode === 'light';
  const currentCampus = campus || CAMPUS_AC_TECH;
  const cctvFeeds = currentCampus.cctvFeeds;
  const buildingsList = currentCampus.buildings;

  // Live CCTV digital timestamp clock
  const [cctvTime, setCctvTime] = React.useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCctvTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* 3D Hover Tooltip overlay */}
      {hoverInfo && (
        <div
          id="building-hover-tooltip"
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          <div
            className={`backdrop-blur-md rounded-xl px-3.5 py-2 shadow-xl flex items-center space-x-2.5 animate-in fade-in zoom-in-95 duration-150 border ${
              isLight
                ? 'bg-white/95 border-sky-400 text-slate-800 shadow-slate-300/50'
                : 'bg-slate-900/90 border-sky-400/60 text-slate-100 shadow-sky-500/20'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
            <div>
              <div className={`text-xs font-bold ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
                {hoverInfo.name}
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {hoverInfo.type} · 点击进入钻取
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEFT HUD PANELS (Rich, balanced, full data density) */}
      <div className="absolute left-6 top-20 bottom-4 w-84 z-20 flex flex-col pointer-events-none space-y-2.5 overflow-y-auto pr-1 select-none scrollbar-none">
        {/* 1. 园区态势监测 */}
        <div
          className={`backdrop-blur-md rounded-2xl p-3.5 pointer-events-auto shadow-xl transition-colors duration-300 border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50 text-slate-800'
              : 'bg-slate-950/85 border-sky-500/20 shadow-slate-950/50 text-slate-100'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                园区综合态势监测
              </h3>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border ${
                isLight
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              实时在线
            </span>
          </div>

          {/* 4 Key Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  总入驻企业
                </span>
                <span className="text-[9px] font-mono text-emerald-600 font-semibold">+3.2%</span>
              </div>
              <div className="text-base font-bold text-sky-600 mt-0.5">
                384 <span className="text-xs font-normal text-slate-400">家</span>
              </div>
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  在园人员
                </span>
                <span className="text-[9px] font-mono text-cyan-600 font-semibold">峰值 16.4k</span>
              </div>
              <div className="text-base font-bold text-cyan-600 mt-0.5">
                14,892 <span className="text-xs font-normal text-slate-400">人</span>
              </div>
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  今日总能耗
                </span>
                <span className="text-[9px] font-mono text-amber-600 font-semibold">达标率94%</span>
              </div>
              <div className="text-base font-bold text-amber-500 mt-0.5">
                42.8 <span className="text-xs font-normal text-slate-400">MWh</span>
              </div>
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  车位实时余量
                </span>
                <span className="text-[9px] font-mono text-emerald-600 font-semibold">快充桩84%</span>
              </div>
              <div className="text-base font-bold text-emerald-600 mt-0.5">
                328 <span className="text-xs font-normal text-slate-400">/1800</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 设施运营 & 安全报警 (Rich data filled to eliminate empty space) */}
        <div
          className={`backdrop-blur-md rounded-2xl p-3.5 pointer-events-auto shadow-xl transition-colors duration-300 border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50 text-slate-800'
              : 'bg-slate-950/85 border-sky-500/20 shadow-slate-950/50 text-slate-100'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-sky-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                设施运营 & 安全健康
              </h3>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] font-semibold ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>
                无高危隐患
              </span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20">
                5大子系统
              </span>
            </div>
          </div>

          {/* 5 Comprehensive Subsystem Progress Bars */}
          <div className="mt-2.5 space-y-2">
            <div>
              <div className={`flex justify-between text-[11px] mb-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <span>给排水管网健康度</span>
                <span className="font-mono text-[10px]">
                  <span className="text-slate-400 mr-1.5">静压 0.42 MPa</span>
                  <span className="text-sky-600 font-bold">99.4%</span>
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '99.4%' }} />
              </div>
            </div>

            <div>
              <div className={`flex justify-between text-[11px] mb-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <span>供配电负荷平稳率</span>
                <span className="font-mono text-[10px]">
                  <span className="text-slate-400 mr-1.5">主进线 10.2 kV</span>
                  <span className="text-cyan-600 font-bold">98.1%</span>
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '98.1%' }} />
              </div>
            </div>

            <div>
              <div className={`flex justify-between text-[11px] mb-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <span>暖通中央空调自愈率</span>
                <span className="font-mono text-[10px]">
                  <span className="text-slate-400 mr-1.5">COP能效 4.35</span>
                  <span className="text-indigo-600 font-bold">96.8%</span>
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '96.8%' }} />
              </div>
            </div>

            <div>
              <div className={`flex justify-between text-[11px] mb-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <span>消防烟感联动在线率</span>
                <span className="font-mono text-[10px]">
                  <span className="text-slate-400 mr-1.5">428/428 在线</span>
                  <span className="text-emerald-600 font-bold">100%</span>
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className={`flex justify-between text-[11px] mb-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <span>智能电梯群控效率</span>
                <span className="font-mono text-[10px]">
                  <span className="text-slate-400 mr-1.5">平均候梯 22s</span>
                  <span className="text-violet-600 font-bold">99.2%</span>
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                <div className="h-full bg-violet-500 rounded-full" style={{ width: '99.2%' }} />
              </div>
            </div>
          </div>

          {/* Live IoT Sensor Telemetry Strip */}
          <div className="grid grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/80 text-center">
            <div className={`p-1 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-slate-900/60'}`}>
              <span className="block text-[9px] text-slate-400">变压温升</span>
              <span className="text-[11px] font-mono font-bold text-amber-500">38.6°C</span>
            </div>
            <div className={`p-1 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-slate-900/60'}`}>
              <span className="block text-[9px] text-slate-400">水浸传感器</span>
              <span className="text-[11px] font-mono font-bold text-emerald-600">0 报警</span>
            </div>
            <div className={`p-1 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-slate-900/60'}`}>
              <span className="block text-[9px] text-slate-400">瞬时功率</span>
              <span className="text-[11px] font-mono font-bold text-sky-600">2,480kW</span>
            </div>
            <div className={`p-1 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-slate-900/60'}`}>
              <span className="block text-[9px] text-slate-400">闸机通行</span>
              <span className="text-[11px] font-mono font-bold text-cyan-600">1,280次</span>
            </div>
          </div>
        </div>

        {/* 3. 楼栋快捷选择 */}
        <div
          className={`backdrop-blur-md rounded-2xl p-3.5 pointer-events-auto shadow-xl transition-colors duration-300 border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50 text-slate-800'
              : 'bg-slate-950/85 border-sky-500/20 shadow-slate-950/50 text-slate-100'
          }`}
        >
          <div className="text-xs font-bold mb-2 flex items-center justify-between">
            <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>核心楼栋索引</span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              共 {buildingsList.length} 栋 · {currentCampus.modelSource === 'obj' ? '35 个楼层' : currentCampus.builtArea}
            </span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {buildingsList.map(b => (
              <button
                key={b.id}
                id={`btn-select-building-${b.id}`}
                onClick={() => onSelectBuilding(b)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left transition-all group ${
                  isLight
                    ? 'bg-slate-50 hover:bg-sky-50/80 border-slate-200 hover:border-sky-300 text-slate-800 shadow-sm'
                    : 'bg-slate-900/60 hover:bg-sky-950/70 border-slate-800 hover:border-sky-500/40 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                      isLight
                        ? 'bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white'
                        : 'bg-sky-500/20 text-sky-400 group-hover:bg-sky-500 group-hover:text-white'
                    }`}
                  >
                    {b.code.split('-')[0]}
                  </span>
                  <div>
                    <div
                      className={`text-xs font-medium ${
                        isLight ? 'text-slate-800 group-hover:text-sky-700' : 'text-slate-200 group-hover:text-sky-300'
                      }`}
                    >
                      {b.name}
                    </div>
                    <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {b.floorsCount}层 · {b.area}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-600 font-mono font-bold">{currentCampus.modelSource === 'obj' ? '查看' : `${b.occupancyRate}%`}</span>
                  <span className={`block text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{currentCampus.modelSource === 'obj' ? '楼栋模型' : '入驻率'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT HUD PANELS (Rich, balanced, data-dense) */}
      <div className="absolute right-6 top-20 bottom-4 w-84 z-20 flex flex-col pointer-events-none space-y-2.5 overflow-y-auto pr-1 select-none scrollbar-none">
        {/* 1. 视频安防巡视与 AI 智能视觉 (Rich data & telemetry) */}
        <div
          className={`backdrop-blur-md rounded-2xl p-3.5 pointer-events-auto shadow-xl transition-colors duration-300 border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50 text-slate-800'
              : 'bg-slate-950/85 border-sky-500/20 shadow-slate-950/50 text-slate-100'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-sky-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                全景视频监控 & AI 视觉
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-sky-500/10 text-sky-600 border border-sky-500/20">
                48 TOPS
              </span>
              <span className="flex items-center text-[10px] text-rose-500 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-1" />
                REC
              </span>
            </div>
          </div>

          {/* 6 Real CCTV Video Monitor Screens (2 columns x 3 rows) */}
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            {cctvFeeds.map(feed => (
              <div
                key={feed.id}
                onClick={onOpenSurveillance}
                title={`点击全屏查看 ${feed.id} ${feed.name} 实时监控画面`}
                className="relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 aspect-[16/10] group cursor-pointer shadow-md hover:ring-2 hover:ring-sky-400 hover:shadow-sky-500/20 transition-all select-none"
              >
                {/* 真实监控镜头实景 */}
                <img
                  src={feed.img}
                  alt={feed.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                />

                {/* 监控扫描线 CRT 滤镜 */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.7) 50%)',
                    backgroundSize: '100% 3px'
                  }}
                />

                {/* 监控边缘暗角渐变 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

                {/* 顶部监控 OSD：点位名称 + 录像红点指示 */}
                <div className="absolute top-1 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-mono text-white/95 drop-shadow z-10">
                  <span className="font-bold flex items-center gap-1 bg-black/60 backdrop-blur-xs px-1 py-0.2 rounded border border-white/10">
                    <span className="text-sky-400 font-extrabold">{feed.id}</span>
                    <span className="text-[7.5px] text-slate-300 truncate max-w-[62px]">{feed.name}</span>
                  </span>
                  <span className="flex items-center text-[7.5px] font-bold text-rose-400 bg-black/60 px-1 py-0.2 rounded border border-rose-500/30">
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping mr-0.5" />
                    REC
                  </span>
                </div>

                {/* 监控画面中心 AI 智能目标识别框 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="relative border border-emerald-400/80 bg-emerald-500/10 px-1 py-0.2 rounded text-[7px] font-mono text-emerald-300 backdrop-blur-[1px] shadow-sm">
                    {/* 4角标记 */}
                    <span className="absolute -top-0.5 -left-0.5 w-1 h-1 border-t border-l border-emerald-300" />
                    <span className="absolute -top-0.5 -right-0.5 w-1 h-1 border-t border-r border-emerald-300" />
                    <span className="absolute -bottom-0.5 -left-0.5 w-1 h-1 border-b border-l border-emerald-300" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-1 h-1 border-b border-r border-emerald-300" />
                    <span className="truncate max-w-[76px] block font-sans">{feed.target}</span>
                  </div>
                </div>

                {/* 底部监控 OSD：数字时钟 + 分辨率 */}
                <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[7px] font-mono text-emerald-400 drop-shadow z-10">
                  <span className="text-white/90 bg-black/60 px-1 py-0.2 rounded">
                    {cctvTime}
                  </span>
                  <span className="bg-black/60 text-sky-300 px-1 py-0.2 rounded border border-sky-400/20">
                    1080P
                  </span>
                </div>

                {/* 悬停放大蒙层 */}
                <div className="absolute inset-0 bg-sky-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                  <span className="text-[9px] text-white font-bold bg-black/75 px-1.5 py-0.5 rounded-md border border-white/20 shadow">
                    点击放大
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. 园区微气候与环境气象监测 (Rich new environment card) */}
        <div
          className={`backdrop-blur-md rounded-2xl p-3.5 pointer-events-auto shadow-xl transition-colors duration-300 border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50 text-slate-800'
              : 'bg-slate-950/85 border-sky-500/20 shadow-slate-950/50 text-slate-100'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <SunMedium className="w-4 h-4 text-amber-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                园区微气候气象站
              </h3>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              优良 AQI 32
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-2.5 text-center">
            <div className={`p-1.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
              <span className={`text-[9px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>室外温度</span>
              <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">24.2°C</div>
            </div>
            <div className={`p-1.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
              <span className={`text-[9px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>相对湿度</span>
              <div className="text-xs font-bold font-mono text-sky-600 mt-0.5">54%</div>
            </div>
            <div className={`p-1.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
              <span className={`text-[9px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>东南风速</span>
              <div className="text-xs font-bold font-mono text-cyan-600 mt-0.5">2.8 m/s</div>
            </div>
            <div className={`p-1.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
              <span className={`text-[9px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>光照辐射</span>
              <div className="text-xs font-bold font-mono text-amber-500 mt-0.5">640 W/m²</div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] font-mono px-1">
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              屋顶光伏功率: <strong className="text-amber-500 font-bold">418 kW</strong>
            </span>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
              负氧离子: <strong className="text-emerald-600 font-bold">1,850</strong>/cm³
            </span>
          </div>
        </div>

        {/* 3. 运维工单分布 & 机器人巡更 */}
        <div
          className={`backdrop-blur-md rounded-2xl p-3.5 pointer-events-auto shadow-xl transition-colors duration-300 border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50 text-slate-800'
              : 'bg-slate-950/85 border-sky-500/20 shadow-slate-950/50 text-slate-100'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                运维事件统计 & 闭环
              </h3>
            </div>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              今日 48 件 · 响应 3.8m
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            {/* Visual Ring representation */}
            <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke={isLight ? '#e2e8f0' : '#334155'} strokeWidth="3.5" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeDasharray="52 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="28 100" strokeDashoffset="-52" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="15 100" strokeDashoffset="-80" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="5 100" strokeDashoffset="-95" />
              </svg>
              <div className="absolute text-center">
                <span className={`text-xs font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>97.8%</span>
                <span className={`block text-[8px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>办结率</span>
              </div>
            </div>

            <div className={`text-[11px] space-y-1 pl-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>能耗管理 (52%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>物业报修 (28%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>保洁绿化 (15%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>访客预约 (5%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
