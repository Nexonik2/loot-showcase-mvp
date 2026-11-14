// src/components/Forge.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useShowcaseStore, type Badge } from '@/store/useShowcaseStore';
import { useQuestStore } from '@/store/useQuestStore';
import {
  ForgeAltarSlots,
  ForgeCrucibleNode,
  ForgeBatchControls,
  ForgeAnvilTrigger,
} from './forge';
import WorkbenchHelpBanner from './dashboard/WorkbenchHelpBanner';
import {
  validateForgeRecipe,
  calculateMaxBatchCount,
  findContextualForgeCandidate,
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

const FORGE_HELP_BULLETS = [
  'Combine 3 same-tier badges (T5–T2) to mint 1 badge of the next higher tier.',
  'Valid trios: 3x same Project, 2x same Project + 1x Wildcard, or 3x same Shape (2+1 Projects).',
  'Use Autofill to quickly slot compatible duplicates from your inventory.',
];

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

  const pauseQuestToasts = useQuestStore((state) => state.pauseQuestToasts);
  const resumeQuestToasts = useQuestStore((state) => state.resumeQuestToasts);

  const [batchCount, setBatchCount] = useState<number>(1);
  const [isForging, setIsForging] = useState<boolean>(false);
  const [strikeStep, setStrikeStep] = useState<number>(0);
  const [mintedResults, setMintedResults] = useState<Badge[]>([]);
  const [inkSavedAmount, setInkSavedAmount] = useState<number>(0);

  const slottedBadges = useMemo(() => {
    return selectedBadgeIds.map((id) => badges[id]).filter(Boolean) as Badge[];
  }, [selectedBadgeIds, badges]);

  useEffect(() => {
    if (selectedBadgeIds.length > 0 && mintedResults.length > 0) {
      setMintedResults([]);
      setInkSavedAmount(0);
    }
  }, [selectedBadgeIds.length, mintedResults.length]);

  const activeTier = slottedBadges.length > 0 ? slottedBadges[0].tier : null;

  const validation = useMemo(() => {
    return validateForgeRecipe(slottedBadges);
  }, [slottedBadges]);

  const costPerCraft = validation.cost || 0;

  const maxBatchCount = useMemo(() => {
    return calculateMaxBatchCount(
      slottedBadges,
      badges,
      costPerCraft,
      inkBalance,
      validation.valid
    );
  }, [slottedBadges, badges, costPerCraft, inkBalance, validation.valid]);

  const autoFillCandidate = useMemo(() => {
    return findContextualForgeCandidate(slottedBadges, badges);
  }, [slottedBadges, badges]);

  useEffect(() => {
    if (batchCount > maxBatchCount) {
      setBatchCount(Math.max(1, maxBatchCount));
    }
  }, [maxBatchCount, batchCount]);

  const handleAutoFill = () => {
    if (!autoFillCandidate) return;
    setMintedResults([]);
    setInkSavedAmount(0);
    if (onSelectBadgeIds) {
      onSelectBadgeIds(autoFillCandidate);
    }
    setBatchCount(1);
  };

  const handleBatchChange = (newCount: number) => {
    setBatchCount(Math.max(1, Math.min(newCount, maxBatchCount)));
  };

  const handleClearResults = () => {
    setMintedResults([]);
    setInkSavedAmount(0);
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
    setMintedResults([]);
    setInkSavedAmount(0);
    pauseQuestToasts();

    setStrikeStep(1);
    forgeAudio.playStrike1();

    setTimeout(() => {
      setStrikeStep(2);
      forgeAudio.playStrike2();
    }, 200);

    setTimeout(() => {
      setStrikeStep(3);
      forgeAudio.playStrike3();
    }, 420);

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

      onClearSlots();
      setBatchCount(1);
      setStrikeStep(0);
      setIsForging(false);
      resumeQuestToasts();
    }, 650);
  };

  return (
    <motion.div
      animate={isShaking ? { x: [-5, 5, -4, 4, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-0 h-auto lg:h-full lg:flex-1 p-4 sm:p-5 gap-3.5 sm:gap-4 overflow-y-auto custom-scrollbar"
    >
      {/* Contextual Onboarding Banner / Subtle Guide Toggle */}
      <WorkbenchHelpBanner
        tipId="forge"
        title="How The Forge Works"
        bullets={FORGE_HELP_BULLETS}
      />

      {/* Upper Workbench: Altar Trio + Conduits + Crucible Node */}
      <div className="w-full flex flex-col items-center gap-3">
        <ForgeAltarSlots
          slots={[
            slottedBadges[0] || null,
            slottedBadges[1] || null,
            slottedBadges[2] || null,
          ]}
          onRemoveBadge={onRemoveFromSlot}
          isValidRecipe={validation.valid}
          activeTier={activeTier}
          strikeStep={strikeStep}
        />

        <ForgeCrucibleNode
          validation={validation}
          slottedCount={slottedBadges.length}
          mintedResults={mintedResults}
          inkSaved={inkSavedAmount}
          onClearResults={handleClearResults}
        />
      </div>

      {/* Lower Controls */}
      <div className="w-full flex flex-col items-center gap-3">
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
      </div>
    </motion.div>
  );
}