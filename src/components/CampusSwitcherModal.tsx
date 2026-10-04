import React from 'react';
import { CampusEntity, ALL_CAMPUSES } from '../models/campusModel';
import { ThemeMode } from '../types';
import {
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  Gauge,
  Trees,
  Factory
} from 'lucide-react';

interface CampusSwitcherModalProps {
  currentCampus: CampusEntity;
  themeMode?: ThemeMode;
  onSelectCampus: (campus: CampusEntity) => void;
  onClose: () => void;
}

export const CampusSwitcherModal: React.FC<CampusSwitcherModalProps> = ({
  currentCampus,
  themeMode = 'light',
  onSelectCampus,
  onClose
}) => {
  const isLight = themeMode === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border transition-all ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
            : 'bg-slate-950/95 border-sky-500/30 text-slate-100 shadow-sky-950/80'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-md">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-900'}`}>
                <Sparkles className="w-5 h-5 text-sky-500" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                切换园区 · 面向对象数字化孪生基座
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                系统已全面解耦为面向对象实体架构，可随时无缝接入加载不同地域的工业与科技智慧园区
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

        {/* Campus Cards List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {ALL_CAMPUSES.map(campus => {
            const isCurrent = currentCampus.id === campus.id;

            return (
              <div
                key={campus.id}
                onClick={() => {
                  onSelectCampus(campus);
                  onClose();
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                    : isLight
                    ? 'border-slate-200 bg-slate-50/70 hover:border-sky-300 hover:bg-sky-50/30'
                    : 'border-slate-800 bg-slate-900/60 hover:border-sky-500/50 hover:bg-slate-900'
                }`}
              >
                {/* Active Marker */}
                {isCurrent && (
                  <div className="absolute top-4 right-4 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>当前运行中</span>
                  </div>
                )}

                <div className="flex items-start justify-between pr-24">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className={`text-base font-bold ${isCurrent ? 'text-sky-600' : isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                        {campus.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/20 font-bold">
                        {campus.code}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
                        {campus.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-sky-600 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{campus.city} · {campus.district}</span>
                    </div>

                    <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {campus.description}
                    </p>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t text-xs ${
                    isLight ? 'border-slate-200/80' : 'border-slate-800'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white' : 'bg-slate-950/60'}`}>
                    <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>占地 / 建筑面积</span>
                    <span className="font-mono font-bold text-sky-600">{campus.totalArea} / {campus.builtArea}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white' : 'bg-slate-950/60'}`}>
                    <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>入驻企业 / 人数</span>
                    <span className="font-mono font-bold text-cyan-600">{campus.enterpriseCount} 家 · {campus.totalHeadcount} 人</span>
                  </div>
                  <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white' : 'bg-slate-950/60'}`}>
                    <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>绿化率 / 能效认证</span>
                    <span className="font-mono font-bold text-emerald-600">{campus.greenRate} · {campus.energyGrade}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl ${isLight ? 'bg-white' : 'bg-slate-950/60'}`}>
                    <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>3D实体建筑群</span>
                    <span className="font-mono font-bold text-indigo-600">{campus.buildings.length} 栋数字孪生单体</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-sky-600 pt-1">
                  <span>{campus.tagline}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isCurrent ? '当前正处于此园区' : '点击切换至此园区'} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-slate-900 text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>面向对象架构已自动解耦园区配置、3D建筑坐标、BIM层级与物联遥测</span>
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
