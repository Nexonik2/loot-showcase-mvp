// Run inside: frontend/
// src/components/gacha/LootRevealGrid.tsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Badge } from '@/store/useShowcaseStore';
import BadgeCard from '@/components/BadgeCard';
import { Sparkles } from 'lucide-react';

interface LootRevealGridProps {
  badges: Badge[];
  isSkipped?: boolean;
  isBatch?: boolean;
  onAllFlipped?: () => void;
}

interface RevealCardItem {
  key: string;
  badge: Badge;
  count: number;
}

export default function LootRevealGrid({
  badges,
  isSkipped = false,
  isBatch = false,
  onAllFlipped,
}: LootRevealGridProps) {
  // Build display list: 5 individual cards for 1x, or grouped stacks (rarest first) for batches
  const displayItems = useMemo<RevealCardItem[]>(() => {
    if (!isBatch) {
      return badges.map((badge) => ({
        key: badge.id,
        badge,
        count: 1,
      }));
    }

    const map = new Map<string, RevealCardItem>();
    for (const badge of badges) {
      const key = `${badge.tier}-${badge.projectId}-${badge.shape}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, { key, badge, count: 1 });
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const aWild = a.badge.projectId === 'wildcard' || a.badge.shape === 'wildcard' ? 0 : 1;
      const bWild = b.badge.projectId === 'wildcard' || b.badge.shape === 'wildcard' ? 0 : 1;
      if (aWild !== bWild) return aWild - bWild;
      return a.badge.tier - b.badge.tier;
    });
  }, [badges, isBatch]);

  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(() =>
    isSkipped ? new Set(displayItems.map((_, i) => i)) : new Set()
  );

  const flipTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // If user clicks "Flip All" / "Skip" mid-cascade, flip every card immediately
  useEffect(() => {
    if (isSkipped) {
      flipTimersRef.current.forEach((t) => clearTimeout(t));
      flipTimersRef.current = [];
      setFlippedIndices(new Set(displayItems.map((_, i) => i)));
    }
  }, [isSkipped, displayItems]);

  // Clean up pending flip timers on unmount
  useEffect(() => {
    return () => {
      flipTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Notify parent once the last card finishes flipping so the "Flip All" button auto-hides
  useEffect(() => {
    if (displayItems.length > 0 && flippedIndices.size >= displayItems.length) {
      onAllFlipped?.();
    }
  }, [flippedIndices.size, displayItems.length, onAllFlipped]);

  const handleCardMount = (index: number) => {
    if (isSkipped) return;
    const staggerMs = isBatch ? 65 : 95;
    const timer = setTimeout(() => {
      setFlippedIndices((prev) => {
        if (prev.has(index)) return prev;
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    }, 180 + index * staggerMs);
    flipTimersRef.current.push(timer);
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
    <div
      className={`w-full flex flex-col items-center gap-3 ${
        isBatch ? 'flex-1 min-h-0 justify-start' : 'justify-center'
      }`}
    >
      {summary && (
        <div className="w-full max-w-xl flex flex-col xs:flex-row items-start xs:items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs gap-2 shrink-0">
          <span className="font-bold text-neutral-300">
            Batch Unsealed: <strong className="text-white">{summary.total} Badges</strong>
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
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
        className={`w-full max-w-xl mx-auto flex flex-wrap justify-center content-start gap-2.5 sm:gap-3 pt-2.5 px-2 pb-2 ${
          isBatch
            ? 'flex-1 min-h-0 max-h-[460px] lg:max-h-none overflow-y-auto custom-scrollbar'
            : ''
        }`}
      >
        {displayItems.map((item, idx) => {
          const isFlipped = isSkipped || flippedIndices.has(idx);
          const jackpotRing = getJackpotRingClass(item.badge);

          return (
            <motion.div
              key={item.key}
              className="w-[92px] xs:w-[100px] sm:w-[106px] [perspective:1000px] shrink-0"
              initial={isSkipped ? false : { opacity: 0, y: 22, scale: 0.86 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.24,
                delay: isSkipped ? 0 : Math.min(idx * 0.035, 0.35),
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

                {/* Face Up Badge Card + Batch Stack Pill */}
                <div
                  className={`absolute inset-0 rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden] ${jackpotRing}`}
                >
                  <BadgeCard
                    tier={item.badge.tier}
                    projectId={item.badge.projectId}
                    shape={item.badge.shape}
                  />

                  {item.count > 1 && (
                    <span className="absolute -top-2 -right-1.5 z-20 px-1.5 py-0.5 rounded-full bg-neutral-950 border border-neutral-600/90 text-neutral-100 text-[11px] font-mono font-extrabold leading-none shadow-md">
                      x{item.count}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}