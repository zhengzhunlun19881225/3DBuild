import { useEffect, useRef, useState } from 'react';
import { CloudRain, Snowflake, Sun, X, CloudSun, RotateCcw, Pause, Play } from 'lucide-react';
import { DEFAULT_WEATHER, WeatherSettings } from '../types/weather';

export function WeatherController({ value, onChange }: {
  value: WeatherSettings; onChange: (value: WeatherSettings) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const update = (patch: Partial<WeatherSettings>) => onChange({ ...value, ...patch });
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  const modes = [
    { mode: 'clear' as const, label: '晴天', icon: Sun },
    { mode: 'rain' as const, label: '下雨', icon: CloudRain },
    { mode: 'snow' as const, label: '下雪', icon: Snowflake },
  ];
  const active = value.mode !== 'clear';
  const Icon = value.mode === 'rain' ? CloudRain : value.mode === 'snow' ? Snowflake : CloudSun;
  return <div ref={root} className="absolute left-full top-0 ml-3">
    <button ref={trigger} id="btn-weather-controller" title="天气控制器" aria-label="天气控制器" aria-expanded={open} aria-controls="weather-settings" onClick={() => setOpen(v => !v)}
      className={`relative flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur transition ${open || active ? 'border-cyan-400/60 bg-cyan-950/95 text-cyan-200 shadow-lg shadow-cyan-500/10' : 'border-cyan-500/25 bg-slate-950/90 text-slate-300 hover:border-cyan-400 hover:text-cyan-200'}`}>
      <Icon size={19} />
      {active && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300" />}
    </button>
    {open && <section id="weather-settings" role="dialog" aria-label="天气控制器设置" className="absolute right-0 top-14 w-[304px] max-w-[calc(100vw-32px)] rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-4 text-slate-200 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div><h2 className="flex items-center gap-2 text-sm font-semibold text-cyan-50"><CloudSun size={16} className="text-cyan-400" />天气控制器</h2><p className="mt-1 text-[10px] tracking-widest text-slate-500">园区环境模拟</p></div>
        <button ref={close} aria-label="关闭天气设置" onClick={() => { setOpen(false); trigger.current?.focus(); }} className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={16} /></button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="天气类型">
        {modes.map(({ mode, label, icon: ModeIcon }) => <button key={mode} aria-pressed={value.mode === mode} onClick={() => update({mode, paused: false})} className={`flex flex-col items-center gap-2 rounded-xl border py-3 text-xs transition ${value.mode === mode ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200' : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'}`}><ModeIcon size={21} />{label}</button>)}
      </div>
      <fieldset disabled={!active} className="mt-5 space-y-4 disabled:opacity-40">
        <label className="block text-xs"><span className="mb-2 flex justify-between"><span>{value.mode === 'snow' ? '降雪强度' : '降雨强度'}</span><output className="font-mono text-cyan-300">{Math.round(value.intensity * 100)}%</output></span><input aria-label="降水强度" type="range" min="0" max="100" value={Math.round(value.intensity * 100)} onChange={e => update({intensity: Number(e.target.value)/100})} className="w-full accent-cyan-400" /></label>
        <label className="block text-xs"><span className="mb-2 flex justify-between"><span>风力</span><output className="font-mono text-cyan-300">{Math.round(value.wind * 100)}%</output></span><input aria-label="风力" type="range" min="0" max="100" value={Math.round(value.wind * 100)} onChange={e => update({wind: Number(e.target.value)/100})} className="w-full accent-cyan-400" /></label>
        <div className="border-t border-slate-800 pt-4">
          <label className="flex cursor-pointer items-center justify-between text-xs"><span>{value.mode === 'snow' ? '地面积雪' : '地面湿润与涟漪'}</span><input aria-label="地面效果" type="checkbox" checked={value.groundEffect} onChange={e => update({groundEffect: e.target.checked})} className="h-4 w-4 accent-cyan-400" /></label>
          <label className={`mt-4 block text-xs ${!value.groundEffect ? 'opacity-40' : ''}`}><span className="mb-2 flex justify-between"><span>{value.mode === 'snow' ? '积雪覆盖' : '地面湿润程度'}</span><output className="font-mono text-cyan-300">{Math.round(value.coverage * 100)}%</output></span><input aria-label="地面覆盖程度" type="range" min="0" max="100" disabled={!value.groundEffect} value={Math.round(value.coverage * 100)} onChange={e => update({coverage: Number(e.target.value)/100})} className="w-full accent-cyan-400" /></label>
        </div>
      </fieldset>
      <div className="mt-5 flex gap-2 border-t border-slate-800 pt-3">
        <button disabled={!active} onClick={() => update({paused: !value.paused})} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-800/80 py-2 text-xs disabled:opacity-40">{value.paused ? <Play size={13}/> : <Pause size={13}/>} {value.paused ? '继续天气' : '暂停天气'}</button>
        <button onClick={() => onChange({...DEFAULT_WEATHER})} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 py-2 text-xs hover:bg-slate-800"><RotateCcw size={13}/>恢复晴天</button>
      </div>
      <p className="mt-3 text-[10px] leading-4 text-slate-500">{value.mode === 'clear' ? '选择雨或雪，实时预览降水与地面效果。' : value.mode === 'snow' ? '雪花随风飘落，地面与屋顶呈现积雪。' : '雨丝随风落下，路面产生湿润反光与涟漪。'}</p>
    </section>}
  </div>;
}
