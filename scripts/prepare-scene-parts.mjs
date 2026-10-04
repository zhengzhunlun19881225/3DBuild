import { open, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { defaultScene } from '../integrations/3dgs/src/default-scene.js';

const directory = new URL('../public/3dgs/', import.meta.url);
await mkdir(new URL('scene-parts/', directory), { recursive: true });
const file = await open(new URL('scene.ply', directory), 'r');
const parts = [], hash = createHash('sha256');
let total = 0;
try {
  while (true) {
    const buffer = Buffer.alloc(64 * 1024 * 1024);
    const { bytesRead } = await file.read(buffer, 0, buffer.length, total);
    if (!bytesRead) break;
    const bytes = buffer.subarray(0, bytesRead);
    hash.update(bytes);
    const url = `scene-parts/part-${String(parts.length).padStart(2, '0')}.bin`;
    await writeFile(new URL(url, directory), bytes);
    parts.push({ url, bytes: bytesRead, sha256: createHash('sha256').update(bytes).digest('hex') });
    total += bytesRead;
  }
} finally { await file.close(); }
if (total !== defaultScene.expectedBytes || hash.digest('hex') !== defaultScene.version) throw new Error('PLY differs from the collision scene version.');
await writeFile(new URL('scene.parts.json', directory), JSON.stringify({ version: 1, bytes: total, sourceSha256: defaultScene.version, parts }, null, 2));
console.log(`Prepared ${parts.length} verified scene parts (${total} bytes).`);
