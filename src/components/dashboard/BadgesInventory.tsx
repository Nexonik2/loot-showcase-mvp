// Run inside: frontend/
// src/components/dashboard/BadgesInventory.tsx

import React, { useState, useMemo } from 'react';
import { Layers, Shapes, Clock, Award, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BadgeCard from '@/components/BadgeCard';
import { type Badge, useShowcaseStore } from '@/store/useShowcaseStore';

export type OrderMode = 'age' | 'tier' | 'project' | 'shape';
export type OrderDirection = 'desc' | 'asc';
export type GroupingMode = OrderMode;

interface BadgesInventoryProps {
  badges: Record<string, Badge>;
  selectedForgeIds: string[];
  unseenBadgeIds?: string[];
  isForgeActive?: boolean;
  isShowcaseActive?: boolean;
  isCompactMobile?: boolean;
  onBadgeClick: (stack: Badge & { count: number; ids: string[] }) => void;
  onHoverStack?: (stackIds: string[]) => void;
}

// Extracts numeric timestamp from badge IDs (e.g. badge-1700000000000-...)
const getBadgeTimestamp = (id: string): number => {
  const match = id.match(/\d{10,14}/);
  return match ? parseInt(match[0], 10) : 0;
};

export default function BadgesInventory({
  badges,
  selectedForgeIds,
  isForgeActive = false,
  isShowcaseActive = false,
  isCompactMobile = false,
  onBadgeClick,
}: BadgesInventoryProps) {
  const [orderMode, setOrderMode] = useState<OrderMode>('age');
  const [orderDirection, setOrderDirection] = useState<OrderDirection>('desc');

  const stagedBadgeId = useShowcaseStore((state) => state.stagedBadgeId);

  // Derive active tier for Forge compatibility lock & tier-floating
  const activeForgeTier = useMemo(() => {
    if (!isForgeActive || selectedForgeIds.length === 0) return null;
    const firstBadge = badges[selectedForgeIds[0]];
    return firstBadge ? firstBadge.tier : null;
  }, [isForgeActive, selectedForgeIds, badges]);

  // Handle order selection: clicking a new button sets it to 'desc', clicking active toggles direction
  const handleOrderClick = (mode: OrderMode) => {
    if (orderMode === mode) {
      setOrderDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setOrderMode(mode);
      setOrderDirection('desc');
    }
  };

  const renderSortIndicator = (mode: OrderMode) => {
    if (orderMode !== mode) return null;
    return orderDirection === 'desc' ? (
      <ArrowDown size={12} className="text-emerald-400" />
    ) : (
      <ArrowUp size={12} className="text-emerald-400" />
    );
  };

  // Stack identical badges (same project, shape, tier) and sort
  const stackedInventory = useMemo(() => {
    const grouped = Object.values(badges).reduce((acc, badge) => {
      const stackKey = `${badge.projectId}-${badge.shape}-${badge.tier}`;

      if (!acc[stackKey]) {
        acc[stackKey] = { ...badge, count: 0, ids: [] };
      }
      acc[stackKey].count += 1;
      acc[stackKey].ids.push(badge.id);
      return acc;
    }, {} as Record<string, Badge & { count: number; ids: string[] }>);

    return Object.values(grouped).sort((a, b) => {
      // Float compatible tier badges to the top when forging
      if (isForgeActive) {
        if (activeForgeTier !== null) {
          const aMatchesTier = a.tier === activeForgeTier ? 0 : 1;
          const bMatchesTier = b.tier === activeForgeTier ? 0 : 1;
          if (aMatchesTier !== bMatchesTier) {
            return aMatchesTier - bMatchesTier;
          }
        }

        // Keep forgeable tiers (T2-T5) above unforgeable Tier 1 badges in Forge view
        const aIsTier1 = a.tier === 1 ? 1 : 0;
        const bIsTier1 = b.tier === 1 ? 1 : 0;
        if (aIsTier1 !== bIsTier1) {
          return aIsTier1 - bIsTier1;
        }
      }

      if (orderMode === 'age') {
        const timeA = Math.max(...a.ids.map(getBadgeTimestamp));
        const timeB = Math.max(...b.ids.map(getBadgeTimestamp));
        if (timeA !== timeB) {
          return orderDirection === 'desc' ? timeB - timeA : timeA - timeB;
        }
        return a.tier - b.tier;
      }

      if (orderMode === 'tier') {
        if (a.tier !== b.tier) {
          return orderDirection === 'desc' ? b.tier - a.tier : a.tier - b.tier;
        }
        return a.projectId.localeCompare(b.projectId);
      }

      if (orderMode === 'project') {
        const projectComp = a.projectId.localeCompare(b.projectId);
        if (projectComp !== 0) {
          return orderDirection === 'desc' ? -projectComp : projectComp;
        }
        return a.tier - b.tier;
      }

      if (orderMode === 'shape') {
        const shapeComp = (a.shape || '').localeCompare(b.shape || '');
        if (shapeComp !== 0) {
          return orderDirection === 'desc' ? -shapeComp : shapeComp;
        }
        return a.tier - b.tier;
      }

      return 0;
    });
  }, [badges, orderMode, orderDirection, isForgeActive, activeForgeTier]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Sorting Control Toolbar: Keeps "Order:" connected to the sort pills across all screen widths */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 text-xs text-neutral-400 px-1">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-500 shrink-0">
          Order:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800 max-w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOrderClick('age')}
            className={`h-7 px-2 sm:px-2.5 text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all ${
              orderMode === 'age'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock size={12} />
            <span>New</span>
            {renderSortIndicator('age')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOrderClick('tier')}
            className={`h-7 px-2 sm:px-2.5 text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all ${
              orderMode === 'tier'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Award size={12} />
            <span>Tier</span>
            {renderSortIndicator('tier')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOrderClick('project')}
            className={`h-7 px-2 sm:px-2.5 text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all ${
              orderMode === 'project'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers size={12} />
            <span>Project</span>
            {renderSortIndicator('project')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOrderClick('shape')}
            className={`h-7 px-2 sm:px-2.5 text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all ${
              orderMode === 'shape'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shapes size={12} />
            <span>Shape</span>
            {renderSortIndicator('shape')}
          </Button>
        </div>
      </div>

      {/* Badges Grid */}
      <Card
        className={`bg-neutral-900 border-neutral-800 flex-1 ${
          isCompactMobile ? 'min-h-0 py-3 sm:py-4 lg:py-6 lg:min-h-[550px]' : 'min-h-[550px]'
        }`}
      >
        <CardContent className="p-3 sm:p-4 lg:p-5 h-full">
          {Object.keys(badges).length === 0 ? (
            <div
              className={`h-full flex items-center justify-center border border-dashed border-neutral-800 rounded-lg bg-neutral-950/50 ${
                isCompactMobile ? 'min-h-[200px] lg:min-h-[400px]' : 'min-h-[400px]'
              }`}
            >
              <p className="text-neutral-500 text-sm">Un-inscribed badges will appear here.</p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3 sm:gap-3.5 overflow-y-auto p-1 sm:p-2 custom-scrollbar ${
                isCompactMobile
                  ? 'max-h-[clamp(300px,46dvh,540px)] lg:max-h-[650px]'
                  : 'max-h-[650px]'
              }`}
            >
              {stackedInventory.map((stackedBadge) => {
                const slottedCount = isForgeActive
                  ? stackedBadge.ids.filter((id) => selectedForgeIds.includes(id)).length
                  : 0;
                const remainingCount = stackedBadge.count - slottedCount;
                const isStaged =
                  isShowcaseActive && stagedBadgeId
                    ? stackedBadge.ids.includes(stagedBadgeId)
                    : false;

                const isWildcard =
                  stackedBadge.projectId === 'wildcard' || stackedBadge.shape === 'wildcard';

                // Dim incompatible cards strictly for the active visible workbench
                const isForgeDisabled =
                  isForgeActive &&
                  (stackedBadge.tier === 1 ||
                    (activeForgeTier !== null && stackedBadge.tier !== activeForgeTier));
                const isShowcaseDisabled = isShowcaseActive && isWildcard;
                const isCardDisabled = isForgeDisabled || isShowcaseDisabled;

                return (
                  <BadgeCard
                    key={`${stackedBadge.projectId}-${stackedBadge.shape}-${stackedBadge.tier}`}
                    tier={stackedBadge.tier}
                    projectId={stackedBadge.projectId}
                    shape={stackedBadge.shape}
                    count={remainingCount}
                    isSelected={slottedCount > 0 || isStaged}
                    isSlottedOut={remainingCount === 0}
                    isDisabled={isCardDisabled}
                    onClick={() => {
                      if (remainingCount > 0 && !isCardDisabled) {
                        onBadgeClick(stackedBadge);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}