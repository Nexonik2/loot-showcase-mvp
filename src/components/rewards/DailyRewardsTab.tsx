// Run inside: frontend/
// src/components/rewards/DailyRewardsTab.tsx

import React, { useState, useEffect, useMemo } from 'react';
import type { Quest } from '@/store/useQuestStore';
import DailyQuestCard from './DailyQuestCard';
import { Button } from '@/components/ui/button';
import { Flame, Sparkles, Check, Target, Droplet } from 'lucide-react';
import { useArchiverStore } from '@/store/useShowcaseStore';
import { calculateShowcaseTotalYield } from '@/lib/inscriptionYield';

interface DailyRewardsTabProps {
  inkBalance: number;
  streakCount: number;
  isDailyClaimed: boolean;
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  dailyRerollsUsed: number;
  weeklyRerollsUsed: number;
  onClaimDailyInk: (event: React.MouseEvent) => void;
  onClaimQuest: (questId: string, isWeekly: boolean, event: React.MouseEvent) => void;
  onRerollQuest: (questId: string, isWeekly: boolean) => void;
  onNavigateRoute: (route: 'forge' | 'gacha' | 'showcase') => void;
}

export default function DailyRewardsTab({
  streakCount,
  isDailyClaimed,
  dailyQuests,
  weeklyQuests,
  dailyRerollsUsed,
  weeklyRerollsUsed,
  onClaimDailyInk,
  onClaimQuest,
  onRerollQuest,
  onNavigateRoute,
}: DailyRewardsTabProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  const slots = useArchiverStore((state) => state.slots);
  const claimMultiplierBonus = useArchiverStore((state) => state.claimMultiplierBonus);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      setTimeUntilReset(`${h}h ${m.toString().padStart(2, '0')}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const streakBonusPercent = Math.min(60, streakCount * 10);
  const baseClaim = 150;
  const baseMultiplier = 1 + streakBonusPercent / 100 + claimMultiplierBonus;
  const faucetBaseClaim = Math.floor(baseClaim * baseMultiplier);

  const { claimableYield: inscriptionYield } = useMemo(
    () => calculateShowcaseTotalYield(slots),
    [slots]
  );

  const totalDailyPayout = faucetBaseClaim + inscriptionYield;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Daily Streak Faucet Card */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 flex flex-col items-start gap-3.5 shadow-sm w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
            <Flame size={18} className="text-amber-500 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">Daily Ink Faucet</h3>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[9px] font-mono font-bold whitespace-nowrap">
                {streakCount}-Day Streak (+{streakBonusPercent}%)
              </span>
              {claimMultiplierBonus > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[9px] font-mono font-bold whitespace-nowrap">
                  +{(claimMultiplierBonus * 100).toFixed(0)}% Calendar
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1">
              <span>Base: {faucetBaseClaim} Ink</span>
              {inscriptionYield > 0 && (
                <span className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
                  <Droplet size={11} /> +{inscriptionYield} Inscription Yield
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={onClaimDailyInk}
          disabled={isDailyClaimed}
          className={`w-full h-8 sm:h-9 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95 ${
            !isDailyClaimed
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-neutral-800 text-neutral-500 cursor-default'
          }`}
        >
          {isDailyClaimed ? (
            <>
              <Check size={14} />
              <span>Claimed Today</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Claim {totalDailyPayout} Ink</span>
            </>
          )}
        </Button>
      </div>

      {/* 2. Weekly Quests Tray */}
      <div className="flex flex-col gap-2.5 w-full">
        <div className="flex items-center justify-between gap-1 text-xs px-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Target size={13} className="text-purple-400 shrink-0" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 truncate">
              Weekly Quests
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 shrink-0 whitespace-nowrap">
            Rerolls: {1 - weeklyRerollsUsed}/1
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {weeklyQuests.map((quest) => (
            <DailyQuestCard
              key={quest.id}
              quest={quest}
              onClaim={onClaimQuest}
              onNavigateRoute={onNavigateRoute}
              onReroll={onRerollQuest}
              canReroll={weeklyRerollsUsed < 1}
            />
          ))}
        </div>
      </div>

      {/* 3. Active Bounties Tray */}
      <div className="flex flex-col gap-2.5 w-full">
        <div className="flex items-center justify-between gap-1 text-xs px-0.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 truncate">
            Active Bounties
          </h3>
          <span className="text-[10px] font-mono text-neutral-500 shrink-0 whitespace-nowrap">
            Rerolls: {1 - dailyRerollsUsed}/1
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {dailyQuests.map((quest) => (
            <DailyQuestCard
              key={quest.id}
              quest={quest}
              onClaim={onClaimQuest}
              onNavigateRoute={onNavigateRoute}
              onReroll={onRerollQuest}
              canReroll={dailyRerollsUsed < 1}
            />
          ))}

          {Array.from({ length: Math.max(0, 6 - dailyQuests.length) }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="h-[68px] rounded-xl border border-dashed border-neutral-800/80 bg-neutral-950/20 flex items-center justify-center"
            >
              <span className="text-[10px] font-mono text-neutral-600">
                Empty Slot (Refills in {timeUntilReset})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}