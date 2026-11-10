// src/components/BadgeCard.tsx

import React, { useRef } from 'react';
import { Hexagon, Circle, Square, Triangle, Star } from 'lucide-react';
import type { Badge, BadgeShape } from '@/store/useShowcaseStore';
import { getTierTheme } from '@/lib/theme';

export interface BadgeCardProps {
  badge?: Badge;
  tier?: number;
  projectId?: string;
  shape?: BadgeShape;
  count?: number;
  isSelected?: boolean;
  isSlottedOut?: boolean;
  isDisabled?: boolean;
  isNew?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

export const getTierColor = (tier: number) => {
  switch (tier) {
    case 1:
      return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10 shadow-yellow-400/20';
    case 2:
      return 'text-purple-400 border-purple-400/50 bg-purple-400/10 shadow-purple-400/20';
    case 3:
      return 'text-blue-400 border-blue-400/50 bg-blue-400/10 shadow-blue-400/20';
    case 4:
      return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10 shadow-emerald-400/20';
    default:
      return 'text-neutral-400 border-neutral-700 bg-neutral-800/50 shadow-none';
  }
};

export const getMutedTierColor = (tier: number) => {
  switch (tier) {
    case 1:
      return 'text-yellow-400/60 border-yellow-500/25 bg-yellow-950/15 shadow-none';
    case 2:
      return 'text-purple-400/60 border-purple-500/25 bg-purple-950/15 shadow-none';
    case 3:
      return 'text-blue-400/60 border-blue-500/25 bg-blue-950/15 shadow-none';
    case 4:
      return 'text-emerald-400/60 border-emerald-500/25 bg-emerald-950/15 shadow-none';
    default:
      return 'text-neutral-500 border-neutral-800/80 bg-neutral-950/40 shadow-none';
  }
};

const renderShapeIcon = (shape?: BadgeShape) => {
  switch (shape) {
    case 'circle':
      return <Circle className="w-8 h-8 mb-2 opacity-80" />;
    case 'square':
      return <Square className="w-8 h-8 mb-2 opacity-80" />;
    case 'triangle':
      return <Triangle className="w-8 h-8 mb-2 opacity-80" />;
    case 'wildcard':
      return <Star className="w-8 h-8 mb-2 fill-current opacity-90 animate-pulse" />;
    case 'hexagon':
    default:
      return <Hexagon className="w-8 h-8 mb-2 opacity-80" />;
  }
};

export default function BadgeCard(props: BadgeCardProps) {
  const {
    badge,
    count,
    isSelected,
    isSlottedOut,
    isDisabled,
    isNew,
    onClick,
    onMouseEnter,
  } = props;

  const tier = badge ? badge.tier : (props.tier ?? 5);
  const projectId = badge ? badge.projectId : props.projectId;
  const shape = badge ? badge.shape : props.shape;

  const isWild = projectId === 'wildcard' || shape === 'wildcard';

  const tierStyle = isDisabled || isSlottedOut
    ? getMutedTierColor(tier)
    : getTierColor(tier);

  const stateStyle = isDisabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : isSlottedOut
    ? 'opacity-25 cursor-not-allowed pointer-events-none'
    : isSelected
    ? 'ring-2 ring-emerald-500 scale-105 bg-neutral-800 opacity-100 shadow-lg'
    : isNew
    ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.45)] opacity-100'
    : onClick
    ? 'cursor-pointer hover:bg-neutral-800/60 hover:opacity-100 opacity-90'
    : 'opacity-100';

  return (
    <div
      onClick={!isDisabled && !isSlottedOut ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      className={`flex flex-col items-center justify-center w-full aspect-[3/4] rounded-lg border relative transition-all duration-200 select-none ${tierStyle} ${stateStyle}`}
    >
      {/* Project ID Tag */}
      {projectId && (
        <div
          className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider ${
            isDisabled ? 'opacity-40' : 'opacity-60'
          }`}
        >
          {isWild ? 'WILDCARD' : projectId}
        </div>
      )}

      {/* New Badge Beacon Pill */}
      {isNew && !isSlottedOut && !isDisabled && (
        <div className="absolute -top-1.5 -left-1.5 bg-emerald-500 text-neutral-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider shadow-sm z-20 animate-pulse">
          New
        </div>
      )}

      {/* Stack Count Indicator */}
      {count !== undefined && count > 0 && (
        <div
          className={`absolute -top-2 -right-2 border text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10 ${
            isDisabled
              ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
              : isSelected
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
              : 'bg-neutral-800 border-neutral-600 text-white'
          }`}
        >
          x{count}
        </div>
      )}

      {/* Dynamic Shape / Star Icon */}
      {renderShapeIcon(shape)}

      {/* Tier Label */}
      <span className="text-xs font-bold uppercase tracking-wider">
        Tier {tier}
      </span>
    </div>
  );
}