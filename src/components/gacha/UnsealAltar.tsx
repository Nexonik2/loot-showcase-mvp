// Run inside: frontend/
// src/components/gacha/UnsealAltar.tsx

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PackType, PACK_CONFIGS } from '@/store/useShowcaseStore';
import { THEME } from './gachaTheme';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import BoosterPackVisual from './BoosterPackVisual';

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
      className={`w-full max-w-xl mx-auto flex flex-col items-center justify-center lg:flex-1 lg:justify-between p-4 sm:p-5 border ${theme.borderMuted} ${theme.bgMuted} rounded-xl text-center relative overflow-hidden transition-colors`}
    >
      {/* Interactive Booster Pack Preview */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="my-auto"
      >
        <BoosterPackVisual
          packType={activePackType}
          size="lg"
          dimmed={!canOpen1}
          onClick={canOpen1 ? () => handleTriggerOpen(1) : undefined}
        />
      </motion.div>

      {/* Bottom Action Controls Wrapper */}
      <div className="w-full flex flex-col items-center mt-3 shrink-0">
        {ownedCount > 0 ? (
          /* 2x2 Action Opening Grid (Shown when player owns >= 1 pack) */
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-md sm:max-w-lg">
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
        ) : (
          /* Empty Stash Replacement: Replaces 2x2 grid when ownedCount === 0 */
          <div className="w-full max-w-md flex flex-col items-center gap-2.5 py-2 px-3 rounded-xl">
            <p className="text-xs text-neutral-400">
              You currently hold <span className="font-mono font-bold text-neutral-200">0</span>{' '}
              {currentConfig.name}s in your inventory.
            </p>
            <Button
              type="button"
              onClick={onQuickBuyAndOpen}
              disabled={inkBalance < currentConfig.cost}
              className={`w-full max-w-[260px] text-xs h-10 px-5 font-bold rounded-xl transition-all ${
                inkBalance >= currentConfig.cost
                  ? `${theme.btn} shadow-md cursor-pointer active:scale-95`
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              Quick Buy & Open 1x (-{currentConfig.cost} Ink)
            </Button>
          </div>
        )}

        {/* Wildcard Info Tag */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400/90 mt-3 font-medium">
          <Sparkles size={13} className="text-amber-400 shrink-0" />
          <span>5 badges / pack | wildcard chance: 5%</span>
        </div>
      </div>
    </div>
  );
}