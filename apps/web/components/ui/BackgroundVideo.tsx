'use client';

import { useState, useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  sources?: string[];
  opacity?: number;
  className?: string;
  overlayGradient?: string;
}

const LOCAL_VIDEOS = [
  '/videos/hero.mp4',
  '/videos/cta.mp4',
];

export function BackgroundVideo({
  sources = LOCAL_VIDEOS,
  opacity = 0.6,
  className = '',
  overlayGradient = 'from-[#0E0E10]/75 via-[#0E0E10]/65 to-[#0E0E10]/95',
}: BackgroundVideoProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Force video playback on mount (handles browser autoplay policies)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, [currentSourceIndex]);

  // Subtle copper highway particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 80 + 30,
      speed: Math.random() * 1.5 + 0.6,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.35 + 0.15,
      color: Math.random() > 0.5 ? '#E8A547' : '#F5D78A',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x -= p.speed * 1.2;
        p.y += p.speed * 0.3;

        if (p.x < -p.length) p.x = width + p.length;
        if (p.y > height) p.y = -p.length;

        ctx.beginPath();
        const gradient = ctx.createLinearGradient(p.x, p.y, p.x + p.length, p.y - p.length * 0.2);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.radius;
        ctx.globalAlpha = p.opacity;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length, p.y - p.length * 0.2);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleVideoError = () => {
    if (currentSourceIndex < sources.length - 1) {
      setCurrentSourceIndex((prev) => prev + 1);
    } else {
      setVideoFailed(true);
    }
  };

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Video layer */}
      {!videoFailed && sources.length > 0 && (
        <video
          ref={videoRef}
          key={sources[currentSourceIndex]}
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          className="absolute inset-0 h-full w-full object-cover scale-105 filter brightness-85 contrast-110"
          style={{ opacity }}
        >
          <source src={sources[currentSourceIndex]} type="video/mp4" />
        </video>
      )}

      {/* Particle canvas overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover z-10 opacity-60" />

      {/* Dark overlay ensuring perfect text contrast & readability */}
      <div className={`absolute inset-0 z-20 bg-gradient-to-b ${overlayGradient}`} />
    </div>
  );
}
