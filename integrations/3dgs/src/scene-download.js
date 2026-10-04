export function describeLoadError(error) {
  if (typeof error === 'string' && error.trim()) return error;
  if (error?.message) return String(error.message);
  if (error?.type === 'error') return '模型解析失败，请重试或重新导入模型。';
  return '下载或解析失败，请检查网络后重试。';
}

// Download once and hand Spark a verified local Blob, never a URL that was
// previously requested with Range. Some intermediary caches reuse the partial
// header response for the decoder's full-file request.
export async function downloadScene(url, {
  expectedBytes, expectedVersion, signal, onProgress = () => {}, fetchImpl = fetch,
  attempts = 3, retryDelayMs = 750,
} = {}) {
  if (new URL(url, globalThis.location?.href ?? 'http://localhost/').pathname.endsWith('.parts.json')) {
    const response = await fetchImpl(url, { signal });
    if (!response.ok) throw new Error(`场景清单加载失败（HTTP ${response.status}）`);
    const manifest = await response.json();
    if (manifest.version !== 1 || (expectedVersion && manifest.sourceSha256 !== expectedVersion) || !Array.isArray(manifest.parts) || !manifest.parts.length ||
        manifest.parts.length > 100 || manifest.parts.some(p => !/^scene-parts\/part-\d+\.bin$/.test(p.url) || !Number.isSafeInteger(p.bytes) || p.bytes <= 0 || !/^[a-f0-9]{64}$/.test(p.sha256)) ||
        manifest.parts.reduce((sum, p) => sum + p.bytes, 0) !== expectedBytes) {
      throw new Error('场景分片清单与模型版本不一致。');
    }
    const parts = [];
    let received = 0;
    for (const part of manifest.parts) {
      signal?.throwIfAborted();
      const partUrl = new URL(part.url, new URL(url, globalThis.location?.href ?? 'http://localhost/'));
      const blob = await downloadScene(partUrl.href, {
        expectedBytes: part.bytes, signal, fetchImpl, attempts, retryDelayMs,
        onProgress: (bytes, _, attempt) => onProgress(received + bytes, expectedBytes, attempt),
      });
      const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
      const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== part.sha256) throw new Error('场景分片校验失败，请重新加载。');
      parts.push(blob);
      received += blob.size;
    }
    signal?.throwIfAborted();
    return new Blob(parts, { type: 'application/octet-stream' });
  }
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    signal?.throwIfAborted();
    const requestUrl = new URL(url, globalThis.location?.href ?? 'http://localhost/');
    requestUrl.searchParams.set('complete', '1');
    requestUrl.searchParams.set('attempt', String(attempt));
    let reader;
    try {
      onProgress(0, expectedBytes || 0, attempt);
      const response = await fetchImpl(requestUrl.href, { cache: 'no-store', signal });
      if (response.status !== 200) {
        await response.body?.cancel();
        throw new Error(response.status === 206 ? '服务器返回了局部数据，正在重新下载完整模型。' : `模型下载失败（HTTP ${response.status}）`);
      }
      if (!response.body) throw new Error('服务器没有返回模型数据。');
      const total = expectedBytes || Number(response.headers.get('content-length')) || 0;
      const chunks = [];
      let received = 0;
      reader = response.body.getReader();
      while (true) {
        signal?.throwIfAborted();
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.byteLength;
        if (expectedBytes && received > expectedBytes) throw new Error('模型文件大小与发布版本不一致。');
        onProgress(received, total, attempt);
      }
      if (!received || (expectedBytes && received !== expectedBytes)) {
        throw new Error(`模型下载不完整：收到 ${received.toLocaleString()} / ${(expectedBytes || total).toLocaleString()} 字节，请重试。`);
      }
      return new Blob(chunks, { type: 'application/octet-stream' });
    } catch (error) {
      lastError = error;
      await reader?.cancel().catch(() => {});
      signal?.throwIfAborted();
      if (attempt + 1 < attempts && retryDelayMs) await new Promise(resolve => setTimeout(resolve, retryDelayMs * (attempt + 1)));
    } finally {
      reader?.releaseLock();
    }
  }
  throw new Error(describeLoadError(lastError));
}
