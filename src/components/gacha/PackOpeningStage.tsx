import React, { useState } from 'react';
import {
  useArchiverStore,
  type PackType,
  type Badge,
  type BadgeShape,
  PACK_CONFIGS,
} from '@/store/useShowcaseStore';
import FoilPackFissure from './FoilPackFissure';
import UnsealParticleCanvas from './UnsealParticleCanvas';
import LootRevealGrid from './LootRevealGrid';
import { Button } from '@/components/ui/button';
import { FastForward, Check, RefreshCw, ShoppingBag } from 'lucide-react';

interface PackOpeningStageProps {
  packType: PackType;
  batchCount: number;
  affiliation?: { shape?: BadgeShape; projectId?: string };
  onClose: () => void;
  onBatchSummary: (pulls: Badge[]) => void;
}

type StagePhase = 'tapping' | 'bursting' | 'revealing' | 'resolved';

export default function PackOpeningStage({
  packType,
  batchCount,
  affiliation,
  onClose,
}: PackOpeningStageProps) {
  const { openPacksBatch, buyPacks, unopenedPacks, inkBalance } = useArchiverStore();

  const [phase, setPhase] = useState<StagePhase>('tapping');
  const [tapCount, setTapCount] = useState<number>(0);
  const [pulledBadges, setPulledBadges] = useState<Badge[] | null>(null);

  const ownedPacksRemaining = unopenedPacks[packType] || 0;
  const packCost = PACK_CONFIGS[packType].cost;
  const canAffordBatch = inkBalance >= packCost * batchCount;
  const canAffordSingle = inkBalance >= packCost;

  const executePull = (count: number) => {
    const pulls = openPacksBatch(packType, count, affiliation);
    setPulledBadges(pulls);
    return pulls;
  };

  const handlePackTap = () => {
    if (phase !== 'tapping') return;
    const nextTap = tapCount + 1;
    setTapCount(nextTap);

    if (nextTap >= 3) {
      executePull(batchCount);
      setPhase('bursting');
    }
  };

  const handleBurstComplete = () => {
    setPhase('revealing');
  };

  const handleSkip = () => {
    let currentPulls = pulledBadges;
    if (!currentPulls) {
      currentPulls = executePull(batchCount);
    }
    if (!currentPulls) {
      onClose();
      return;
    }
    setPhase('resolved');
  };

  const handleOpenAnotherOwned = () => {
    setTapCount(0);
    setPulledBadges(null);
    setPhase('tapping');
  };

  const handleQuickBuyAndOpenAnother = () => {
    const countToBuy = ownedPacksRemaining >= batchCount ? batchCount : 1;
    const bought = buyPacks(packType, countToBuy);
    if (bought) {
      setTapCount(0);
      setPulledBadges(null);
      setPhase('tapping');
    }
  };

  return (
    <div className="relative w-full min-h-[440px] flex flex-col items-center justify-center p-4 overflow-visible">
      {/* Skip Button */}
      {(phase === 'tapping' || phase === 'bursting') && (
        <div className="absolute top-2 right-2 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-7 px-2.5 text-xs text-neutral-400 hover:text-white bg-neutral-900/80 border border-neutral-800"
          >
            <FastForward size={13} className="mr-1 text-amber-400" /> Skip
          </Button>
        </div>
      )}

      {/* Promoted Full-Stage Canvas: Spans the entire stage to prevent spark boundary clipping */}
      {phase === 'bursting' && (
        <UnsealParticleCanvas packType={packType} onComplete={handleBurstComplete} />
      )}

      {/* Interactive Foil Booster Pack */}
      {(phase === 'tapping' || phase === 'bursting') && (
        <div className="relative flex flex-col items-center">
          <FoilPackFissure
            packType={packType}
            tapCount={tapCount}
            onTap={handlePackTap}
            disabled={phase === 'bursting'}
          />
        </div>
      )}

      {/* Visual Badge Reveal Grid */}
      {(phase === 'revealing' || phase === 'resolved') && pulledBadges && (
        <div className="flex flex-col items-center gap-5 w-full animate-in fade-in duration-300">
          <LootRevealGrid
            badges={pulledBadges}
            isSkipped={phase === 'resolved'}
            isBatch={batchCount > 1}
          />

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {ownedPacksRemaining >= batchCount && (
              <Button
                onClick={handleOpenAnotherOwned}
                size="sm"
                className="h-8 px-4 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} /> Open Another {batchCount > 1 ? `${batchCount}x` : ''} ({ownedPacksRemaining} left)
              </Button>
            )}

            {ownedPacksRemaining < batchCount && (canAffordBatch || canAffordSingle) && (
              <Button
                onClick={handleQuickBuyAndOpenAnother}
                size="sm"
                className="h-8 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg border border-amber-500 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <ShoppingBag size={13} /> Buy & Open 1x (-{packCost} Ink)
              </Button>
            )}

            <Button
              onClick={onClose}
              size="sm"
              className="h-8 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={13} /> Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}