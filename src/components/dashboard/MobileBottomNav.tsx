// Run inside: frontend/
// src/components/dashboard/MobileBottomNav.tsx

import React from 'react';
import { Package, LayoutDashboard, Flame, Sparkles, Gift } from 'lucide-react';

export type MobileTab = 'packs' | 'showcase' | 'forge' | 'gacha' | 'rewards';

interface MobileBottomNavProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  packCount?: number;
  unclaimedRewardsCount?: number;
}

export default function MobileBottomNav({
  currentTab,
  onSelectTab,
  packCount = 0,
  unclaimedRewardsCount = 0,
}: MobileBottomNavProps) {
  const tabs: Array<{
    id: MobileTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
    isAlert?: boolean;
    dividerAfter?: boolean;
  }> = [
    // Slot 1: Pack Depot
    {
      id: 'packs',
      label: 'Packs',
      icon: Package,
      count: packCount > 0 ? packCount : undefined,
      dividerAfter: true,
    },
    // Slots 2–4: Core Workbenches
    {
      id: 'showcase',
      label: 'Showcase',
      icon: LayoutDashboard,
    },
    {
      id: 'forge',
      label: 'Forge',
      icon: Flame,
    },
    {
      id: 'gacha',
      label: 'Open Packs',
      icon: Sparkles,
      dividerAfter: true,
    },
    // Slot 5: Rewards & Progression
    {
      id: 'rewards',
      label: 'Rewards',
      icon: Gift,
      count: unclaimedRewardsCount > 0 ? unclaimedRewardsCount : undefined,
      isAlert: unclaimedRewardsCount > 0,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-800/80 backdrop-blur-md px-1 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full w-full py-1 transition-all select-none active:scale-95 cursor-pointer ${
                tab.dividerAfter ? 'border-r border-neutral-800/60' : ''
              } ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon
                  size={18}
                  className={`transition-transform duration-200 ${
                    isActive
                      ? 'scale-110 text-emerald-400'
                      : tab.isAlert
                        ? 'text-purple-300 animate-[pulse_2.8s_ease-in-out_infinite]'
                        : ''
                  }`}
                />
                {tab.count !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-3 flex items-center justify-center font-mono leading-none rounded-full ${
                      tab.isAlert
                        ? 'min-w-[16px] h-4 px-1 bg-emerald-500 text-neutral-950 text-[10px] font-extrabold shadow-sm'
                        : 'min-w-[14px] h-3.5 px-1 bg-neutral-900/95 border border-neutral-700 text-neutral-200 text-[9px] font-bold'
                    }`}
                  >
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors whitespace-nowrap ${
                  isActive ? 'text-white font-semibold' : 'text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}