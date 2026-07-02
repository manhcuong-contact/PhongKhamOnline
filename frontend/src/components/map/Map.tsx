'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface/50 border border-surface rounded-2xl">
      <div className="animate-pulse text-text-light text-sm">Đang tải bản đồ...</div>
    </div>
  ),
});

export default MapComponent;
