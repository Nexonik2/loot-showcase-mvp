// Run inside: frontend/
// src/components/Gacha.tsx

import React, { useState, useEffect } from 'react';
import {
  useShowcaseStore,
  type PackType,
  type BadgeShape,
  PACK_CONFIGS,
} from '@/store/useShowcaseStore';
import PackTierSelector from './gacha/PackTierSelector';
import AffiliationBiasSelector from './gacha/AffiliationBiasSelector';
import UnsealAltar from './gacha/UnsealAltar';
import PackOpeningStage from './gacha/PackOpeningStage';

interface GachaShrineProps {
  selectedPackType?: PackType;
  onSelectPackType?: (pack: PackType) => void;
}

export default function GachaShrine({
  selectedPackType: controlledPackType,
  onSelectPackType,
}: GachaShrineProps) {
  const inkBalance = useShowcaseStore((state) => state.inkBalance);
  const unopenedPacks = useShowcaseStore((state) => state.unopenedPacks);
  const buyPacks = useShowcaseStore((state) => state.buyPacks);

  const [internalPackType, setInternalPackType] = useState<PackType>('explorer');
  const activePackType = controlledPackType ?? internalPackType;

  const setActivePackType = (pack: PackType) => {
    if (onSelectPackType) {
      onSelectPackType(pack);
    } else {
      setInternalPackType(pack);
    }
  };

  const [batchCount, setBatchCount] = useState<number>(1);
  const [isOpeningActive, setIsOpeningActive] = useState<boolean>(false);

  const [selectedShapeBias, setSelectedShapeBias] = useState<BadgeShape | undefined>(undefined);
  const [selectedProjectBias, setSelectedProjectBias] = useState<string | undefined>(undefined);

  const ownedCount = unopenedPacks[activePackType] || 0;
  const currentConfig = PACK_CONFIGS[activePackType];

  useEffect(() => {
    setBatchCount(1);
    setIsOpeningActive(false);
  }, [activePackType]);

  useEffect(() => {
    if (!isOpeningActive && ownedCount > 0 && batchCount > ownedCount) {
      setBatchCount(ownedCount);
    }
  }, [ownedCount, batchCount, isOpeningActive]);

  const handleQuickBuyAndOpen = () => {
    if (inkBalance < currentConfig.cost) return;
    const bought = buyPacks(activePackType, 1);
    if (bought) {
      setBatchCount(1);
      setIsOpeningActive(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 sm:p-5 min-h-0 h-auto lg:h-full lg:flex-1 overflow-y-auto custom-scrollbar">
      {/* 1. Pack Tier Selector */}
      <PackTierSelector
        activePackType={activePackType}
        unopenedPacks={unopenedPacks}
        onSelectPack={setActivePackType}
      />

      {/* 2. Opening Stage (Single & Batch Ritual + Reveal) vs Altar Controls */}
      {isOpeningActive ? (
        <div className="w-full max-w-xl mx-auto lg:flex-1 flex flex-col justify-center">
          <PackOpeningStage
            packType={activePackType}
            batchCount={batchCount}
            affiliation={{
              shape: activePackType === 'explorer' ? selectedShapeBias : undefined,
              projectId: activePackType === 'degen' ? selectedProjectBias : undefined,
            }}
            onClose={() => setIsOpeningActive(false)}
          />
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-3.5 sm:gap-4 lg:flex-1 lg:min-h-0">
          {/* Collapsible Shape / Project Affiliation Pickers */}
          <AffiliationBiasSelector
            activePackType={activePackType}
            selectedShapeBias={selectedShapeBias}
            selectedProjectBias={selectedProjectBias}
            onSelectShapeBias={setSelectedShapeBias}
            onSelectProjectBias={setSelectedProjectBias}
          />

          {/* Unsealing Altar Centerpiece */}
          <UnsealAltar
            activePackType={activePackType}
            ownedCount={ownedCount}
            batchCount={batchCount}
            inkBalance={inkBalance}
            onBatchCountChange={setBatchCount}
            onStartOpening={() => setIsOpeningActive(true)}
            onQuickBuyAndOpen={handleQuickBuyAndOpen}
          />
        </div>
      )}
    </div>
  );
}