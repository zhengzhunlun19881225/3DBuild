export type WeatherMode = 'clear' | 'rain' | 'snow';

export interface WeatherSettings {
  mode: WeatherMode;
  intensity: number;
  wind: number;
  groundEffect: boolean;
  coverage: number;
  paused: boolean;
}

export const DEFAULT_WEATHER: WeatherSettings = {
  mode: 'clear', intensity: 0.65, wind: 0.25,
  groundEffect: true, coverage: 0.7, paused: false,
};
