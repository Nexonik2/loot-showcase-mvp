// src/store/useShowcaseStore.ts (formerly useArchiverStore.ts)

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuestStore } from "./useQuestStore";
import { useFeedStore } from './useFeedStore';
import { calculateShowcaseTotalYield } from "@/lib/inscriptionYield";

export type PackType = 'explorer' | 'adventurer' | 'degen';
export type BadgeShape = 'circle' | 'square' | 'triangle' | 'hexagon' | 'wildcard';

export interface Badge {
  id: string;
  projectId: string;
  shape: BadgeShape;
  tier: number;
}

export const INSCRIBE_SETTINGS = {
  calculateCost: (tier: number): number => Math.max(0, 10 * (6 - tier)),
} as const;

export const FORGE_SETTINGS = {
  BASE_COST: 100,
  COST_MULTIPLIER: 1.1,
} as const;

export const LOOT_PROJECTS = ['loot', 'realms', 'genesis', 'bifrost', 'hyperloot'] as const;
export const STANDARD_SHAPES: BadgeShape[] = ['circle', 'square', 'triangle', 'hexagon'];

export const getForgeCost = (sourceTier: number) => {
  return FORGE_SETTINGS.BASE_COST * FORGE_SETTINGS.COST_MULTIPLIER * (5 - sourceTier);
};

export const PACK_CONFIGS: Record<PackType, {
  id: PackType;
  name: string;
  cost: number;
  description: string;
  odds: Record<number, number>;
  affiliationType?: 'shape' | 'project';
}> = {
  explorer: {
    id: 'explorer',
    name: 'Explorer Pack',
    cost: 150,
    description: 'Baseline pack weighted toward targeted forge crafting.',
    odds: { 5: 80, 4: 20, 3: 0, 2: 0, 1: 0 },
    affiliationType: 'shape',
  },
  adventurer: {
    id: 'adventurer',
    name: 'Adventurer Pack',
    cost: 400,
    description: 'Mid-tier parity pack with broad project distribution.',
    odds: { 5: 65, 4: 30, 3: 5, 2: 0, 1: 0 },
  },
  degen: {
    id: 'degen',
    name: 'Degen Pack',
    cost: 850,
    description: 'High-cost pack with project alignment and epic roll chances.',
    odds: { 5: 45, 4: 45, 3: 9, 2: 1, 1: 0 },
    affiliationType: 'project',
  },
};

export const rollTierFromOdds = (odds: Record<number, number>): number => {
  const roll = Math.random() * 100;
  let cumulative = 0;
  const tiers = [5, 4, 3, 2, 1];

  for (const tier of tiers) {
    cumulative += odds[tier] || 0;
    if (roll < cumulative) return tier;
  }
  return 5;
};

export const rollProject = (targetProject?: string): string => {
  if (targetProject && (LOOT_PROJECTS as readonly string[]).includes(targetProject)) {
    if (Math.random() < 0.5) return targetProject;
    const otherProjects = LOOT_PROJECTS.filter((p) => p !== targetProject);
    return otherProjects[Math.floor(Math.random() * otherProjects.length)];
  }
  return LOOT_PROJECTS[Math.floor(Math.random() * LOOT_PROJECTS.length)];
};

export const rollShape = (targetShape?: BadgeShape): BadgeShape => {
  if (targetShape && STANDARD_SHAPES.includes(targetShape)) {
    if (Math.random() < 0.5) return targetShape;
    const otherShapes = STANDARD_SHAPES.filter((s) => s !== targetShape);
    return otherShapes[Math.floor(Math.random() * otherShapes.length)];
  }
  return STANDARD_SHAPES[Math.floor(Math.random() * STANDARD_SHAPES.length)];
};

export interface Traits {
  shiny?: boolean;
  [key: string]: unknown;
}

export interface ShowcaseState {
  inkBalance: number;
  currentDay: number;
  calendarProgress: number; 
  claimedCalendarDays: number[];
  currentStreak: number; 
  isDailyFaucetClaimed: boolean;
  claimMultiplierBonus: number; 
  wildcardTokens: Record<number, number>; 
  unopenedPacks: Record<PackType, number>;
  traits: Traits;
  
