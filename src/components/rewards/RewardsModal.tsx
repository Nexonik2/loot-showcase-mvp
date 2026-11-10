// Run inside: frontend/
// src/components/rewards/RewardsModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DailyRewardsTab from './DailyRewardsTab';
import SeasonalRewardsTab from './SeasonalRewardsTab';
import ClaimSparkCanvas, { type SparkBurstPayload } from './ClaimSparkCanvas';
import { useArchiverStore } from '@/store/useShowcaseStore';
import { useQuestStore } from '@/store/useQuestStore';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateActionRoute?: (route: 'forge' | 'gacha' | 'showcase') => void;
}

export default function RewardsModal({
  isOpen,
  onClose,
  onNavigateActionRoute,
}: RewardsModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'seasonal'>('daily');
  const [activeBurst, setActiveBurst] = useState<SparkBurstPayload | null>(null);

  const {
    inkBalance,
    currentDay,
    currentStreak,
    isDailyFaucetClaimed,
    claimedCalendarDays,
    claimDailyFaucet,
    claimCalendarDay,
    addInk,
  } = useArchiverStore();

  const { 
    dailyQuests, 
    weeklyQuests, 
    dailyRerollsUsed,
    weeklyRerollsUsed,
    syncQuests, 
    claimQuestReward,
    rerollQuest
  } = useQuestStore();

  useEffect(() => {
    syncQuests(currentDay);
  }, [currentDay, syncQuests]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerSparks = (e: React.MouseEvent, color?: string) => {
    setActiveBurst({ x: e.clientX, y: e.clientY, color });
  };

  const handleClaimDailyInk = (e: React.MouseEvent) => {
    triggerSparks(e, '#10b981');
    claimDailyFaucet();
  };

  const handleClaimQuest = (questId: string, isWeekly: boolean, e: React.MouseEvent) => {
    triggerSparks(e, isWeekly ? '#a855f7' : '#34d399');
    claimQuestReward(questId, isWeekly, addInk);
  };

  const handleClaimCalendarDay = (day: number, e: React.MouseEvent) => {
    triggerSparks(e, '#fbbf24');
    claimCalendarDay(day);
  };

  const handleNavigate = (route: 'forge' | 'gacha' | 'showcase') => {
    onClose();
    onNavigateActionRoute?.(route);
  };

  const handleClaimAllCalendar = (days: number[], e: React.MouseEvent) => {
    triggerSparks(e, '#fbbf24');
    days.forEach((day) => claimCalendarDay(day));
  };

  const unclaimedQuestsCount = 
    dailyQuests.filter(q => q.isCompleted && !q.isClaimed).length + 
    weeklyQuests.filter(q => q.isCompleted && !q.isClaimed).length;

  return (
    <>
      <ClaimSparkCanvas burst={activeBurst} onComplete={() => setActiveBurst(null)} />

      <AnimatePresence>
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"          >
            {/* Header: Streamlined without icon/description, close button protected */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-neutral-900/90 shrink-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate pr-2">
                REWARDS & PROGRESSION
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center shrink-0 aspect-square transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Segmented Switcher: Text truncates gracefully on narrow screens */}
            <div className="px-3 sm:px-6 pt-3 pb-2 shrink-0">
              <div className="grid grid-cols-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('daily')}
                  className={`h-8 font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer px-2 min-w-0 ${
                    activeTab === 'daily'
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">Active </span>Bounties
                  </span>
                  {unclaimedQuestsCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-neutral-950 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 ml-0.5">
                      {unclaimedQuestsCount}
                    </span>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('seasonal')}
                  className={`h-8 font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer px-2 min-w-0 ${
                    activeTab === 'seasonal'
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Calendar size={13} className="text-purple-400 shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">Seasonal </span>Calendar
                    <span className="hidden sm:inline"> (Day {Math.min(40, currentDay)}/40)</span>
                  </span>
                </Button>
              </div>
            </div>

            {/* Tab Body: Optimized scroll padding */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 overflow-y-auto custom-scrollbar flex-1">
              {activeTab === 'daily' ? (
                <DailyRewardsTab
                  inkBalance={inkBalance}
                  streakCount={currentStreak}
                  isDailyClaimed={isDailyFaucetClaimed}
                  dailyQuests={dailyQuests}
                  weeklyQuests={weeklyQuests}
                  dailyRerollsUsed={dailyRerollsUsed}
                  weeklyRerollsUsed={weeklyRerollsUsed}
                  onClaimDailyInk={handleClaimDailyInk}
                  onClaimQuest={handleClaimQuest}
                  onRerollQuest={rerollQuest}
                  onNavigateRoute={handleNavigate}
                />
              ) : (
                <SeasonalRewardsTab
                  currentEpochDay={currentDay}
                  claimedCalendarDays={claimedCalendarDays}
                  onClaimDay={handleClaimCalendarDay}
                  onClaimAll={handleClaimAllCalendar}
                />
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}