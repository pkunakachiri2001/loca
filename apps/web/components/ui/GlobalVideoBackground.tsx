'use client';

import { usePathname } from 'next/navigation';
import { BackgroundVideo } from './BackgroundVideo';

export function GlobalVideoBackground() {
  const pathname = usePathname();

  // Dynamic video selection based on page context
  const videoSources = pathname.startsWith('/company') || pathname.startsWith('/admin')
    ? ['/videos/cta.mp4', '/videos/hero.mp4']
    : ['/videos/hero.mp4', '/videos/cta.mp4'];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <BackgroundVideo
        sources={videoSources}
        opacity={0.35}
        className="fixed inset-0"
        overlayGradient="from-[#0E0E10]/75 via-[#0E0E10]/70 to-[#0E0E10]/95"
      />
    </div>
  );
}