  slots: Record<number, Badge | null>;
  badges: Record<string, Badge>;
  gachaOdds: Record<PackType, Record<number, number>>;
  unseenBadgeIds: string[];
  markBadgesAsSeen: (badgeIds: string[]) => void;

  // Staged Inscription Pipeline
  stagedSlotId: number | null;
  stagedBadgeId: string | null;
  setStagedSlotId: (slotId: number | null) => void;
  setStagedBadgeId: (badgeId: string | null) => void;
  confirmInscription: () => boolean;
  cancelInscription: () => void;

  addInk: (amount: number) => void;
  claimDailyFaucet: () => number;
  claimCalendarDay: (day: number) => boolean;

  inscribe: (slotId: number, badgeId: string) => void;
  advanceDay: () => void;
  injectInk: (amount: number) => void;
  resetSlots: () => void;
  resetInventory: () => void;
  forgeBadges: (badgeIdsToBurn: string[], targetTier: number, projectId: string, shape: BadgeShape) => Badge | null;
  
  buyPacks: (packType: PackType, count: number) => boolean;
  openPacksBatch: (
    packType: PackType,
    count: number,
    affiliation?: { projectId?: string; shape?: BadgeShape }
  ) => Badge[] | null;
  openPack: (cost?: number) => Badge[] | null;
  injectTestBundle: () => void;
}

