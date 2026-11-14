// Run inside: frontend/
// src/components/dashboard/BadgeActionModal.tsx

import React from 'react';
import { LayoutDashboard, Flame, X } from 'lucide-react';
import type { Badge } from '@/store/useShowcaseStore';
import BadgeCard from '@/components/BadgeCard';
import { Button } from '@/components/ui/button';

export type StackedBadgeItem = Badge & {
  count: number;
  ids: string[];
};

interface BadgeActionModalProps {
  stack: StackedBadgeItem | null;
  onClose: () => void;
  onSelectShowcase: (badgeId: string) => void;
  onSelectForge: (badgeId: string) => void;
}

export default function BadgeActionModal({
  stack,
  onClose,
  onSelectShowcase,
  onSelectForge,
}: BadgeActionModalProps) {
  if (!stack) return null;

  const isWildcard = stack.projectId === 'wildcard' || stack.shape === 'wildcard';
  const isTier1 = stack.tier === 1;
  const targetBadgeId = stack.ids[0] ?? stack.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-xl border border-neutral-800 bg-neutral-950 p-4 shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5 gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Select Action
            </div>
            <div className="text-sm font-bold capitalize text-neutral-100 truncate">
              {stack.projectId} {stack.shape} (T{stack.tier})
            </div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-red-900/60 bg-red-950/40 text-red-300 hover:border-red-600 hover:bg-red-900/60 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        <div className="w-28 mx-auto">
          <BadgeCard
            tier={stack.tier}
            projectId={stack.projectId}
            shape={stack.shape}
            count={stack.count}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            disabled={isWildcard || !targetBadgeId}
            onClick={() => targetBadgeId && onSelectShowcase(targetBadgeId)}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-all active:scale-95"
          >
            <LayoutDashboard size={15} />
            <span>
              {isWildcard ? "Wildcard Can't Be Inscribed" : 'Inscribe in Showcase'}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isTier1 || !targetBadgeId}
            onClick={() => targetBadgeId && onSelectForge(targetBadgeId)}
            className="w-full h-10 border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 font-semibold text-xs flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-all active:scale-95"
          >
            <Flame size={15} className="text-amber-400" />
            <span>
              {isTier1 ? "Tier 1 Can't Be Forged" : 'Use in The Forge'}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full h-9 rounded-lg border border-red-900/60 bg-red-950/30 text-red-300 hover:border-red-600 hover:bg-red-900/40 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <X size={14} />
            <span>Cancel</span>
          </Button>
        </div>
      </div>
    </div>
  );
}