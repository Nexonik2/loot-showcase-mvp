// src/components/dashboard/BadgesInventory.tsx

import React, { useState, useMemo } from 'react';
import { Layers, Shapes, Clock, Award, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BadgeCard from '@/components/BadgeCard';
import { type Badge, useArchiverStore } from '@/store/useShowcaseStore';

export type OrderMode = 'age' | 'tier' | 'project' | 'shape';
export type OrderDirection = 'desc' | 'asc';

interface BadgesInventoryProps {
  badges: Record<string, Badge>;
  selectedForgeIds: string[];
  unseenBadgeIds?: string[];
  isForgeActive?: boolean;
  onBadgeClick: (stack: Badge & { count: number; ids: string[] }) => void;
  onHoverStack?: (stackIds: string[]) => void;
}

const getBadgeTimestamp = (id: string): number => {
  const match = id.match(/\d{10,14}/);
  return match ? parseInt(match[0], 10) : 0;
};

export default function BadgesInventory({
  badges,
  selectedForgeIds,
  unseenBadgeIds: propUnseenBadgeIds,
  isForgeActive = false,
  onBadgeClick,
  onHoverStack,
}: BadgesInventoryProps) {
  const [orderMode, setOrderMode] = useState<OrderMode>('age');
  const [orderDirection, setOrderDirection] = useState<OrderDirection>('desc');

  const { stagedBadgeId, unseenBadgeIds: storeUnseenBadgeIds, markBadgesAsSeen } = useArchiverStore();
  const effectiveUnseenBadgeIds = propUnseenBadgeIds ?? storeUnseenBadgeIds ?? [];

  // Determine active tier filter when Forge is active and at least 1 badge is slotted
  const activeForgeTier = useMemo(() => {
    if (!isForgeActive || selectedForgeIds.length === 0) return null;
    const firstBadge = badges[selectedForgeIds[0]];
    return firstBadge ? firstBadge.tier : null;
  }, [isForgeActive, selectedForgeIds, badges]);

  // Pre-calculate best tier owned per project and shape
  const { bestTierByProject, bestTierByShape } = useMemo(() => {
    const projBest: Record<string, number> = {};
    const shapeBest: Record<string, number> = {};

    Object.values(badges).forEach((b) => {
      if (!projBest[b.projectId] || b.tier < projBest[b.projectId]) {
        projBest[b.projectId] = b.tier;
      }
      if (!shapeBest[b.shape] || b.tier < shapeBest[b.shape]) {
        shapeBest[b.shape] = b.tier;
      }
    });

    return { bestTierByProject: projBest, bestTierByShape: shapeBest };
  }, [badges]);

  const handleOrderClick = (mode: OrderMode) => {
    if (orderMode === mode) {
      setOrderDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setOrderMode(mode);
      setOrderDirection('desc');
    }
  };

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
          return orderDirection === 'desc' ? a.tier - b.tier : b.tier - a.tier;
        }
        return a.projectId.localeCompare(b.projectId);
      }

      if (orderMode === 'project') {
        if (a.projectId !== b.projectId) {
          const rankA = bestTierByProject[a.projectId] ?? 99;
          const rankB = bestTierByProject[b.projectId] ?? 99;
          if (rankA !== rankB) {
            return orderDirection === 'desc' ? rankA - rankB : rankB - rankA;
          }
          return orderDirection === 'desc'
            ? a.projectId.localeCompare(b.projectId)
            : b.projectId.localeCompare(a.projectId);
        }
        if (a.tier !== b.tier) {
          return orderDirection === 'desc' ? a.tier - b.tier : b.tier - a.tier;
        }
        return a.shape.localeCompare(b.shape);
      }

      if (orderMode === 'shape') {
        if (a.shape !== b.shape) {
          const rankA = bestTierByShape[a.shape] ?? 99;
          const rankB = bestTierByShape[b.shape] ?? 99;
          if (rankA !== rankB) {
            return orderDirection === 'desc' ? rankA - rankB : rankB - rankA;
          }
          return orderDirection === 'desc'
            ? a.shape.localeCompare(b.shape)
            : b.shape.localeCompare(a.shape);
        }
        if (a.tier !== b.tier) {
          return orderDirection === 'desc' ? a.tier - b.tier : b.tier - a.tier;
        }
        return a.projectId.localeCompare(b.projectId);
      }

      return 0;
    });
  }, [badges, orderMode, orderDirection, bestTierByProject, bestTierByShape]);

  const renderSortIndicator = (mode: OrderMode) => {
    if (orderMode !== mode) return null;
    return orderDirection === 'desc' ? (
      <ArrowDown size={12} className="text-emerald-400" />
    ) : (
      <ArrowUp size={12} className="text-emerald-400" />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Ordering Selection Toolbar */}
      <div className="flex items-center justify-end gap-2 w-full">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider select-none">
          Order:
        </span>
        <div className="flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-800 gap-1 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOrderClick('age')}
            className={`h-7 px-2.5 flex items-center gap-1.5 transition-all ${
              orderMode === 'age' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock size={12} />
            <span>Age</span>
            {renderSortIndicator('age')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOrderClick('tier')}
            className={`h-7 px-2.5 flex items-center gap-1.5 transition-all ${
              orderMode === 'tier' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
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
            className={`h-7 px-2.5 flex items-center gap-1.5 transition-all ${
              orderMode === 'project' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
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
            className={`h-7 px-2.5 flex items-center gap-1.5 transition-all ${
              orderMode === 'shape' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shapes size={12} />
            <span>Shape</span>
            {renderSortIndicator('shape')}
          </Button>
        </div>
      </div>

      {/* Badges Grid */}
      <Card className="bg-neutral-900 border-neutral-800 flex-1 min-h-[550px]">
        <CardContent className="p-6 h-full">
          {Object.keys(badges).length === 0 ? (
            <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-neutral-800 rounded-lg bg-neutral-950/50">
              <p className="text-neutral-500 text-sm">Un-inscribed badges will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 overflow-y-auto max-h-[650px] p-2 custom-scrollbar">
              {stackedInventory.map((stackedBadge) => {
                const slottedCount = stackedBadge.ids.filter((id) => selectedForgeIds.includes(id)).length;
                const remainingCount = stackedBadge.count - slottedCount;
                const isStackNew = stackedBadge.ids.some((id) => effectiveUnseenBadgeIds.includes(id));
                const isStaged = stagedBadgeId ? stackedBadge.ids.includes(stagedBadgeId) : false;
                
                // Forge Incompatibility Constraints:
                // 1. T1 Legendary can never be forged
                const isT1Restricted = isForgeActive && stackedBadge.tier === 1;
                // 2. Cross-tier merging is strictly forbidden once slot 1 is chosen
                const isTierMismatch =
                  isForgeActive && activeForgeTier !== null && stackedBadge.tier !== activeForgeTier;
                const isCardDisabled = isT1Restricted || isTierMismatch;

                const handleMouseEnter = () => {
                  if (isStackNew) {
                    markBadgesAsSeen?.(stackedBadge.ids);
                    onHoverStack?.(stackedBadge.ids);
                  }
                };

                return (
                  <BadgeCard
                    key={`${stackedBadge.projectId}-${stackedBadge.shape}-${stackedBadge.tier}`}
                    tier={stackedBadge.tier}
                    projectId={stackedBadge.projectId}
                    shape={stackedBadge.shape}
                    count={remainingCount}
                    isSelected={slottedCount > 0 || isStaged}
                    isSlottedOut={remainingCount === 0}
                    isNew={isStackNew}
                    onClick={() => remainingCount > 0 && onBadgeClick(stackedBadge)}
                    onMouseEnter={() => isStackNew && onHoverStack?.(stackedBadge.ids)}
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