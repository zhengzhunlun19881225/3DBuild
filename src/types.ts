export type ViewLevel = 'overview' | 'building' | 'floor' | 'room' | 'roam' | '3dgs' | 'gis';

export type RoamPerspective = 'fpv' | 'tpv'; // First Person View or Third Person View

export type ThemeMode = 'light' | 'dark';

export interface BuildingInfo {
  id: string;
  name: string;
  code: string;
  type: string;
  floorsCount: number;
  area: string;
  occupancyRate: number;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  description: string;
  status: 'normal' | 'warning' | 'optimal';
  energyLevel: string;
}

export interface IndustryShare {
  name: string;
  percentage: number;
  color: string;
  revenueShare: string;
}

export interface AirQualityData {
  aqi: number;
  aqiLevel: '优' | '良' | '轻度污染';
  pm25: number;
  pm10: number;
  co: number;
  so2: number;
  no2: number;
  temp: number;
  humidity: number;
}

export interface WeeklyEnergy {
  day: string;
  electricity: number; // kWh
  water: number;       // t
  cooling: number;     // kWh
}

export interface RoomData {
  id: string;
  floor: number;
  roomNumber: string;
  enterpriseName: string;
  category: '研发办公' | '会议中心' | '前沿实验' | '休闲配套' | '基础设施';
  usableArea: number; // ㎡
  headcount: number;  // 人
  temperature: number; // °C
  humidity: number;    // %
  dailyRent: number;   // 元/㎡/天
  contractExpiry: string;
  powerUsage: number;  // kWh/天
  status: '正常办公' | '会议进行中' | '恒温恒湿中' | '闲置维护';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export interface FloorInfo {
  floorNumber: number;
  label: string;
  height: number;
  purpose: string;
  tenantCount: number;
  area: number;
  energyToday: number;
  rooms: RoomData[];
}

export interface RobotStatus {
  id: string;
  model: string;
  speed: number; // km/h
  battery: number; // %
  heading: number; // deg
  status: 'patrolling' | 'inspecting' | 'charging' | 'idle';
  currentWaypoint: string;
  totalWaypoints: number;
  lidarStatus: 'OK' | 'CALIBRATING';
  thermalStatus: 'NORMAL' | 'ALERT';
  signal: string; // e.g. '5G - 12ms'
}
