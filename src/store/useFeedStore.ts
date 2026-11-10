// src/store/useFeedStore.ts

import { create } from 'zustand';

export interface FeedEvent {
  id: string;
  actor: string;
  isPlayer?: boolean;
  actionText: string;
  highlightText: string;
  tier?: number;
}

interface FeedState {
  events: FeedEvent[];
  addEvent: (event: Omit<FeedEvent, 'id'>) => void;
}

const SEED_EVENTS: FeedEvent[] = [
  {
    id: 'seed-1',
    actor: '@Degen99',
    actionText: 'unsealed a',
    highlightText: 'Tier 4 Realms Square',
    tier: 4,
  },
  {
    id: 'seed-2',
    actor: '@WhaleTears',
    actionText: 'forged a',
    highlightText: 'Tier 1 Genesis Triangle',
    tier: 1,
  },
  {
    id: 'seed-3',
    actor: '@RNGsus',
    actionText: 'bound a Tier 2 badge to',
    highlightText: 'Showcase Slot #4',
    tier: 2,
  },
  {
    id: 'seed-4',
    actor: '@LootSmith',
    actionText: 'unsealed a',
    highlightText: 'Tier 3 Hyperloot Circle',
    tier: 3,
  },
];

export const useFeedStore = create<FeedState>((set) => ({
  events: SEED_EVENTS,
  addEvent: (event) =>
    set((state) => ({
      // Keep feed capped at the 12 most recent events
      events: [
        { ...event, id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
        ...state.events.slice(0, 11),
      ],
    })),
}));