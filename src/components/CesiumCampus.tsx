import React, { useEffect, useRef } from 'react';

export function CesiumCampus({ resetToken, onSelectBuilding }: {
  resetToken: number;
  onSelectBuilding: (code: string) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    ref.current?.contentWindow?.postMessage({ type: 'gis:reset' }, location.origin);
  }, [resetToken]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== ref.current?.contentWindow) return;
      if (event.data?.type === 'gis:building' && typeof event.data.code === 'string') onSelectBuilding(event.data.code);
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [onSelectBuilding]);
  return <iframe ref={ref} title="Cesium GIS 园区" src={`${import.meta.env.BASE_URL}gis/index.html`} className="absolute inset-x-0 bottom-0 top-16 h-[calc(100%-4rem)] w-full border-0 bg-slate-950" />;
}
