import React, { useEffect, useRef } from 'react';
import type { PackType } from '@/store/useShowcaseStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  progress: number;
  alpha: number;
  decay: number;
  color: string;
}

interface UnsealParticleCanvasProps {
  packType: PackType;
  durationMs?: number;
  particleCount?: number;
  onComplete?: () => void;
}

const TIER_COLORS: Record<PackType, string[]> = {
  explorer: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ffffff'],
  adventurer: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#ffffff'],
  degen: ['#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#ffffff'],
};

export default function UnsealParticleCanvas({
  packType,
  durationMs = 550,
  particleCount = 64,
  onComplete,
}: UnsealParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const palette = TIER_COLORS[packType];

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 6.5;
      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.4, // Initial upward lift
        baseSize: 1.8 + Math.random() * 2.5,
        progress: 0,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    });

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, rect.width, rect.height);

      let aliveCount = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.11; // Gravity
        p.vx *= 0.975; // Drag
        p.progress = Math.min(1, p.progress + p.decay * 1.5);
        p.alpha = Math.max(0, p.alpha - p.decay);

        // Scales up over lifetime before dissipation
        const currentSize = p.baseSize * (1 + p.progress * 1.4);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        aliveCount++;
      }

      if (aliveCount > 0 && elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
        onComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [packType, durationMs, particleCount, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
      style={{ willChange: 'transform' }}
    />
  );
}