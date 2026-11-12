// Run inside: frontend/
// src/components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { useShowcaseStore, type PackType, type Badge } from '@/store/useShowcaseStore';
import DashboardHeader from './dashboard/DashboardHeader';
import InventorySummary from './dashboard/InventorySummary';
import BadgesInventory from './dashboard/BadgesInventory';
import PacksInventory from './dashboard/PacksInventory';
import ShowcaseView from './dashboard/ShowcaseView';
import Forge from './Forge';
import Gacha from './Gacha';
import MobileBottomNav, { type MobileTab } from './dashboard/MobileBottomNav';
import { Button } from '@/components/ui/button';
import QuestProgressToast from '@/components/rewards/QuestProgressToast';
import RewardsModal from './rewards/RewardsModal';

export default function Dashboard() {
  const currentDay = useShowcaseStore((state) => state.currentDay);
  const inkBalance = useShowcaseStore((state) => state.inkBalance);
  const badges = useShowcaseStore((state) => state.badges);
  const unopenedPacks = useShowcaseStore((state) => state.unopenedPacks);
  const stagedSlotId = useShowcaseStore((state) => state.stagedSlotId);
  const stagedBadgeId = useShowcaseStore((state) => state.stagedBadgeId);
  const setStagedBadgeId = useShowcaseStore((state) => state.setStagedBadgeId);
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);

  // Desktop active views
  const [inventoryView, setInventoryView] = useState<'badges' | 'packs'>('badges');
  const [activeTab, setActiveTab] = useState<'showcase' | 'forge' | 'gacha'>('showcase');
  const [selectedGachaPack, setSelectedGachaPack] = useState<PackType>('explorer');

  // Mobile dedicated tab state
  const [mobileTab, setMobileTab] = useState<MobileTab>('badges');

  // Forge slotting & shake state
  const [selectedForgeIds, setSelectedForgeIds] = useState<string[]>([]);
  const [isForgeShaking, setIsForgeShaking] = useState<boolean>(false);

  // Auto-switch inventory from Packs to Badges when a Showcase slot is clicked
  useEffect(() => {
    if (stagedSlotId !== null) {
      setInventoryView('badges');
    }
  }, [stagedSlotId]);

  const totalBadges = Object.keys(badges).length;
  const totalPacks = Object.values(unopenedPacks).reduce((sum, count) => sum + count, 0);

  // Synchronized mobile dock handler
  const handleSelectMobileTab = (tab: MobileTab) => {
    setMobileTab(tab);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    if (tab === 'badges') {
      setInventoryView('badges');
      if (isMobile) {
        document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'packs') {
      setInventoryView('packs');
      if (isMobile) {
        document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tab === 'showcase' || tab === 'forge') {
      setActiveTab(tab);
      setInventoryView('badges');
      if (isMobile) {
        requestAnimationFrame(() => {
          document.getElementById('action-hub-section')?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    } else if (tab === 'gacha') {
      setActiveTab('gacha');
      if (isMobile) {
        requestAnimationFrame(() => {
          document.getElementById('action-hub-section')?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  };

  const handleOpenPackInShrine = (packType: PackType) => {
    setSelectedGachaPack(packType);
    setActiveTab('gacha');
    setMobileTab('gacha');
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    setSelectedForgeIds((prev) => prev.filter((_, idx) => idx !== slotIndex));
  };

  const handleClearSlots = () => {
    setSelectedForgeIds([]);
  };

  const handleBadgeClick = (stack: Badge & { count: number; ids: string[] }) => {
    if (activeTab === 'forge') {
      if (selectedForgeIds.length >= 3) {
        setIsForgeShaking(true);
        setTimeout(() => setIsForgeShaking(false), 350);
        return;
      }

      if (selectedForgeIds.length > 0) {
        const firstBadge = badges[selectedForgeIds[0]];
        if (firstBadge && firstBadge.tier !== stack.tier) {
          setIsForgeShaking(true);
          setTimeout(() => setIsForgeShaking(false), 350);
          return;
        }
      }

      const nextAvailableId = stack.ids.find((id) => !selectedForgeIds.includes(id));
      if (nextAvailableId) {
        setSelectedForgeIds((prev) => [...prev, nextAvailableId]);
      }
    } else if (activeTab === 'showcase') {
      if (stagedBadgeId && stack.ids.includes(stagedBadgeId)) {
        setStagedBadgeId(null);
        return;
      }

      const targetBadgeId = stack.ids[0] ?? stack.id;
      if (targetBadgeId) {
        setStagedBadgeId(targetBadgeId);
      }
    }
  };

  const isSplitWorkbenchMobile = mobileTab === 'showcase' || mobileTab === 'forge';
  const showInventoryOnMobile =
    mobileTab === 'badges' || mobileTab === 'packs' || isSplitWorkbenchMobile;
  const showHubOnMobile =
    mobileTab === 'showcase' || mobileTab === 'forge' || mobileTab === 'gacha';

  return (
    <div className="min-h-screen bg-black text-neutral-50 flex flex-col items-center">
      <QuestProgressToast />

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5 pb-24 lg:pb-6 flex flex-col gap-3 sm:gap-3.5">
        {/* Navigation Header */}
        <DashboardHeader
          currentDay={currentDay}
          inkBalance={inkBalance}
          onOpenRewards={() => setIsRewardsOpen(true)}
        />

        {/* 2. Main Workspace: Viewport-clamped on desktop so Left Inventory & Right Action Hub stay locked in height */}
        <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 relative items-stretch lg:h-[calc(100vh-145px)] lg:min-h-[560px] lg:max-h-[820px]">
          {/* Action Hub Column */}
          <section
            id="action-hub-section"
            className={`w-full lg:col-span-6 lg:order-2 flex-col gap-4 scroll-mt-20 lg:h-full lg:min-h-0 ${
              showHubOnMobile ? 'flex order-1' : 'hidden lg:flex'
            }`}
          >
            {/* Desktop Switcher: Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-3 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs gap-1 w-full shrink-0">
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

            {/* Action Hub Card: Matches Left Inventory height seamlessly */}
            <div className="w-full border border-neutral-800 rounded-xl bg-neutral-950/70 shadow-lg min-h-0 h-auto lg:flex-1 lg:h-full flex flex-col justify-center overflow-hidden">
              {activeTab === 'showcase' && <ShowcaseView />}
              {activeTab === 'forge' && (
                <Forge
                  selectedBadgeIds={selectedForgeIds}
                  onRemoveFromSlot={handleRemoveFromSlot}
                  onClearSlots={handleClearSlots}
                  onSelectBadgeIds={(ids) => setSelectedForgeIds(ids)}
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

          {/* Inventory Column */}
          <section
            id="inventory-section"
            className={`w-full lg:col-span-6 lg:order-1 flex-col gap-4 scroll-mt-20 lg:h-full lg:min-h-0 ${
              showInventoryOnMobile ? 'flex order-2' : 'hidden lg:flex'
            }`}
          >
            {/* Desktop Switcher: Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs gap-1 w-full shrink-0">
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

            {/* Dynamic Viewport Content */}
            {inventoryView === 'badges' ? (
              <div className="w-full flex flex-col gap-4 lg:flex-1 lg:min-h-0">
                <div className={`w-full shrink-0 ${isSplitWorkbenchMobile ? 'hidden lg:block' : 'block'}`}>
                  <InventorySummary badges={badges} />
                </div>

                <div className="w-full lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
                  <BadgesInventory
                    badges={badges}
                    isForgeActive={activeTab === 'forge'}
                    isCompactMobile={isSplitWorkbenchMobile}
                    selectedForgeIds={selectedForgeIds}
                    onBadgeClick={handleBadgeClick}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1 custom-scrollbar">
                <PacksInventory onOpenInShrine={handleOpenPackInShrine} />
              </div>
            )}
          </section>
        </div>
      </div>

      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        onNavigateActionRoute={(route) => {
          setActiveTab(route);
          setMobileTab(route);
        }}
      />

      {/* Mobile-Only Bottom Navigation Dock */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        badgeCount={totalBadges}
        packCount={totalPacks}
      />
    </div>
  );
}