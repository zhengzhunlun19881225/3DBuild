import React from 'react';
import {
  BuildingInfo,
  IndustryShare,
  AirQualityData,
  WeeklyEnergy,
  ThemeMode
} from '../types';
import { CampusEntity } from '../models/campusModel';
import {
  B1A_INDUSTRY_SHARES,
  B1A_AIR_QUALITY,
  B1A_WEEKLY_ENERGY,
  B1A_FOOTFALL_TREND,
  B1A_METRICS
} from '../data/campusData';
import {
  Building2,
  Wind,
  Zap,
  Users,
  TrendingUp,
  DollarSign,
  Layers,
  Car,
  Video,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface BuildingHUDProps {
  building: BuildingInfo;
  campus?: CampusEntity;
  isAutoRotating: boolean;
  themeMode?: ThemeMode;
  onToggleAutoRotate: () => void;
  onDrillFloor: (floorNum: number) => void;
  onBack?: () => void;
}

export const BuildingHUD: React.FC<BuildingHUDProps> = ({
  building,
  campus,
  isAutoRotating,
  themeMode = 'light',
  onToggleAutoRotate,
  onDrillFloor,
  onBack
}) => {
  const isLight = themeMode === 'light';

  if (campus?.modelSource === 'obj') {
    const floors = campus.floorsMap[building.id] || [];
    return <div className="absolute left-6 top-24 z-20 w-72 rounded-2xl border border-cyan-500/25 bg-slate-950/90 p-5 text-slate-200 shadow-2xl backdrop-blur">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-200"><ArrowLeft size={14} /> 返回园区总览</button>
      <div className="text-[10px] tracking-[0.25em] text-cyan-500">BUILDING / {building.code}</div>
      <h2 className="mt-2 text-2xl font-semibold text-white">{building.name}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{building.floorsCount} 个楼层已识别。点击下方楼层，或点击建筑外立面，查看结构剖切。</p>
      <div className="my-5 border-t border-slate-800" />
      <div className="mb-3 text-xs text-cyan-100">楼层结构</div>
      <div className="grid grid-cols-4 gap-2">{floors.map(f => <button key={f.floorNumber} onClick={() => onDrillFloor(f.floorNumber)} className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 py-3 text-xs font-mono text-cyan-100 hover:bg-cyan-500/30">{f.label}</button>)}</div>
      <p className="mt-5 text-xs leading-5 text-slate-500">建筑面积、入驻信息和房间数据待绑定。模型比例为估算值。</p>
      <button onClick={onToggleAutoRotate} className="mt-5 w-full rounded-lg border border-slate-700 py-2 text-xs hover:bg-slate-800">{isAutoRotating ? '停止旋转' : '旋转查看建筑'}</button>
    </div>;
  }

  const industryShares = campus?.industryShares || B1A_INDUSTRY_SHARES;
  const airQuality = campus?.airQuality || B1A_AIR_QUALITY;
  const weeklyEnergy = campus?.weeklyEnergy || B1A_WEEKLY_ENERGY;
  const footfallTrend = campus?.footfallTrend || B1A_FOOTFALL_TREND;
  const metrics = campus?.metrics || B1A_METRICS;

  // Peak for footfall scaling
  const maxFootfall = Math.max(...footfallTrend.map(t => t.count));
  // Peak for energy scaling
  const maxEnergy = Math.max(...weeklyEnergy.map(e => e.electricity));

  return (
    <>
      {/* Top Controls: Back button + 3D Showroom Rotation toggle */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto flex items-center space-x-2.5">
        {onBack && (
          <button
            id="btn-building-back-to-overview"
            onClick={onBack}
            className={`backdrop-blur-md rounded-full px-3.5 py-1.5 flex items-center space-x-1.5 text-xs font-medium shadow-lg transition-all border cursor-pointer ${
              isLight
                ? 'bg-white/95 hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-slate-200/40 hover:text-sky-600'
                : 'bg-slate-900/85 hover:bg-slate-800 border-sky-500/30 text-slate-200 shadow-sky-950/40 hover:text-sky-300'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回上一层</span>
          </button>
        )}

        <div
          className={`backdrop-blur-md rounded-full px-4 py-1.5 flex items-center space-x-3 text-xs shadow-lg transition-colors border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 text-slate-700 shadow-slate-200/40'
              : 'bg-slate-900/80 border-sky-500/30 text-slate-200 shadow-sky-950/40'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="font-medium">3D展厅立面展示模式</span>
          </div>
          <button
            id="btn-toggle-rotate"
            onClick={onToggleAutoRotate}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isAutoRotating
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : isLight
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoRotating ? '暂停缓转' : '开启缓转'}</span>
          </button>
        </div>
      </div>

      {/* LEFT PANEL: 入住行业分析 (服务业, 金融业, 政府, 工作室, 零售) */}
      <div className="absolute left-6 top-20 bottom-4 w-84 z-20 flex flex-col justify-between pointer-events-none space-y-2.5 overflow-y-auto pr-1 select-none scrollbar-none">
        <div
          className={`backdrop-blur-md rounded-2xl p-4 pointer-events-auto shadow-2xl transition-colors duration-300 border ${
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
              <Building2 className="w-4 h-4 text-sky-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                {building.code} 入驻行业分析
              </h3>
            </div>
            <span className={`text-[10px] font-mono ${isLight ? 'text-sky-700 font-bold' : 'text-sky-400'}`}>
              100% 满额核验
            </span>
          </div>

          {/* Industry Distribution Bars */}
          <div className="mt-3.5 space-y-2.5">
            {industryShares.map(ind => (
              <div key={ind.name} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    {ind.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                      {ind.revenueShare}
                    </span>
                    <span className={`text-xs font-bold font-mono ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
                      {ind.percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden p-0.5 ${isLight ? 'bg-slate-200' : 'bg-slate-800/80'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${ind.percentage}%`,
                      backgroundColor: ind.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中间: 建筑核心运营综合指标 (Moved from bottom panel as requested in Image 1) */}
        <div
          className={`backdrop-blur-md rounded-2xl p-3.5 pointer-events-auto shadow-2xl transition-colors duration-300 border ${
            isLight
              ? 'bg-white/90 border-slate-200/90 shadow-slate-200/50 text-slate-800'
              : 'bg-slate-950/85 border-sky-500/20 shadow-slate-950/50 text-slate-100'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2 border-b mb-2.5 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-sky-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                建筑核心综合运营指标
              </h3>
            </div>
            <span className={`text-[10px] font-mono ${isLight ? 'text-sky-700 font-bold' : 'text-sky-400'}`}>
              综合核算
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* 1. 综合年总产值/收入 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-sky-50 border border-sky-200 text-sky-600' : 'bg-sky-500/10 border border-sky-500/30 text-sky-400'
                }`}
              >
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  综合年总产值/收入
                </span>
                <div className={`text-xs font-bold font-mono truncate ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
                  {metrics.comprehensiveIncome}
                </div>
              </div>
            </div>

            {/* 2. 标准商务房间数 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-cyan-50 border border-cyan-200 text-cyan-600' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  标准商务房间数
                </span>
                <div className={`text-xs font-bold font-mono truncate ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                  {metrics.roomCount}
                </div>
              </div>
            </div>

            {/* 3. 智慧车位数 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-indigo-50 border border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                }`}
              >
                <Car className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  智慧车位数
                </span>
                <div className={`text-xs font-bold font-mono truncate ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                  {metrics.parkingSpaces}
                </div>
              </div>
            </div>

            {/* 4. 智能远程会议室 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                }`}
              >
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  智能远程会议室
                </span>
                <div className={`text-xs font-bold font-mono truncate ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                  {metrics.meetingRooms}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 下方: 人流趋势 (24h Trend) */}
        <div
          className={`backdrop-blur-md rounded-2xl p-4 pointer-events-auto shadow-2xl transition-colors duration-300 border ${
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
              <Users className="w-4 h-4 text-cyan-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                人流趋势 (今日实时)
              </h3>
            </div>
            <span className={`text-[10px] font-mono ${isLight ? 'text-cyan-700 font-bold' : 'text-cyan-400'}`}>
              峰值 3,380 人/h
            </span>
          </div>

          {/* Simple crisp SVG Area / Curve Chart */}
          <div className="mt-3 h-28 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 90">
              <defs>
                <linearGradient id="footfallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={isLight ? 0.35 : 0.45} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke={isLight ? '#e2e8f0' : '#334155'} strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="0" y1="50" x2="300" y2="50" stroke={isLight ? '#e2e8f0' : '#334155'} strokeDasharray="3 3" strokeWidth="0.8" />
              <line x1="0" y1="80" x2="300" y2="80" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1" />

              {/* Points calculation */}
              {(() => {
                const pts = footfallTrend.map((item, idx) => {
                  const x = (idx / (footfallTrend.length - 1)) * 300;
                  const y = 80 - (item.count / maxFootfall) * 65;
                  return { x, y, count: item.count };
                });

                const linePath = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                const areaPath = `${linePath} L 300 80 L 0 80 Z`;

                return (
                  <>
                    <path d={areaPath} fill="url(#footfallGrad)" />
                    <path d={linePath} fill="none" stroke="#0284c7" strokeWidth="2.5" />
                    {pts.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="#0284c7"
                        stroke={isLight ? '#ffffff' : '#0f172a'}
                        strokeWidth="1.5"
                      />
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* X-axis labels */}
            <div className={`flex justify-between text-[9px] mt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {footfallTrend.filter((_, i) => i % 2 === 0).map(t => (
                <span key={t.time}>{t.time}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: 空气质量分析 (AQI, PM2.5, PM10, CO, SO2, NO2) & 周能耗图 */}
      <div className="absolute right-6 top-20 bottom-4 w-84 z-20 flex flex-col justify-between pointer-events-none space-y-2.5 overflow-y-auto pr-1 select-none scrollbar-none">
        {/* 空气质量分析 */}
        <div
          className={`backdrop-blur-md rounded-2xl p-4 pointer-events-auto shadow-2xl transition-colors duration-300 border ${
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
              <Wind className="w-4 h-4 text-emerald-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                楼宇环境与空气质量
              </h3>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isLight
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              AQI {airQuality.aqi} · {airQuality.aqiLevel}
            </span>
          </div>

          {/* 6 metrics grid: PM2.5, PM10, CO, SO2, NO2, Temp/Humidity */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>PM2.5</span>
              <div className="text-sm font-bold text-emerald-600 mt-0.5">{airQuality.pm25}</div>
              <span className="text-[9px] text-slate-400">µg/m³</span>
            </div>

            <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>PM10</span>
              <div className="text-sm font-bold text-emerald-600 mt-0.5">{airQuality.pm10}</div>
              <span className="text-[9px] text-slate-400">µg/m³</span>
            </div>

            <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>一氧化碳 CO</span>
              <div className="text-sm font-bold text-sky-600 mt-0.5">{airQuality.co}</div>
              <span className="text-[9px] text-slate-400">mg/m³</span>
            </div>

            <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>二氧化硫 SO2</span>
              <div className="text-sm font-bold text-sky-600 mt-0.5">{airQuality.so2}</div>
              <span className="text-[9px] text-slate-400">µg/m³</span>
            </div>

            <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>二氧化氮 NO2</span>
              <div className="text-sm font-bold text-sky-600 mt-0.5">{airQuality.no2}</div>
              <span className="text-[9px] text-slate-400">µg/m³</span>
            </div>

            <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-900/70 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>温湿度</span>
              <div className="text-sm font-bold text-cyan-600 mt-0.5">{airQuality.temp}℃</div>
              <span className="text-[9px] text-slate-400">{airQuality.humidity}% RH</span>
            </div>
          </div>
        </div>

        {/* 周能耗图 (Weekly Energy) */}
        <div
          className={`backdrop-blur-md rounded-2xl p-4 pointer-events-auto shadow-2xl transition-colors duration-300 border ${
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
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className={`text-xs font-bold tracking-wide ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                周能耗监测分析
              </h3>
            </div>
            <span className={`text-[10px] font-mono ${isLight ? 'text-amber-600 font-bold' : 'text-amber-400'}`}>
              周用电 89.7 MWh
            </span>
          </div>

          {/* Bar chart for Monday to Sunday */}
          <div className="mt-3 flex items-end justify-between h-28 pt-2 px-1">
            {weeklyEnergy.map(item => {
              const hPercent = (item.electricity / maxEnergy) * 100;
              return (
                <div key={item.day} className="flex flex-col items-center flex-1 group">
                  <div className={`text-[9px] opacity-0 group-hover:opacity-100 transition-opacity font-mono mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {(item.electricity / 1000).toFixed(1)}k
                  </div>
                  <div className={`w-4 rounded-t overflow-hidden flex flex-col justify-end h-20 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                    <div
                      className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 group-hover:from-amber-500 group-hover:to-amber-300 rounded-t transition-all duration-300"
                      style={{ height: `${hPercent}%` }}
                    />
                  </div>
                  <span className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
