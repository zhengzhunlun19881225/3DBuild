import { unlink, readFile, stat, writeFile } from 'node:fs/promises';
const root = new URL('../dist/', import.meta.url);
await unlink(new URL('3dgs/scene.ply', root)).catch(error => { if (error.code !== 'ENOENT') throw error; });
const manifest = JSON.parse(await readFile(new URL('3dgs/scene.parts.json', root), 'utf8'));
for (const part of manifest.parts) {
  if ((await stat(new URL(`3dgs/${part.url}`, root))).size !== part.bytes) throw new Error(`Missing scene part: ${part.url}`);
}
await writeFile(new URL('.nojekyll', root), '');
console.log('Pages artifact ready; original PLY excluded, verified parts included.');
