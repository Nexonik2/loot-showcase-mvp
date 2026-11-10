// src/components/DevPanel.tsx

import React, { useState } from 'react';
import { useArchiverStore } from '@/store/useShowcaseStore';
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
} from 'lucide-react';

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState<number[]>([Math.round(getMasterVolume() * 100)]);
  const [isMuted, setIsMutedState] = useState<boolean>(getAudioMuted());

  const { injectInk, advanceDay, resetSlots, injectTestBundle } = useArchiverStore();

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

  const handleResetProfile = () => {
    localStorage.removeItem('loot-showcase-gameplay-state');
    localStorage.removeItem('loot-archiver-gameplay-state');
    localStorage.removeItem('archiver-quest-board-state');
    window.location.reload();
  };

  return (
    <aside aria-label="Developer Sandbox Tools" className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 shadow-xl flex items-center justify-center p-0 transition-transform active:scale-95"
        >
          <Settings size={20} />
        </Button>
      )}

      {/* Floating Dev Card */}
      {isOpen && (
        <Card className="w-80 bg-neutral-950 border border-neutral-800 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="p-3.5 border-b border-neutral-800/80 flex flex-row items-center justify-between bg-neutral-900/60">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2 font-mono">
              <Settings size={14} className="text-emerald-400" />
              Dev & Test Tools
            </CardTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
            >
              <X size={15} />
            </button>
          </CardHeader>

          <CardContent className="p-4 flex flex-col gap-4 text-xs">
            {/* 1. Fast Sandbox Injection */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                Fast Sandbox Injection
              </span>
              <Button
                size="sm"
                onClick={injectTestBundle}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-8 text-xs flex items-center justify-center gap-2 shadow-sm rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <PackagePlus size={14} />
                +10 Badges & +3 All Packs
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
                  className="h-8 text-xs font-mono font-semibold rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <Droplet size={13} className="mr-1 text-emerald-400" /> +1000 Ink
                </Button>
                <Button
                  size="sm"
                  onClick={advanceDay}
                  className="h-8 text-xs font-mono font-semibold rounded-lg bg-blue-950/40 border border-blue-800/60 text-blue-300 hover:bg-blue-900/50 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <Calendar size={13} className="mr-1 text-blue-400" /> Advance Day (+1)
                </Button>
              </div>
            </div>

            {/* 3. Audio & Volume Controls (Replaces Network Latency) */}
            <div className="flex flex-col gap-2 p-2.5 rounded-lg border border-neutral-800/80 bg-neutral-900/40">
              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                <span className="flex items-center gap-1.5">
                  {isMuted || volume[0] === 0 ? (
                    <VolumeX size={13} className="text-red-400" />
                  ) : (
                    <Volume2 size={13} className="text-emerald-400" />
                  )}
                  Sound Volume
                </span>
                <span className="text-neutral-300">{isMuted ? 'MUTED' : `${volume[0]}%`}</span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Mute button on the left anchoring 0% */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleMute}
                  className={`h-7 px-2 text-[10px] font-mono rounded border transition-colors shrink-0 cursor-pointer ${
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

            {/* 4. Reset Controls */}
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
              <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider font-mono">
                Reset Controls
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={resetSlots}
                  className="h-8 text-xs font-mono font-medium rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-300 hover:bg-amber-900/40 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw size={12} className="mr-1 text-amber-400" /> Clear Slots
                </Button>
                <Button
                  size="sm"
                  onClick={handleResetProfile}
                  className="h-8 text-xs font-mono font-bold rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 hover:bg-red-900/70 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 size={12} className="mr-1 text-red-400" /> Reset Day 1
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}