// Run inside: frontend/
// src/components/dashboard/DashboardHeader.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Flame, Gift, Droplet, Radio, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TIER_THEMES } from '@/lib/theme';
import { useFeedStore } from '@/store/useFeedStore';
import { useShowcaseStore } from '@/store/useShowcaseStore';
import { useQuestStore } from '@/store/useQuestStore';
import { SEASONAL_CALENDAR_CONFIG } from '@/lib/calendarData';

interface DashboardHeaderProps {
  currentDay: number;
  inkBalance: number;
  onOpenRewards?: () => void;
}

const EPOCH_HOURS = 2; // 1 in-game day = 2 real-world hours
const TOTAL_SEASON_DAYS = 50;

export default function DashboardHeader({
  currentDay,
  inkBalance,
  onOpenRewards,
}: DashboardHeaderProps) {
  const events = useFeedStore((state) => state.events);
  const advanceDay = useShowcaseStore((state) => state.advanceDay);
  const isDailyFaucetClaimed = useShowcaseStore((state) => state.isDailyFaucetClaimed);
  const claimedCalendarDays = useShowcaseStore((state) => state.claimedCalendarDays);

  const dailyQuests = useQuestStore((state) => state.dailyQuests);
  const weeklyQuests = useQuestStore((state) => state.weeklyQuests);

  const [epochTimeRemaining, setEpochTimeRemaining] = useState<string>('');
  const [seasonTimeRemaining, setSeasonTimeRemaining] = useState<string>('');

  // Total unclaimed rewards across Daily/Weekly quests, Daily Faucet, and Seasonal Calendar
  const totalUnclaimedRewards = useMemo(() => {
    const unclaimedQuests =
      dailyQuests.filter((q) => q.isCompleted && !q.isClaimed).length +
      weeklyQuests.filter((q) => q.isCompleted && !q.isClaimed).length;

    const unclaimedFaucet = isDailyFaucetClaimed ? 0 : 1;

    const currentProgressDay = Math.min(40, currentDay);
    const claimedSet = new Set(claimedCalendarDays);
    const unclaimedCalendar = SEASONAL_CALENDAR_CONFIG.filter(
      (c) => c.day <= currentProgressDay && !claimedSet.has(c.day)
    ).length;

    return unclaimedQuests + unclaimedFaucet + unclaimedCalendar;
  }, [dailyQuests, weeklyQuests, isDailyFaucetClaimed, claimedCalendarDays, currentDay]);

  // Continuous real-time countdown for both the active Epoch and total Season
  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const epochMs = EPOCH_HOURS * 60 * 60 * 1000;
      const msIntoCurrentEpoch = now % epochMs;
      const msRemainingInEpoch = epochMs - msIntoCurrentEpoch;

      // 1. Current 2-Hour Epoch Countdown
      const epHours = Math.floor(msRemainingInEpoch / (1000 * 60 * 60));
      const epMinutes = Math.floor((msRemainingInEpoch % (1000 * 60 * 60)) / (1000 * 60));
      const epSeconds = Math.floor((msRemainingInEpoch % (1000 * 60)) / 1000);

      setEpochTimeRemaining(
        `${epHours.toString().padStart(2, '0')}:${epMinutes.toString().padStart(2, '0')}:${epSeconds.toString().padStart(2, '0')}`
      );

      // 2. Total Season Countdown (ticks down second-by-second)
      const remainingDaysAfterCurrent = Math.max(0, TOTAL_SEASON_DAYS - currentDay);
      const totalSeasonRemainingMs = remainingDaysAfterCurrent * epochMs + msRemainingInEpoch;

      const totalHours = Math.floor(totalSeasonRemainingMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor((totalSeasonRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const totalSeconds = Math.floor((totalSeasonRemainingMs % (1000 * 60)) / 1000);

      setSeasonTimeRemaining(
        `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`
      );

      // Auto-advance when the epoch reaches zero
      if (msRemainingInEpoch < 1000) {
        advanceDay();
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [currentDay, advanceDay]);

  // Duplicate events array to form a continuous, seamless loop
  const displayEvents = events.length > 0 ? [...events, ...events] : [];

  const renderRewardsButton = () => {
    const hasUnclaimed = totalUnclaimedRewards > 0;

    return (
      <div className="relative inline-flex shrink-0">
        {hasUnclaimed && (
          <span className="absolute -top-2 -right-1.5 z-20 min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 border border-emerald-300 text-neutral-950 font-mono text-[11px] font-extrabold flex items-center justify-center shadow-md leading-none pointer-events-none">
            {totalUnclaimedRewards}
          </span>
        )}

        <Button
          variant="outline"
          onClick={onOpenRewards}
          className={`h-9 sm:h-10 lg:h-11 px-3.5 sm:px-4 lg:px-5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
            hasUnclaimed
              ? 'border-purple-500/80 bg-purple-950/55 hover:bg-purple-900/65 text-white shadow-[0_0_18px_rgba(168,85,247,0.35)] animate-[pulse_3s_ease-in-out_infinite]'
              : 'border-purple-900/60 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 hover:text-white shadow-sm'
          }`}
        >
          <Gift size={15} className="text-purple-300 shrink-0" />
          <span className="font-bold text-xs sm:text-sm tracking-wide">Rewards</span>
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Ticker Animation Styling */}
      <style>{`
        @keyframes tickerMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-feed-marquee {
          display: flex;
          width: max-content;
          animation: tickerMarquee 35s linear infinite;
        }
        .animate-feed-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Global Navigation Bar:
          - < 560px (Mobile): 2x2 grid (Top-Left: Brand, Top-Right: Countdown, Bottom-Left: Ink Pill, Bottom-Right: Rewards Button)
          - 560px–1023px (Medium/Tablet): 3-zone row (Brand left, Countdown center, stacked Ink + Rewards right)
          - >= 1024px (Desktop): 3-zone row (Brand left, Countdown center, side-by-side Ink + Rewards right)
      */}
      <nav className="grid grid-cols-[1fr_auto] min-[560px]:flex min-[560px]:flex-row items-center justify-between bg-neutral-900 px-3.5 py-3 sm:px-5 sm:py-3.5 lg:px-6 lg:py-4 rounded-xl border border-neutral-800 shadow-md gap-x-3 gap-y-2.5 min-[560px]:gap-4 lg:gap-6">
        {/* 1. Left Zone: Branding & Epoch Day */}
        <div className="order-1 flex flex-col items-start justify-center text-left min-w-0 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-400 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold tracking-wider text-white whitespace-nowrap">
              LOOT SHOWCASE
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 text-[10px] xs:text-[11px] sm:text-xs font-mono text-neutral-400 mt-1 sm:pl-7">
            <span className="whitespace-nowrap">
              Day <strong className="text-neutral-200">{currentDay}/{TOTAL_SEASON_DAYS}</strong>
            </span>
            <span className="text-neutral-600">•</span>
            <span className="inline-flex items-center gap-1 text-[10px] xs:text-[11px] text-amber-400/90 font-medium whitespace-nowrap">
              <Clock size={11} className="shrink-0" /> Next: {epochTimeRemaining || '--:--:--'}
            </span>
          </div>
        </div>

        {/* 2. Center Zone (560px+) / Top-Right (< 560px): Live Season Countdown */}
        <div className="order-2 justify-self-end min-[560px]:justify-self-auto flex items-center justify-center shrink-0">
          <div className="relative px-3 py-1.5 min-[560px]:px-4 min-[560px]:py-1.5 lg:px-6 lg:py-2 rounded-xl border border-red-900/60 bg-gradient-to-b from-red-950/40 via-red-950/20 to-neutral-950 flex flex-row min-[560px]:flex-col items-center gap-1.5 min-[560px]:gap-0 shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20">
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-red-400 tracking-wider lg:tracking-widest uppercase whitespace-nowrap">
              <Flame size={12} className="text-red-500 animate-pulse shrink-0" />
              <span className="hidden min-[560px]:inline">Season Ends In</span>
              <span className="min-[560px]:hidden">Ends</span>
            </div>
            <div className="font-mono text-xs xs:text-sm min-[560px]:text-base lg:text-2xl font-black text-red-100 tracking-wider min-[560px]:mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] whitespace-nowrap">
              {seasonTimeRemaining || '--:--:--'}
            </div>
          </div>
        </div>

        {/* Mobile (< 560px) Bottom-Left: Ink Balance Pill */}
        <div className="order-3 min-[560px]:hidden justify-self-start flex items-center">
          <div className="h-9 px-3 rounded-xl bg-neutral-950/85 border border-neutral-800/90 shadow-inner flex items-center gap-1.5 select-none shrink-0">
            <Droplet size={14} className="text-emerald-400 shrink-0" />
            <span className="hidden xs:inline text-xs text-neutral-400 font-medium">Balance:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums whitespace-nowrap">
              {inkBalance.toLocaleString()} Ink
            </span>
          </div>
        </div>

        {/* Mobile (< 560px) Bottom-Right: Rewards Button (Directly below Countdown for thumb reach) */}
        <div className="order-4 min-[560px]:hidden justify-self-end flex items-center">
          {renderRewardsButton()}
        </div>

        {/* 3. Right Zone (560px+): Stacked on 560px–1023px (Ink on top, Rewards below), Side-by-Side on 1024px+ */}
        <div className="hidden min-[560px]:flex min-[560px]:order-3 flex-col lg:flex-row items-end lg:items-center justify-center lg:justify-end gap-1.5 lg:gap-3 shrink-0">
          <div className="h-8 lg:h-11 px-3 lg:px-4 rounded-xl bg-neutral-950/85 border border-neutral-800/90 shadow-inner flex items-center gap-1.5 lg:gap-2 select-none shrink-0">
            <Droplet size={14} className="text-emerald-400 shrink-0" />
            <span className="hidden xl:inline text-xs text-neutral-400 font-medium">Balance:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs lg:text-sm tabular-nums whitespace-nowrap">
              {inkBalance.toLocaleString()} Ink
            </span>
          </div>

          {renderRewardsButton()}
        </div>
      </nav>

      {/* Infinite Auto-Scrolling Public Feed */}
      <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg px-2.5 py-1.5 flex items-center overflow-hidden shadow-inner">
        <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono font-bold uppercase tracking-wider mr-3 pl-1 pr-3 -my-1.5 py-1.5 shrink-0 border-r border-neutral-800 z-10 bg-neutral-900">
          <Radio size={13} className="text-emerald-400 animate-pulse" />
          <span>News Feed</span>
        </div>

        <div className="overflow-hidden w-full relative">
          <div className="animate-feed-marquee flex items-center gap-6 text-xs text-neutral-300 font-sans">
            {displayEvents.map((evt, idx) => {
              const tierStyle =
                evt.tier && TIER_THEMES[evt.tier] ? TIER_THEMES[evt.tier].text : 'text-amber-400';

              return (
                <div
                  key={`${evt.id}-${idx}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  {evt.isPlayer ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-[10px] leading-none">
                      YOU
                    </span>
                  ) : (
                    <span className="inline-flex items-center font-bold text-neutral-200 font-mono text-xs leading-none">
                      {evt.actor}
                    </span>
                  )}
                  <span className="text-neutral-400 leading-none">{evt.actionText}</span>
                  <span className={`font-semibold leading-none ${tierStyle}`}>
                    {evt.highlightText}
                  </span>
                  <span className="opacity-25 text-neutral-600 select-none ml-4">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}