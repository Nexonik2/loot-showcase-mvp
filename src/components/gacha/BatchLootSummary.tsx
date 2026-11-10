import React, { useMemo } from 'react';
import type { Badge, PackType } from '@/store/useShowcaseStore';
import { THEME } from './gachaTheme';
import BadgeCard from '@/components/BadgeCard';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface BatchLootSummaryProps {
  pulls: Badge[];
  packType: PackType;
  onClear: () => void;
}

export default function BatchLootSummary({ pulls, packType, onClear }: BatchLootSummaryProps) {
  const theme = THEME[packType];

  const summary = useMemo(() => {
    const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let wildcardCount = 0;

    pulls.forEach((b) => {
      tierCounts[b.tier] = (tierCounts[b.tier] || 0) + 1;
      if (b.projectId === 'wildcard' || b.shape === 'wildcard') {
        wildcardCount++;
      }
    });

    const notablePulls = pulls.filter(
      (b) => b.tier <= 3 || b.projectId === 'wildcard' || b.shape === 'wildcard'
    );

    return { tierCounts, wildcardCount, notablePulls, total: pulls.length };
  }, [pulls]);

  return (
    <div className="flex flex-col gap-4 p-4 border border-neutral-800 bg-neutral-900/60 rounded-xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${theme.text}`}>
            Batch Loot Summary ({summary.total} Badges)
          </span>
          <div className="flex items-center gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((t) => (
              <span key={t} className="text-[11px] font-mono text-neutral-300">
                T{t}: <strong className="text-white">{summary.tierCounts[t] || 0}</strong>
              </span>
            ))}
            {summary.wildcardCount > 0 && (
              <span className="text-[11px] font-mono text-amber-400 font-bold ml-1">
                ★ {summary.wildcardCount} Wildcard
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 px-2.5 text-xs text-neutral-400 hover:text-white"
        >
          <RotateCcw size={12} className="mr-1" /> Dismiss
        </Button>
      </div>

      {summary.notablePulls.length > 0 && (
        <div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
            Jackpot & Rare Drops ({summary.notablePulls.length})
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {summary.notablePulls.map((badge) => (
              <BadgeCard
                key={badge.id}
                tier={badge.tier}
                projectId={badge.projectId}
                shape={badge.shape}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}