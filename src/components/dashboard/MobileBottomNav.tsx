// src/components/dashboard/MobileBottomNav.tsx

import React from 'react';
import { Shield, Package, LayoutDashboard, Flame, Sparkles } from 'lucide-react';

export type MobileTab = 'badges' | 'packs' | 'showcase' | 'forge' | 'gacha';

interface MobileBottomNavProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  badgeCount?: number;
  packCount?: number;
}

export default function MobileBottomNav({
  currentTab,
  onSelectTab,
  badgeCount = 0,
  packCount = 0,
}: MobileBottomNavProps) {
  const tabs = [
    // Group 1: Inventory
    {
      id: 'badges' as MobileTab,
      label: 'Badges',
      icon: Shield,
      count: badgeCount > 0 ? badgeCount : undefined,
      group: 'inventory',
    },
    {
      id: 'packs' as MobileTab,
      label: 'Packs',
      icon: Package,
      count: packCount > 0 ? packCount : undefined,
      group: 'inventory',
    },
    // Group 2: Action Hub
    {
      id: 'showcase' as MobileTab,
      label: 'Showcase',
      icon: LayoutDashboard,
      group: 'hub',
    },
    {
      id: 'forge' as MobileTab,
      label: 'Forge',
      icon: Flame,
      group: 'hub',
    },
    {
      id: 'gacha' as MobileTab,
      label: 'Shrine',
      icon: Sparkles,
      group: 'hub',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-800/80 backdrop-blur-md px-1 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto h-14">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isGroupBoundary = idx === 1;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full w-full py-1 transition-all select-none active:scale-95 ${
                isGroupBoundary ? 'border-r border-neutral-800/60' : ''
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
                    isActive ? 'scale-110 text-emerald-400' : ''
                  }`}
                />
                {tab.count !== undefined && (
                  <span className="absolute -top-1.5 -right-3 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[9px] font-mono font-bold bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-full">
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
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