// src/components/rewards/DailyQuestCard.tsx

import React from 'react';
import type { Quest } from '@/store/useQuestStore';
import { Button } from '@/components/ui/button';
import { Droplet, Check, ArrowRight, RefreshCw } from 'lucide-react';

interface DailyQuestCardProps {
  quest: Quest;
  onClaim: (questId: string, isWeekly: boolean, event: React.MouseEvent) => void;
  onNavigateRoute?: (route: 'forge' | 'gacha' | 'showcase') => void;
  onReroll?: (questId: string, isWeekly: boolean) => void;
  canReroll?: boolean;
}

export default function DailyQuestCard({
  quest,
  onClaim,
  onNavigateRoute,
  onReroll,
  canReroll,
}: DailyQuestCardProps) {
  const progressRatio = Math.min(1, quest.currentProgress / quest.target);
  const percent = Math.round(progressRatio * 100);

  const getActionRoute = () => {
    if (quest.type.includes('pack_') || quest.type === 'spend_ink') return 'gacha';
    if (quest.type.includes('forge_') || quest.type === 'wildcard') return 'forge';
    if (quest.type.includes('acquire_') || quest.type.includes('tier_')) return 'gacha';
    if (quest.type === 'inscribe') return 'showcase';
    return undefined;
  };
  const route = getActionRoute();

  // Tier color styling: Emerald for Easy, Blue for Medium, Purple for Weekly
  const getTheme = () => {
    if (quest.isWeekly) {
      return {
        titleColor: 'text-purple-400',
        progressBar: 'bg-purple-500',
        cardBorder: 'border-purple-900/40 hover:border-purple-800/60',
      };
    }
    if (quest.difficulty === 'medium') {
      return {
        titleColor: 'text-blue-400',
        progressBar: 'bg-blue-500',
        cardBorder: 'border-neutral-800 hover:border-neutral-700/80',
      };
    }
    // Default: Easy
    return {
      titleColor: 'text-emerald-400',
      progressBar: 'bg-emerald-500',
      cardBorder: 'border-neutral-800 hover:border-neutral-700/80',
    };
  };

  const theme = getTheme();

  return (
    <div
      className={`relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-xl border transition-colors gap-2.5 select-none overflow-hidden bg-neutral-950/70 ${theme.cardBorder}`}
    >
      {/* Top/Left: Info Section */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Title rendered with tier colorway */}
          <h4 className={`text-xs font-bold truncate shrink min-w-0 ${theme.titleColor}`}>
            {quest.title}
          </h4>

          {canReroll && !quest.isCompleted && !quest.isClaimed && (
            <button
              type="button"
              onClick={() => onReroll?.(quest.id, quest.isWeekly || false)}
              className="w-7 h-7 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95 ml-0.5"
              title="Reroll Quest"
              aria-label="Reroll Quest"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>

        <p className="text-[11px] text-neutral-400 leading-snug break-words">
          {quest.description}
        </p>

        {/* Progress Bar (Synchronized with Quest Tier Color) */}
        <div className="flex items-center gap-2 mt-0.5 w-full">
          <div className="flex-1 min-w-0 bg-neutral-900 rounded-full h-1.5 border border-neutral-800 overflow-hidden">
            <div
              className={`${theme.progressBar} h-full rounded-full transition-all duration-300`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-500 whitespace-nowrap shrink-0">
            {quest.currentProgress}/{quest.target}
          </span>
        </div>
      </div>

      {/* Bottom/Right: Reward & CTA Section */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-neutral-800/50">
        <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 shrink-0">
          <Droplet size={12} className="text-emerald-400" />
          <span>+{quest.rewardInk} Ink</span>
        </div>

        {quest.isClaimed ? (
          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-500 px-2 py-0.5 rounded-md bg-neutral-900/50 border border-neutral-800/60 shrink-0">
            <Check size={12} className="text-emerald-500" />
            <span>Claimed</span>
          </div>
        ) : quest.isCompleted ? (
          <Button
            size="sm"
            onClick={(e) => onClaim(quest.id, quest.isWeekly || false, e)}
            className="h-6 sm:h-7 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm cursor-pointer active:scale-95 transition-transform shrink-0"
          >
            Claim
          </Button>
        ) : route && onNavigateRoute ? (
          <Button
            type="button"
            size="sm"
            onClick={() => onNavigateRoute(route)}
            className="h-6 sm:h-7 px-2.5 text-[11px] font-semibold border border-neutral-700/80 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs shrink-0"
          >
            <span>Go</span>
            <ArrowRight size={11} className="text-neutral-400" />
          </Button>
        ) : quest.currentProgress > 0 ? (
          <span className="text-[10px] font-mono text-neutral-500 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 shrink-0">
            In Progress
          </span>
        ) : null}
      </div>
    </div>
  );
}