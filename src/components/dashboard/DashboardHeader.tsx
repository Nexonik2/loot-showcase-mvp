// Run inside: frontend/
// src/components/dashboard/DashboardHeader.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Gift, Droplet, Radio, Clock, Flame } from 'lucide-react';
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

  // Continuous real-time countdown for the active 2-Hour Epoch
  useEffect(() => {
    const updateEpochTimer = () => {
      const now = Date.now();
      const epochMs = EPOCH_HOURS * 60 * 60 * 1000;
      const msIntoCurrentEpoch = now % epochMs;
      const msRemainingInEpoch = epochMs - msIntoCurrentEpoch;

      const epHours = Math.floor(msRemainingInEpoch / (1000 * 60 * 60));
      const epMinutes = Math.floor((msRemainingInEpoch % (1000 * 60 * 60)) / (1000 * 60));
      const epSeconds = Math.floor((msRemainingInEpoch % (1000 * 60)) / 1000);

      setEpochTimeRemaining(
        `${epHours.toString().padStart(2, '0')}:${epMinutes.toString().padStart(2, '0')}:${epSeconds.toString().padStart(2, '0')}`
      );

      if (msRemainingInEpoch < 1000) {
        advanceDay();
      }
    };

    updateEpochTimer();
    const interval = setInterval(updateEpochTimer, 1000);
    return () => clearInterval(interval);
  }, [advanceDay]);

  // Duplicate events array to form a continuous, seamless loop
  const displayEvents = events.length > 0 ? [...events, ...events] : [];
  const isFinalStretch =
    currentDay >= TOTAL_SEASON_DAYS - 4 && currentDay <= TOTAL_SEASON_DAYS;
  const hasUnclaimed = totalUnclaimedRewards > 0;

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

      {/* Sticky 1-Row Global Status Bar */}
      <nav className="sticky top-2 z-40 flex items-center justify-between bg-neutral-900/95 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-3.5 rounded-xl border border-neutral-800 shadow-lg gap-2 sm:gap-3">
        {/* 1. Left Zone: Branding */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
          <Sparkles className="text-emerald-400 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <h1 className="text-xs xs:text-sm sm:text-lg lg:text-xl font-bold tracking-wider text-white whitespace-nowrap">
            LOOT SHOWCASE
          </h1>
        </div>

        {/* 2. Center Zone: Dedicated Day & Countdown Pill (Visible on both Mobile & Desktop) */}
        <div className="flex items-center justify-center shrink-0">
          <div
            className={`h-8 sm:h-9 lg:h-11 px-2.5 sm:px-3.5 lg:px-4 rounded-xl border flex items-center gap-2 sm:gap-3 shadow-inner ${
              isFinalStretch
                ? 'border-red-900/60 bg-red-950/30 text-red-200'
                : 'border-neutral-800 bg-neutral-950/90 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1 text-[11px] sm:text-xs lg:text-sm font-mono">
              {isFinalStretch && (
                <Flame size={13} className="text-red-500 animate-pulse shrink-0" />
              )}
              <span className="whitespace-nowrap text-neutral-400">
                Day{' '}
                <strong className="text-white font-extrabold">
                  {currentDay}/{TOTAL_SEASON_DAYS}
                </strong>
              </span>
            </div>

            <span className="h-3.5 w-px bg-neutral-800 shrink-0" />

            <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-amber-400 whitespace-nowrap tabular-nums">
              <Clock size={13} className="shrink-0" />
              <span className="hidden md:inline text-xs text-neutral-400 font-normal">
                Next:
              </span>
              <span className="text-xs sm:text-sm lg:text-base font-extrabold tracking-wide">
                {epochTimeRemaining || '--:--:--'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Right Zone: Compact Droplet Balance Pill + Desktop-Only Rewards Trigger */}
        <div className="flex items-center justify-end gap-2 lg:gap-3 shrink-0">
          <div
            title="Available Currency"
            className="h-8 sm:h-9 lg:h-11 px-2.5 sm:px-3.5 lg:px-4 rounded-xl bg-neutral-950/90 border border-neutral-800/90 shadow-inner flex items-center gap-1.5 select-none shrink-0"
          >
            <span className="font-mono font-extrabold text-emerald-400 text-xs sm:text-sm lg:text-base tabular-nums whitespace-nowrap">
              {inkBalance.toLocaleString()}
            </span>
            <Droplet
              size={15}
              className="text-emerald-400 fill-emerald-400/25 shrink-0"
            />
          </div>

          {/* Desktop-Only Rewards Button (On mobile, Rewards lives in the 5th bottom dock tab) */}
          <div className="hidden lg:inline-flex relative shrink-0">
            {hasUnclaimed && (
              <span className="absolute -top-1.5 -right-1.5 z-20 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-neutral-950 font-mono text-[10px] font-extrabold flex items-center justify-center shadow-md leading-none pointer-events-none">
                {totalUnclaimedRewards}
              </span>
            )}

            <Button
              variant="outline"
              onClick={onOpenRewards}
              className={`h-11 px-5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
                hasUnclaimed
                  ? 'border-purple-500/80 bg-purple-950/55 hover:bg-purple-900/65 text-white shadow-[0_0_18px_rgba(168,85,247,0.35)] animate-[pulse_3s_ease-in-out_infinite]'
                  : 'border-purple-900/60 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 hover:text-white shadow-sm'
              }`}
            >
              <Gift size={15} className="text-purple-300 shrink-0" />
              <span className="font-bold text-sm tracking-wide">Rewards</span>
            </Button>
          </div>
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