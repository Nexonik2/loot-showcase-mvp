// Run inside: frontend/
// src/components/DevPanel.tsx

import React, { useState, useMemo } from 'react';
import { useShowcaseStore } from '@/store/useShowcaseStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  setMasterVolume,
  setAudioMuted,
  getMasterVolume,
  getAudioMuted,
} from '@/lib/forgeAudio';
import {
  Settings,
  Droplet,
  Calendar,
  PackagePlus,
  Trash2,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  PieChart,
  Wrench,
  Sliders,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Star,
  HelpCircle,
  Check,
} from 'lucide-react';

type DrawerTab = 'stats' | 'settings' | 'sandbox';

const renderSmallShapeIcon = (shape: string) => {
  switch (shape) {
    case 'circle':
      return <Circle className="w-2.5 h-2.5 inline text-neutral-400" />;
    case 'square':
      return <Square className="w-2.5 h-2.5 inline text-neutral-400" />;
    case 'triangle':
      return <Triangle className="w-2.5 h-2.5 inline text-neutral-400" />;
    case 'wildcard':
      return <Star className="w-2.5 h-2.5 inline text-amber-400 fill-amber-400" />;
    case 'hexagon':
    default:
      return <Hexagon className="w-2.5 h-2.5 inline text-neutral-400" />;
  }
};

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>('stats');
  const [volume, setVolume] = useState<number[]>([Math.round(getMasterVolume() * 100)]);
  const [isMuted, setIsMutedState] = useState<boolean>(getAudioMuted());
  const [guidesRestored, setGuidesRestored] = useState<boolean>(false);

  const badges = useShowcaseStore((state) => state.badges);
  const injectInk = useShowcaseStore((state) => state.injectInk);
  const advanceDay = useShowcaseStore((state) => state.advanceDay);
  const resetSlots = useShowcaseStore((state) => state.resetSlots);
  const injectTestBundle = useShowcaseStore((state) => state.injectTestBundle);
  const resetHelpTips = useShowcaseStore((state) => state.resetHelpTips);

  // Aggregate collection breakdown for the Stats tab
  const summary = useMemo(() => {
    const total = Object.keys(badges).length;
    const byTier: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const byProject: Record<string, { total: number; shapes: Record<string, number> }> = {};
    const byShape: Record<string, number> = {};

    Object.values(badges).forEach((badge) => {
      byTier[badge.tier] = (byTier[badge.tier] || 0) + 1;
      byShape[badge.shape] = (byShape[badge.shape] || 0) + 1;

      if (!byProject[badge.projectId]) {
        byProject[badge.projectId] = { total: 0, shapes: {} };
      }
      byProject[badge.projectId].total += 1;
      byProject[badge.projectId].shapes[badge.shape] =
        (byProject[badge.projectId].shapes[badge.shape] || 0) + 1;
    });

    const sortedProjects = Object.entries(byProject).sort(([projA], [projB]) => {
      if (projA === 'wildcard') return -1;
      if (projB === 'wildcard') return 1;
      return projA.localeCompare(projB);
    });

    return { total, byTier, byShape, sortedProjects };
  }, [badges]);

  const handleVolumeChange = (vals: number[]) => {
    const val = vals[0] ?? 0;
    setVolume([val]);
    setMasterVolume(val / 100);
    if (val > 0 && isMuted) {
      setIsMutedState(false);
      setAudioMuted(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    setAudioMuted(nextMuted);
  };

  const handleRestoreGuides = () => {
    resetHelpTips();
    setGuidesRestored(true);
    setTimeout(() => setGuidesRestored(false), 1800);
  };

  const handleResetProfile = () => {
    localStorage.removeItem('loot-showcase-gameplay-state');
    localStorage.removeItem('loot-archiver-gameplay-state');
    localStorage.removeItem('archiver-quest-board-state');
    window.location.reload();
  };

  return (
    <aside
      aria-label="Settings, Collection Stats & Sandbox Tools"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-3.5 lg:bottom-6 lg:right-6 z-50"
    >
      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          aria-label="Open Settings & Collection Stats"
          onClick={() => setIsOpen(true)}
          className="rounded-full w-11 h-11 sm:w-12 sm:h-12 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white shadow-xl flex items-center justify-center p-0 transition-transform active:scale-95 cursor-pointer"
        >
          <Settings size={20} />
        </Button>
      )}

      {/* Popover Drawer Card (p-0 gap-0 overrides Shadcn Card default py-6 gap-6) */}
      {isOpen && (
        <Card className="p-0 gap-0 w-[calc(100vw-1.75rem)] max-w-80 sm:max-w-96 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="px-4 py-2.5 border-b border-neutral-800/80 flex flex-row items-center justify-between bg-neutral-900/80 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2 font-mono">
              <Settings size={14} className="text-emerald-400 shrink-0" />
              <span>Utility & Settings</span>
            </CardTitle>

            {/* Standardized Circular Crimson Close Button */}
            <button
              type="button"
              aria-label="Close Settings Drawer"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full border border-red-900/60 bg-red-950/40 text-red-300 hover:border-red-600 hover:bg-red-900/60 hover:text-white flex items-center justify-center shrink-0 aspect-square transition-all active:scale-95 cursor-pointer"
            >
              <X size={14} />
            </button>
          </CardHeader>

          {/* 3-Tab Segmented Switcher (Tight spacing directly below header) */}
          <div className="px-3.5 pt-2.5 pb-2 bg-neutral-950 border-b border-neutral-800/60">
            <div className="grid grid-cols-3 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px] gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`h-8 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'stats'
                    ? 'bg-neutral-800 text-white border border-neutral-700/60 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <PieChart size={12} className="text-emerald-400 shrink-0" />
                <span>Stats ({summary.total})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`h-8 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-neutral-800 text-white border border-neutral-700/60 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sliders size={12} className="text-amber-400 shrink-0" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sandbox')}
                className={`h-8 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'sandbox'
                    ? 'bg-neutral-800 text-white border border-neutral-700/60 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Wrench size={12} className="text-purple-400 shrink-0" />
                <span>Sandbox</span>
              </button>
            </div>
          </div>

          <CardContent className="p-3.5 flex flex-col gap-3 text-xs max-h-[60dvh] overflow-y-auto custom-scrollbar">
            {/* TAB 1: COLLECTION STATS */}
            {activeTab === 'stats' && (
              <div className="flex flex-col gap-2.5">
                {/* Explicit Context Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Inventory Summary
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {summary.total} Badges Held
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* By Tier */}
                  <div className="p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono block mb-1.5">
                      By Tier
                    </span>
                    <div className="flex flex-col gap-1">
                      {[1, 2, 3, 4, 5].map((t) => (
                        <div key={t} className="flex justify-between text-neutral-400">
                          <span>Tier {t}:</span>
                          <span className="font-mono font-bold text-neutral-200">
                            {summary.byTier[t] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Shape */}
                  <div className="p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono block mb-1.5">
                      By Shape
                    </span>
                    <div className="flex flex-col gap-1">
                      {Object.entries(summary.byShape).length === 0 ? (
                        <span className="text-neutral-600">None</span>
                      ) : (
                        Object.entries(summary.byShape).map(([shape, count]) => (
                          <div
                            key={shape}
                            className="flex items-center justify-between text-neutral-400"
                          >
                            <span className="capitalize flex items-center gap-1.5 truncate">
                              {renderSmallShapeIcon(shape)} {shape}
                            </span>
                            <span className="font-mono font-bold text-neutral-200">{count}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* By Project */}
                <div className="p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono block mb-1.5">
                    By Project
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                    {summary.sortedProjects.length === 0 ? (
                      <span className="text-neutral-600">No badges owned yet.</span>
                    ) : (
                      summary.sortedProjects.map(([proj, data]) => (
                        <div
                          key={proj}
                          className="flex items-center justify-between text-neutral-400 border-b border-neutral-800/60 pb-1 last:border-none last:pb-0"
                        >
                          <span className="capitalize font-medium text-neutral-200">{proj}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 opacity-80">
                              {Object.entries(data.shapes).map(([sh, cnt]) => (
                                <span
                                  key={sh}
                                  className="inline-flex items-center gap-0.5 text-[10px] font-mono"
                                >
                                  {renderSmallShapeIcon(sh)}
                                  {cnt}
                                </span>
                              ))}
                            </div>
                            <span className="font-mono font-bold text-emerald-400 min-w-[20px] text-right">
                              {data.total}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PLAYER SETTINGS */}
            {activeTab === 'settings' && (
              <div className="flex flex-col gap-3">
                {/* Audio & Volume Controls */}
                <div className="flex flex-col gap-2.5 p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    <span className="flex items-center gap-1.5">
                      {isMuted || volume[0] === 0 ? (
                        <VolumeX size={13} className="text-red-400" />
                      ) : (
                        <Volume2 size={13} className="text-emerald-400" />
                      )}
                      Sound Effects Volume
                    </span>
                    <span className="text-neutral-200">{isMuted ? 'MUTED' : `${volume[0]}%`}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleMute}
                      className={`h-8 px-2.5 text-[11px] font-mono rounded-lg border transition-colors shrink-0 cursor-pointer ${
                        isMuted
                          ? 'bg-red-950/60 border-red-800 text-red-300 hover:bg-red-900'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {isMuted ? 'Unmute' : 'Mute'}
                    </Button>

                    <Slider
                      dir="ltr"
                      value={isMuted ? [0] : volume}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={5}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>

                {/* Onboarding Help Guides Reset */}
                <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    Workbench Onboarding
                  </span>
                  <Button
                    size="sm"
                    onClick={handleRestoreGuides}
                    className="h-9 w-full text-xs font-mono font-semibold rounded-lg border border-amber-700/60 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {guidesRestored ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>Guides Restored!</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle size={14} className="text-amber-400" />
                        <span>Restore Tutorial Guides</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: DEVELOPER SANDBOX */}
            {activeTab === 'sandbox' && (
              <div className="flex flex-col gap-3.5">
                {/* 1. Fast Sandbox Injection */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                    Fast Sandbox Injection
                  </span>
                  <Button
                    size="sm"
                    onClick={injectTestBundle}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-9 text-xs flex items-center justify-center gap-2 shadow-sm rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <PackagePlus size={14} />
                    +18 Badges & +3 All Packs
                  </Button>
                </div>

                {/* 2. Economy & Progression */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                    Economy & Time Travel
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => injectInk(1000)}
                      className="h-9 text-xs font-mono font-semibold rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>+1,000</span>
                      <Droplet size={13} className="text-emerald-400 fill-emerald-400/25" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={advanceDay}
                      className="h-9 text-xs font-mono font-semibold rounded-lg bg-blue-950/40 border border-blue-800/60 text-blue-300 hover:bg-blue-900/50 hover:text-white transition-all active:scale-95 cursor-pointer"
                    >
                      <Calendar size={13} className="mr-1 text-blue-400" /> Advance Day
                    </Button>
                  </div>
                </div>

                {/* 3. Reset Controls */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-800/80">
                  <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider font-mono">
                    Reset Controls
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={resetSlots}
                      className="h-9 text-xs font-mono font-medium rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-300 hover:bg-amber-900/40 hover:text-white transition-all active:scale-95 cursor-pointer"
                    >
                      <RotateCcw size={12} className="mr-1 text-amber-400" /> Clear Slots
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleResetProfile}
                      className="h-9 text-xs font-mono font-bold rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 hover:bg-red-900/70 hover:text-white transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={12} className="mr-1 text-red-400" /> Reset Day 1
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </aside>
  );
}