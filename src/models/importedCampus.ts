import metadata from '../data/importedCampus.json';
import type { BuildingInfo, FloorInfo } from '../types';

export const MODEL_SCALE = 0.32;
export const MODEL_OFFSET = [135.4, 0, 44] as const;
export const importedMetadata = metadata;
export const importedBuildings: BuildingInfo[] = metadata.map(b => ({
  id: `obj-${b.code}`, code: b.code, name: `${b.code} 栋`,
  type: '园区建筑', floorsCount: b.floors.length, area: '待绑定', occupancyRate: 0,
  position: [(b.min[0] + b.max[0]) / 2 - MODEL_OFFSET[0], 0, (b.min[2] + b.max[2]) / 2 - MODEL_OFFSET[2]].map(n => n * MODEL_SCALE) as [number, number, number],
  size: b.max.map((n, i) => (n - b.min[i]) * MODEL_SCALE) as [number, number, number],
  color: '#22d3ee', description: `${b.code} 栋 · 模型包含 ${b.floors.length} 个楼层；空间与运营信息待绑定。`,
  status: 'normal', energyLevel: '待绑定',
}));
export const importedFloors: Record<string, FloorInfo[]> = Object.fromEntries(metadata.map(b => [
  `obj-${b.code}`, b.floors.map(f => ({
    floorNumber: f.number, label: `F${f.number}`,
    height: f.min[1] * MODEL_SCALE, purpose: '模型结构楼层 · 业务信息待绑定',
    tenantCount: 0, area: 0, energyToday: 0, rooms: [],
  })).reverse(),
]));
