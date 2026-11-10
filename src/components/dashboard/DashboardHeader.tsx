// src/components/dashboard/DashboardHeader.tsx

import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Gift, Droplet, Radio, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TIER_THEMES } from '@/lib/theme';
import { useFeedStore } from '@/store/useFeedStore';
import { useShowcaseStore } from '@/store/useShowcaseStore';

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

  const [epochTimeRemaining, setEpochTimeRemaining] = useState<string>('');
  const [seasonTimeRemaining, setSeasonTimeRemaining] = useState<string>('');

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

      {/* Global Navigation Bar */}
      <nav className="flex flex-col lg:flex-row items-center justify-between mb-4 bg-neutral-900 px-6 py-4 rounded-xl border border-neutral-800 shadow-md gap-4">
        {/* Left: Branding & Epoch Day */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-400 w-5 h-5" />
            <h1 className="text-lg font-bold tracking-wider text-white">LOOT SHOWCASE</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mt-1 lg:pl-7">
            <span>
              Epoch Day: <strong className="text-neutral-200">{currentDay} / {TOTAL_SEASON_DAYS}</strong>
            </span>
            <span className="text-neutral-600">•</span>
            <span className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
              <Clock size={11} /> Next: {epochTimeRemaining || '--:--:--'}
            </span>
          </div>
        </div>

        {/* Center: Live Season Countdown */}
        <div className="flex flex-col items-center justify-center w-full lg:w-auto">
          <div className="relative group px-6 py-2 rounded-xl border border-red-900/60 bg-gradient-to-b from-red-950/40 via-red-950/20 to-neutral-950 flex flex-col items-center shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 tracking-widest uppercase">
              <Flame size={14} className="text-red-500 animate-pulse" />
              <span>Season Ends In</span>
            </div>
            <div className="font-mono text-2xl font-black text-red-100 tracking-wider mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
              {seasonTimeRemaining || '--:--:--'}
            </div>
          </div>
        </div>

        {/* Right: Ink Balance & Rewards */}
        <div className="flex flex-col items-center lg:items-end justify-center gap-1.5 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 select-none">
            <Droplet size={14} className="text-emerald-400" />
            <span>Balance:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{inkBalance} Ink</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRewards}
            className="h-8 px-3.5 border-purple-900/60 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Gift size={14} className="mr-1.5 text-purple-400" />
            <span className="font-semibold text-xs">Rewards</span>
          </Button>
        </div>
      </nav>

      {/* Infinite Auto-Scrolling Public Feed */}
      <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg p-2.5 mb-6 flex items-center overflow-hidden shadow-inner">
        <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono font-bold uppercase tracking-wider mr-3 pl-1 shrink-0 border-r border-neutral-800 pr-3 z-10 bg-neutral-900/60">
          <Radio size={14} className="text-emerald-400 animate-pulse" />
          <span>News Feed</span>
        </div>

        <div className="overflow-hidden w-full relative">
          <div className="animate-feed-marquee flex items-center gap-6 text-xs text-neutral-300 font-sans">
            {displayEvents.map((evt, idx) => {
              const tierStyle = evt.tier && TIER_THEMES[evt.tier] ? TIER_THEMES[evt.tier].text : 'text-amber-400';

              return (
                <div key={`${evt.id}-${idx}`} className="inline-flex items-center gap-2 whitespace-nowrap shrink-0">
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
                  <span className={`font-semibold leading-none ${tierStyle}`}>{evt.highlightText}</span>
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