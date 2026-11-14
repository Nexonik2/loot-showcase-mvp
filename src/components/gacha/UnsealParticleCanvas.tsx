// Run inside: frontend/
// src/components/gacha/UnsealParticleCanvas.tsx

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
  revealDelayMs?: number;
  particleCount?: number;
  onRevealStart?: () => void;
  onComplete?: () => void;
}

const TIER_COLORS: Record<PackType, string[]> = {
  explorer: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#ffffff'],
  adventurer: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#ffffff'],
  degen: ['#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#ffffff'],
};

export default function UnsealParticleCanvas({
  packType,
  durationMs = 1350,
  revealDelayMs = 520,
  particleCount = 72,
  onRevealStart,
  onComplete,
}: UnsealParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onRevealStartRef = useRef(onRevealStart);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onRevealStartRef.current = onRevealStart;
    onCompleteRef.current = onComplete;
  }, [onRevealStart, onComplete]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onRevealStartRef.current?.();
      onCompleteRef.current?.();
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
      const speed = 2.8 + Math.random() * 6.8;
      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // Initial upward lift
        baseSize: 2.0 + Math.random() * 2.6,
        progress: 0,
        alpha: 1,
        // Per-60fps-frame decay rate (normalized by dt below so 120Hz/144Hz screens match 60Hz)
        decay: 0.0085 + Math.random() * 0.0085,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    });

    let animationFrameId: number;
    let hasTriggeredReveal = false;
    const startTime = performance.now();
    let lastTime = startTime;

    const render = (now: number) => {
      const elapsed = now - startTime;
      // Normalize frame step to 60fps (16.667ms) so high-refresh screens don't fast-forward
      const dt = Math.min(Math.max((now - lastTime) / 16.667, 0.25), 2.5);
      lastTime = now;

      ctx.clearRect(0, 0, rect.width, rect.height);

      if (!hasTriggeredReveal && elapsed >= revealDelayMs) {
        hasTriggeredReveal = true;
        onRevealStartRef.current?.();
      }

      let aliveCount = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        const drag = Math.pow(0.984, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.06 * dt; // Soft gravity
        p.vx *= drag;
        p.vy *= Math.pow(0.992, dt);

        const stepDecay = p.decay * dt;
        p.progress = Math.min(1, p.progress + stepDecay * 1.25);
        p.alpha = Math.max(0, p.alpha - stepDecay);

        const sizeCurve =
          p.progress < 0.65 ? 1 + p.progress * 1.45 : 1.94 - (p.progress - 0.65) * 1.3;
        const currentSize = Math.max(0.6, p.baseSize * sizeCurve);

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        aliveCount++;
      }

      if (aliveCount > 0 && elapsed < durationMs) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        if (!hasTriggeredReveal) {
          hasTriggeredReveal = true;
          onRevealStartRef.current?.();
        }
        ctx.clearRect(0, 0, rect.width, rect.height);
        onCompleteRef.current?.();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [packType, durationMs, revealDelayMs, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-50 mix-blend-screen"
      style={{ willChange: 'transform' }}
    />
  );
}