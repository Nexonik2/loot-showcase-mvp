import type { PackType } from '@/store/useShowcaseStore';

export type QuestDifficulty = 'easy' | 'medium' | 'hard';

export interface DailyQuest {
  id: string;
  name: string;
  difficulty: QuestDifficulty;
  description: string;
  rewardInk: number;
  currentProgress: number;
  maxProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionRoute?: 'forge' | 'gacha' | 'showcase';
}

export type CalendarRewardType =
  | 'resource'
  | 'engine_builder'
  | 'gacha'
  | 'utility'
  | 'trophy';

export interface CalendarRewardConfig {
  day: number;
  type: CalendarRewardType;
  title: string;
  description: string;
  inkAmount?: number;
  additiveBoostPercent?: number;
  packType?: PackType;
  packCount?: number;
  wildcardTier?: 2 | 3 | 4;
  isCosmeticTrophy?: boolean;
}