// src/components/rewards/CalendarDayCard.tsx

import React from 'react';
import type { CalendarRewardConfig } from './types';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Package, 
  Zap, 
  Star, 
  Crown, 
  Check, 
  Lock 
} from 'lucide-react';
import { TIER_THEMES, PACK_THEMES } from '@/lib/theme';

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
          icon: <Zap size={14} className="text-amber-400" />,
          badge: 'bg-amber-950/60 border-amber-800/80 text-amber-300',
          accentBorder: isAvailable 
            ? 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
            : 'border-neutral-800',
          label: 'BONUS',
          dayBadge: 'bg-amber-950/80 border-amber-600/80 text-amber-300',
          currentTileRing: 'ring-2 ring-amber-500/60',
          claimBtn: 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
        };

      case 'gacha': {
        const packTheme = config.packType ? PACK_THEMES[config.packType] : null;

        // Default: Explorer Pack (Emerald)
        let dayBadgeClass = 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300';
        let currentTileRingClass = 'ring-2 ring-emerald-500/60';
        let claimBtnClass = 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]';

        // Adventurer Pack (Blue)
        if (config.packType === 'adventurer') {
          dayBadgeClass = 'bg-blue-950/80 border-blue-600/80 text-blue-300';
          currentTileRingClass = 'ring-2 ring-blue-500/60';
          claimBtnClass = 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]';
        } 
        // Degen Pack (Purple)
        else if (config.packType === 'degen') {
          dayBadgeClass = 'bg-purple-950/80 border-purple-600/80 text-purple-300';
          currentTileRingClass = 'ring-2 ring-purple-500/60';
          claimBtnClass = 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]';
        }

        return {
          icon: <Package size={14} className={packTheme?.text || 'text-emerald-400'} />,
          badge: packTheme?.badge || 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
          accentBorder: isAvailable 
            ? `${packTheme?.border || 'border-emerald-500'} shadow-[0_0_15px_rgba(16,185,129,0.2)]` 
            : 'border-neutral-800',
          label: 'PACK',
          dayBadge: dayBadgeClass,
          currentTileRing: currentTileRingClass,
          claimBtn: claimBtnClass,
        };
      }

      case 'utility': {
        const tierTheme = config.wildcardTier ? TIER_THEMES[config.wildcardTier] : null;

        let dayBadgeClass = 'bg-amber-950/80 border-amber-600/80 text-amber-300';
        let currentTileRingClass = 'ring-2 ring-amber-500/60';
        let claimBtnClass = 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]';

        // Tier 4 Wildcard (Emerald)
        if (config.wildcardTier === 4) {
          dayBadgeClass = 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300';
          currentTileRingClass = 'ring-2 ring-emerald-500/60';
          claimBtnClass = 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]';
        } 
        // Tier 3 Wildcard (Blue)
        else if (config.wildcardTier === 3) {
          dayBadgeClass = 'bg-blue-950/80 border-blue-600/80 text-blue-300';
          currentTileRingClass = 'ring-2 ring-blue-500/60';
          claimBtnClass = 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]';
        } 
        // Tier 2 Wildcard (Purple)
        else if (config.wildcardTier === 2) {
          dayBadgeClass = 'bg-purple-950/80 border-purple-600/80 text-purple-300';
          currentTileRingClass = 'ring-2 ring-purple-500/60';
          claimBtnClass = 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]';
        }

        return {
          icon: <Star size={14} className={`${tierTheme?.text || 'text-amber-400'} fill-current`} />,
          badge: `${tierTheme?.bgSubtle || 'bg-amber-950/60'} ${tierTheme?.border || 'border-amber-800/80'} ${tierTheme?.text || 'text-amber-300'}`,
          accentBorder: isAvailable 
            ? `${tierTheme?.border || 'border-amber-500'} shadow-[0_0_15px_rgba(245,158,11,0.2)]` 
            : 'border-neutral-800',
          label: 'TOKEN',
          dayBadge: dayBadgeClass,
          currentTileRing: currentTileRingClass,
          claimBtn: claimBtnClass,
        };
      }

      case 'trophy':
        return {
          icon: <Crown size={15} className="text-yellow-400 animate-pulse" />,
          badge: 'bg-yellow-950/80 border-yellow-700 text-yellow-300 font-bold',
          accentBorder: isAvailable 
            ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] ring-1 ring-yellow-400/50' 
            : 'border-neutral-800',
          label: 'TROPHY',
          dayBadge: 'bg-yellow-950/80 border-yellow-500 text-yellow-300 ring-1 ring-yellow-400/50',
          currentTileRing: 'ring-2 ring-yellow-400/70',
          claimBtn: 'bg-yellow-500 hover:bg-yellow-400 text-neutral-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
        };

      case 'resource':
      default:
        return {
          icon: <Sparkles size={13} className="text-neutral-400" />,
          badge: 'bg-neutral-900 border-neutral-800 text-neutral-400',
          accentBorder: isAvailable ? 'border-emerald-600/70 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'border-neutral-800/80',
          label: 'INK',
          dayBadge: 'bg-neutral-900 border-emerald-600/70 text-emerald-400',
          currentTileRing: 'ring-2 ring-emerald-500/60',
          claimBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]',
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
      {/* Left: Day Node & Reward Details */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Day Number Tile */}
        <div
          className={`flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border shrink-0 font-mono transition-colors ${
            isCurrentDay && !isClaimed
              ? theme.currentTileRing
              : ''
          } ${
            isAvailable
              ? theme.dayBadge
              : isClaimed
              ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400/80'
              : 'bg-neutral-950 border-neutral-800/80 text-neutral-600'
          }`}
        >
          <span className="text-[8px] uppercase tracking-wider font-semibold opacity-70">Day</span>
          <span className="text-[11px] sm:text-xs font-black">{config.day}</span>
        </div>

        {/* Reward Icon Graphic */}
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 ${
            isMilestone
              ? 'bg-neutral-900/90 border-neutral-700/80 shadow-inner'
              : 'bg-neutral-950 border-neutral-800'
          }`}
        >
          {theme.icon}
        </div>

        {/* Reward Title & Subtitle */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4
              className={`text-xs sm:text-sm font-bold leading-tight break-words ${
                isClaimed ? 'text-neutral-500' : 'text-neutral-100'
              }`}
            >
              {config.title}
            </h4>

            {isMilestone && (
              <span
                className={`hidden sm:inline-flex px-1.5 py-0.2 rounded-full border text-[8px] font-mono uppercase tracking-wider font-bold ${theme.badge}`}
              >
                {theme.label}
              </span>
            )}
          </div>

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