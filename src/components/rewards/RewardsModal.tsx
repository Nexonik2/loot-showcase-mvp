// Run inside: frontend/
// src/components/rewards/RewardsModal.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle2, Sparkles, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DailyRewardsTab from './DailyRewardsTab';
import SeasonalRewardsTab from './SeasonalRewardsTab';
import ClaimSparkCanvas, { type SparkBurstPayload } from './ClaimSparkCanvas';
import { useShowcaseStore, type PackType } from '@/store/useShowcaseStore';
import { useQuestStore } from '@/store/useQuestStore';
import { SEASONAL_CALENDAR_CONFIG } from '@/lib/calendarData';
import { calculateShowcaseTotalYield } from '@/lib/inscriptionYield';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'inline';
  onNavigateActionRoute?: (route: 'forge' | 'gacha' | 'showcase', packType?: PackType) => void;
}

export default function RewardsModal({
  isOpen,
  onClose,
  mode = 'modal',
  onNavigateActionRoute,
}: RewardsModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'seasonal'>('daily');
  const [activeBurst, setActiveBurst] = useState<SparkBurstPayload | null>(null);

  const inkBalance = useShowcaseStore((state) => state.inkBalance);
  const currentDay = useShowcaseStore((state) => state.currentDay);
  const currentStreak = useShowcaseStore((state) => state.currentStreak);
  const isDailyFaucetClaimed = useShowcaseStore((state) => state.isDailyFaucetClaimed);
  const claimedCalendarDays = useShowcaseStore((state) => state.claimedCalendarDays);
  const claimMultiplierBonus = useShowcaseStore((state) => state.claimMultiplierBonus);
  const slots = useShowcaseStore((state) => state.slots);
  const claimDailyFaucet = useShowcaseStore((state) => state.claimDailyFaucet);
  const claimCalendarDay = useShowcaseStore((state) => state.claimCalendarDay);
  const addInk = useShowcaseStore((state) => state.addInk);

  const dailyQuests = useQuestStore((state) => state.dailyQuests);
  const weeklyQuests = useQuestStore((state) => state.weeklyQuests);
  const dailyRerollsUsed = useQuestStore((state) => state.dailyRerollsUsed);
  const weeklyRerollsUsed = useQuestStore((state) => state.weeklyRerollsUsed);
  const syncQuests = useQuestStore((state) => state.syncQuests);
  const claimQuestReward = useQuestStore((state) => state.claimQuestReward);
  const rerollQuest = useQuestStore((state) => state.rerollQuest);

  useEffect(() => {
    syncQuests(currentDay);
  }, [currentDay, syncQuests]);

  // Calculate Daily Faucet payout for the Claim All summary
  const totalDailyPayout = useMemo(() => {
    const streakBonusPercent = Math.min(60, currentStreak * 10);
    const baseMultiplier = 1 + streakBonusPercent / 100 + claimMultiplierBonus;
    const faucetBaseClaim = Math.floor(150 * baseMultiplier);
    const { claimableYield } = calculateShowcaseTotalYield(slots);
    return faucetBaseClaim + claimableYield;
  }, [currentStreak, claimMultiplierBonus, slots]);

  // 1. Unclaimed count & total claimable Ink for Active Bounties tab
  const { unclaimedBountiesCount, claimableBountiesInk } = useMemo(() => {
    const readyDaily = dailyQuests.filter((q) => q.isCompleted && !q.isClaimed);
    const readyWeekly = weeklyQuests.filter((q) => q.isCompleted && !q.isClaimed);
    const unclaimedFaucet = isDailyFaucetClaimed ? 0 : 1;

    const questsInk =
      readyDaily.reduce((sum, q) => sum + q.rewardInk, 0) +
      readyWeekly.reduce((sum, q) => sum + q.rewardInk, 0);
    const faucetInk = isDailyFaucetClaimed ? 0 : totalDailyPayout;

    return {
      unclaimedBountiesCount: readyDaily.length + readyWeekly.length + unclaimedFaucet,
      claimableBountiesInk: questsInk + faucetInk,
    };
  }, [dailyQuests, weeklyQuests, isDailyFaucetClaimed, totalDailyPayout]);

  // 2. Unclaimed calendar days array & count
  const unclaimedCalendarDays = useMemo(() => {
    const currentProgressDay = Math.min(40, currentDay);
    const claimedSet = new Set(claimedCalendarDays);
    return SEASONAL_CALENDAR_CONFIG.filter(
      (c) => c.day <= currentProgressDay && !claimedSet.has(c.day)
    ).map((c) => c.day);
  }, [currentDay, claimedCalendarDays]);

  const unclaimedCalendarCount = unclaimedCalendarDays.length;

  // Auto-focus Seasonal Calendar tab on open if only calendar rewards are waiting
  useEffect(() => {
    if (isOpen) {
      if (unclaimedBountiesCount === 0 && unclaimedCalendarCount > 0) {
        setActiveTab('seasonal');
      } else if (unclaimedBountiesCount > 0) {
        setActiveTab('daily');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (mode !== 'modal') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, mode]);

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

  // Batch claim all ready Bounties + Daily Faucet (including any quest completed by claiming the Faucet)
  const handleClaimAllBounties = (e: React.MouseEvent) => {
    triggerSparks(e, '#10b981');
    if (!isDailyFaucetClaimed) {
      claimDailyFaucet();
    }
    const freshQuestState = useQuestStore.getState();
    freshQuestState.dailyQuests.forEach((q) => {
      if (q.isCompleted && !q.isClaimed) {
        freshQuestState.claimQuestReward(q.id, false, addInk);
      }
    });
    freshQuestState.weeklyQuests.forEach((q) => {
      if (q.isCompleted && !q.isClaimed) {
        freshQuestState.claimQuestReward(q.id, true, addInk);
      }
    });
  };

  const handleClaimCalendarDay = (day: number, e: React.MouseEvent) => {
    triggerSparks(e, '#fbbf24');
    claimCalendarDay(day);
  };

  const handleClaimAllCalendar = (days: number[], e: React.MouseEvent) => {
    triggerSparks(e, '#fbbf24');
    days.forEach((day) => claimCalendarDay(day));
  };

  const handleNavigate = (route: 'forge' | 'gacha' | 'showcase', packType?: PackType) => {
    if (mode === 'modal') {
      onClose();
    }
    onNavigateActionRoute?.(route, packType);
  };

  // Contextual Pinned Claim All Button (Appears whenever multiple Bounties or >=1 Calendar days are waiting)
  const renderPinnedClaimAllBar = () => {
    if (activeTab === 'daily' && unclaimedBountiesCount >= 2) {
      return (
        <Button
          type="button"
          onClick={handleClaimAllBounties}
          className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles size={14} className="shrink-0" />
          <span>Claim All ({unclaimedBountiesCount})</span>
          <span className="opacity-60">•</span>
          <span className="inline-flex items-center gap-1 font-mono">
            +{claimableBountiesInk.toLocaleString()}
            <Droplet size={12} className="text-white fill-white/30 shrink-0" />
          </span>
        </Button>
      );
    }

    if (activeTab === 'seasonal' && unclaimedCalendarCount >= 1) {
      return (
        <Button
          type="button"
          onClick={(e) => handleClaimAllCalendar(unclaimedCalendarDays, e)}
          className="w-full h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles size={14} className="shrink-0" />
          <span>
            Claim All Unlocked ({unclaimedCalendarCount}{' '}
            {unclaimedCalendarCount === 1 ? 'Day' : 'Days'})
          </span>
        </Button>
      );
    }

    return null;
  };

  const renderSegmentedSwitcher = () => (
    <div className="grid grid-cols-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab('daily')}
        className={`h-9 font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer px-2 min-w-0 ${
          activeTab === 'daily'
            ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
        <span className="truncate">
          <span className="hidden sm:inline">Active </span>Bounties
        </span>
        {unclaimedBountiesCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-neutral-950 font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0 ml-0.5 leading-none">
            {unclaimedBountiesCount}
          </span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab('seasonal')}
        className={`h-9 font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer px-2 min-w-0 ${
          activeTab === 'seasonal'
            ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Calendar size={14} className="text-purple-400 shrink-0" />
        <span className="truncate">
          <span className="hidden sm:inline">Seasonal </span>Calendar
          <span className="hidden sm:inline"> (Day {Math.min(40, currentDay)}/40)</span>
        </span>
        {unclaimedCalendarCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-neutral-950 font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0 ml-0.5 leading-none">
            {unclaimedCalendarCount}
          </span>
        )}
      </Button>
    </div>
  );

  const renderTabBody = () =>
    activeTab === 'daily' ? (
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
    );

  // Mobile Inline Tab Mode: Locked viewport height so scroll body never overlaps the bottom footer
  if (mode === 'inline') {
    const pinnedClaimAll = renderPinnedClaimAllBar();

    return (
      <>
        <ClaimSparkCanvas burst={activeBurst} onComplete={() => setActiveBurst(null)} />
        <div className="w-full h-[calc(100dvh-10.75rem)] min-h-[420px] flex flex-col overflow-hidden">
          {/* Independent Scroll Body */}
          <div className="p-3 sm:p-4 pb-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {renderTabBody()}
          </div>

          {/* Flush Bottom Footer: Claim All Bar + Sub-View Switcher (Zero black gap below) */}
          <div className="shrink-0 p-2.5 bg-neutral-950 border-t border-neutral-800 flex flex-col gap-2">
            {pinnedClaimAll}
            {renderSegmentedSwitcher()}
          </div>
        </div>
      </>
    );
  }

  // Desktop Modal Mode
  const pinnedClaimAll = renderPinnedClaimAllBar();

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
            className="relative w-full max-w-3xl h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header with Standardized Circular Crimson Close Button */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-800 bg-neutral-900/90 shrink-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate pr-2">
                REWARDS & PROGRESSION
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-red-900/60 bg-red-950/40 text-red-300 hover:border-red-600 hover:bg-red-900/60 hover:text-white flex items-center justify-center shrink-0 aspect-square transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={15} />
              </button>
            </div>

            {/* Top Segmented Switcher + Pinned Claim All Bar on Desktop */}
            <div className="px-3 sm:px-6 pt-3 pb-2 flex flex-col gap-2 shrink-0 border-b border-neutral-800/60">
              {renderSegmentedSwitcher()}
              {pinnedClaimAll}
            </div>

            {/* Tab Body */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
              {renderTabBody()}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}