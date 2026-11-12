// Run inside: frontend/
// src/components/rewards/QuestProgressToast.tsx

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestStore } from '@/store/useQuestStore';
import { Target, CheckCircle2, Flame, Package } from 'lucide-react';

const TOAST_DURATION_MS = 3000;

export default function QuestProgressToast() {
  const activeToast = useQuestStore((state) => state.activeToast);
  const clearQuestToast = useQuestStore((state) => state.clearQuestToast);

  useEffect(() => {
    if (!activeToast) return;

    const timer = setTimeout(() => {
      clearQuestToast();
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [activeToast, clearQuestToast]);

  const getToastIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />;
    }
    if (type.includes('pack')) {
      return <Package className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />;
    }
    if (type.includes('forge')) {
      return <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 shrink-0" />;
    }
    return <Target className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />;
  };

  const progressPercent = activeToast
    ? Math.min(100, Math.round((activeToast.currentProgress / activeToast.target) * 100))
    : 0;

  return (
    <div className="fixed top-3 sm:top-5 md:top-6 left-1/2 -translate-x-1/2 z-[70] pointer-events-none select-none w-[calc(100vw-1.5rem)] max-w-[340px] sm:max-w-sm md:max-w-md lg:max-w-[460px]">
      <AnimatePresence mode="wait">
        {activeToast && (
          <motion.div
            key={`${activeToast.id}-${activeToast.currentProgress}`}
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative overflow-hidden rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 shadow-2xl backdrop-blur-md border ${
              activeToast.isCompleted
                ? 'bg-neutral-950/95 border-emerald-500/80 shadow-[0_8px_30px_rgba(16,185,129,0.28)]'
                : 'bg-neutral-950/92 border-neutral-700/85 shadow-[0_8px_28px_rgba(0,0,0,0.7)]'
            }`}
          >
            {/* Slim Top 3-Second Countdown Indicator */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-neutral-800/80 overflow-hidden">
              <motion.div
                key={`timer-${activeToast.id}-${activeToast.currentProgress}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: TOAST_DURATION_MS / 1000, ease: 'linear' }}
                style={{ transformOrigin: 'left center' }}
                className={`h-full w-full ${
                  activeToast.isCompleted
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400'
                    : 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300'
                }`}
              />
            </div>

            {/* Two-Row Layout: Title on Top, Progress Bar + Ratio Below */}
            <div className="flex flex-col gap-1.5 sm:gap-2 pt-0.5">
              {/* Top Row: Icon + Quest Title + Reward/Status Tag */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {getToastIcon(activeToast.type, activeToast.isCompleted)}
                  <span className="text-xs sm:text-sm md:text-[15px] font-bold text-neutral-100 truncate">
                    {activeToast.title}
                  </span>
                </div>

                {activeToast.isCompleted ? (
                  <span className="text-[11px] sm:text-xs md:text-sm font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/70 px-2 py-0.5 rounded-md shrink-0">
                    +{activeToast.rewardInk} Ink
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs font-mono font-medium text-neutral-400 shrink-0">
                    {progressPercent}%
                  </span>
                )}
              </div>

              {/* Bottom Row: Full-Width Progress Bar + Numeric Count */}
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-1.5 sm:h-2 md:h-2.5 rounded-full bg-neutral-800/90 border border-neutral-700/60 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      activeToast.isCompleted
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <span
                  className={`text-[11px] sm:text-xs md:text-[13px] font-mono font-semibold shrink-0 tabular-nums ${
                    activeToast.isCompleted ? 'text-emerald-400' : 'text-neutral-300'
                  }`}
                >
                  {activeToast.isCompleted
                    ? `Completed (${activeToast.currentProgress}/${activeToast.target})`
                    : `${activeToast.currentProgress}/${activeToast.target}`}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}