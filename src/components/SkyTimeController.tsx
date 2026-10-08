import { useEffect, useRef, useState } from 'react';
import { Clock3, Sun, Sunrise, Sunset, MoonStar, Play, Pause, RotateCcw, X } from 'lucide-react';
import { DEFAULT_SKY, formatSkyTime, skyPeriod, SkySettings } from '../types/sky';

export function SkyTimeController({ value, onChange }: { value: SkySettings; onChange: (value: SkySettings) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null), close = useRef<HTMLButtonElement>(null);
  const update = (patch: Partial<SkySettings>) => onChange({ ...value, ...patch });
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const presets = [ { label: '日出', minutes: 6 * 60, Icon: Sunrise }, { label: '正午', minutes: 12 * 60, Icon: Sun }, { label: '日落', minutes: 18 * 60, Icon: Sunset }, { label: '夜晚', minutes: 22 * 60, Icon: MoonStar } ];
  return <div ref={root} className="absolute left-full top-0 ml-[68px]">
    <button ref={trigger} id="btn-sky-time-controller" title="天空时间控制器" aria-label="天空时间控制器" aria-expanded={open} aria-controls="sky-time-settings" onClick={() => setOpen(v => !v)}
      className={`relative flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur transition ${open || value.enabled ? 'border-cyan-400/60 bg-cyan-950/95 text-cyan-200 shadow-lg shadow-cyan-500/10' : 'border-cyan-500/25 bg-slate-950/90 text-slate-300 hover:border-cyan-400 hover:text-cyan-200'}`}>
      <Clock3 size={19}/>{value.playing && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse"/>}
    </button>
    {open && <section id="sky-time-settings" role="dialog" aria-label="天空时间控制器设置" className="absolute right-0 top-14 max-h-[calc(100vh-160px)] w-[320px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-4 text-slate-200 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="flex items-start justify-between"><div><h2 className="flex items-center gap-2 text-sm font-semibold text-cyan-50"><Clock3 size={16} className="text-cyan-400"/>天空时间控制器</h2><p className="mt-1 text-[10px] tracking-widest text-slate-500">昼夜环境模拟</p></div><button ref={close} aria-label="关闭天空时间设置" onClick={() => { setOpen(false); trigger.current?.focus(); }} className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"><X size={16}/></button></div>
      <label className="mt-4 flex cursor-pointer items-center justify-between text-xs"><span>启用天空球</span><input aria-label="启用天空球" type="checkbox" checked={value.enabled} onChange={e => update({enabled: e.target.checked, playing: false})} className="h-4 w-4 accent-cyan-400"/></label>
      <div className="mt-4 flex items-end justify-between"><span className="text-xs text-slate-400">{skyPeriod(value.minutes)} · 场景时间</span><output className="font-mono text-3xl font-semibold text-cyan-100" aria-label="当前场景时间">{formatSkyTime(value.minutes)}</output></div>
      <input aria-label="场景时间" aria-valuetext={formatSkyTime(value.minutes)} type="range" min="0" max="1439" step="1" value={Math.floor(value.minutes)} onChange={e => update({minutes: Number(e.target.value), enabled: true, playing: false})} className="mt-4 w-full accent-cyan-400"/>
      <div className="flex justify-between font-mono text-[10px] text-slate-500"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
      <div className="mt-4 grid grid-cols-4 gap-2">{presets.map(({label, minutes, Icon}) => <button key={label} aria-pressed={value.enabled && Math.abs(value.minutes - minutes) < 1} onClick={() => update({minutes, enabled:true, playing:false})} className={`flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-xs ${Math.abs(value.minutes - minutes) < 1 && value.enabled ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200' : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600'}`}><Icon size={17}/>{label}</button>)}</div>
      <div className="mt-4 flex gap-2"><button onClick={() => update({enabled:true, playing:!value.playing})} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-400/15 py-2 text-xs text-cyan-200">{value.playing ? <Pause size={13}/> : <Play size={13}/>} {value.playing ? '暂停播放' : '自动播放'}</button><label className="flex items-center gap-1.5 text-[10px] text-slate-400">一天 /<select aria-label="昼夜循环时长" value={value.cycleMinutes} onChange={e=>update({cycleMinutes:Number(e.target.value)})} className="rounded-lg border border-slate-700 bg-slate-900 px-1 py-2 text-xs text-slate-200">{[1,3,5,10].map(m=><option key={m} value={m}>{m} 分钟</option>)}</select></label></div>
      <label className="mt-4 block text-xs"><span className="mb-2 flex justify-between"><span>云量</span><output className="font-mono text-cyan-300">{Math.round(value.clouds*100)}%</output></span><input aria-label="天空云量" type="range" min="0" max="100" value={Math.round(value.clouds*100)} onChange={e=>update({clouds:Number(e.target.value)/100})} className="w-full accent-cyan-400"/></label>
      <div className="mt-4 border-t border-slate-800 pt-3"><button onClick={()=>onChange({...DEFAULT_SKY})} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 py-2 text-xs hover:bg-slate-800"><RotateCcw size={13}/>恢复默认</button><p className="mt-3 text-[10px] leading-4 text-slate-500">拖动时间，天空色彩与太阳光照同步变化。夜晚呈现星空，雨雪天气自动增加云层。</p></div>
    </section>}
  </div>;
}
