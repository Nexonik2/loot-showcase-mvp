// Run inside: frontend/
// src/store/useQuestStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Badge, BadgeShape } from './useShowcaseStore';
import { LOOT_PROJECTS, STANDARD_SHAPES } from './useShowcaseStore';

export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestActionType =
  | 'claim_ink' | 'pack_any' | 'forge_any' | 'acquire_shape' | 'acquire_proj'
  | 'pack_bulk' | 'forge_bulk' | 'forge_pure' | 'spend_ink' | 'pack_adv'
  | 'tier_rare' | 'inscribe' | 'tier_epic' | 'wildcard' | 'pack_degen';

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  rewardInk: number;
  type: QuestActionType;
  target: number;
  currentProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  targetShape?: BadgeShape;
  targetProject?: string;
  isWeekly?: boolean;
}

export interface QuestToastPayload {
  id: string;
  title: string;
  currentProgress: number;
  target: number;
  isCompleted: boolean;
  rewardInk: number;
  type: string;
}

export interface QuestStoreState {
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  lastDailySyncDay: number | null;
  lastWeeklySyncWeek: number | null;
  dailyRerollsUsed: number;
  weeklyRerollsUsed: number;

  // HUD Toast State & Deferral Controls
  activeToast: QuestToastPayload | null;
  deferredToast: QuestToastPayload | null;
  isToastPaused: boolean;
  triggerQuestToast: (payload: QuestToastPayload) => void;
  clearQuestToast: () => void;
  pauseQuestToasts: () => void;
  resumeQuestToasts: () => void;

  syncQuests: (currentDay: number) => void;
  claimQuestReward: (questId: string, isWeekly: boolean, addInk: (amt: number) => void) => void;
  rerollQuest: (questId: string, isWeekly: boolean) => void;
  reportActionProgress: (type: QuestActionType, amount: number) => void;
  reportBadgeAcquired: (badge: Badge) => void;
}

// --- Priority Helper ---
const resolveToastPriority = (
  existing: QuestToastPayload | null,
  incoming: QuestToastPayload | null
): QuestToastPayload | null => {
  if (!incoming) return existing;
  if (!existing) return incoming;
  // Never let a non-completed progress tick overwrite a completed quest banner
  if (existing.isCompleted && !incoming.isCompleted) return existing;
  return incoming;
};

