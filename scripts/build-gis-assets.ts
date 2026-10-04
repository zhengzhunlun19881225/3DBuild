import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createCampusMaterials } from '../src/materials/campusMaterials';

// GLTFExporter uses FileReader for binary buffers, including in Node.
globalThis.FileReader = class {
  result: ArrayBuffer | string = '';
  onloadend?: () => void;
  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.(); });
  }
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then(value => { this.result = `data:${blob.type};base64,${Buffer.from(value).toString('base64')}`; this.onloadend?.(); });
  }
} as any;

const out = new URL('../public/gis/', import.meta.url);
await mkdir(out, { recursive: true });
await cp(new URL('../node_modules/cesium/Build/Cesium/', import.meta.url), new URL('cesium/', out), { recursive: true });
await cp(new URL('../node_modules/cesium/LICENSE.md', import.meta.url), new URL('cesium/LICENSE.md', out));
const root = new OBJLoader().parse(await readFile(new URL('../campus_aerial_estimated_scale.obj', import.meta.url), 'utf8'));
const materials = createCampusMaterials();
materials.setTheme(true);
const groups = new Map<string, THREE.Group>();
for (const child of [...root.children]) {
  if (!(child instanceof THREE.Mesh)) continue;
  // Omit approximate context buildings; the GIS basemap supplies the surroundings.
  if (/SurroundingBuildings/.test(child.name)) continue;
  const code = child.name.match(/^Campus_(A|B1|B2|C1|C2|C3|D|E)_/)?.[1] ?? 'site';
  if (!groups.has(code)) { const group = new THREE.Group(); group.name = code; groups.set(code, group); }
  child.geometry.translate(-135.4, 0.3, -44);
  child.material = materials.forName(child.name);
  groups.get(code)!.add(child);
}
const manifest = [];
for (const [code, group] of groups) {
  const bounds = new THREE.Box3().setFromObject(group);
  const center = bounds.getCenter(new THREE.Vector3());
  const binary = await new GLTFExporter().parseAsync(group, { binary: true });
  await writeFile(new URL(`${code}.glb`, out), Buffer.from(binary as ArrayBuffer));
  manifest.push({ code, url: `${code}.glb`, center: center.toArray(), maxY: bounds.max.y, min: bounds.min.toArray(), max: bounds.max.toArray() });
}
await writeFile(new URL('models.json', out), JSON.stringify(manifest, null, 2));
materials.dispose();
console.log(`Exported ${manifest.length} GLB models and Cesium runtime.`);
