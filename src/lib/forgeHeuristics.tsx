// src/lib/forgeHeuristics.ts

import type { Badge, BadgeShape } from '@/store/useShowcaseStore';
import { getForgeCost } from '@/store/useShowcaseStore';

export interface ProjectOdds {
  project: string;
  percentage: number;
}

export interface ShapeOdds {
  shape: BadgeShape;
  percentage: number;
}

export interface RecipeValidationResult {
  valid: boolean;
  reason?: string;
  targetTier?: number;
  resultingProject?: string;
  possibleProjects?: string[];
  projectOdds?: ProjectOdds[];
  possibleShapes?: BadgeShape[];
  shapeOdds?: ShapeOdds[];
  cost?: number;
}

/**
 * Calculates percentage breakdown for an array of string or enum items rounded to 1%
 */
function calculateDistribution<T extends string>(items: T[]): { value: T; percentage: number }[] {
  if (items.length === 0) return [];
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1;
  });

  const total = items.length;
  return Object.entries(counts).map(([value, count]) => ({
    value: value as T,
    percentage: Math.round((count / total) * 100),
  }));
}

/**
 * Validates 3 slotted badges against the 3 Forge recipes:
 * 1. Standard Project Merge: 3x same tier & project (100% project, 33% per shape)
 * 2. Wildcard Merge: 2x same tier & project + 1x Wildcard (100% project, 50% per shape)
 * 3. Mixed-Project Shape Merge: 2 of Project A + 1 of Project B, all same shape (67% Proj A, 33% Proj B, 100% shape)
 */
export function validateForgeRecipe(selectedBadges: Badge[]): RecipeValidationResult {
  if (selectedBadges.length < 3) {
    return {
      valid: false,
      reason: `Select ${3 - selectedBadges.length} more matching badge${3 - selectedBadges.length > 1 ? 's' : ''} to align the recipe.`,
    };
  }

  const [b1, b2, b3] = selectedBadges;

  // Rule 1: All badges must be of the exact same tier
  if (b1.tier !== b2.tier || b2.tier !== b3.tier) {
    return { valid: false, reason: 'All 3 badges must be of the exact same tier.' };
  }

  // Rule 2: Tier 1 Legendary badges cannot be upgraded
  if (b1.tier === 1) {
    return { valid: false, reason: 'Tier 1 Legendary badges cannot be upgraded.' };
  }

  const targetTier = b1.tier - 1;
  const rawCost = getForgeCost(b1.tier);
  // Ensure integer rounding to eliminate floating decimals ending in 6
  const cost = Math.round(rawCost);

  const wildcards = selectedBadges.filter(
    (b) => b.projectId === 'wildcard' || b.shape === 'wildcard'
  );
  const regular = selectedBadges.filter(
    (b) => b.projectId !== 'wildcard' && b.shape !== 'wildcard'
  );

  // Recipe 2: Wildcard Merge (2 matching regular badges + 1 wildcard)
  if (wildcards.length === 1 && regular.length === 2) {
    if (regular[0].projectId === regular[1].projectId) {
      const proj = regular[0].projectId;
      const shapes: BadgeShape[] = [regular[0].shape, regular[1].shape];
      const shapeDist = calculateDistribution(shapes);

      return {
        valid: true,
        targetTier,
        cost,
        resultingProject: proj,
        possibleProjects: [proj],
        projectOdds: [{ project: proj, percentage: 100 }],
        possibleShapes: shapes,
        shapeOdds: shapeDist.map((d) => ({ shape: d.value, percentage: d.percentage })),
      };
    }
    return { valid: false, reason: 'Wildcard craft requires 2 badges from the same project.' };
  }

  if (wildcards.length > 1) {
    return { valid: false, reason: 'Only 1 Wildcard can be used per forge.' };
  }

  // Recipe 1: Standard Project Merge (3 badges of same project, any shape)
  if (b1.projectId === b2.projectId && b2.projectId === b3.projectId) {
    const proj = b1.projectId;
    const shapes: BadgeShape[] = [b1.shape, b2.shape, b3.shape];
    const shapeDist = calculateDistribution(shapes);

    return {
      valid: true,
      targetTier,
      cost,
      resultingProject: proj,
      possibleProjects: [proj, proj, proj],
      projectOdds: [{ project: proj, percentage: 100 }],
      possibleShapes: shapes,
      shapeOdds: shapeDist.map((d) => ({ shape: d.value, percentage: d.percentage })),
    };
  }

  // Recipe 3: Mixed-Project Shape Merge (All same shape; 2 of Project A + 1 of Project B)
  if (b1.shape === b2.shape && b2.shape === b3.shape) {
    const projectCounts: Record<string, number> = {};
    selectedBadges.forEach((b) => {
      projectCounts[b.projectId] = (projectCounts[b.projectId] || 0) + 1;
    });

    const majorityProject = Object.keys(projectCounts).find((p) => projectCounts[p] === 2);
    const minorityProject = Object.keys(projectCounts).find((p) => projectCounts[p] === 1);

    if (majorityProject && minorityProject) {
      return {
        valid: true,
        targetTier,
        cost,
        resultingProject: majorityProject,
        possibleProjects: [majorityProject, majorityProject, minorityProject],
        projectOdds: [
          { project: majorityProject, percentage: 67 },
          { project: minorityProject, percentage: 33 },
        ],
        possibleShapes: [b1.shape],
        shapeOdds: [{ shape: b1.shape, percentage: 100 }],
      };
    }
    return {
      valid: false,
      reason: 'Mixed-project merge requires exactly 2 badges from one project and 1 from another.',
    };
  }

  return {
    valid: false,
    reason: 'Combination does not match any recipe: (1) Same Project, (2) 2 Same Project + Wildcard, or (3) Same Shape with 2:1 Project ratio.',
  };
}

