import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { downloadScene } from '../src/scene-download.js';

const buffers = [Buffer.from('original-'), Buffer.from('scene-data')];
const source = Buffer.concat(buffers);
const digest = value => createHash('sha256').update(value).digest('hex');
const manifest = { version: 1, sourceSha256: digest(source), parts: buffers.map((bytes, index) => ({ url: `scene-parts/part-${index}.bin`, bytes: bytes.length, sha256: digest(bytes) })) };
const options = { expectedBytes: source.length, expectedVersion: digest(source), retryDelayMs: 0 };
const fixture = (metadata = manifest, data = buffers) => async url => {
  const path = new URL(url).pathname;
  return path.endsWith('.json') ? Response.json(metadata) : new Response(data[Number(path.match(/part-(\d+)\.bin/)[1])]);
};

test('reassembles exact original bytes with cumulative progress', async () => {
  const progress = [];
  const blob = await downloadScene('https://example.com/3DBuild/3dgs/scene.parts.json', { ...options, fetchImpl: fixture(), onProgress: bytes => progress.push(bytes) });
  assert.deepEqual(Buffer.from(await blob.arrayBuffer()), source);
  assert.equal(progress.at(-1), source.length);
});
test('rejects mismatched collision version and unsafe part URLs', async () => {
  for (const metadata of [ { ...manifest, sourceSha256: 'wrong' }, { ...manifest, parts: [{ ...manifest.parts[0], url: '../secret' }, manifest.parts[1]] } ]) {
    await assert.rejects(downloadScene('https://example.com/scene.parts.json', { ...options, fetchImpl: fixture(metadata) }), /清单/);
  }
});
test('rejects corrupt content even when length matches', async () => {
  const corrupt = Buffer.from(buffers[0]); corrupt[0] ^= 1;
  await assert.rejects(downloadScene('https://example.com/scene.parts.json', { ...options, fetchImpl: fixture(manifest, [corrupt, buffers[1]]) }), /校验失败/);
});
test('retries incomplete parts before reconstruction', async () => {
  let failures = 0;
  const fetchImpl = async url => {
    if (new URL(url).pathname.endsWith('part-0.bin') && failures++ === 0) return new Response(buffers[0].subarray(1));
    return fixture()(url);
  };
  const blob = await downloadScene('https://example.com/scene.parts.json', { ...options, fetchImpl });
  assert.deepEqual(Buffer.from(await blob.arrayBuffer()), source);
  assert.equal(failures, 2);
});
test('aborted scene never produces a partial model', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(downloadScene('https://example.com/scene.parts.json', { ...options, signal: controller.signal, fetchImpl: fixture() }), { name: 'AbortError' });
});
