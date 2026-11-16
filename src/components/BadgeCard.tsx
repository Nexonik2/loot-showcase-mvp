// Run inside: frontend/
// src/components/BadgeCard.tsx

import React, { useRef } from 'react';
import { Hexagon, Circle, Square, Triangle, Star } from 'lucide-react';
import type { Badge, BadgeShape } from '@/store/useShowcaseStore';

export interface BadgeCardProps {
  badge?: Badge;
  tier?: number;
  projectId?: string;
  shape?: BadgeShape;
  count?: number;
  isSelected?: boolean;
  isSlottedOut?: boolean;
  isDisabled?: boolean;
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
      return <Circle className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 opacity-80" />;
    case 'square':
      return <Square className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 opacity-80" />;
    case 'triangle':
      return <Triangle className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 opacity-80" />;
    case 'wildcard':
      return (
        <Star className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 fill-current opacity-90 animate-pulse" />
      );
    case 'hexagon':
    default:
      return <Hexagon className="w-7 h-7 sm:w-8 sm:h-8 mb-1.5 sm:mb-2 opacity-80" />;
  }
};

export default function BadgeCard(props: BadgeCardProps) {
  const {
    badge,
    count,
    isSelected,
    isSlottedOut,
    isDisabled,
    onClick,
    onMouseEnter,
  } = props;

  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef<boolean>(false);

  const tier = badge ? badge.tier : (props.tier ?? 5);
  const projectId = badge ? badge.projectId : props.projectId;
  const shape = badge ? badge.shape : props.shape;

  const isWild = projectId === 'wildcard' || shape === 'wildcard';
  const isInteractive = Boolean(onClick && !isDisabled && !isSlottedOut);

  const tierStyle =
    isDisabled || isSlottedOut ? getMutedTierColor(tier) : getTierColor(tier);

  // Zero-scale selection & hover styling prevents neighbor overlap and top-edge pill clipping
  const stateStyle = isDisabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : isSlottedOut
    ? 'opacity-25 cursor-not-allowed pointer-events-none'
    : isSelected
    ? 'ring-2 ring-emerald-400 bg-neutral-800/95 opacity-100 shadow-[0_0_16px_rgba(52,211,153,0.3)]'
    : isInteractive
    ? 'cursor-pointer hover:bg-neutral-800/70 hover:brightness-110 hover:opacity-100 opacity-90'
    : 'opacity-100';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownPosRef.current) return;
    const dx = Math.abs(e.clientX - pointerDownPosRef.current.x);
    const dy = Math.abs(e.clientY - pointerDownPosRef.current.y);
    if (dx > 8 || dy > 8) {
      didDragRef.current = true;
    }
  };

  const handleClick = () => {
    if (!isInteractive) return;
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onClick?.();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      className={`flex flex-col items-center justify-center w-full aspect-[3/4] rounded-lg border relative transition-all duration-150 select-none ${tierStyle} ${stateStyle}`}
    >
      {/* Project ID Tag */}
      {projectId && (
        <div
          className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 max-w-[66%] truncate text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${
            isDisabled ? 'opacity-40' : 'opacity-65'
          }`}
        >
          {isWild ? 'WILDCARD' : projectId}
        </div>
      )}

      {/* Inset Stack Count Pill */}
      {count !== undefined && count > 0 && (
        <div
          className={`absolute -top-1.5 -right-1 border text-[10px] font-mono font-bold px-1.5 py-0.5 leading-none rounded-full shadow-md z-10 ${
            isDisabled
              ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
              : isSelected
              ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
              : 'bg-neutral-900/95 border-neutral-600 text-neutral-100'
          }`}
        >
          x{count}
        </div>
      )}

      {/* Dynamic Shape / Star Icon */}
      {renderShapeIcon(shape)}

      {/* Tier Label */}
      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
        Tier {tier}
      </span>
    </div>
  );
}