import React, { useState, useMemo } from 'react';
import { Layers, Shapes, Clock, Award, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BadgeCard from '@/components/BadgeCard';
import { type Badge, type BadgeShape, useArchiverStore } from '@/store/useShowcaseStore';

export type OrderMode = 'age' | 'tier' | 'project' | 'shape';
export type OrderDirection = 'desc' | 'asc';
export type GroupingMode = OrderMode;

interface BadgesInventoryProps {
  badges: Record<string, Badge>;
  selectedForgeIds: string[];
  unseenBadgeIds?: string[];
  isForgeActive?: boolean;
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
  unseenBadgeIds: propUnseenBadgeIds,
  isForgeActive = false,
  onBadgeClick,
  onHoverStack,
}: BadgesInventoryProps) {
  const [orderMode, setOrderMode] = useState<OrderMode>('age');
  const [orderDirection, setOrderDirection] = useState<OrderDirection>('desc');

  // Pull store unseen IDs, staged badge ID, and dismissal action
  const { stagedBadgeId, unseenBadgeIds: storeUnseenBadgeIds, markBadgesAsSeen } = useArchiverStore();
  const effectiveUnseenBadgeIds = propUnseenBadgeIds ?? storeUnseenBadgeIds ?? [];

  // Derive active tier for Forge compatibility lock
  const activeForgeTier = useMemo(() => {
    if (selectedForgeIds.length === 0) return null;
    const firstBadge = badges[selectedForgeIds[0]];
    return firstBadge ? firstBadge.tier : null;
  }, [selectedForgeIds, badges]);

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
  }, [badges, orderMode, orderDirection]);

  return (
    <div className="flex flex-col gap-4">
      {/* Sorting Control Toolbar */}
      <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-500">
          Order:
        </span>
        <div className="flex items-center gap-1.5 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOrderClick('age')}
            className={`h-7 px-2.5 flex items-center gap-1.5 transition-all ${
              orderMode === 'age'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
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
            className={`h-7 px-2.5 flex items-center gap-1.5 transition-all ${
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
            className={`h-7 px-2.5 flex items-center gap-1.5 transition-all ${
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
      <Card className="bg-neutral-900 border-neutral-800 flex-1 min-h-[550px]">
        <CardContent className="p-4 sm:p-5 h-full">
          {Object.keys(badges).length === 0 ? (
            <div className="h-full min-h-[400px] flex items-center justify-center border border-dashed border-neutral-800 rounded-lg bg-neutral-950/50">
              <p className="text-neutral-500 text-sm">Un-inscribed badges will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3 sm:gap-3.5 overflow-y-auto max-h-[650px] p-1 sm:p-2 custom-scrollbar">
              {stackedInventory.map((stackedBadge) => {
                const slottedCount = stackedBadge.ids.filter((id) => selectedForgeIds.includes(id)).length;
                const remainingCount = stackedBadge.count - slottedCount;
                const isStackNew = stackedBadge.ids.some((id) => effectiveUnseenBadgeIds.includes(id));
                const isStaged = stagedBadgeId ? stackedBadge.ids.includes(stagedBadgeId) : false;

                // Forge compatibility check: dim Tier 1 (unforgeable) or mismatched tiers when slots occupied
                const isCardDisabled = isForgeActive && (
                  stackedBadge.tier === 1 ||
                  (activeForgeTier !== null && stackedBadge.tier !== activeForgeTier)
                );

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
                    isDisabled={isCardDisabled}
                    isNew={isStackNew}
                    onMouseEnter={handleMouseEnter}
                    onClick={() => remainingCount > 0 && !isCardDisabled && onBadgeClick(stackedBadge)}
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