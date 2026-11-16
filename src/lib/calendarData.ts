// Run inside: frontend/
// src/lib/calendarData.ts

import type { CalendarRewardConfig } from '@/components/rewards/types';

export const SEASONAL_CALENDAR_CONFIG: CalendarRewardConfig[] = Array.from(
  { length: 40 },
  (_, idx) => {
    const day = idx + 1;

    // Daily Claim Bonus Milestones (Days 3, 9, 15, 21, 27)
    if ([3, 9, 15, 21, 27].includes(day)) {
      return {
        day,
        type: 'engine_builder',
        title: '+5% Daily Claim Bonus',
        description: 'Permanent additive boost to your Daily Faucet claims.',
        additiveBoostPercent: 5,
      };
    }

    // Gacha Packs (Days 6, 18, 24, 33, 39) — No redundant explainer text
    if (day === 6 || day === 24) {
      return {
        day,
        type: 'gacha',
        title: '1x Adventurer Pack',
        description: '',
        packType: 'adventurer',
        packCount: 1,
      };
    }
    if (day === 18 || day === 39) {
      return {
        day,
        type: 'gacha',
        title: '2x Explorer Packs',
        description: '',
        packType: 'explorer',
        packCount: 2,
      };
    }
    if (day === 33) {
      return {
        day,
        type: 'gacha',
        title: '1x Degen Pack',
        description: '',
        packType: 'degen',
        packCount: 1,
      };
    }

    // Wildcard Badges (Days 12, 30, 36) — No redundant explainer text
    if (day === 12) {
      return {
        day,
        type: 'utility',
        title: 'T4 Wildcard Badge',
        description: '',
        wildcardTier: 4,
      };
    }
    if (day === 30) {
      return {
        day,
        type: 'utility',
        title: 'T3 Wildcard Badge',
        description: '',
        wildcardTier: 3,
      };
    }
    if (day === 36) {
      return {
        day,
        type: 'utility',
        title: 'T2 Wildcard Badge',
        description: '',
        wildcardTier: 2,
      };
    }

    // The Trophy (Day 40)
    if (day === 40) {
      return {
        day,
        type: 'trophy',
        title: 'Shiny Cosmetic Trait',
        description: 'Exclusive cosmetic trait applied permanently to your Showcase.',
        isCosmeticTrophy: true,
      };
    }

    // Baseline Resource Padding Days
    return {
      day,
      type: 'resource',
      title: '+150',
      description: '',
      inkAmount: 150,
    };
  }
);