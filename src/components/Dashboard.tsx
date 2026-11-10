import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useArchiverStore, type Badge, type PackType } from '@/store/useShowcaseStore';
import { Button } from '@/components/ui/button';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import InventorySummary from '@/components/dashboard/InventorySummary';
import BadgesInventory from '@/components/dashboard/BadgesInventory';
import PacksInventory from '@/components/dashboard/PacksInventory';
import ShowcaseView from '@/components/dashboard/ShowcaseView';
import RewardsModal from '@/components/rewards/RewardsModal';
import Forge from '@/components/Forge';
import Gacha from '@/components/Gacha';

export default function Dashboard() {
  const {
    inkBalance,
    currentDay,
    badges,
    unopenedPacks,
    unseenBadgeIds = [],
    markBadgesAsSeen,
    injectTestBundle,
  } = useArchiverStore();

  // Auto-inject starting resources on initial mount/reload
  const hasInjectedRef = useRef(false);
  useEffect(() => {
    if (!hasInjectedRef.current) {
      hasInjectedRef.current = true;
      injectTestBundle();
    }
  }, [injectTestBundle]);

  // Tab & Selection States
  const [activeTab, setActiveTab] = useState<'showcase' | 'forge' | 'gacha'>('showcase');
  const [inventoryView, setInventoryView] = useState<'badges' | 'packs'>('badges');
  const [selectedGachaPack, setSelectedGachaPack] = useState<PackType>('explorer');
  const [selectedForgeIds, setSelectedForgeIds] = useState<string[]>([]);
  const [isForgeShaking, setIsForgeShaking] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);

  // Inventory Totals
  const totalBadges = Object.keys(badges).length;
  const totalPacks = useMemo(() => {
    return Object.values(unopenedPacks || {}).reduce((acc, count) => acc + count, 0);
  }, [unopenedPacks]);

  // Active Tier Constraint for Forge
  const activeForgeTier = useMemo(() => {
    if (selectedForgeIds.length === 0) return null;
    const firstBadge = badges[selectedForgeIds[0]];
    return firstBadge ? firstBadge.tier : null;
  }, [selectedForgeIds, badges]);

  // Unified LMB Handler
  const handleBadgeClick = (stack: Badge & { count: number; ids: string[] }) => {
    // 1. Forge Tab Handling
    if (activeTab === 'forge') {
      if (stack.tier === 1) return;

      // Hard-Cap: If 3 slots are full, trigger rejection shake
      if (selectedForgeIds.length >= 3) {
        setIsForgeShaking(true);
        setTimeout(() => setIsForgeShaking(false), 360);
        return;
      }

      // Tier-lock: Reject mismatching tiers
      if (activeForgeTier !== null && stack.tier !== activeForgeTier) {
        setIsForgeShaking(true);
        setTimeout(() => setIsForgeShaking(false), 360);
        return;
      }

      // Add next available ID from this stack
      const nextAvailableId = stack.ids.find((id) => !selectedForgeIds.includes(id));
      if (nextAvailableId) {
        setSelectedForgeIds((prev) => [...prev, nextAvailableId]);
      }
      return;
    }

    // 2. Showcase Tab Handling (Routes directly to Archiver Staging)
    if (activeTab === 'showcase') {
      const setStagedBadgeId = useArchiverStore.getState().setStagedBadgeId;
      if (stack.ids.length > 0) {
        setStagedBadgeId(stack.ids[0]);
      }
    }
  };

  const handleHoverStack = (stackIds: string[]) => {
    const hasUnseen = stackIds.some((id) => unseenBadgeIds.includes(id));
    if (hasUnseen && markBadgesAsSeen) {
      markBadgesAsSeen(stackIds);
    }
  };

  const handleOpenPackInShrine = (type: PackType) => {
    setSelectedGachaPack(type);
    setActiveTab('gacha');
  };

  const handleRemoveFromSlot = (idx: number) => {
    setSelectedForgeIds((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleClearSlots = () => {
    setSelectedForgeIds([]);
  };

  const handleSelectBadgeIds = (ids: string[]) => {
    setSelectedForgeIds(ids);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-50 font-sans">
      {/* Global Viewport Shell Centered with 1536px (2xl) Max Width */}
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* 1. Global Navigation & News Ticker */}
        <DashboardHeader
          currentDay={currentDay}
          inkBalance={inkBalance}
          onOpenRewards={() => setIsRewardsOpen(true)}
        />

        {/* 2. Main 50/50 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
          {/* Left Column: Persistent Inventory & Depot */}
          <section className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-300 flex items-center gap-2 tracking-wider">
                <LayoutDashboard size={18} className="text-neutral-500" />
                YOUR INVENTORY
              </h2>
            </div>

            {/* Inventory Segmented Toggle */}
            <div className="grid grid-cols-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInventoryView('badges')}
                className={`h-8 font-semibold transition-all ${
                  inventoryView === 'badges'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60 hover:bg-neutral-800 hover:text-white cursor-default'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700/60'
                }`}
              >
                Badges ({totalBadges})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInventoryView('packs')}
                className={`h-8 font-semibold transition-all ${
                  inventoryView === 'packs'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60 hover:bg-neutral-800 hover:text-white cursor-default'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700/60'
                }`}
              >
                Packs ({totalPacks})
              </Button>
            </div>

            {inventoryView === 'badges' ? (
              <>
                <InventorySummary badges={badges} />
                <BadgesInventory
                  badges={badges}
                  selectedForgeIds={selectedForgeIds}
                  unseenBadgeIds={unseenBadgeIds}
                  isForgeActive={activeTab === 'forge'}
                  onBadgeClick={handleBadgeClick}
                  onHoverStack={handleHoverStack}
                />
              </>
            ) : (
              <PacksInventory onOpenInShrine={handleOpenPackInShrine} />
            )}
          </section>

          {/* Right Column: The Action Hub */}
          <section className="lg:col-span-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 min-h-[32px]">
              <h2 className="text-lg font-bold text-neutral-300 tracking-wider">
                ACTION HUB
              </h2>
            </div>

            {/* Action Hub Segmented Tabs */}
            <div className="grid grid-cols-3 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('showcase')}
                className={`h-8 font-semibold transition-all ${
                  activeTab === 'showcase'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60 hover:bg-neutral-800 hover:text-white cursor-default'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700/60'
                }`}
              >
                The Showcase
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('forge')}
                className={`h-8 font-semibold transition-all ${
                  activeTab === 'forge'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60 hover:bg-neutral-800 hover:text-white cursor-default'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700/60'
                }`}
              >
                The Forge
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('gacha')}
                className={`h-8 font-semibold transition-all ${
                  activeTab === 'gacha'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60 hover:bg-neutral-800 hover:text-white cursor-default'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700/60'
                }`}
              >
                Gacha Shrine
              </Button>
            </div>

            {/* Action Hub Tab Content Panels */}
            {activeTab === 'showcase' && <ShowcaseView />}
            {activeTab === 'forge' && (
              <Forge
                selectedBadgeIds={selectedForgeIds}
                onRemoveFromSlot={handleRemoveFromSlot}
                onClearSlots={handleClearSlots}
                onSelectBadgeIds={handleSelectBadgeIds}
                isShaking={isForgeShaking}
              />
            )}
            {activeTab === 'gacha' && <Gacha selectedPackType={selectedGachaPack} />}
          </section>
        </div>
      </div>

      {/* Rewards Modal */}
      {isRewardsOpen && (
        <RewardsModal isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} />
      )}
    </div>
  );
}