// Run inside: frontend/
// src/components/rewards/CalendarDayCard.tsx

import React from 'react';
import type { CalendarRewardConfig } from './types';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, Lock } from 'lucide-react';
import { TIER_THEMES, PACK_THEMES } from '@/lib/theme';
import InkDrop from '@/components/ui/InkDrop';

interface CalendarDayCardProps {
  config: CalendarRewardConfig;
  currentDayProgress: number;
  isClaimed: boolean;
  isCurrentDay: boolean;
  onClaim: (day: number, event: React.MouseEvent) => void;
}

export default function CalendarDayCard({
  config,
  currentDayProgress,
  isClaimed,
  isCurrentDay,
  onClaim,
}: CalendarDayCardProps) {
  const isAvailable = config.day <= currentDayProgress && !isClaimed;
  const isLocked = config.day > currentDayProgress;
  const isMilestone = config.type !== 'resource';

  const getThemeStyling = () => {
    switch (config.type) {
      case 'engine_builder':
        return {
          titleColor: 'text-amber-300',
          accentBorder: isAvailable
            ? 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            : 'border-neutral-800',
          dayBadge: 'bg-amber-950/80 border-amber-600/80 text-amber-300',
          currentTileRing: 'ring-2 ring-amber-500/60',
          claimBtn:
            'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
        };
      case 'gacha': {
        const packTheme = config.packType ? PACK_THEMES[config.packType] : null;
        let titleColorClass = 'text-emerald-400';
        let dayBadgeClass = 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300';
        let currentTileRingClass = 'ring-2 ring-emerald-500/60';
        let claimBtnClass =
          'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]';

        if (config.packType === 'adventurer') {
          titleColorClass = 'text-blue-400';
          dayBadgeClass = 'bg-blue-950/80 border-blue-600/80 text-blue-300';
          currentTileRingClass = 'ring-2 ring-blue-500/60';
          claimBtnClass =
            'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]';
        } else if (config.packType === 'degen') {
          titleColorClass = 'text-purple-400';
          dayBadgeClass = 'bg-purple-950/80 border-purple-600/80 text-purple-300';
          currentTileRingClass = 'ring-2 ring-purple-500/60';
          claimBtnClass =
            'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]';
        }

        return {
          titleColor: titleColorClass,
          accentBorder: isAvailable
            ? `${packTheme?.border || 'border-emerald-500'} shadow-[0_0_15px_rgba(16,185,129,0.2)]`
            : 'border-neutral-800',
          dayBadge: dayBadgeClass,
          currentTileRing: currentTileRingClass,
          claimBtn: claimBtnClass,
        };
      }
      case 'utility': {
        const tierTheme = config.wildcardTier ? TIER_THEMES[config.wildcardTier] : null;
        let titleColorClass = 'text-amber-400';
        let dayBadgeClass = 'bg-amber-950/80 border-amber-600/80 text-amber-300';
        let currentTileRingClass = 'ring-2 ring-amber-500/60';
        let claimBtnClass =
          'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]';

        if (config.wildcardTier === 4) {
          titleColorClass = 'text-emerald-400';
          dayBadgeClass = 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300';
          currentTileRingClass = 'ring-2 ring-emerald-500/60';
          claimBtnClass =
            'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]';
        } else if (config.wildcardTier === 3) {
          titleColorClass = 'text-blue-400';
          dayBadgeClass = 'bg-blue-950/80 border-blue-600/80 text-blue-300';
          currentTileRingClass = 'ring-2 ring-blue-500/60';
          claimBtnClass =
            'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]';
        } else if (config.wildcardTier === 2) {
          titleColorClass = 'text-purple-400';
          dayBadgeClass = 'bg-purple-950/80 border-purple-600/80 text-purple-300';
          currentTileRingClass = 'ring-2 ring-purple-500/60';
          claimBtnClass =
            'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]';
        }

        return {
          titleColor: titleColorClass,
          accentBorder: isAvailable
            ? `${tierTheme?.border || 'border-amber-500'} shadow-[0_0_15px_rgba(245,158,11,0.2)]`
            : 'border-neutral-800',
          dayBadge: dayBadgeClass,
          currentTileRing: currentTileRingClass,
          claimBtn: claimBtnClass,
        };
      }
      case 'trophy':
        return {
          titleColor: 'text-yellow-300',
          accentBorder: isAvailable
            ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] ring-1 ring-yellow-400/50'
            : 'border-neutral-800',
          dayBadge:
            'bg-yellow-950/80 border-yellow-500 text-yellow-300 ring-1 ring-yellow-400/50',
          currentTileRing: 'ring-2 ring-yellow-400/70',
          claimBtn:
            'bg-yellow-500 hover:bg-yellow-400 text-neutral-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
        };
      case 'resource':
      default:
        return {
          titleColor: 'text-emerald-400',
          accentBorder: isAvailable
            ? 'border-emerald-600/70 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            : 'border-neutral-800/80',
          dayBadge: 'bg-neutral-900 border-emerald-600/70 text-emerald-400',
          currentTileRing: 'ring-2 ring-emerald-500/60',
          claimBtn:
            'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]',
        };
    }
  };

  const theme = getThemeStyling();

  return (
    <div
      className={`relative flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 select-none ${
        isMilestone
          ? `bg-gradient-to-r from-neutral-900/90 via-neutral-900/60 to-neutral-950/90 ${theme.accentBorder}`
          : `bg-neutral-950/70 hover:bg-neutral-900/40 ${theme.accentBorder}`
      } ${
        isClaimed
          ? 'bg-emerald-950/20 border-emerald-900/40 opacity-80'
          : isLocked
            ? 'opacity-35 grayscale-[50%] bg-neutral-950/50 border-neutral-900'
            : ''
      }`}
    >
      {/* Left: Day Node & Reward Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
        {/* Day Number Tile */}
        <div
          className={`flex flex-col items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border shrink-0 font-mono transition-colors ${
            isCurrentDay && !isClaimed ? theme.currentTileRing : ''
          } ${
            isAvailable
              ? theme.dayBadge
              : isClaimed
                ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400/80'
                : 'bg-neutral-950 border-neutral-800/80 text-neutral-600'
          }`}
        >
          <span className="text-[8px] uppercase tracking-wider font-semibold opacity-70">
            Day
          </span>
          <span className="text-[11px] sm:text-xs font-black">{config.day}</span>
        </div>

        {/* Reward Title & Optional Subtitle */}
        <div className="flex flex-col min-w-0 flex-1">
          {config.type === 'resource' ? (
            <h4
              className={`text-xs sm:text-sm font-mono font-bold leading-tight whitespace-nowrap ${
                isClaimed ? 'text-neutral-500' : theme.titleColor
              }`}
            >
              +{config.inkAmount ?? 150}{' '}
              <InkDrop
                className={
                  isClaimed
                    ? 'text-neutral-500 fill-neutral-500/20'
                    : 'text-emerald-400 fill-emerald-400/25'
                }
              />
            </h4>
          ) : (
            <h4
              className={`text-xs sm:text-sm font-bold leading-tight break-words ${
                isClaimed ? 'text-neutral-500' : theme.titleColor
              }`}
            >
              {config.title}
            </h4>
          )}

          {config.description && (
            <p className="text-[10px] sm:text-[11px] text-neutral-400 leading-snug break-words mt-0.5">
              {config.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: State Readout & Claim CTA */}
      <div className="shrink-0 flex items-center pl-1">
        {isClaimed ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-[10px] sm:text-xs font-mono">
            <Check size={12} className="text-emerald-400" />
            <span className="hidden sm:inline font-semibold">Claimed</span>
          </div>
        ) : isAvailable ? (
          <Button
            size="sm"
            onClick={(e) => onClaim(config.day, e)}
            className={`h-7 px-3 text-[11px] font-bold rounded-lg cursor-pointer active:scale-95 transition-all flex items-center gap-1 ${theme.claimBtn}`}
          >
            <Sparkles size={11} />
            <span>Claim</span>
          </Button>
        ) : (
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-950/60 border border-neutral-800/80 text-neutral-600">
            <Lock size={12} />
          </div>
        )}
      </div>
    </div>
  );
}