export interface SkySettings {
  enabled: boolean;
  minutes: number;
  playing: boolean;
  cycleMinutes: number;
  clouds: number;
}

export const DEFAULT_SKY: SkySettings = { enabled: true, minutes: 18 * 60, playing: false, cycleMinutes: 3, clouds: .35 };
export const SKY_STORAGE = 'campus-sky-time-v1';
export function formatSkyTime(minutes: number) {
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
export function skyPeriod(minutes: number) {
  const hour = minutes / 60;
  return hour < 5 || hour >= 19 ? '夜晚' : hour < 7 ? '日出' : hour < 17 ? '白天' : '日落';
}
export function readSkySettings(): SkySettings {
  try {
    const p = JSON.parse(localStorage.getItem(SKY_STORAGE) ?? 'null');
    if (p && typeof p.enabled === 'boolean' && Number.isFinite(p.minutes) && p.minutes >= 0 && p.minutes < 1440 &&
        [1, 3, 5, 10].includes(p.cycleMinutes) && Number.isFinite(p.clouds) && p.clouds >= 0 && p.clouds <= 1) {
      return { ...DEFAULT_SKY, enabled: p.enabled, minutes: p.minutes, cycleMinutes: p.cycleMinutes, clouds: p.clouds };
    }
  } catch {}
  return { ...DEFAULT_SKY };
}
