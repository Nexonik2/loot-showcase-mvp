import React from "react";
import { useArchiverStore } from "../store/useShowcaseStore";
import { 
  Check, 
  Flame, 
  Sparkles, 
  Package, 
  TrendingUp, 
  Ticket, 
  Lock 
} from "lucide-react";

interface MilestoneInfo {
  type: "multiplier" | "pack" | "token" | "trait";
  label: string;
  detail: string;
}

const MILESTONES: Record<number, MilestoneInfo> = {
  3: { type: "multiplier", label: "+5% Multiplier", detail: "Additive Base Ink Bonus" },
  6: { type: "pack", label: "1x Adventurer Pack", detail: "Rare card pack" },
  9: { type: "multiplier", label: "+5% Multiplier", detail: "Additive Base Ink Bonus" },
  12: { type: "token", label: "1x T4 Wildcard", detail: "Tier 4 Wildcard Token" },
  15: { type: "multiplier", label: "+5% Multiplier", detail: "Additive Base Ink Bonus" },
  18: { type: "pack", label: "2x Explorer Packs", detail: "Standard card packs" },
  21: { type: "multiplier", label: "+5% Multiplier", detail: "Additive Base Ink Bonus" },
  24: { type: "pack", label: "1x Adventurer Pack", detail: "Rare card pack" },
  27: { type: "multiplier", label: "+5% Multiplier", detail: "Additive Base Ink Bonus" },
  30: { type: "token", label: "1x T3 Wildcard", detail: "Tier 3 Wildcard Token" },
  33: { type: "pack", label: "1x Degen Pack", detail: "High-variance pack" },
  36: { type: "token", label: "1x T2 Wildcard", detail: "Epic Wildcard Token" },
  39: { type: "pack", label: "2x Explorer Packs", detail: "Standard card packs" },
  40: { type: "trait", label: "Shiny Trait", detail: "Exclusive seasonal cosmetic" },
};

const getMilestoneIcon = (type: MilestoneInfo["type"]) => {
  switch (type) {
    case "multiplier":
      return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
    case "pack":
      return <Package className="w-3.5 h-3.5 text-sky-400" />;
    case "token":
      return <Ticket className="w-3.5 h-3.5 text-purple-400" />;
    case "trait":
      return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
  }
};

export const SeasonalCalendar: React.FC = () => {
  const { calendarProgress, currentStreak, claimMultiplierBonus } = useArchiverStore();

  const nextMilestoneDay = Object.keys(MILESTONES)
    .map(Number)
    .sort((a, b) => a - b)
    .find((day) => day > calendarProgress);

  const nextReward = nextMilestoneDay ? MILESTONES[nextMilestoneDay] : null;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl backdrop-blur-md shadow-2xl text-zinc-100 font-sans">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-wide">Season Calendar</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full">
              40-Day Track + 10d Pity
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">
            Total Claim Multiplier:{" "}
            <span className="text-emerald-400 font-semibold font-mono">
              +{(claimMultiplierBonus * 100).toFixed(0)}%
            </span>
          </p>
        </div>

        {/* 7-Day Rolling Streak Indicator */}
        <div className="bg-zinc-900/90 border border-zinc-800 px-4 py-3 rounded-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <div>
              <div className="text-xs font-medium text-zinc-400">Rolling Streak</div>
              <div className="text-sm font-bold font-mono text-zinc-200">
                {currentStreak} / 7 <span className="text-xs text-zinc-500 font-normal">Days</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => {
              const isFilled = currentStreak >= step;
              return (
                <div
                  key={step}
                  className={`w-2.5 h-6 rounded-sm transition-all duration-300 ${
                    isFilled
                      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      : "bg-zinc-800 border border-zinc-700/50"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Next Upcoming Milestone Tracker */}
      <div className="my-5 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800 border border-zinc-700/60 rounded-lg">
            {nextReward ? getMilestoneIcon(nextReward.type) : <Check className="w-4 h-4 text-emerald-400" />}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {nextReward ? `Upcoming: Day ${nextMilestoneDay}` : "Track Complete"}
            </div>
            <div className="text-sm font-semibold text-zinc-200">
              {nextReward ? `${nextReward.label} — ${nextReward.detail}` : "All seasonal check-ins unlocked"}
            </div>
          </div>
        </div>
        <div className="text-right font-mono text-sm">
          <span className="text-emerald-400 font-bold">{calendarProgress}</span>
          <span className="text-zinc-500"> / 40 Days</span>
        </div>
      </div>

      {/* 40-Day Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
        {Array.from({ length: 40 }, (_, idx) => {
          const day = idx + 1;
          const isClaimed = calendarProgress >= day;
          const isCurrent = calendarProgress + 1 === day;
          const milestone = MILESTONES[day];

          return (
            <div
              key={day}
              className={`relative flex flex-col items-center justify-between p-2 rounded-lg border text-center transition-all select-none min-h-[76px] ${
                isClaimed
                  ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-400"
                  : isCurrent
                  ? "bg-zinc-900 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.15)] text-zinc-100"
                  : "bg-zinc-950/40 border-zinc-800/40 text-zinc-600"
              }`}
            >
              <div className="flex w-full justify-between items-center text-[10px] font-mono">
                <span>D{day}</span>
                {isClaimed ? (
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                ) : (
                  <Lock className="w-2.5 h-2.5 text-zinc-600" />
                )}
              </div>

              {milestone ? (
                <div className="my-auto flex flex-col items-center gap-0.5">
                  {getMilestoneIcon(milestone.type)}
                  <span
                    className={`text-[9px] font-medium leading-tight line-clamp-1 ${
                      isClaimed ? "text-zinc-400" : isCurrent ? "text-amber-300" : "text-zinc-400"
                    }`}
                  >
                    {milestone.label}
                  </span>
                </div>
              ) : (
                <div className="my-auto text-[10px] font-mono text-zinc-500">Claim</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};