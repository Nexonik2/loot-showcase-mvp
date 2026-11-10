// Run inside: frontend/
// src/lib/inscriptionYield.ts

import type { Badge } from '@/store/useShowcaseStore';

export const ADJACENCY_MAP: Record<number, readonly number[]> = {
  1: [2, 5],
  2: [1, 3, 6],
  3: [2, 4, 7],
  4: [3, 8],
  5: [1, 6],
  6: [2, 5, 7],
  7: [3, 6, 8],
  8: [4, 7],
} as const;

export const ORTHOGONAL_EDGES: readonly [number, number][] = [
  [1, 2], [2, 3], [3, 4],
  [5, 6], [6, 7], [7, 8],
  [1, 5], [2, 6], [3, 7], [4, 8],
] as const;

export const BASE_TIER_YIELDS: Record<number, number> = {
  1: 35,
  2: 20,
  3: 10,
  4: 5,
  5: 2,
};

export type SynergyType = 'none' | 'project' | 'shape' | 'dual';

export interface EdgeSynergy {
  edgeKey: string;
  sourceSlot: number;
  targetSlot: number;
  type: SynergyType;
}

export interface SlotResonanceBreakdown {
  slotId: number;
  badge: Badge | null;
  baseYield: number;
  projectMatches: number;
  shapeMatches: number;
  bonusMultiplier: number;
  totalMultiplier: number;
  slotYield: number;
  activeSynergies: Array<{
    neighborSlotId: number;
    type: SynergyType;
  }>;
}

export interface ShowcaseYieldReport {
  baseYieldSum: number;
  synergyBonusSum: number;
  totalYield: number;
  claimableYield: number;
  activeSynergyCount: number;
  breakdown: Record<number, SlotResonanceBreakdown>;
  edges: EdgeSynergy[];
}

/**
 * Evaluates adjacency synergies strictly across Loot derivatives (no wildcard bypass).
 */
export function evaluatePairSynergy(
  badgeA: Badge | null,
  badgeB: Badge | null
): { projectMatch: boolean; shapeMatch: boolean; synergyType: SynergyType } {
  if (!badgeA || !badgeB) {
    return { projectMatch: false, shapeMatch: false, synergyType: 'none' };
  }

  const projectMatch = badgeA.projectId === badgeB.projectId;
  const shapeMatch = badgeA.shape === badgeB.shape;

  let synergyType: SynergyType = 'none';
  if (projectMatch && shapeMatch) {
    synergyType = 'dual';
  } else if (projectMatch) {
    synergyType = 'project';
  } else if (shapeMatch) {
    synergyType = 'shape';
  }

  return { projectMatch, shapeMatch, synergyType };
}

export function calculateSlotResonance(
  slotId: number,
  slots: Record<number, Badge | null>
): SlotResonanceBreakdown {
  const badge = slots[slotId];
  if (!badge) {
    return {
      slotId,
      badge: null,
      baseYield: 0,
      projectMatches: 0,
      shapeMatches: 0,
      bonusMultiplier: 0,
      totalMultiplier: 1.0,
      slotYield: 0,
      activeSynergies: [],
    };
  }

  const baseYield = BASE_TIER_YIELDS[badge.tier] ?? 0;
  const neighbors = ADJACENCY_MAP[slotId] ?? [];

  let projectMatches = 0;
  let shapeMatches = 0;
  const activeSynergies: Array<{ neighborSlotId: number; type: SynergyType }> = [];

  for (const nId of neighbors) {
    const neighborBadge = slots[nId];
    if (!neighborBadge) continue;

    const { projectMatch, shapeMatch, synergyType } = evaluatePairSynergy(badge, neighborBadge);

    if (projectMatch) projectMatches += 1;
    if (shapeMatch) shapeMatches += 1;

    if (synergyType !== 'none') {
      activeSynergies.push({ neighborSlotId: nId, type: synergyType });
    }
  }

  const bonusMultiplier = projectMatches * 0.25 + shapeMatches * 0.25;
  const totalMultiplier = 1.0 + bonusMultiplier;
  const slotYield = baseYield * totalMultiplier;

  return {
    slotId,
    badge,
    baseYield,
    projectMatches,
    shapeMatches,
    bonusMultiplier,
    totalMultiplier,
    slotYield,
    activeSynergies,
  };
}

export function calculateShowcaseTotalYield(
  slots: Record<number, Badge | null>
): ShowcaseYieldReport {
  const breakdown: Record<number, SlotResonanceBreakdown> = {};
  let baseYieldSum = 0;
  let totalYield = 0;
  let activeSynergyCount = 0;

  for (let slotId = 1; slotId <= 8; slotId++) {
    const result = calculateSlotResonance(slotId, slots);
    breakdown[slotId] = result;
    baseYieldSum += result.baseYield;
    totalYield += result.slotYield;
  }

  const edges: EdgeSynergy[] = ORTHOGONAL_EDGES.map(([u, v]) => {
    const badgeU = slots[u];
    const badgeV = slots[v];
    const { synergyType } = evaluatePairSynergy(badgeU, badgeV);
    if (synergyType !== 'none') {
      activeSynergyCount += 1;
    }
    return {
      edgeKey: `${u}-${v}`,
      sourceSlot: u,
      targetSlot: v,
      type: synergyType,
    };
  });

  return {
    baseYieldSum,
    synergyBonusSum: Math.max(0, totalYield - baseYieldSum),
    totalYield,
    claimableYield: Math.floor(totalYield),
    activeSynergyCount,
    breakdown,
    edges,
  };
}