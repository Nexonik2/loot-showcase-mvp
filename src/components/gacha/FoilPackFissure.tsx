import React from 'react';
import { motion, type Transition } from 'framer-motion';
import type { PackType } from '@/store/useShowcaseStore';
import { Sparkles } from 'lucide-react';

interface FoilPackFissureProps {
  packType: PackType;
  tapCount: number; // 0, 1, 2, or 3
  onTap: () => void;
  disabled?: boolean;
}

const PACK_CONFIG = {
  explorer: {
    title: 'Explorer',
    gradient: 'from-emerald-950 via-emerald-800 to-teal-950',
    foilAccent: '#10b981',       // Pack border & emblem tint
    glowColor: 'rgba(16, 185, 129, 0.45)',
    fissureGlow: '#10b981',      // Vibrant saturated green for the outer pulse
    fissureCore: '#d1fae5',      // Hyper-bright white-mint core (or '#ffffff')
  },
  adventurer: {
    title: 'Adventurer',
    gradient: 'from-blue-950 via-blue-800 to-indigo-950',
    foilAccent: '#3b82f6',       // Pack border & emblem tint
    glowColor: 'rgba(59, 130, 246, 0.45)',
    fissureGlow: '#3b82f6',      // Vibrant saturated blue for the outer pulse
    fissureCore: '#e0f2fe',      // Hyper-bright white-cyan core (or '#ffffff')
  },
  degen: {
    title: 'Degen',
    gradient: 'from-purple-950 via-purple-800 to-fuchsia-950',
    foilAccent: '#a855f7',       // Pack border & emblem tint
    glowColor: 'rgba(168, 85, 247, 0.45)',
    fissureGlow: '#a855f7',      // Vibrant saturated purple for the outer pulse
    fissureCore: '#fae8ff',      // Hyper-bright white-magenta core (or '#ffffff')
  },
} as const;

