// Run inside: frontend/
// src/components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { useShowcaseStore, type PackType } from '@/store/useShowcaseStore';
import DashboardHeader from './dashboard/DashboardHeader';
import InventorySummary from './dashboard/InventorySummary';
import BadgesInventory from './dashboard/BadgesInventory';
import PacksInventory from './dashboard/PacksInventory';
import ShowcaseView from './dashboard/ShowcaseView';
import BadgeActionModal, { type StackedBadgeItem } from './dashboard/BadgeActionModal';
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
  const cancelInscription = useShowcaseStore((state) => state.cancelInscription);

  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);

  // Desktop active views
  const [inventoryView, setInventoryView] = useState<'badges' | 'packs'>('badges');
  const [activeTab, setActiveTab] = useState<'showcase' | 'forge' | 'gacha'>('showcase');
  const [selectedGachaPack, setSelectedGachaPack] = useState<PackType>('explorer');

  // Mobile dedicated tab state & viewport listener
  const [mobileTab, setMobileTab] = useState<MobileTab>('showcase');
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  // Forge slotting & shake state
  const [selectedForgeIds, setSelectedForgeIds] = useState<string[]>([]);
  const [isForgeShaking, setIsForgeShaking] = useState<boolean>(false);

  // Standalone Badge Action Modal state (for mobile Badges view or non-workbench clicks)
  const [actionModalStack, setActionModalStack] = useState<StackedBadgeItem | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const handleViewportChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (e.matches) {
        // Sync mobileTab to activeTab when resizing from desktop down to mobile
        setMobileTab((prev) =>
          prev === 'badges' || prev === 'packs' ? activeTab : activeTab
        );
      }
    };
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, [activeTab]);

  // Desktop-only soft-sync: clicking a Showcase slot switches left column from Packs to Badges
  useEffect(() => {
    if (stagedSlotId !== null && !isMobile) {
      setInventoryView('badges');
    }
  }, [stagedSlotId, isMobile]);

  const totalBadges = Object.keys(badges).length;
  const totalPacks = Object.values(unopenedPacks).reduce((sum, count) => sum + count, 0);

  // Clear pending Showcase & Forge selections whenever switching workbenches
  const clearAllSelections = () => {
    cancelInscription();
    setSelectedForgeIds([]);
    setActionModalStack(null);
  };

  // Desktop Action Hub tab switcher with desktop-only inventory soft-sync & mobileTab sync
  const handleDesktopTabChange = (nextTab: 'showcase' | 'forge' | 'gacha') => {
    if (nextTab !== activeTab) {
      clearAllSelections();
      setActiveTab(nextTab);
    }
    setMobileTab(nextTab);

    if (!isMobile) {
      setInventoryView(nextTab === 'gacha' ? 'packs' : 'badges');
    }
  };

  // Synchronized mobile dock handler
  const handleSelectMobileTab = (tab: MobileTab) => {
    clearAllSelections();
    setMobileTab(tab);

    if (tab === 'badges' || tab === 'packs') {
      setInventoryView(tab);
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
    clearAllSelections();
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

  // Determine which workbench is actively visible to the user right now
  const isShowcaseWorkbenchVisible = isMobile
    ? mobileTab === 'showcase'
    : activeTab === 'showcase';
  const isForgeWorkbenchVisible = isMobile
    ? mobileTab === 'forge'
    : activeTab === 'forge';

  const handleBadgeClick = (stack: StackedBadgeItem) => {
    if (isForgeWorkbenchVisible) {
      if (stack.tier === 1) return;

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
      return;
    }

    if (isShowcaseWorkbenchVisible) {
      if (stack.projectId === 'wildcard' || stack.shape === 'wildcard') {
        return;
      }

      if (stagedBadgeId && stack.ids.includes(stagedBadgeId)) {
        setStagedBadgeId(null);
        return;
      }

      const targetBadgeId = stack.ids[0] ?? stack.id;
      if (targetBadgeId) {
        setStagedBadgeId(targetBadgeId);
      }
      return;
    }

    setActionModalStack(stack);
  };

  const handleModalRouteToShowcase = (badgeId: string) => {
    clearAllSelections();
    setActiveTab('showcase');
    setMobileTab('showcase');
    setInventoryView('badges');
    setStagedBadgeId(badgeId);
    if (isMobile) {
      requestAnimationFrame(() => {
        document.getElementById('action-hub-section')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  };

  const handleModalRouteToForge = (badgeId: string) => {
    clearAllSelections();
    setActiveTab('forge');
    setMobileTab('forge');
    setInventoryView('badges');
    setSelectedForgeIds([badgeId]);
    if (isMobile) {
      requestAnimationFrame(() => {
        document.getElementById('action-hub-section')?.scrollIntoView({ behavior: 'smooth' });
      });
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
                onClick={() => handleDesktopTabChange('showcase')}
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
                onClick={() => handleDesktopTabChange('forge')}
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
                onClick={() => handleDesktopTabChange('gacha')}
                className={`h-8 font-semibold transition-all ${
                  activeTab === 'gacha'
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60 hover:bg-neutral-800 hover:text-white cursor-default'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700/60'
                }`}
              >
                Gacha Shrine
              </Button>
            </div>

            {/* Action Hub Card */}
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
                <div
                  className={`w-full shrink-0 ${
                    isSplitWorkbenchMobile ? 'hidden lg:block' : 'block'
                  }`}
                >
                  <InventorySummary badges={badges} />
                </div>

                <div className="w-full lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
                  <BadgesInventory
                    badges={badges}
                    isForgeActive={isForgeWorkbenchVisible}
                    isShowcaseActive={isShowcaseWorkbenchVisible}
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

      <BadgeActionModal
        stack={actionModalStack}
        onClose={() => setActionModalStack(null)}
        onSelectShowcase={handleModalRouteToShowcase}
        onSelectForge={handleModalRouteToForge}
      />

      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        onNavigateActionRoute={(route, packType) => {
          clearAllSelections();
          if (packType) {
            setSelectedGachaPack(packType);
          }
          setActiveTab(route);
          setMobileTab(route);
          if (!isMobile) {
            setInventoryView(route === 'gacha' ? 'packs' : 'badges');
          }
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