/**
 * Calculates the maximum craftable batch multiplier (k_max).
 * Fix: Does not block batching when costPerCraft === 0.
 */
export function calculateMaxBatchCount(
  slottedBadges: Badge[],
  allBadges: Record<string, Badge>,
  costPerCraft: number,
  inkBalance: number,
  isValidRecipe: boolean
): number {
  if (!isValidRecipe || slottedBadges.length !== 3) {
    return 1;
  }

  // 1. Group slotted requirements by unique signature: projectId-shape-tier
  const requiredCounts: Record<string, number> = {};
  slottedBadges.forEach((b) => {
    const key = `${b.projectId}-${b.shape}-${b.tier}`;
    requiredCounts[key] = (requiredCounts[key] || 0) + 1;
  });

  // 2. Count total matching unreserved badges in inventory
  const ownedCounts: Record<string, number> = {};
  Object.values(allBadges).forEach((b) => {
    const key = `${b.projectId}-${b.shape}-${b.tier}`;
    if (requiredCounts[key]) {
      ownedCounts[key] = (ownedCounts[key] || 0) + 1;
    }
  });

  // 3. Multiplier constrained by badge inventory
  let maxFromBadges = Infinity;
  for (const [key, req] of Object.entries(requiredCounts)) {
    const owned = ownedCounts[key] || 0;
    const possibleForSig = Math.floor(owned / req);
    if (possibleForSig < maxFromBadges) {
      maxFromBadges = possibleForSig;
    }
  }

  if (maxFromBadges === Infinity || maxFromBadges < 1) {
    return 1;
  }

  // 4. Multiplier constrained by Ink (if craft cost is 0, ink constraint is infinite)
  const maxFromInk = costPerCraft > 0 ? Math.floor(inkBalance / costPerCraft) : Infinity;

  const kMax = Math.min(maxFromBadges, maxFromInk);
  return Math.max(1, kMax);
}

/**
 * Resolves k trios of badge IDs from inventory matching the slotted signatures
 */
