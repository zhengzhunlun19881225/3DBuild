import React, { useEffect, useRef } from 'react';

/** Isolate the source project's Spark / Three runtime from the campus renderer. */
export function GaussianScene({ resetToken }: { resetToken: number }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: '3dgs:reset' }, window.location.origin);
  }, [resetToken]);

  return (
    <iframe
      ref={frame}
      title="3DGS 实景浏览"
      src={`${import.meta.env.BASE_URL}3dgs/index.html`}
      className="absolute inset-x-0 bottom-0 top-16 h-[calc(100%-4rem)] w-full border-0 bg-slate-950"
      allow="fullscreen"
    />
  );
}
