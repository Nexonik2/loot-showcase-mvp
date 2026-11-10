// Run inside: frontend/
// src/components/gacha/LootRevealGrid.tsx

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Badge } from '@/store/useShowcaseStore';
import BadgeCard from '@/components/BadgeCard';
import { Sparkles } from 'lucide-react';

interface LootRevealGridProps {
  badges: Badge[];
  isSkipped?: boolean;
  isBatch?: boolean;
}

export default function LootRevealGrid({
  badges,
  isSkipped = false,
  isBatch = false,
}: LootRevealGridProps) {
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(
    isSkipped || isBatch ? new Set(badges.map((_, i) => i)) : new Set()
  );

  const handleCardMount = (index: number) => {
    if (isSkipped || isBatch) return;
    setTimeout(() => {
      setFlippedIndices((prev) => new Set([...prev, index]));
    }, 200 + index * 90);
  };

  const summary = useMemo(() => {
    if (!isBatch) return null;
    const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let wildcardCount = 0;

    badges.forEach((b) => {
      tierCounts[b.tier] = (tierCounts[b.tier] || 0) + 1;
      if (b.projectId === 'wildcard' || b.shape === 'wildcard') {
        wildcardCount++;
      }
    });

    return { tierCounts, wildcardCount, total: badges.length };
  }, [badges, isBatch]);

  // Resolves jackpot styling according to native tier colors
  const getJackpotRingClass = (badge: Badge) => {
    const isWild = badge.projectId === 'wildcard' || badge.shape === 'wildcard';
    if (isWild || badge.tier === 1) {
      return 'ring-2 ring-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.4)]';
    }
    if (badge.tier === 2) {
      return 'ring-2 ring-purple-400/80 shadow-[0_0_14px_rgba(168,85,247,0.4)]';
    }
    if (badge.tier === 3) {
      return 'ring-2 ring-blue-400/80 shadow-[0_0_14px_rgba(59,130,246,0.35)]';
    }
    return '';
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3">
      {summary && (
        <div className="w-full max-w-xl flex flex-col xs:flex-row items-start xs:items-center justify-between px-3 py-2 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs gap-2">
          <span className="font-bold text-neutral-300">
            Batch Unsealed: <strong className="text-white">{summary.total} Badges</strong>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((t) => (
              <span key={t} className="text-[11px] font-mono text-neutral-400">
                T{t}: <strong className="text-neutral-200">{summary.tierCounts[t] || 0}</strong>
              </span>
            ))}
            {summary.wildcardCount > 0 && (
              <span className="text-[11px] font-mono text-amber-400 font-bold ml-1">
                ★ {summary.wildcardCount}
              </span>
            )}
          </div>
        </div>
      )}

      <div
        className={`w-full max-w-xl mx-auto flex flex-wrap justify-center gap-2.5 sm:gap-3 p-1 ${
          isBatch ? 'max-h-[380px] overflow-y-auto custom-scrollbar' : ''
        }`}
      >
        {badges.map((badge, idx) => {
          const isFlipped = isSkipped || isBatch || flippedIndices.has(idx);
          const jackpotRing = getJackpotRingClass(badge);

          return (
            <motion.div
              key={badge.id}
              className="w-[92px] xs:w-[102px] sm:w-[106px] [perspective:1000px] shrink-0"
              initial={isSkipped ? false : { opacity: 0, y: 25, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.25,
                delay: isSkipped || isBatch ? 0 : idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              onAnimationComplete={() => handleCardMount(idx)}
            >
              <div
                className={`relative w-full aspect-[3/4] transition-transform duration-500 [transform-style:preserve-3d] ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
                style={{ willChange: 'transform' }}
              >
                {/* Face Down Backing */}
                <div className="absolute inset-0 rounded-xl bg-neutral-900 border border-neutral-700/80 p-2 flex flex-col items-center justify-center [backface-visibility:hidden] shadow-md">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                    <Sparkles size={14} className="text-neutral-500" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 mt-2">SEALED</span>
                </div>

                {/* Face Up Badge Card */}
                <div
                  className={`absolute inset-0 rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden] ${jackpotRing}`}
                >
                  <BadgeCard tier={badge.tier} projectId={badge.projectId} shape={badge.shape} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}