export const useShowcaseStore = create<ShowcaseState>()(
  persist(
    // ─── ARGUMENT 1: State Creator Function ──────────────────────────
    (set, get) => ({
      inkBalance: 0,
      currentDay: 1,
      calendarProgress: 1,
      claimedCalendarDays: [],
      currentStreak: 0,
      isDailyFaucetClaimed: false,
      claimMultiplierBonus: 0,
      wildcardTokens: { 2: 0, 3: 0, 4: 0 },
      unopenedPacks: { explorer: 0, adventurer: 0, degen: 0 },
      traits: {},
      slots: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null },
      badges: {},
      unseenBadgeIds: [],
      gachaOdds: {
        explorer: { ...PACK_CONFIGS.explorer.odds },
        adventurer: { ...PACK_CONFIGS.adventurer.odds },
        degen: { ...PACK_CONFIGS.degen.odds },
      },

      // Transient Staging UI State
      stagedSlotId: null,
      stagedBadgeId: null,

      setStagedSlotId: (slotId) => {
        set((state) => ({ stagedSlotId: state.stagedSlotId === slotId ? null : slotId }));
      },

      setStagedBadgeId: (badgeId) => {
        set((state) => ({ stagedBadgeId: state.stagedBadgeId === badgeId ? null : badgeId }));
      },

      cancelInscription: () => {
        set({ stagedSlotId: null, stagedBadgeId: null });
      },

      confirmInscription: () => {
        const state = get();
        const { stagedSlotId, stagedBadgeId, badges, inkBalance } = state;
        if (!stagedSlotId || !stagedBadgeId) return false;

        const badge = badges[stagedBadgeId];
        if (!badge) {
          set({ stagedSlotId: null, stagedBadgeId: null });
          return false;
        }

        if (badge.projectId === 'wildcard' || badge.shape === 'wildcard') {
          return false;
        }

        const cost = INSCRIBE_SETTINGS.calculateCost(badge.tier);
        if (inkBalance < cost) return false;

        state.inscribe(stagedSlotId, stagedBadgeId);
        set({ stagedSlotId: null, stagedBadgeId: null });
        return true;
      },

      addInk: (amount: number) => {
        set((state) => ({ inkBalance: state.inkBalance + Math.max(0, amount) }));
      },

      claimDailyFaucet: () => {
        const state = get();
        if (state.isDailyFaucetClaimed) return 0;

        const nextStreak = state.currentStreak >= 7 ? 1 : state.currentStreak + 1;
        const streakBonusPercent = Math.min(60, nextStreak * 10);
        const basePayout = 150;
        
        const totalMultiplier = 1 + (streakBonusPercent / 100) + state.claimMultiplierBonus;
        const faucetBaseClaim = Math.floor(basePayout * totalMultiplier);

        const { claimableYield: inscriptionYield } = calculateShowcaseTotalYield(state.slots);
        const totalClaimed = faucetBaseClaim + inscriptionYield;

        set({
          inkBalance: state.inkBalance + totalClaimed,
          currentStreak: nextStreak,
          isDailyFaucetClaimed: true,
        });

        useQuestStore.getState().reportActionProgress('claim_ink', 1);
        return totalClaimed;
      },

      claimCalendarDay: (day: number) => {
        const state = get();
        if (day > state.currentDay || state.claimedCalendarDays.includes(day)) {
          return false;
        }

        const updatedClaimed = [...state.claimedCalendarDays, day];
        const updatedPacks = { ...state.unopenedPacks };
        const updatedTokens = { ...state.wildcardTokens };
        const updatedTraits = { ...state.traits };
        let newMultiplierBonus = state.claimMultiplierBonus;
        let inkReward = 0;

        if ([3, 9, 15, 21, 27].includes(day)) {
          newMultiplierBonus += 0.05;
        } else if (day === 6 || day === 24) {
          updatedPacks.adventurer = (updatedPacks.adventurer || 0) + 1;
        } else if (day === 12) {
          updatedTokens[4] = (updatedTokens[4] || 0) + 1;
        } else if (day === 18 || day === 39) {
          updatedPacks.explorer = (updatedPacks.explorer || 0) + 2;
        } else if (day === 30) {
          updatedTokens[3] = (updatedTokens[3] || 0) + 1;
        } else if (day === 33) {
          updatedPacks.degen = (updatedPacks.degen || 0) + 1;
        } else if (day === 36) {
          updatedTokens[2] = (updatedTokens[2] || 0) + 1;
        } else if (day === 40) {
          updatedTraits.shiny = true;
        } else {
          inkReward = 150;
        }

        set({
          claimedCalendarDays: updatedClaimed,
          claimMultiplierBonus: newMultiplierBonus,
          unopenedPacks: updatedPacks,
          wildcardTokens: updatedTokens,
          traits: updatedTraits,
          inkBalance: state.inkBalance + inkReward,
        });

        useQuestStore.getState().reportActionProgress('claim_ink', 1);
        return true;
      },

      buyPacks: (packType: PackType, count: number) => {
        if (count <= 0) return false;
        const packCost = PACK_CONFIGS[packType].cost;
        const totalCost = packCost * count;
        let success = false;

        set((state) => {
          if (state.inkBalance < totalCost) return state;
          success = true;
          return {
            inkBalance: state.inkBalance - totalCost,
            unopenedPacks: {
              ...state.unopenedPacks,
              [packType]: (state.unopenedPacks[packType] || 0) + count,
            },
          };
        });

        useQuestStore.getState().reportActionProgress('spend_ink', totalCost);
        return success;
      },

      openPacksBatch: (packType: PackType, count: number, affiliation) => {
        if (count <= 0) return null;
        let pulledBadges: Badge[] = [];

        set((state) => {
          const owned = state.unopenedPacks[packType] || 0;
          if (owned < count) return state;

          const updatedBadges = { ...state.badges };
          const newPulls: Badge[] = [];
          const odds = state.gachaOdds[packType] || PACK_CONFIGS[packType].odds;

          for (let p = 0; p < count; p++) {
            for (let s = 0; s < 5; s++) {
              const tier = rollTierFromOdds(odds);
              const isWildcard = Math.random() < 0.05;

              const projectId = isWildcard
                ? 'wildcard'
                : rollProject(affiliation?.projectId);

              const shape = isWildcard
                ? 'wildcard'
                : rollShape(affiliation?.shape);

              const newBadge: Badge = {
                id: `badge-${Date.now()}-${p}-${s}-${Math.random().toString(36).slice(2, 9)}`,
                projectId,
                shape,
                tier,
              };

              newPulls.push(newBadge);
              updatedBadges[newBadge.id] = newBadge;
            }
          }

          pulledBadges = newPulls;

          return {
            badges: updatedBadges,
            unopenedPacks: {
              ...state.unopenedPacks,
              [packType]: owned - count,
            },
          };
        });

        // Action listeners & broadcast outside of set()
        useQuestStore.getState().reportActionProgress('pack_any', count);
        useQuestStore.getState().reportActionProgress('pack_bulk', count);
        if (packType === 'adventurer') useQuestStore.getState().reportActionProgress('pack_adv', count);
        if (packType === 'degen') useQuestStore.getState().reportActionProgress('pack_degen', count);

        pulledBadges.forEach((b) => useQuestStore.getState().reportBadgeAcquired(b));

        const jackpot = pulledBadges.find((b) => b.tier <= 2 || b.projectId === 'wildcard');
        if (jackpot) {
          useFeedStore.getState().addEvent({
            actor: 'YOU',
            isPlayer: true,
            actionText: 'unsealed a rare drop:',
            highlightText: `Tier ${jackpot.tier} ${jackpot.projectId.toUpperCase()}`,
            tier: jackpot.tier,
          });
        }

        return pulledBadges.length > 0 ? pulledBadges : null;
      },

      openPack: (cost = PACK_CONFIGS.explorer.cost) => {
        const pulls = get().openPacksBatch('explorer', 1);
        if (pulls) return pulls;

        if (get().inkBalance >= cost) {
          if (get().buyPacks('explorer', 1)) {
            return get().openPacksBatch('explorer', 1);
          }
        }
        return null;
      },

      inscribe: (slotId, badgeId) => {
        let inscribedBadge: Badge | null = null;
        let cost = 0;

        set((state) => {
          const badgeToInscribe = state.badges[badgeId];
          if (!badgeToInscribe) return state;

          if (badgeToInscribe.projectId === 'wildcard' || badgeToInscribe.shape === 'wildcard') {
            return state;
          }

          cost = INSCRIBE_SETTINGS.calculateCost(badgeToInscribe.tier);
          if (state.inkBalance < cost) return state;

          const updatedBadges = { ...state.badges };
          delete updatedBadges[badgeId];
          inscribedBadge = badgeToInscribe;

          return {
            slots: { ...state.slots, [slotId]: badgeToInscribe },
            badges: updatedBadges,
            inkBalance: Math.max(0, state.inkBalance - cost),
          };
        });

        if (inscribedBadge) {
          useQuestStore.getState().reportActionProgress('inscribe', 1);
          if (cost > 0) useQuestStore.getState().reportActionProgress('spend_ink', cost);
          useFeedStore.getState().addEvent({
            actor: 'YOU',
            isPlayer: true,
            actionText: 'inscribed',
            highlightText: `Slot #${slotId} (${(inscribedBadge as Badge).projectId.toUpperCase()} T${(inscribedBadge as Badge).tier})`,
            tier: (inscribedBadge as Badge).tier,
          });
        }
      },

      advanceDay: () => {
        const nextDay = get().currentDay + 1;
        set({
          currentDay: nextDay,
          calendarProgress: Math.min(40, nextDay),
          isDailyFaucetClaimed: false,
        });

        useQuestStore.getState().syncQuests(nextDay);
      },

      injectInk: (amount) => {
        get().addInk(amount);
      },

      resetSlots: () => {
        set(() => ({ slots: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null } }));
      },

      resetInventory: () => set(() => ({ badges: {} })),

      forgeBadges: (badgeIdsToBurn, targetTier, projectId, shape) => {
        let forgedBadge: Badge | null = null;
        let cost = 0;

        set((state) => {
          if (badgeIdsToBurn.length !== 3) return state;

          const sourceTier = targetTier + 1;
          cost = getForgeCost(sourceTier);
          if (state.inkBalance < cost) return state;

          const updatedBadges = { ...state.badges };
          badgeIdsToBurn.forEach((id) => delete updatedBadges[id]);

          const newBadge: Badge = {
            id: `badge-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            projectId,
            shape,
            tier: targetTier,
          };
          
          updatedBadges[newBadge.id] = newBadge;
          forgedBadge = newBadge;

          return {
            badges: updatedBadges,
            inkBalance: Math.max(0, state.inkBalance - cost),
          };
        });

        if (forgedBadge) {
          useQuestStore.getState().reportActionProgress('forge_any', 1);
          useQuestStore.getState().reportActionProgress('forge_bulk', 1);
          useQuestStore.getState().reportBadgeAcquired(forgedBadge);
          if (cost > 0) useQuestStore.getState().reportActionProgress('spend_ink', cost);
        }

        return forgedBadge;
      },

      injectTestBundle: () => {
        set((state) => {
          const updatedBadges = { ...state.badges };
          const updatedPacks = {
            explorer: (state.unopenedPacks?.explorer || 0) + 3,
            adventurer: (state.unopenedPacks?.adventurer || 0) + 3,
            degen: (state.unopenedPacks?.degen || 0) + 3,
          };

          const now = Date.now();

          const guaranteedSets: Array<{ projectId: string; shape: BadgeShape; tier: number }> = [
            { projectId: 'realms', shape: 'circle', tier: 5 },
            { projectId: 'realms', shape: 'square', tier: 5 },
            { projectId: 'realms', shape: 'hexagon', tier: 5 },

            { projectId: 'genesis', shape: 'triangle', tier: 5 },
            { projectId: 'genesis', shape: 'triangle', tier: 5 },
            { projectId: 'genesis', shape: 'triangle', tier: 5 },

            { projectId: 'hyperloot', shape: 'square', tier: 4 },
            { projectId: 'hyperloot', shape: 'square', tier: 4 },
            { projectId: 'hyperloot', shape: 'circle', tier: 4 },

            { projectId: 'bifrost', shape: 'triangle', tier: 4 },
            { projectId: 'bifrost', shape: 'triangle', tier: 4 },
            { projectId: 'wildcard', shape: 'wildcard', tier: 4 },
          ];

          guaranteedSets.forEach((item, idx) => {
            const id = `badge-seed-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
            updatedBadges[id] = {
              id,
              projectId: item.projectId,
              shape: item.shape,
              tier: item.tier,
            };
          });

          for (let i = 0; i < 6; i++) {
            const tier = Math.floor(Math.random() * 4) + 2;
            const projectId = LOOT_PROJECTS[Math.floor(Math.random() * LOOT_PROJECTS.length)];
            const shape = STANDARD_SHAPES[Math.floor(Math.random() * STANDARD_SHAPES.length)];
            const id = `badge-test-${now}-${i}-${Math.random().toString(36).slice(2, 6)}`;
            updatedBadges[id] = {
              id,
              projectId,
              shape,
              tier,
            };
          }

          return {
            inkBalance: state.inkBalance + 1000,
            unopenedPacks: updatedPacks,
            badges: updatedBadges,
          };
        });
      },

      markBadgesAsSeen: (badgeIds: string[]) =>
        set((state) => ({
          unseenBadgeIds: state.unseenBadgeIds.filter((id) => !badgeIds.includes(id)),
        })),
    }),

    // ─── ARGUMENT 2: Persistence Configuration Options ───────────────
    {
      name: 'loot-showcase-gameplay-state',
      partialize: (state) => ({
        inkBalance: state.inkBalance,
        currentDay: state.currentDay,
        calendarProgress: state.calendarProgress,
        claimedCalendarDays: state.claimedCalendarDays,
        currentStreak: state.currentStreak,
        isDailyFaucetClaimed: state.isDailyFaucetClaimed,
        claimMultiplierBonus: state.claimMultiplierBonus,
        wildcardTokens: state.wildcardTokens,
        unopenedPacks: state.unopenedPacks,
        traits: state.traits,
        slots: state.slots,
        badges: state.badges,
        unseenBadgeIds: state.unseenBadgeIds,
        // stagedSlotId and stagedBadgeId are intentionally omitted so selections reset on reload
      }),
    }
  )
);

// ─── Backward-Compatibility Aliases ─────────────────────────────────
// These allow components still importing `useArchiverStore` or `ArchiverState`
// to continue working without throwing immediate compiler errors.
export const useArchiverStore = useShowcaseStore;
export type ArchiverState = ShowcaseState;