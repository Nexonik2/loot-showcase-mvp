// src/components/Dashboard.tsx

import React, { useState } from 'react';
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
import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const currentDay = useShowcaseStore((state) => state.currentDay);
  const inkBalance = useShowcaseStore((state) => state.inkBalance);
  const badges = useShowcaseStore((state) => state.badges);
  const unopenedPacks = useShowcaseStore((state) => state.unopenedPacks);

  // Desktop active views
  const [inventoryView, setInventoryView] = useState<'badges' | 'packs'>('badges');
  const [activeTab, setActiveTab] = useState<'showcase' | 'forge' | 'gacha'>('showcase');

  // Mobile dedicated tab state
  const [mobileTab, setMobileTab] = useState<MobileTab>('badges');

  // Forge slotting & shake state
  const [selectedForgeIds, setSelectedForgeIds] = useState<string[]>([]);
  const [isForgeShaking, setIsForgeShaking] = useState<boolean>(false);

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
    setActiveTab('gacha');
    setMobileTab('gacha');
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    setSelectedForgeIds((prev) => prev.filter((_, idx) => idx !== slotIndex));
  };

  const handleClearSlots = () => {
    setSelectedForgeIds([]);
  };

  const handleBadgeClick = (badge: Badge) => {
    if (activeTab === 'forge') {
      if (selectedForgeIds.includes(badge.id)) {
        setSelectedForgeIds((prev) => prev.filter((id) => id !== badge.id));
        return;
      }

      if (selectedForgeIds.length >= 3) {
        setIsForgeShaking(true);
        setTimeout(() => setIsForgeShaking(false), 350);
        return;
      }

      if (selectedForgeIds.length > 0) {
        const firstBadge = badges[selectedForgeIds[0]];
        if (firstBadge && firstBadge.tier !== badge.tier) {
          setIsForgeShaking(true);
          setTimeout(() => setIsForgeShaking(false), 350);
          return;
        }
      }

      setSelectedForgeIds((prev) => [...prev, badge.id]);
    }
  };

  const isSplitWorkbenchMobile = mobileTab === 'showcase' || mobileTab === 'forge';
  const showInventoryOnMobile =
    mobileTab === 'badges' || mobileTab === 'packs' || isSplitWorkbenchMobile;
  const showHubOnMobile =
    mobileTab === 'showcase' || mobileTab === 'forge' || mobileTab === 'gacha';

  return (
    <div className="min-h-screen bg-black text-neutral-50 flex flex-col items-center">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 flex flex-col gap-6">
        
        {/* Navigation Header */}
        <DashboardHeader
          currentDay={currentDay}
          inkBalance={inkBalance}
          onOpenRewards={() => {}}
        />

        {/* 2. Main Workspace: items-stretch on mobile guarantees full width */}
        <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 relative items-stretch">

          {/* Action Hub Column */}
          <section
            id="action-hub-section"
            className={`w-full lg:col-span-6 lg:order-2 flex-col gap-4 scroll-mt-20 lg:h-full ${
              showHubOnMobile ? 'flex order-1' : 'hidden lg:flex'
            }`}
          >
            <div className="flex items-center justify-between gap-2 min-h-[32px]">
              <h2 className="text-lg font-bold text-neutral-300 tracking-wider">
                ACTION HUB
              </h2>
            </div>

            {/* Desktop Switcher: Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-3 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs gap-1 w-full">
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

            {/* Action Hub Card: min-h-fit on mobile removes empty black void */}
            <div className="w-full min-h-0 h-auto lg:h-full flex flex-col">
              {activeTab === 'showcase' && <ShowcaseView />}
              {activeTab === 'forge' && (
                <Forge
                  selectedBadgeIds={selectedForgeIds}
                  onRemoveFromSlot={handleRemoveFromSlot}
                  onClearSlots={handleClearSlots}
                  onSelectBadgeIds={(ids) => setSelectedForgeIds(ids)}
                />
              )}
              {activeTab === 'gacha' && <Gacha />}
            </div>
          </section>

          {/* Inventory Column */}
          <section
            id="inventory-section"
            className={`w-full lg:col-span-6 lg:order-1 flex-col gap-4 scroll-mt-20 lg:h-full ${
              showInventoryOnMobile ? 'flex order-2' : 'hidden lg:flex'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-300 flex items-center gap-2 tracking-wider">
                <LayoutDashboard size={18} className="text-neutral-500" />
                YOUR INVENTORY
              </h2>
            </div>

            {/* Desktop Switcher: Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs gap-1 w-full">
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
              <div className="w-full flex flex-col gap-4">
                <div className={`w-full ${isSplitWorkbenchMobile ? 'hidden lg:block' : 'block'}`}>
                  <InventorySummary badges={badges} />
                </div>

                <div className={`w-full ${isSplitWorkbenchMobile ? 'max-h-[320px] lg:max-h-none overflow-y-auto custom-scrollbar' : ''}`}>
                  <BadgesInventory
                    badges={badges}
                    isForgeActive={activeTab === 'forge'}
                    selectedForgeIds={selectedForgeIds}
                    onBadgeClick={handleBadgeClick}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full">
                <PacksInventory onOpenInShrine={handleOpenPackInShrine} />
              </div>
            )}
          </section>

        </div>
      </div>

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