// src/components/rewards/SeasonalRewardsTab.tsx

import React, { useRef, useEffect } from 'react';
import CalendarDayCard from './CalendarDayCard';
import { SEASONAL_CALENDAR_CONFIG } from '@/lib/calendarData';
import { Button } from '@/components/ui/button';
import { Calendar, Zap, ShieldCheck, Target, Sparkles } from 'lucide-react';

interface SeasonalRewardsTabProps {
  currentEpochDay: number;
  claimedCalendarDays: number[];
  onClaimDay: (day: number, event: React.MouseEvent) => void;
  onClaimAll?: (unclaimedDays: number[], event: React.MouseEvent) => void;
}

export default function SeasonalRewardsTab({
  currentEpochDay,
  claimedCalendarDays,
  onClaimDay,
  onClaimAll,
}: SeasonalRewardsTabProps) {
  const currentClaimedSet = new Set(claimedCalendarDays);
  const currentProgressDay = Math.min(40, currentEpochDay); //[cite: 11]

  const activeDayNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeDayNodeRef.current) {
      activeDayNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, []);

  const handleJumpToToday = () => {
    if (activeDayNodeRef.current) {
      activeDayNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const boostMilestones = [3, 9, 15, 21, 27]; //[cite: 11]
  const boostStepsClaimed = boostMilestones.filter((d) => currentClaimedSet.has(d)).length;
  const cumulativeBoost = boostStepsClaimed * 5; //[cite: 11]

  // Identify all available unclaimed days up to the current progress cap[cite: 11]
  const unclaimedDays = SEASONAL_CALENDAR_CONFIG
    .filter((c) => c.day <= currentProgressDay && !currentClaimedSet.has(c.day))
    .map((c) => c.day);

  const handleClaimAllClick = (e: React.MouseEvent) => {
    if (onClaimAll) {
      onClaimAll(unclaimedDays, e);
    } else {
      // Fallback: trigger sequential claims if batch callback is omitted
      unclaimedDays.forEach((day) => onClaimDay(day, e));
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* 1. Header Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
            <Calendar size={14} className="text-purple-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-neutral-500 block leading-tight">
              Season Track
            </span>
            <span className="text-xs font-mono font-bold text-neutral-200">
              Day {currentProgressDay} / 40
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
            <Zap size={14} className="text-amber-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-neutral-500 block leading-tight">
              Daily Claim Bonus
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              +{cumulativeBoost}% Additive
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
            <ShieldCheck size={14} className="text-emerald-400" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-neutral-500 block leading-tight">
              Pity Buffer
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              10 Pity Days
            </span>
          </div>
        </div>
      </div>

      {/* 2. Track Navigation & Contextual Claim Bar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300">
          Season Track
        </span>

        {unclaimedDays.length > 1 ? (
          <Button
            size="sm"
            onClick={handleClaimAllClick}
            className="h-6 sm:h-7 px-3 text-[10px] sm:text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm flex items-center gap-1 cursor-pointer active:scale-95 transition-transform shrink-0"
          >
            <Sparkles size={11} />
            <span>Claim All ({unclaimedDays.length})</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToToday}
            className="h-6 sm:h-7 px-2.5 text-[10px] sm:text-[11px] font-mono border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Target size={11} className="text-emerald-400" />
            <span>Jump to Day {currentProgressDay}</span>
          </Button>
        )}
      </div>

      {/* 3. Vertical Linear Battle Pass List */}
      <div className="flex flex-col gap-2">
        {SEASONAL_CALENDAR_CONFIG.map((config) => {
          const isCurrent = config.day === currentProgressDay;
          return (
            <div
              key={config.day}
              ref={isCurrent ? activeDayNodeRef : undefined}
            >
              <CalendarDayCard
                config={config}
                currentDayProgress={currentProgressDay}
                isClaimed={currentClaimedSet.has(config.day)}
                isCurrentDay={isCurrent}
                onClaim={onClaimDay}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}