export function findBatchBadgeIds(
  slottedBadges: Badge[],
  allBadges: Record<string, Badge>,
  batchCount: number
): string[][] | null {
  if (slottedBadges.length !== 3 || batchCount < 1) return null;

  const trios: string[][] = [];
  const usedBadgeIds = new Set<string>();

  // Slot 0 trio starts with currently slotted items
  const initialTrio = slottedBadges.map((b) => b.id);
  initialTrio.forEach((id) => usedBadgeIds.add(id));
  trios.push(initialTrio);

  const availableBadges = Object.values(allBadges);

  // Find duplicates for batches 2 to k
  for (let i = 1; i < batchCount; i++) {
    const currentTrio: string[] = [];

    for (const slotBadge of slottedBadges) {
      const match = availableBadges.find(
        (b) =>
          !usedBadgeIds.has(b.id) &&
          b.tier === slotBadge.tier &&
          b.projectId === slotBadge.projectId &&
          b.shape === slotBadge.shape
      );

      if (!match) return null;

      usedBadgeIds.add(match.id);
      currentTrio.push(match.id);
    }

    trios.push(currentTrio);
  }

  return trios;
}

/**
 * Clean Forge: Scans inventory and returns optimal 3 badge IDs following the 4 strict rules
 */
export function findCleanInventoryCandidate(
  badges: Record<string, Badge>,
  excludeIds: string[] = []
): string[] | null {
  const eligible = Object.values(badges).filter(
    (b) => b.tier > 1 && !excludeIds.includes(b.id)
  );

  if (eligible.length < 3) return null;

  const tiers = [2, 3, 4, 5];

  for (const tier of tiers) {
    const tierBadges = eligible.filter((b) => b.tier === tier);
    if (tierBadges.length < 3) continue;

    // Rule 2: 100% Deterministic Crafts (3x same project and shape)
    const exactGroups: Record<string, Badge[]> = {};
    tierBadges.forEach((b) => {
      if (b.projectId === 'wildcard' || b.shape === 'wildcard') return;
      const key = `${b.projectId}-${b.shape}`;
      if (!exactGroups[key]) exactGroups[key] = [];
      exactGroups[key].push(b);
    });

    const pureCandidates = Object.values(exactGroups).filter((g) => g.length >= 3);
    if (pureCandidates.length > 0) {
      pureCandidates.sort((a, b) => b.length - a.length);
      return pureCandidates[0].slice(0, 3).map((b) => b.id);
    }

    // Rule 3: 100% Project Crafts (3x same project, mixed shapes)
    const projectGroups: Record<string, Badge[]> = {};
    tierBadges.forEach((b) => {
      if (b.projectId === 'wildcard' || b.shape === 'wildcard') return;
      if (!projectGroups[b.projectId]) projectGroups[b.projectId] = [];
      projectGroups[b.projectId].push(b);
    });

    const projectCandidates = Object.values(projectGroups).filter((g) => g.length >= 3);
    if (projectCandidates.length > 0) {
      projectCandidates.sort((a, b) => b.length - a.length);
      return projectCandidates[0].slice(0, 3).map((b) => b.id);
    }

    // Rule 4: Compatible Badges of the Same Tier
    const shapeGroups: Record<string, Badge[]> = {};
    tierBadges.forEach((b) => {
      if (b.projectId === 'wildcard' || b.shape === 'wildcard') return;
      if (!shapeGroups[b.shape]) shapeGroups[b.shape] = [];
      shapeGroups[b.shape].push(b);
    });

    for (const badgesInShape of Object.values(shapeGroups)) {
      if (badgesInShape.length < 3) continue;

      const byProj: Record<string, Badge[]> = {};
      badgesInShape.forEach((b) => {
        if (!byProj[b.projectId]) byProj[b.projectId] = [];
        byProj[b.projectId].push(b);
      });

      const projs = Object.keys(byProj);
      const projA = projs.find((p) => byProj[p].length >= 2);
      const projB = projs.find((p) => p !== projA && byProj[p].length >= 1);

      if (projA && projB) {
        return [byProj[projA][0].id, byProj[projA][1].id, byProj[projB][0].id];
      }
    }

    // 4B. Wildcard Merge
    const wildcards = tierBadges.filter(
      (b) => b.projectId === 'wildcard' || b.shape === 'wildcard'
    );
    if (wildcards.length >= 1) {
      const projPair = Object.values(projectGroups).find((g) => g.length >= 2);
      if (projPair) {
        return [projPair[0].id, projPair[1].id, wildcards[0].id];
      }
    }
  }

  return null;
}

