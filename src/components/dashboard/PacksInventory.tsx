// Run inside: frontend/
// src/components/dashboard/PacksInventory.tsx

import React, { useState } from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useShowcaseStore, type PackType, PACK_CONFIGS } from '@/store/useShowcaseStore';
import { PACK_THEMES, TIER_THEMES } from '@/lib/theme';
import BoosterPackVisual from '@/components/gacha/BoosterPackVisual';

interface PacksInventoryProps {
  onOpenInShrine: (packType: PackType) => void;
}

interface TierOddsSegment {
  tier: 2 | 3 | 4 | 5;
  pct: number;
  barClass: string;
}

const PACK_ORDER: PackType[] = ['explorer', 'adventurer', 'degen'];

const PACK_META: Record<
  PackType,
  {
    biasTag: string;
    segments: TierOddsSegment[];
  }
> = {
  explorer: {
    biasTag: 'Shape Bias (50%)',
    segments: [
      { tier: 5, pct: 80, barClass: 'bg-neutral-500' },
      { tier: 4, pct: 20, barClass: 'bg-emerald-500' },
    ],
  },
  adventurer: {
    biasTag: 'Even Parity',
    segments: [
      { tier: 5, pct: 65, barClass: 'bg-neutral-500' },
      { tier: 4, pct: 30, barClass: 'bg-emerald-500' },
      { tier: 3, pct: 5, barClass: 'bg-blue-500' },
    ],
  },
  degen: {
    biasTag: 'Project Bias (50%)',
    segments: [
      { tier: 5, pct: 45, barClass: 'bg-neutral-500' },
      { tier: 4, pct: 45, barClass: 'bg-emerald-500' },
      { tier: 3, pct: 9, barClass: 'bg-blue-500' },
      { tier: 2, pct: 1, barClass: 'bg-purple-500' },
    ],
  },
};

export default function PacksInventory({ onOpenInShrine }: PacksInventoryProps) {
  const unopenedPacks = useShowcaseStore((state) => state.unopenedPacks);
  const buyPacks = useShowcaseStore((state) => state.buyPacks);
  const inkBalance = useShowcaseStore((state) => state.inkBalance);

  const [buyQuantities, setBuyQuantities] = useState<Record<PackType, number>>({
    explorer: 1,
    adventurer: 1,
    degen: 1,
  });

  return (
    <Card className="bg-neutral-900 border-neutral-800 min-h-0 lg:flex-1">
      <CardContent className="p-2.5 sm:p-4 flex flex-col gap-3">
        {PACK_ORDER.map((type) => {
          const cfg = PACK_CONFIGS[type];
          const count = unopenedPacks[type] || 0;
          const style = PACK_THEMES[type];
          const meta = PACK_META[type];
          const qty = buyQuantities[type] || 1;
          const totalCost = cfg.cost * qty;
          const canAfford = inkBalance >= totalCost;

          return (
            <div
              key={type}
              className={`rounded-xl border ${style.borderMuted} ${style.bgMuted} transition-all overflow-hidden flex flex-col`}
            >
              {/* Upper Asset & Drop Odds Overview */}
              <div className="px-3 sm:px-4 pt-4 pb-3 sm:pb-3.5 flex items-start gap-3.5 sm:gap-4">
                <BoosterPackVisual
                  packType={type}
                  size="sm"
                  count={count}
                  dimmed={count === 0}
                  onClick={() => onOpenInShrine(type)}
                />

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  {/* Top Row: Elevated Pack Title (Left) + Bias Mechanic Pill (Top-Right) */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-neutral-100 leading-tight truncate">
                      {cfg.name}
                    </span>

                    <span
                      className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${style.badge}`}
                    >
                      {meta.biasTag}
                    </span>
                  </div>

                  {/* Middle Row: Drop Odds Label + Tier Percentage Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
                    <span className="text-neutral-400 font-semibold uppercase tracking-wider text-xs mr-0.5">
                      Drop Odds
                    </span>
                    {meta.segments.map((seg) => {
                      const t = TIER_THEMES[seg.tier];
                      return (
                        <span
                          key={seg.tier}
                          className={`px-1.5 sm:px-2 py-0.5 rounded border font-semibold ${t.border} ${t.bgSubtle} ${t.text}`}
                        >
                          T{seg.tier}: {seg.pct}%
                        </span>
                      );
                    })}
                  </div>

                  {/* Bottom Row: Segmented Probability Distribution Line */}
                  <div className="w-full h-1.5 rounded-full bg-neutral-950 overflow-hidden flex gap-0.5 p-[1px] border border-neutral-800/80">
                    {meta.segments.map((seg) => (
                      <div
                        key={seg.tier}
                        style={{ width: `${Math.max(seg.pct, 3)}%` }}
                        className={`h-full first:rounded-l-full last:rounded-r-full ${seg.barClass}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom-Docked Store & Unseal Action Bar */}
              <div className="px-3 sm:px-4 py-2.5 border-t border-neutral-800/80 bg-neutral-950/65 flex flex-wrap items-center justify-between gap-2">
                {/* Left Group: Quantity Selector + Adjacent Buy CTA */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 shrink-0">
                    {[1, 5, 10].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setBuyQuantities((prev) => ({ ...prev, [type]: q }))}
                        className={`h-7 px-2.5 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                          qty === q
                            ? 'bg-neutral-800 text-white shadow-xs'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {q}x
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => buyPacks(type, qty)}
                    className={`h-9 px-3 sm:px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      canAfford
                        ? `${style.btn} shadow-sm active:scale-95`
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={13} />
                    <span>
                      Buy {qty}x (-{totalCost.toLocaleString()} Ink)
                    </span>
                  </Button>
                </div>

                {/* Right Group: Shrine Navigation CTA */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenInShrine(type)}
                  className={`h-9 px-3 sm:px-3.5 text-xs font-bold rounded-xl border bg-neutral-900/90 hover:bg-neutral-800 text-neutral-100 flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto active:scale-95 ${style.border}`}
                >
                  <Sparkles size={13} className={style.icon} />
                  <span>Open Pack(s)</span>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}