// src/components/forge/ForgeAltarSlots.tsx

import React from 'react';
import { motion } from 'framer-motion';
import type { Badge } from '@/store/useShowcaseStore';
import BadgeCard from '@/components/BadgeCard';
import { X, Sparkles } from 'lucide-react';
import { getTierTheme } from '@/lib/theme';

interface ForgeAltarSlotsProps {
  slots: (Badge | null)[];
  onRemoveBadge: (slotIndex: number) => void;
  isValidRecipe: boolean;
  activeTier: number | null;
  strikeStep: number;
}

export default function ForgeAltarSlots({
  slots,
  onRemoveBadge,
  isValidRecipe,
  activeTier,
  strikeStep,
}: ForgeAltarSlotsProps) {
  const activeTheme = activeTier ? getTierTheme(activeTier) : null;
  const strokeColor = activeTheme ? activeTheme.stroke : '#404040';
  const glowColor = activeTheme ? activeTheme.glowColor : 'transparent';
  const ringClass = activeTheme ? activeTheme.ring : 'border-neutral-800 ring-transparent';

  const slottedCount = slots.filter(Boolean).length;

  const arcTransforms = [
    'translate3d(0, 0, 0)',
    'translate3d(0, 8px, 0)',
    'translate3d(0, 0, 0)',
  ];

  const getStrikeVariant = () => {
    switch (strikeStep) {
      case 1: return { scale: 0.97, transition: { duration: 0.08 } };
      case 2: return { scale: 0.94, transition: { duration: 0.08 } };
      case 3: return { scale: 0.88, opacity: 0.3, transition: { duration: 0.12 } };
      default: return { scale: 1, opacity: 1, transition: { duration: 0.2 } };
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto pt-1 flex flex-col items-center">
      {/* Trio Arc Interactive Badges */}
      <motion.div
        animate={getStrikeVariant()}
        className="relative z-10 grid grid-cols-3 gap-4 sm:gap-6 w-full px-2"
        style={{ willChange: 'transform, opacity' }}
      >
        {[0, 1, 2].map((index) => {
          const badge = slots[index];

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center transition-transform duration-200"
              style={{ transform: arcTransforms[index] }}
            >
              {badge ? (
                <div
                  className="relative group w-full aspect-[3/4] max-w-[100px] rounded-xl transition-all shadow-lg cursor-pointer"
                  onClick={() => strikeStep === 0 && onRemoveBadge(index)}
                  title="Click anywhere on slot to remove badge"
                >
                  <div
                    className={`w-full h-full rounded-xl ring-1 ${ringClass}`}
                    style={{
                      boxShadow: isValidRecipe ? `0 0 12px ${glowColor}` : undefined,
                    }}
                  >
                    <BadgeCard
                      tier={badge.tier}
                      projectId={badge.projectId}
                      shape={badge.shape}
                    />
                  </div>

                  {strikeStep === 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBadge(index);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-950/95 border border-red-500/80 text-red-300 hover:bg-red-800 hover:text-white hover:border-red-300 flex items-center justify-center shadow-md transition-all cursor-pointer z-30 hover:scale-110 active:scale-90"
                      title="Remove badge from forge"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="w-full aspect-[3/4] max-w-[100px] rounded-xl border border-dashed border-neutral-800 bg-neutral-950/70 flex flex-col items-center justify-center p-2 text-center transition-all hover:border-neutral-700 hover:bg-neutral-900/40 select-none shadow-inner"
                >
                  <div className="w-6 h-6 rounded-md border border-neutral-800 bg-neutral-900/60 flex items-center justify-center mb-1.5 opacity-60">
                    <Sparkles size={11} className="text-neutral-500" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-neutral-500">
                    Slot {index + 1}
                  </span>
                  <span className="text-[9px] text-neutral-600 mt-0.5">Empty</span>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Clean Energy Conduits */}
      <div className="relative w-full h-6 pointer-events-none">
        {slottedCount > 0 && (
          <svg
            className="w-full h-full"
            viewBox="0 0 360 24"
            preserveAspectRatio="none"
            fill="none"
          >
            {slots[0] && (
              <path
                d="M 60 4 C 60 16, 130 18, 180 24"
                stroke={strokeColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )}
            {slots[1] && (
              <path
                d="M 180 10 L 180 24"
                stroke={strokeColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )}
            {slots[2] && (
              <path
                d="M 300 4 C 300 16, 230 18, 180 24"
                stroke={strokeColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )}
          </svg>
        )}
      </div>
    </div>
  );
}