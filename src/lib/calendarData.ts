// Run inside: frontend/
// src/lib/calendarData.ts

import type { CalendarRewardConfig } from '@/components/rewards/types';

export const SEASONAL_CALENDAR_CONFIG: CalendarRewardConfig[] = Array.from(
  { length: 40 },
  (_, idx) => {
    const day = idx + 1;

    // Daily Claim Bonus Milestones (Days 3, 9, 15, 21, 27)[cite: 3, 29]
    if ([3, 9, 15, 21, 27].includes(day)) {
      return {
        day,
        type: 'engine_builder',
        title: '+5% Daily Claim Bonus',
        description: 'Permanent additive boost to all future daily Ink claims.',
        additiveBoostPercent: 5,
      };
    }

    // Gacha Packs (Days 6, 18, 24, 33, 39)[cite: 3, 29]
    if (day === 6 || day === 24) {
      return {
        day,
        type: 'gacha',
        title: '1x Adventurer Pack',
        description: 'Mid-tier pack containing 5 badges with T3/T4 chances.',
        packType: 'adventurer',
        packCount: 1,
      };
    }
    if (day === 18 || day === 39) {
      return {
        day,
        type: 'gacha',
        title: '2x Explorer Packs',
        description: '2 standard packs containing 10 badges total.',
        packType: 'explorer',
        packCount: 2,
      };
    }
    if (day === 33) {
      return {
        day,
        type: 'gacha',
        title: '1x Degen Pack',
        description: 'High-tier pack containing 5 badges with T2/T1 chances.',
        packType: 'degen',
        packCount: 1,
      };
    }

    // Wildcard Badges (Days 12, 30, 36)[cite: 3, 29]
    if (day === 12) {
      return {
        day,
        type: 'utility',
        title: 'T4 Wildcard Badge',
        description: 'Uncommon wildcard substituting any shape in Tier 4 merges.',
        wildcardTier: 4,
      };
    }
    if (day === 30) {
      return {
        day,
        type: 'utility',
        title: 'T3 Wildcard Badge',
        description: 'Rare wildcard substituting any shape in Tier 3 merges.',
        wildcardTier: 3,
      };
    }
    if (day === 36) {
      return {
        day,
        type: 'utility',
        title: 'T2 Wildcard Badge',
        description: 'Epic wildcard substituting any shape in Tier 2 merges.',
        wildcardTier: 2,
      };
    }

    // The Trophy (Day 40)[cite: 3, 29]
    if (day === 40) {
      return {
        day,
        type: 'trophy',
        title: 'Shiny Cosmetic Trait',
        description: 'Exclusive cosmetic trait applied permanently to Showcase NFT.',
        isCosmeticTrophy: true,
      };
    }

    // Baseline Resource Padding Days[cite: 3, 29]
    return {
      day,
      type: 'resource',
      title: '+150 Ink',
      description: '',
      inkAmount: 150,
    };
  }
);