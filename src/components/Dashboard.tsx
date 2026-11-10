// src/components/Dashboard.tsx

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
    setStagedBadgeId,
  } = useArchiverStore();

  // Auto-inject starting resources on initial mount/reload
  const hasInjectedRef = useRef(false);
    useEffect(() => {
      if (!hasInjectedRef.current) {
        hasInjectedRef.current = true;
        
        const isBrandNewSession = 
          Object.keys(badges).length === 0 && 
          inkBalance === 0 && 
          Object.values(unopenedPacks).every((count) => count === 0);

        if (isBrandNewSession) {
          injectTestBundle();
        }
      }
    }, [badges, inkBalance, unopenedPacks, injectTestBundle]);

  // Tab & Selection States
  const [activeTab, setActiveTab] = useState<'showcase' | 'forge' | 'gacha'>('showcase');
  const [inventoryView, setInventoryView] = useState<'badges' | 'packs'>('badges');
  const [selectedGachaPack, setSelectedGachaPack] = useState<PackType>('explorer');
  const [selectedForgeIds, setSelectedForgeIds] = useState<string[]>([]);
  const [isForgeShaking, setIsForgeShaking] = useState(false);

  // Rewards Modal State
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);

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

    // 2. Showcase Tab Handling: Toggle staged badge for inline inscription
    if (activeTab === 'showcase') {
      const nextAvailableId = stack.ids.find((id) => !selectedForgeIds.includes(id)) ?? stack.ids[0];
      if (nextAvailableId) {
        setStagedBadgeId(nextAvailableId);
      }
      return;
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
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans p-6">
      {/* 1. Global Navigation & News Ticker */}
      <DashboardHeader
        currentDay={currentDay}
        inkBalance={inkBalance}
        onOpenRewards={() => setIsRewardsOpen(true)}
      />

      {/* 2. Main 50/50 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
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

          {/* Action Hub Segmented Switcher */}
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

          {/* Action Hub Views */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-950/60 shadow-lg min-h-[500px]">
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
            {activeTab === 'gacha' && (
              <Gacha
                selectedPackType={selectedGachaPack}
                onSelectPackType={setSelectedGachaPack}
              />
            )}
          </div>
        </section>
      </div>

      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        onNavigateActionRoute={(route) => setActiveTab(route)}
      />
    </div>
  );
}