// Run inside: frontend/
// src/components/Forge.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useShowcaseStore, type Badge } from '@/store/useShowcaseStore';
import {
  ForgeAltarSlots,
  ForgeCrucibleNode,
  ForgeBatchControls,
  ForgeAnvilTrigger,
  ForgeResultModal,
} from './forge';
import {
  validateForgeRecipe,
  calculateMaxBatchCount,
  findCleanInventoryCandidate,
  findBatchBadgeIds,
} from '@/lib/forgeHeuristics';
import { forgeAudio } from '@/lib/forgeAudio';

export interface ForgeProps {
  selectedBadgeIds: string[];
  onRemoveFromSlot: (index: number) => void;
  onClearSlots: () => void;
  onSelectBadgeIds?: (ids: string[]) => void;
  isShaking?: boolean;
}

export default function Forge({
  selectedBadgeIds,
  onRemoveFromSlot,
  onClearSlots,
  onSelectBadgeIds,
  isShaking = false,
}: ForgeProps) {
  const inkBalance = useShowcaseStore((state) => state.inkBalance);
  const badges = useShowcaseStore((state) => state.badges);
  const forgeBadges = useShowcaseStore((state) => state.forgeBadges);

  const [batchCount, setBatchCount] = useState<number>(1);
  const [isForging, setIsForging] = useState<boolean>(false);
  const [strikeStep, setStrikeStep] = useState<number>(0);
  const [mintedResults, setMintedResults] = useState<Badge[]>([]);
  const [inkSavedAmount, setInkSavedAmount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Slotted badge instances
  const slottedBadges = useMemo(() => {
    return selectedBadgeIds.map((id) => badges[id]).filter(Boolean) as Badge[];
  }, [selectedBadgeIds, badges]);

  // Active tier anchor
  const activeTier = slottedBadges.length > 0 ? slottedBadges[0].tier : null;

  // Recipe validation
  const validation = useMemo(() => {
    return validateForgeRecipe(slottedBadges);
  }, [slottedBadges]);

  const costPerCraft = validation.cost || 0;

  // Max batch multiplier calculation
  const maxBatchCount = useMemo(() => {
    return calculateMaxBatchCount(
      slottedBadges,
      badges,
      costPerCraft,
      inkBalance,
      validation.valid
    );
  }, [slottedBadges, badges, costPerCraft, inkBalance, validation.valid]);

  // Autofill candidate check
  const autoFillCandidate = useMemo(() => {
    return findCleanInventoryCandidate(badges);
  }, [badges]);

  useEffect(() => {
    if (batchCount > maxBatchCount) {
      setBatchCount(Math.max(1, maxBatchCount));
    }
  }, [maxBatchCount, batchCount]);

  const handleAutoFill = () => {
    if (!autoFillCandidate) return;
    if (onSelectBadgeIds) {
      onSelectBadgeIds(autoFillCandidate);
    } else {
      onClearSlots();
    }
    setBatchCount(1);
  };

  const handleBatchChange = (newCount: number) => {
    setBatchCount(Math.max(1, Math.min(newCount, maxBatchCount)));
  };

  const handleStrikeForge = () => {
    if (
      !validation.valid ||
      !validation.targetTier ||
      !validation.possibleProjects ||
      !validation.possibleShapes
    ) {
      return;
    }

    const totalCost = costPerCraft * batchCount;
    if (inkBalance < totalCost || isForging) return;

    const batchTrios = findBatchBadgeIds(slottedBadges, badges, batchCount);
    if (!batchTrios || batchTrios.length !== batchCount) return;

    setIsForging(true);

    // Strike 1 (0ms)
    setStrikeStep(1);
    forgeAudio.playStrike1();

    // Strike 2 (200ms)
    setTimeout(() => {
      setStrikeStep(2);
      forgeAudio.playStrike2();
    }, 200);

    // Strike 3 (420ms)
    setTimeout(() => {
      setStrikeStep(3);
      forgeAudio.playStrike3();
    }, 420);

    // Transmutation & Quenching (650ms)
    setTimeout(() => {
      const initialInk = inkBalance;
      const results: Badge[] = [];

      for (const trio of batchTrios) {
        const chosenProject =
          validation.possibleProjects![
            Math.floor(Math.random() * validation.possibleProjects!.length)
          ];

        const chosenShape =
          validation.possibleShapes![
            Math.floor(Math.random() * validation.possibleShapes!.length)
          ];

        const minted = forgeBadges(
          trio,
          validation.targetTier!,
          chosenProject,
          chosenShape
        );

        if (minted) results.push(minted);
      }

      const newInk = useShowcaseStore.getState().inkBalance;
      const actualSpent = initialInk - newInk;
      const saved = Math.max(0, totalCost - actualSpent);

      forgeAudio.playQuenchSteam();

      setMintedResults(results);
      setInkSavedAmount(saved);
      setIsModalOpen(true);

      onClearSlots();
      setBatchCount(1);
      setStrikeStep(0);
      setIsForging(false);
    }, 650);
  };

  return (
    <motion.div
      animate={isShaking ? { x: [-5, 5, -4, 4, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="min-h-[500px] border border-neutral-800 rounded-lg bg-neutral-950/50 p-4 sm:p-5 flex flex-col items-center gap-3 sm:gap-4 w-full"
    >
      {/* 1. Altar Trio Arc & Bottom-Connecting Conduits */}
      <ForgeAltarSlots
        slots={[slottedBadges[0] || null, slottedBadges[1] || null, slottedBadges[2] || null]}
        onRemoveBadge={onRemoveFromSlot}
        isValidRecipe={validation.valid}
        activeTier={activeTier}
        strikeStep={strikeStep}
      />

      {/* 2. Crucible Convergence Node */}
      <ForgeCrucibleNode
        validation={validation}
        slottedCount={slottedBadges.length}
      />

      {/* 3. Batch Multiplier Stepper & Autofill / Clear Controls */}
      <ForgeBatchControls
        batchCount={batchCount}
        maxBatchCount={maxBatchCount}
        costPerCraft={costPerCraft}
        inkBalance={inkBalance}
        isValidRecipe={validation.valid}
        slottedCount={slottedBadges.length}
        onBatchChange={handleBatchChange}
        onAutoFill={handleAutoFill}
        onClearForge={onClearSlots}
        hasAutoFillCandidate={!!autoFillCandidate}
        disabled={isForging}
      />

      {/* 4. Kinetic Anvil Strike Action Button */}
      <ForgeAnvilTrigger
        isValid={validation.valid}
        isForging={isForging}
        canAfford={inkBalance >= costPerCraft * batchCount}
        totalCost={costPerCraft * batchCount}
        batchCount={batchCount}
        slottedCount={slottedBadges.length}
        strikeStep={strikeStep}
        onStrike={handleStrikeForge}
      />

      {/* 5. Transmutation Result & Ink Retention Reveal Modal */}
      <ForgeResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        forgedBadges={mintedResults}
        inkSaved={inkSavedAmount}
      />
    </motion.div>
  );
}