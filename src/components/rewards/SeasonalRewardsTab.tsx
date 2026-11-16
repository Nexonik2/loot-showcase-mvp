// Run inside: frontend/
// src/components/rewards/SeasonalRewardsTab.tsx

import React, { useRef, useEffect } from 'react';
import CalendarDayCard from './CalendarDayCard';
import { SEASONAL_CALENDAR_CONFIG } from '@/lib/calendarData';
import { Button } from '@/components/ui/button';
import { Calendar, Zap, ShieldCheck, Target } from 'lucide-react';

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
}: SeasonalRewardsTabProps) {
  const currentClaimedSet = new Set(claimedCalendarDays);
  const currentProgressDay = Math.min(40, currentEpochDay);

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

  const boostMilestones = [3, 9, 15, 21, 27];
  const boostStepsClaimed = boostMilestones.filter((d) => currentClaimedSet.has(d)).length;
  const cumulativeBoost = boostStepsClaimed * 5;

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

      {/* 2. Track Navigation Bar (Jump to Day stays permanently accessible) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300">
          Season Track
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleJumpToToday}
          className="h-6 sm:h-7 px-2.5 text-[10px] sm:text-[11px] font-mono border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Target size={11} className="text-emerald-400" />
          <span>Jump to Day {currentProgressDay}</span>
        </Button>
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