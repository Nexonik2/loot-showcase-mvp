// Run inside: frontend/
// src/components/gacha/UnsealAltar.tsx

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PackType, PACK_CONFIGS } from '@/store/useShowcaseStore';
import { THEME } from './gachaTheme';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface UnsealAltarProps {
  activePackType: PackType;
  ownedCount: number;
  batchCount: number;
  inkBalance: number;
  onBatchCountChange: (count: number | ((prev: number) => number)) => void;
  onStartOpening: (count?: number) => void;
  onQuickBuyAndOpen: () => void;
}

const PACK_VISUALS = {
  explorer: {
    title: 'Explorer',
    gradient: 'from-emerald-950 via-emerald-800 to-teal-950',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.35)',
  },
  adventurer: {
    title: 'Adventurer',
    gradient: 'from-blue-950 via-blue-800 to-indigo-950',
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.35)',
  },
  degen: {
    title: 'Degen',
    gradient: 'from-purple-950 via-purple-800 to-fuchsia-950',
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.35)',
  },
} as const;

export default function UnsealAltar({
  activePackType,
  ownedCount,
  inkBalance,
  onBatchCountChange,
  onStartOpening,
  onQuickBuyAndOpen,
}: UnsealAltarProps) {
  const currentConfig = PACK_CONFIGS[activePackType];
  const theme = THEME[activePackType];
  const packVis = PACK_VISUALS[activePackType];

  // Feedback states for disabled interactions
  const [shakingKey, setShakingKey] = useState<string | null>(null);
  const [activeTooltipKey, setActiveTooltipKey] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Availability constraints
  const canOpen1 = ownedCount >= 1;
  const canOpen10 = ownedCount >= 10;
  const canOpen50 = ownedCount >= 50;
  const canOpenAll = ownedCount >= 1;

  const handleTriggerOpen = (count: number) => {
    onBatchCountChange(count);
    onStartOpening(count);
  };

  const handleButtonClick = (count: number, isEnabled: boolean, key: string) => {
    if (!isEnabled) {
      setShakingKey(key);
      setActiveTooltipKey(key);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        setShakingKey(null);
        setActiveTooltipKey(null);
      }, 1000);
      return;
    }
    handleTriggerOpen(count);
  };

  const actionButtons = [
    {
      key: '1x',
      count: 1,
      enabled: canOpen1,
      label: (
        <span>
          Open <strong className="font-black text-sm tracking-wide">1x</strong> Pack
        </span>
      ),
    },
    {
      key: '10x',
      count: 10,
      enabled: canOpen10,
      label: (
        <span>
          Open <strong className="font-black text-sm tracking-wide">10x</strong> Packs
        </span>
      ),
    },
    {
      key: '50x',
      count: 50,
      enabled: canOpen50,
      label: (
        <span>
          Open <strong className="font-black text-sm tracking-wide">50x</strong> Packs
        </span>
      ),
    },
    {
      key: 'all',
      count: ownedCount,
      enabled: canOpenAll,
      label: (
        <span>
          Open <strong className="font-black text-sm tracking-wide">All</strong>
          <span className={`font-normal ml-1 ${canOpenAll ? 'text-white/70' : 'text-neutral-400/50'}`}>
            ({ownedCount})
          </span>
        </span>
      ),
    },
  ];

  return (
    <div
      className={`w-full max-w-xl mx-auto flex flex-col items-center justify-center p-5 sm:p-6 border ${theme.borderMuted} ${theme.bgMuted} rounded-xl text-center relative overflow-hidden transition-colors`}
    >
      {/* Interactive Booster Pack Preview */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={canOpen1 ? () => handleTriggerOpen(1) : undefined}
        className={`relative w-28 h-40 sm:w-32 sm:h-44 rounded-xl p-1.5 shadow-xl flex flex-col items-center justify-between border border-white/10 overflow-hidden mb-3 ${
          canOpen1 ? 'cursor-pointer hover:scale-105 transition-transform' : 'opacity-70'
        }`}
        style={{ boxShadow: `0 0 20px ${packVis.glow}` }}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${packVis.gradient} opacity-95`} />

        {/* Crimped Top Edge */}
        <div className="relative z-10 w-full h-2.5 border-b border-black/40 flex items-center justify-center opacity-70">
          <div className="w-full h-0.5 border-t border-dashed border-white/40" />
        </div>

        {/* Center Crest */}
        <div className="relative z-10 flex flex-col items-center my-auto">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-white/20 bg-black/50 flex items-center justify-center mb-1 shadow-inner"
            style={{ borderColor: packVis.accent }}
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: packVis.accent }} />
          </div>
          <span className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-neutral-100">
            {packVis.title}
          </span>
          <span className="text-[8px] font-mono tracking-widest text-neutral-400">
            5 SEALS
          </span>
        </div>

        {/* Crimped Bottom Edge */}
        <div className="relative z-10 w-full h-2.5 border-t border-black/40 flex items-center justify-center opacity-70">
          <div className="w-full h-0.5 border-b border-dashed border-white/40" />
        </div>
      </motion.div>

      {/* 2x2 Action Opening Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-md sm:max-w-lg mt-2">
        {actionButtons.map((btn) => (
          <motion.div
            key={btn.key}
            className="relative w-full"
            animate={shakingKey === btn.key ? { x: [-6, 6, -5, 5, -2, 2, 0] } : { x: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {/* Localized Floating Warning */}
            <AnimatePresence>
              {activeTooltipKey === btn.key && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -2, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700/80 text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-30"
                >
                  Not enough packs
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="button"
              onClick={() => handleButtonClick(btn.count, btn.enabled, btn.key)}
              className={`w-full h-10 sm:h-11 rounded-xl text-xs font-medium transition-all ${
                btn.enabled
                  ? `${theme.btn} shadow-md cursor-pointer active:scale-95`
                  : 'bg-white/5 border border-white/10 text-neutral-400/60 shadow-inner cursor-not-allowed hover:bg-white/5 hover:text-neutral-400/60'
              }`}
            >
              {btn.label}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Quick Buy Fallback when stack is empty */}
      {ownedCount === 0 && (
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-xs text-neutral-500">
            You currently hold 0 {currentConfig.name}s in your inventory.
          </p>
          <Button
            type="button"
            onClick={onQuickBuyAndOpen}
            disabled={inkBalance < currentConfig.cost}
            className={`text-xs h-10 px-5 font-bold rounded-xl transition-all ${
              inkBalance >= currentConfig.cost
                ? `${theme.btn} cursor-pointer active:scale-95`
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Quick Buy & Open 1x (-{currentConfig.cost} Ink)
          </Button>
        </div>
      )}

      {/* Wildcard Info Tag */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400/90 mt-4 font-medium">
        <Sparkles size={13} className="text-amber-400 shrink-0" />
        <span>5 badges / pack | wildcard chance: 5%</span>
      </div>
    </div>
  );
}