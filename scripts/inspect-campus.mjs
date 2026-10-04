import fs from 'node:fs';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Box3 } from 'three';

// Re-run after replacing the OBJ. Bounds and floor groups come from geometry,
// not the old demo buildings. OBJ units are estimated, not surveyed dimensions.
const root = new OBJLoader().parse(fs.readFileSync(new URL('../campus_aerial_estimated_scale.obj', import.meta.url), 'utf8'));
const buildings = {};
for (const mesh of root.children) {
  const match = mesh.name.match(/^Campus_(A|B1|B2|C1|C2|C3|D|E)_/);
  if (!match) continue;
  const item = buildings[match[1]] ??= { bounds: new Box3(), floors: {} };
  const bounds = new Box3().setFromObject(mesh);
  item.bounds.union(bounds);
  const floor = mesh.name.match(/_F(\d+)_/);
  if (floor) (item.floors[Number(floor[1])] ??= new Box3()).union(bounds);
}
const boxData = box => ({ min: box.min.toArray(), max: box.max.toArray() });
const data = Object.entries(buildings).sort(([a], [b]) => a.localeCompare(b)).map(([code, item]) => ({
  code, ...boxData(item.bounds),
  floors: Object.entries(item.floors).map(([number, bounds]) => ({ number: Number(number), ...boxData(bounds) })),
}));
fs.writeFileSync(new URL('../src/data/importedCampus.json', import.meta.url), JSON.stringify(data, null, 2) + '\n');
console.log(`Indexed ${data.length} buildings, ${data.reduce((sum, b) => sum + b.floors.length, 0)} floors, ${root.children.length} objects.`);
