import React, { useState } from 'react';
import { Camera, ShieldCheck, AlertCircle, Radio, Eye, Video, Maximize2, X, RefreshCw } from 'lucide-react';
import { ThemeMode } from '../types';

export interface RooftopCameraNode {
  id: string;
  name: string;
  buildingCode: string;
  floorLevel: string;
  angle: string;
  resolution: string;
  fps: number;
  status: 'ONLINE' | 'PATROL' | 'WARNING';
  coverage: string;
  streamUrlPlaceholder?: string;
  presetView: string;
  bitrate: string;
}

export const ROOFTOP_CAMERAS: RooftopCameraNode[] = [
  {
    id: 'cam-b1a-01',
    name: 'B1-A 楼顶360°全景鹰眼 01',
    buildingCode: 'B1-A',
    floorLevel: 'RF 屋顶停机坪上方',
    angle: '360° 全景云台 (俯视45°)',
    resolution: '4K Ultra-HD (3840×2160)',
    fps: 30,
    status: 'ONLINE',
    coverage: '园区中心喷泉与南大门创新大道',
    presetView: '迎宾主景观与南门车道',
    bitrate: '8.4 Mbps'
  },
  {
    id: 'cam-b1a-02',
    name: 'B1-A 楼顶北向长焦夜视 02',
    buildingCode: 'B1-A',
    floorLevel: 'RF 楼顶设备平台',
    angle: '北向广角 (俯视30°)',
    resolution: '2K QHD (2560×1440)',
    fps: 30,
    status: 'ONLINE',
    coverage: '北侧科技大道与张家浜生态景观廊道',
    presetView: '北出入口及外围道路',
    bitrate: '4.8 Mbps'
  },
  {
    id: 'cam-b1a-03',
    name: 'B1-A 楼顶东侧红外热成像 03',
    buildingCode: 'B1-A',
    floorLevel: 'RF 信号塔顶端',
    angle: '东向巡回 (俯视35°)',
    resolution: '1080P 双光谱热成像',
    fps: 25,
    status: 'PATROL',
    coverage: '东侧申江南路及新能源充电站',
    presetView: '充换电场站防火监测',
    bitrate: '3.6 Mbps'
  }
];

interface SurveillanceModalProps {
  camera: RooftopCameraNode;
  themeMode: ThemeMode;
  onClose: () => void;
}

export const RooftopSurveillanceModal: React.FC<SurveillanceModalProps> = ({
  camera,
  themeMode,
  onClose
}) => {
  const isLight = themeMode === 'light';
  const [isPTZActive, setIsPTZActive] = useState(false);
  const [ptzPan, setPtzPan] = useState(128);
  const [ptzTilt, setPtzTilt] = useState(-34);
  const [zoomLevel, setZoomLevel] = useState(1.8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-sky-500/30 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{camera.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  实时推流中
                </span>
              </div>
              <div className={`text-[11px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                高德坐标: E 121°36'28" · N 31°12'09" | {camera.floorLevel}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Simulation Canvas / Viewport */}
        <div className="relative bg-slate-950 aspect-video w-full overflow-hidden flex flex-col justify-between p-4">
          {/* Mock CCTV Camera Feed Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-transparent to-slate-950/80 pointer-events-none" />

          {/* Grid lines simulating HUD overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Crosshair Target Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-16 h-16 border border-sky-400/80 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-sky-400 rounded-full animate-ping" />
            </div>
            <div className="absolute w-32 h-px bg-sky-400/50" />
            <div className="absolute h-32 w-px bg-sky-400/50" />
          </div>

          {/* Camera Telemetry Header */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-sky-400">
            <div className="flex items-center space-x-2 bg-slate-900/80 px-2 py-1 rounded border border-sky-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE CAM-HD</span>
              <span className="text-slate-400">|</span>
              <span>{camera.resolution}</span>
            </div>
            <div className="bg-slate-900/80 px-2 py-1 rounded border border-sky-500/20">
              BITRATE: {camera.bitrate} · {camera.fps} FPS
            </div>
          </div>

          {/* Live Simulated Scene Graphic */}
          <div className="relative z-10 my-auto text-center space-y-2 pointer-events-none">
            <div className="inline-block px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-sky-500/30 text-slate-200 text-xs">
              <div className="font-semibold text-sky-300">安宸商务园 · 楼顶全景监控高点视角</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                当前聚焦: {camera.coverage} (Zoom: {zoomLevel.toFixed(1)}x)
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <div>PTZ: PAN {ptzPan}° / TILT {ptzTilt}° / ZM {zoomLevel.toFixed(1)}X</div>
            <div className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> AI周界防侵入算力已就绪
            </div>
          </div>
        </div>

        {/* PTZ and Lens Adjustments Footer */}
        <div className={`p-3.5 border-t space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">云台操控 (PTZ)：</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPtzPan(p => p - 5)}
                  className={`px-2 py-1 rounded border text-xs ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  ◀ 左移
                </button>
                <button
                  onClick={() => setPtzPan(p => p + 5)}
                  className={`px-2 py-1 rounded border text-xs ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  右移 ▶
                </button>
                <button
                  onClick={() => setPtzTilt(t => Math.min(0, t + 4))}
                  className={`px-2 py-1 rounded border text-xs ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  ▲ 俯视上抬
                </button>
                <button
                  onClick={() => setPtzTilt(t => Math.max(-75, t - 4))}
                  className={`px-2 py-1 rounded border text-xs ${
                    isLight ? 'bg-white hover:bg-slate-100 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  ▼ 俯视下压
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-semibold">光学变焦：</span>
              <button
                onClick={() => setZoomLevel(z => Math.max(1, +(z - 0.5).toFixed(1)))}
                className={`px-2 py-1 rounded border text-xs ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                }`}
              >
                - 缩小
              </button>
              <span className="font-mono text-xs text-sky-600 font-bold">{zoomLevel.toFixed(1)}x</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(8, +(z + 0.5).toFixed(1)))}
                className={`px-2 py-1 rounded border text-xs ${
                  isLight ? 'bg-white hover:bg-slate-100 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                }`}
              >
                + 放大
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