export default function FoilPackFissure({
  packType,
  tapCount,
  onTap,
  disabled = false,
}: FoilPackFissureProps) {
  const cfg = PACK_CONFIG[packType];

  const handleTap = () => {
    if (disabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(tapCount === 2 ? 35 : 18);
    }
    onTap();
  };

  const getPackVariants = () => {
    if (tapCount === 1) {
      return {
        scale: 1.04,
        rotate: [0, -1, 1, 0],
        transition: { duration: 0.18 },
      };
    }
    if (tapCount === 2) {
      return {
        scale: 1.08,
        x: [0, -2, 2, -1.5, 1.5, 0],
        rotate: [0, -1.5, 1.5, -1, 1, 0],
        transition: { duration: 0.22, repeat: Infinity, repeatType: 'reverse' as const },
      };
    }
    if (tapCount >= 3) {
      return {
        scale: 0.92,
        opacity: [1, 0.35, 0],
        transition: { duration: 0.18 },
      };
    }
    return { scale: 1, x: 0, rotate: 0 };
  };

  // Strictly-typed transitions for path entry vs continuous pulsing
  const pulseTransition: Transition = {
    pathLength: { duration: 0.12, ease: 'easeOut' as const },
    strokeWidth: {
      duration: tapCount === 1 ? 2.5 : 1.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      times:
        tapCount === 1
          ? [0, 0.25, 0.5, 0.75, 1]
          : [0, 0.15, 0.32, 0.52, 0.7, 0.88, 1],
    },
    opacity: {
      duration: tapCount === 1 ? 2.5 : 1.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      times:
        tapCount === 1
          ? [0, 0.25, 0.5, 0.75, 1]
          : [0, 0.15, 0.32, 0.52, 0.7, 0.88, 1],
    },
  };

  // Dynamic stroke widths for the lower emissive line
  const glowStrokeWidthKeyframes =
    tapCount === 1
      ? [5, 12, 7, 14, 5]
      : [6, 16, 9, 20, 8, 17, 6];

  // Opacity variations for the lower emissive line
  const glowOpacityKeyframes =
    tapCount === 1
      ? [0.25, 0.6, 0.3, 0.65, 0.25]
      : [0.35, 0.8, 0.45, 0.9, 0.4, 0.85, 0.35];

  return (
    <div className="flex flex-col items-center select-none cursor-pointer" onClick={handleTap}>
      <motion.div
        animate={getPackVariants()}
        className="relative w-48 h-68 rounded-2xl p-2 shadow-2xl flex flex-col items-center justify-between border border-white/10 overflow-hidden"
        style={{
          boxShadow: `0 0 ${tapCount * 14 + 10}px ${cfg.glowColor}`,
          willChange: 'transform, opacity',
        }}
      >
        {/* Metallic Foil Texture Base */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${cfg.gradient} opacity-95 transition-opacity duration-300`}
        />

        {/* Crimped Top Foil Seal */}
        <div className="relative z-10 w-full h-4 border-b border-black/40 flex items-center justify-center opacity-70">
          <div className="w-full h-1 border-t-2 border-dashed border-white/30" />
        </div>

        {/* Center Crest */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto">
          <div
            className="w-16 h-16 rounded-xl border border-white/20 bg-black/40 flex items-center justify-center mb-2 shadow-inner"
            style={{ borderColor: cfg.foilAccent }}
          >
            <Sparkles className="w-8 h-8" style={{ color: cfg.foilAccent }} />
          </div>
          <span className="font-black text-sm tracking-wider uppercase text-neutral-100 drop-shadow-md">
            {cfg.title}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-neutral-400">
            5 ARCHIVE SEALS
          </span>
        </div>

        {/* Dynamic Vector Fissures: Concentric Line Stacking */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 200 280"
          fill="none"
        >
          {/* ========================================================= */}
          {/* 1. LOWER EMISSIVE LAYER: Unified Group (No Alpha Overlap) */}
          {/* ========================================================= */}
          {tapCount >= 1 && (
            <motion.g
              animate={{ opacity: glowOpacityKeyframes }}
              transition={{
                duration: tapCount === 1 ? 1.6 : 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
                times:
                  tapCount === 1
                    ? [0, 0.25, 0.5, 0.75, 1]
                    : [0, 0.15, 0.32, 0.52, 0.7, 0.88, 1],
              }}
              style={{
                filter: `drop-shadow(0 0 5px ${cfg.foilAccent})`,
              }}
            >
              {/* Central Vertical Seam (100% solid stroke) */}
              <motion.path
                d="M 100 20 L 105 70 L 92 110 L 108 160 L 98 220 L 100 260"
                stroke={cfg.fissureGlow}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: 1,
                  strokeWidth: glowStrokeWidthKeyframes,
                }}
                transition={pulseTransition}
              />

              {/* Lateral Branches (100% solid stroke; merges seamlessly into center) */}
              {tapCount >= 2 && (
                <>
                  <motion.path
                    d="M 92 110 L 60 90 L 30 115"
                    stroke={cfg.fissureGlow}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: 1,
                      strokeWidth: glowStrokeWidthKeyframes,
                    }}
                    transition={pulseTransition}
                  />
                  <motion.path
                    d="M 108 160 L 145 140 L 175 165"
                    stroke={cfg.fissureGlow}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: 1,
                      strokeWidth: glowStrokeWidthKeyframes,
                    }}
                    transition={pulseTransition}
                  />
                </>
              )}
            </motion.g>
          )}

          {/* ========================================================= */}
          {/* 2. UPPER BASE LAYER: Sharp, Opaque Surface Crack Lines    */}
          {/* ========================================================= */}
          {tapCount >= 1 && (
            <motion.path
              d="M 100 20 L 105 70 L 92 110 L 108 160 L 98 220 L 100 260"
              stroke={cfg.foilAccent}
              strokeWidth={tapCount === 1 ? 2.5 : 3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ pathLength: { duration: 0.12, ease: 'easeOut' } }}
            />
          )}

          {tapCount >= 2 && (
            <>
              <motion.path
                d="M 92 110 L 60 90 L 30 115"
                stroke={cfg.foilAccent}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ pathLength: { duration: 0.12, ease: 'easeOut' } }}
              />
              <motion.path
                d="M 108 160 L 145 140 L 175 165"
                stroke={cfg.foilAccent}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ pathLength: { duration: 0.12, ease: 'easeOut' } }}
              />
            </>
          )}
        </svg>

        {/* Crimped Bottom Foil Seal */}
        <div className="relative z-10 w-full h-4 border-t border-black/40 flex items-center justify-center opacity-70">
          <div className="w-full h-1 border-b-2 border-dashed border-white/30" />
        </div>
      </motion.div>

      {/* Tactile Tap Hint Badge */}
      <div className="mt-4 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-300 flex items-center gap-1.5 shadow-md">
        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: cfg.foilAccent }} />
        {tapCount === 0 && 'Tap 1/3 to Strain Foil'}
        {tapCount === 1 && 'Tap 2/3 to Fracture Seal'}
        {tapCount === 2 && 'TAP 3/3 TO UNSEAL!'}
      </div>
    </div>
  );
}