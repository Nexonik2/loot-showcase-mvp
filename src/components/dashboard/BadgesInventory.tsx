// Run inside: frontend/
// src/components/dashboard/BadgesInventory.tsx

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Shapes,
  Clock,
  Award,
  ArrowDown,
  ArrowUp,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BadgeCard from '@/components/BadgeCard';
import {
  type Badge,
  type BadgeShape,
  LOOT_PROJECTS,
  STANDARD_SHAPES,
  useShowcaseStore,
} from '@/store/useShowcaseStore';

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

const ALL_TIERS = [1, 2, 3, 4, 5] as const;
const FILTER_SHAPES: BadgeShape[] = [...STANDARD_SHAPES, 'wildcard'];

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

  // Multi-select filter state (OR within category, AND across categories)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedTiers, setSelectedTiers] = useState<number[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<BadgeShape[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const stagedBadgeId = useShowcaseStore((state) => state.stagedBadgeId);

  const activeFilterCount =
    selectedTiers.length + selectedShapes.length + selectedProjects.length;

  const toggleTier = (tier: number) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const toggleShape = (shape: BadgeShape) => {
    setSelectedShapes((prev) =>
      prev.includes(shape) ? prev.filter((s) => s !== shape) : [...prev, shape]
    );
  };

  const toggleProject = (project: string) => {
    setSelectedProjects((prev) =>
      prev.includes(project) ? prev.filter((p) => p !== project) : [...prev, project]
    );
  };

  const clearAllFilters = () => {
    setSelectedTiers([]);
    setSelectedShapes([]);
    setSelectedProjects([]);
  };

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

  // Filter, stack identical badges (same project, shape, tier), and sort with deterministic tie-breakers
  const stackedInventory = useMemo(() => {
    const grouped = Object.values(badges).reduce((acc, badge) => {
      if (selectedTiers.length > 0 && !selectedTiers.includes(badge.tier)) return acc;
      if (selectedShapes.length > 0 && !selectedShapes.includes(badge.shape)) return acc;
      if (selectedProjects.length > 0 && !selectedProjects.includes(badge.projectId)) return acc;

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
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.projectId.localeCompare(b.projectId);
      }

      if (orderMode === 'tier') {
        if (a.tier !== b.tier) {
          return orderDirection === 'desc' ? a.tier - b.tier : b.tier - a.tier;
        }
        const projectComp = a.projectId.localeCompare(b.projectId);
        if (projectComp !== 0) return projectComp;
        return (a.shape || '').localeCompare(b.shape || '');
      }

      if (orderMode === 'project') {
        const projectComp = a.projectId.localeCompare(b.projectId);
        if (projectComp !== 0) {
          return orderDirection === 'desc' ? projectComp : -projectComp;
        }
        if (a.tier !== b.tier) return a.tier - b.tier;
        return (a.shape || '').localeCompare(b.shape || '');
      }

      if (orderMode === 'shape') {
        const shapeComp = (a.shape || '').localeCompare(b.shape || '');
        if (shapeComp !== 0) {
          return orderDirection === 'desc' ? shapeComp : -shapeComp;
        }
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.projectId.localeCompare(b.projectId);
      }

      return 0;
    });
  }, [
    badges,
    selectedTiers,
    selectedShapes,
    selectedProjects,
    orderMode,
    orderDirection,
    isForgeActive,
    activeForgeTier,
  ]);

  const totalOwnedBadges = Object.keys(badges).length;

  return (
    <div className="flex flex-col gap-2 sm:gap-3 lg:flex-1 lg:min-h-0">
      {/* Single-Row Sorting & Filter Control Toolbar (Omits standalone "Order:" line on mobile) */}
      <div className="flex flex-col gap-2 px-0.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between sm:justify-center lg:justify-between gap-1.5 sm:gap-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline font-semibold uppercase tracking-wider text-[11px] text-neutral-500 shrink-0">
              Order:
            </span>

            <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOrderClick('age')}
                className={`h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  orderMode === 'age'
                    ? 'bg-neutral-800 text-white border border-neutral-700/60 font-semibold shadow-sm'
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
                className={`h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  orderMode === 'tier'
                    ? 'bg-neutral-800 text-white border border-neutral-700/60 font-semibold shadow-sm'
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
                className={`h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  orderMode === 'project'
                    ? 'bg-neutral-800 text-white border border-neutral-700/60 font-semibold shadow-sm'
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
                className={`h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  orderMode === 'shape'
                    ? 'bg-neutral-800 text-white border border-neutral-700/60 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Shapes size={12} />
                <span>Shape</span>
                {renderSortIndicator('shape')}
              </Button>
            </div>
          </div>

          {/* Collapsible Filter Toggle Pill */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`h-9 px-3 rounded-xl border text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              isFilterOpen || activeFilterCount > 0
                ? 'border-emerald-700/60 bg-emerald-950/35 text-emerald-300 hover:bg-emerald-900/40'
                : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={12} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-neutral-950 font-mono text-[10px] font-extrabold flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Structured 3-Row Multi-Select Filter Drawer */}
        {isFilterOpen && (
          <div className="w-full rounded-xl border border-neutral-800 bg-neutral-950/95 p-2.5 sm:p-3 flex flex-col gap-2 text-[11px] animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-neutral-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                {activeFilterCount > 0
                  ? `Active Filters (${activeFilterCount})`
                  : 'Filter Badges (Multi-Select)'}
              </span>

              <div className="flex items-center gap-1.5">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-white text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Reset</span>
                  </button>
                )}

                {/* Standardized Circular Crimson Close Button */}
                <button
                  type="button"
                  aria-label="Close Filter Drawer"
                  onClick={() => setIsFilterOpen(false)}
                  className="w-7 h-7 rounded-full border border-red-900/60 bg-red-950/40 text-red-300 hover:border-red-600 hover:bg-red-900/60 hover:text-white flex items-center justify-center shrink-0 aspect-square transition-all active:scale-95 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Row 1: Tier */}
            <div className="flex items-start gap-2 min-w-0">
              <span className="w-14 shrink-0 pt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Tier:
              </span>
              <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
                {ALL_TIERS.map((t) => {
                  const active = selectedTiers.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTier(t)}
                      className={`h-7 px-2.5 rounded-lg border font-mono font-bold transition-colors cursor-pointer ${
                        active
                          ? 'border-emerald-500/70 bg-emerald-950/60 text-emerald-300'
                          : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      T{t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Shape */}
            <div className="flex items-start gap-2 min-w-0">
              <span className="w-14 shrink-0 pt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Shape:
              </span>
              <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
                {FILTER_SHAPES.map((s) => {
                  const active = selectedShapes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleShape(s)}
                      className={`h-7 px-2.5 rounded-lg border capitalize font-medium transition-colors cursor-pointer ${
                        active
                          ? 'border-emerald-500/70 bg-emerald-950/60 text-emerald-300'
                          : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Project */}
            <div className="flex items-start gap-2 min-w-0">
              <span className="w-14 shrink-0 pt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Project:
              </span>
              <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
                {LOOT_PROJECTS.map((proj) => {
                  const active = selectedProjects.includes(proj);
                  return (
                    <button
                      key={proj}
                      type="button"
                      onClick={() => toggleProject(proj)}
                      className={`h-7 px-2.5 rounded-lg border capitalize font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        active
                          ? 'border-emerald-500/70 bg-emerald-950/60 text-emerald-300'
                          : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {proj}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badges Grid Card (pb-14 on mobile ensures bottom row scrolls clear of floating cog) */}
      <Card
        className={`bg-neutral-900 border-neutral-800 flex-1 flex flex-col lg:min-h-0 ${
          isCompactMobile ? 'min-h-0 py-2.5 sm:py-4 lg:py-5' : 'min-h-[550px]'
        }`}
      >
        <CardContent className="p-2.5 sm:p-4 lg:p-5 flex-1 flex flex-col lg:min-h-0">
          {totalOwnedBadges === 0 ? (
            <div
              className={`flex-1 flex items-center justify-center border border-dashed border-neutral-800 rounded-lg bg-neutral-950/50 ${
                isCompactMobile ? 'min-h-[200px] lg:min-h-0' : 'min-h-[400px] lg:min-h-0'
              }`}
            >
              <p className="text-neutral-500 text-sm">Un-inscribed badges will appear here.</p>
            </div>
          ) : stackedInventory.length === 0 ? (
            <div
              className={`flex-1 flex flex-col items-center justify-center gap-2.5 border border-dashed border-neutral-800 rounded-lg bg-neutral-950/50 p-4 ${
                isCompactMobile ? 'min-h-[200px] lg:min-h-0' : 'min-h-[400px] lg:min-h-0'
              }`}
            >
              <p className="text-neutral-400 text-xs sm:text-sm text-center">
                No badges match your active filters.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={clearAllFilters}
                className="h-8 px-3.5 text-xs border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 cursor-pointer"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] content-start gap-2.5 sm:gap-3.5 overflow-y-auto pt-2.5 px-1.5 pb-14 lg:pb-2 pr-2.5 custom-scrollbar lg:flex-1 lg:min-h-0 ${
                isCompactMobile
                  ? 'max-h-[clamp(300px,46dvh,540px)] lg:max-h-none'
                  : 'max-h-[650px] lg:max-h-none'
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