/**
 * Heuristic auto-slotter with context awareness:
 * - 0 slotted: Standard top-down scan (T2 down to T5 priority)
 * - 1 slotted: Locks to Slot 1's tier and attempts pure identical -> same project -> shape match -> wildcard
 * - 2 slotted: Tests remaining tier candidates against validateForgeRecipe to complete the craft
 * - 3 slotted: Returns null (already full)
 */
export function findContextualForgeCandidate(
  slottedBadges: Badge[],
  allBadges: Record<string, Badge>
): string[] | null {
  // If altar is empty, run standard 4-pass top-down scan
  if (slottedBadges.length === 0) {
    return findCleanInventoryCandidate(allBadges);
  }

  // If 3 badges are already slotted, no fill is needed
  if (slottedBadges.length >= 3) {
    return null;
  }

  const targetTier = slottedBadges[0].tier;
  // Tier 1 Legendary badges cannot be forged
  if (targetTier <= 1) return null;

  const slottedIds = new Set(slottedBadges.map((b) => b.id));

  // Available unreserved badges of the exact same tier
  const pool = Object.values(allBadges).filter(
    (b) => b.tier === targetTier && !slottedIds.has(b.id)
  );

  if (slottedBadges.length === 1) {
    const b1 = slottedBadges[0];

    // Pass 1: Pure Match (same project, same shape)
    const pureMatches = pool.filter(
      (b) => b.projectId === b1.projectId && b.shape === b1.shape
    );
    if (pureMatches.length >= 2) {
      return [b1.id, pureMatches[0].id, pureMatches[1].id];
    }

    // Pass 2: Same Project (any shapes)
    const projectMatches = pool.filter((b) => b.projectId === b1.projectId);
    if (projectMatches.length >= 2) {
      return [b1.id, projectMatches[0].id, projectMatches[1].id];
    }

    // Pass 3: Mixed-Project Shape Merge (same shape, majority project)
    const shapeMatches = pool.filter(
      (b) => b.shape === b1.shape && b.projectId !== 'wildcard'
    );
    const sameProjSameShape = shapeMatches.filter((b) => b.projectId === b1.projectId);
    const diffProjSameShape = shapeMatches.filter((b) => b.projectId !== b1.projectId);

    if (sameProjSameShape.length >= 1 && diffProjSameShape.length >= 1) {
      return [b1.id, sameProjSameShape[0].id, diffProjSameShape[0].id];
    }

    // Pass 4: Wildcard Completion (1 same project + 1 wildcard)
    const wildcards = pool.filter((b) => b.projectId === 'wildcard');
    if (projectMatches.length >= 1 && wildcards.length >= 1) {
      return [b1.id, projectMatches[0].id, wildcards[0].id];
    }

    // Fallback: Test all candidate pairs in the pool with validateForgeRecipe
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const testTrio = [b1, pool[i], pool[j]];
        if (validateForgeRecipe(testTrio).valid) {
          return [b1.id, pool[i].id, pool[j].id];
        }
      }
    }
  }

  if (slottedBadges.length === 2) {
    for (const candidate of pool) {
      const testTrio = [...slottedBadges, candidate];
      if (validateForgeRecipe(testTrio).valid) {
        return testTrio.map((b) => b.id);
      }
    }
  }

  return null;
}