// --- Generator Helpers ---
const randomElement = <T,>(arr: readonly T[] | T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const generateEasyQuest = (idOffset: number): Quest => {
  const templates: Array<() => Omit<Quest, 'id' | 'isCompleted' | 'isClaimed'>> = [
    () => ({ title: 'Residue Tap', description: 'Claim your daily Ink from the faucet banner.', difficulty: 'easy', rewardInk: 20, type: 'claim_ink', target: 1, currentProgress: 0 }),
    () => ({ title: 'Calendar Milestone', description: "Claim today's Seasonal Calendar reward.", difficulty: 'easy', rewardInk: 20, type: 'claim_ink', target: 1, currentProgress: 0 }),
    () => ({ title: 'First Step', description: 'Open 1 pack of any tier in the Shrine.', difficulty: 'easy', rewardInk: 20, type: 'pack_any', target: 1, currentProgress: 0 }),
    () => ({ title: 'Apprentice Smith', description: 'Forge 1 badge of any tier on the Altar.', difficulty: 'easy', rewardInk: 20, type: 'forge_any', target: 1, currentProgress: 0 }),
    () => {
      const shape = randomElement(STANDARD_SHAPES);
      return { title: `Shape Seeker: ${shape}`, description: `Acquire 2 ${shape} badges (Open or Forge).`, difficulty: 'easy', rewardInk: 20, type: 'acquire_shape', targetShape: shape, target: 2, currentProgress: 0 };
    },
    () => {
      const proj = randomElement(LOOT_PROJECTS);
      return { title: `Project Scout: ${proj}`, description: `Acquire 2 ${proj} badges (Open or Forge).`, difficulty: 'easy', rewardInk: 20, type: 'acquire_proj', targetProject: proj, target: 2, currentProgress: 0 };
    },
  ];
  return { id: `d-easy-${Date.now()}-${idOffset}`, ...randomElement(templates)(), isCompleted: false, isClaimed: false };
};

const generateMediumQuest = (idOffset: number, currentDay: number): Quest => {
  const templates: Array<() => Omit<Quest, 'id' | 'isCompleted' | 'isClaimed'>> = [
    () => ({ title: 'Pack Ripper', description: 'Open 3 packs of any tier.', difficulty: 'medium', rewardInk: 38, type: 'pack_bulk', target: 3, currentProgress: 0 }),
    () => ({ title: 'Journeyman Smith', description: 'Forge 3 badges across any project sets.', difficulty: 'medium', rewardInk: 38, type: 'forge_bulk', target: 3, currentProgress: 0 }),
    () => ({ title: 'Harmonic Fusion', description: 'Complete 1 Pure Merge (3 identical shapes & projects).', difficulty: 'medium', rewardInk: 38, type: 'forge_pure', target: 1, currentProgress: 0 }),
    () => {
      const proj = randomElement(LOOT_PROJECTS);
      return { title: `Vanguard: ${proj}`, description: `Acquire 4 ${proj} badges (Open or Forge).`, difficulty: 'medium', rewardInk: 38, type: 'acquire_proj', targetProject: proj, target: 4, currentProgress: 0 };
    },
  ];

  if (currentDay >= 6) {
    templates.push(
      () => ({ title: 'The Adventurer', description: 'Open 1 Adventurer Pack (400 Ink).', difficulty: 'medium', rewardInk: 38, type: 'pack_adv', target: 1, currentProgress: 0 }),
      () => ({ title: 'Rare Assembly', description: 'Acquire 1 Tier 3 (Rare) badge or higher.', difficulty: 'medium', rewardInk: 38, type: 'tier_rare', target: 1, currentProgress: 0 }),
      () => ({ title: 'Active Circulation', description: 'Spend 350+ Ink on packs or forge fees.', difficulty: 'medium', rewardInk: 38, type: 'spend_ink', target: 350, currentProgress: 0 })
    );
  }
  return { id: `d-med-${Date.now()}-${idOffset}`, ...randomElement(templates)(), isCompleted: false, isClaimed: false };
};

const generateWeeklyQuest = (idOffset: number, currentDay: number): Quest => {
  const templates: Array<() => Omit<Quest, 'id' | 'isCompleted' | 'isClaimed'>> = [
    () => ({ title: 'Mass Unsealing', description: 'Open 10 packs of any tier.', difficulty: 'hard', rewardInk: 180, type: 'pack_bulk', target: 10, currentProgress: 0, isWeekly: true }),
    () => ({ title: 'Master Smith', description: 'Forge 10 badges on the Altar.', difficulty: 'hard', rewardInk: 180, type: 'forge_bulk', target: 10, currentProgress: 0, isWeekly: true }),
    () => {
      const isShape = Math.random() > 0.5;
      if (isShape) {
        const shape = randomElement(STANDARD_SHAPES);
        return { title: 'Dedicated Collector', description: `Acquire 20 ${shape} badges.`, difficulty: 'hard', rewardInk: 180, type: 'acquire_shape', targetShape: shape, target: 20, currentProgress: 0, isWeekly: true };
      }
      const proj = randomElement(LOOT_PROJECTS);
      return { title: 'Dedicated Collector', description: `Acquire 20 ${proj} badges.`, difficulty: 'hard', rewardInk: 180, type: 'acquire_proj', targetProject: proj, target: 20, currentProgress: 0, isWeekly: true };
    },
  ];

  if (currentDay >= 8) {
    templates.push(
      () => ({ title: 'The Degen', description: 'Open 2 Degen Packs.', difficulty: 'hard', rewardInk: 180, type: 'pack_degen', target: 2, currentProgress: 0, isWeekly: true }),
      () => ({ title: 'Permanent Archival', description: 'Inscribe 2 badges into your Showcase matrix.', difficulty: 'hard', rewardInk: 180, type: 'inscribe', target: 2, currentProgress: 0, isWeekly: true }),
      () => ({ title: 'Epic Imprint', description: 'Acquire 1 Tier 2 (Epic) badge or higher.', difficulty: 'hard', rewardInk: 180, type: 'tier_epic', target: 1, currentProgress: 0, isWeekly: true }),
      () => ({ title: 'Wildcard Catalyst', description: 'Complete 3 Forge recipes using a Wildcard badge.', difficulty: 'hard', rewardInk: 180, type: 'wildcard', target: 3, currentProgress: 0, isWeekly: true })
    );
  }
  return { id: `w-${Date.now()}-${idOffset}`, ...randomElement(templates)(), isCompleted: false, isClaimed: false };
};

export const useQuestStore = create<QuestStoreState>()(
  persist(
    (set, get) => ({
      dailyQuests: [],
      weeklyQuests: [],
      lastDailySyncDay: null,
      lastWeeklySyncWeek: null,
      dailyRerollsUsed: 0,
      weeklyRerollsUsed: 0,

      // HUD Toast State & Deferral Handlers
      activeToast: null,
      deferredToast: null,
      isToastPaused: false,

      triggerQuestToast: (payload) =>
        set((state) => {
          if (state.isToastPaused) {
            return { deferredToast: resolveToastPriority(state.deferredToast, payload) };
          }
          return { activeToast: resolveToastPriority(state.activeToast, payload) };
        }),

      clearQuestToast: () => set({ activeToast: null }),

      pauseQuestToasts: () => set({ isToastPaused: true }),

      resumeQuestToasts: () =>
        set((state) => ({
          isToastPaused: false,
          activeToast: resolveToastPriority(state.activeToast, state.deferredToast),
          deferredToast: null,
        })),

      syncQuests: (currentDay: number) => {
        const state = get();
        const currentWeek = Math.floor((currentDay - 1) / 7) + 1;
        const updates: Partial<QuestStoreState> = {};

        if (state.lastWeeklySyncWeek !== currentWeek) {
          updates.lastWeeklySyncWeek = currentWeek;
          updates.weeklyRerollsUsed = 0;
          updates.weeklyQuests = [
            generateWeeklyQuest(1, currentDay),
            generateWeeklyQuest(2, currentDay),
            generateWeeklyQuest(3, currentDay),
          ];
        }

        if (state.lastDailySyncDay !== currentDay) {
          updates.lastDailySyncDay = currentDay;
          updates.dailyRerollsUsed = 0;

          const activeDailies = [...state.dailyQuests.filter((q) => !q.isClaimed)];
          const availableSlots = Math.max(0, 6 - activeDailies.length);

          if (availableSlots > 0) {
            let easyToGen = 2;
            let medToGen = 2;

            if (availableSlots < 4) {
              easyToGen = Math.ceil(availableSlots / 2);
              medToGen = availableSlots - easyToGen;
            }

            for (let i = 0; i < easyToGen; i++) activeDailies.push(generateEasyQuest(i));
            for (let i = 0; i < medToGen; i++) activeDailies.push(generateMediumQuest(i, currentDay));
          }

          updates.dailyQuests = activeDailies.sort((a, b) => {
            if (a.difficulty === b.difficulty) return 0;
            return a.difficulty === 'easy' ? -1 : 1;
          });
        }

        if (Object.keys(updates).length > 0) set(updates);
      },

      rerollQuest: (questId: string, isWeekly: boolean) => {
        const state = get();
        if (isWeekly && state.weeklyRerollsUsed < 1) {
          const newQuests = state.weeklyQuests.map((q) =>
            q.id === questId ? generateWeeklyQuest(99, state.lastDailySyncDay || 1) : q
          );
          set({ weeklyQuests: newQuests, weeklyRerollsUsed: 1 });
        } else if (!isWeekly && state.dailyRerollsUsed < 1) {
          const targetQuest = state.dailyQuests.find((q) => q.id === questId);
          if (!targetQuest) return;
          const newQuest =
            targetQuest.difficulty === 'easy'
              ? generateEasyQuest(99)
              : generateMediumQuest(99, state.lastDailySyncDay || 1);

          set({
            dailyQuests: state.dailyQuests
              .map((q) => (q.id === questId ? newQuest : q))
              .sort((a, b) => {
                if (a.difficulty === b.difficulty) return 0;
                return a.difficulty === 'easy' ? -1 : 1;
              }),
            dailyRerollsUsed: 1,
          });
        }
      },

      claimQuestReward: (questId, isWeekly, addInk) => {
        const key = isWeekly ? 'weeklyQuests' : 'dailyQuests';
        const quests = get()[key];
        const quest = quests.find((q) => q.id === questId);

        if (!quest || !quest.isCompleted || quest.isClaimed) return;
        addInk(quest.rewardInk);

        set({
          [key]: quests.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q)),
        });
      },

      reportActionProgress: (type, amount) => {
        let candidateToast: QuestToastPayload | null = null;

        const updateFn = (q: Quest): Quest => {
          if (q.type !== type || q.isCompleted || q.isClaimed) return q;

          const updated = Math.min(q.target, q.currentProgress + amount);
          const newlyCompleted = updated >= q.target;

          if (updated > q.currentProgress) {
            const toastPayload: QuestToastPayload = {
              id: q.id,
              title: q.title,
              currentProgress: updated,
              target: q.target,
              isCompleted: newlyCompleted,
              rewardInk: q.rewardInk,
              type: q.type,
            };

            candidateToast = resolveToastPriority(candidateToast, toastPayload);
          }

          return { ...q, currentProgress: updated, isCompleted: newlyCompleted };
        };

        set((state) => {
          const nextDaily = state.dailyQuests.map(updateFn);
          const nextWeekly = state.weeklyQuests.map(updateFn);

          if (state.isToastPaused) {
            return {
              dailyQuests: nextDaily,
              weeklyQuests: nextWeekly,
              deferredToast: resolveToastPriority(state.deferredToast, candidateToast),
            };
          }

          return {
            dailyQuests: nextDaily,
            weeklyQuests: nextWeekly,
            activeToast: resolveToastPriority(state.activeToast, candidateToast),
          };
        });
      },

      reportBadgeAcquired: (badge: Badge) => {
        let candidateToast: QuestToastPayload | null = null;

        const updateFn = (q: Quest): Quest => {
          if (q.isCompleted || q.isClaimed) return q;
          let increment = 0;

          if (q.type === 'acquire_shape' && q.targetShape === badge.shape) increment = 1;
          else if (q.type === 'acquire_proj' && q.targetProject === badge.projectId) increment = 1;
          else if (q.type === 'tier_rare' && badge.tier <= 3) increment = 1;
          else if (q.type === 'tier_epic' && badge.tier <= 2) increment = 1;

          if (increment > 0) {
            const updated = Math.min(q.target, q.currentProgress + increment);
            const newlyCompleted = updated >= q.target;

            const toastPayload: QuestToastPayload = {
              id: q.id,
              title: q.title,
              currentProgress: updated,
              target: q.target,
              isCompleted: newlyCompleted,
              rewardInk: q.rewardInk,
              type: q.type,
            };

            candidateToast = resolveToastPriority(candidateToast, toastPayload);

            return { ...q, currentProgress: updated, isCompleted: newlyCompleted };
          }
          return q;
        };

        set((state) => {
          const nextDaily = state.dailyQuests.map(updateFn);
          const nextWeekly = state.weeklyQuests.map(updateFn);

          if (state.isToastPaused) {
            return {
              dailyQuests: nextDaily,
              weeklyQuests: nextWeekly,
              deferredToast: resolveToastPriority(state.deferredToast, candidateToast),
            };
          }

          return {
            dailyQuests: nextDaily,
            weeklyQuests: nextWeekly,
            activeToast: resolveToastPriority(state.activeToast, candidateToast),
          };
        });
      },
    }),
    {
      name: 'archiver-quest-board',
      partialize: (state) => ({
        dailyQuests: state.dailyQuests,
        weeklyQuests: state.weeklyQuests,
        lastDailySyncDay: state.lastDailySyncDay,
        lastWeeklySyncWeek: state.lastWeeklySyncWeek,
        dailyRerollsUsed: state.dailyRerollsUsed,
        weeklyRerollsUsed: state.weeklyRerollsUsed,
      }),
    }
  )
);