// src/components/dashboard/PacksInventory.tsx

import React, { useState } from 'react';
import { Package, PackageOpen, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useArchiverStore, type PackType, PACK_CONFIGS } from '@/store/useShowcaseStore';
import { PACK_THEMES, TIER_THEMES } from '@/lib/theme';

interface PackDepotProps {
  onOpenInShrine: (packType: PackType) => void;
}

export default function PackDepot({ onOpenInShrine }: PackDepotProps) {
  const { unopenedPacks, buyPacks, inkBalance } = useArchiverStore();

  const [expandedPacks, setExpandedPacks] = useState<Record<PackType, boolean>>({
    explorer: false,
    adventurer: false,
    degen: false,
  });

  const [buyQuantities, setBuyQuantities] = useState<Record<PackType, number>>({
    explorer: 1,
    adventurer: 1,
    degen: 1,
  });

  const toggleExpanded = (type: PackType) => {
    setExpandedPacks((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 flex-1 min-h-[550px]">
      <CardContent className="p-2.5 sm:p-4 flex flex-col gap-3">
        {(['explorer', 'adventurer', 'degen'] as PackType[]).map((type) => {
          const cfg = PACK_CONFIGS[type];
          const count = unopenedPacks[type] || 0;
          const style = PACK_THEMES[type];
          const isExpanded = !!expandedPacks[type];
          const qty = buyQuantities[type] || 1;
          const totalCost = cfg.cost * qty;
          const canAfford = inkBalance >= totalCost;

          return (
            <div
              key={type}
              className={`rounded-xl border ${style.borderMuted} ${style.bgMuted} transition-all overflow-hidden`}
            >
              {/* Row Header: Responsive gap and strict flex containment */}
              <div className="p-2.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 shrink-0">
                    {count > 0 ? (
                      <PackageOpen className={`w-4 h-4 sm:w-5 sm:h-5 ${style.icon}`} />
                    ) : (
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 opacity-60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                      <span className="font-bold text-xs sm:text-sm text-neutral-200 truncate">
                        {cfg.name}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full border shrink-0 ${style.badge}`}>
                        x{count}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 truncate">
                      {cfg.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => onOpenInShrine(type)}
                    className={`h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold shadow-sm cursor-pointer whitespace-nowrap ${style.btn}`}
                  >
                    <span>Open</span>
                    <span className="hidden sm:inline ml-1">Pack</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(type)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800/60 cursor-pointer shrink-0"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </Button>
                </div>
              </div>

              {/* Expandable Purchase & Drop Odds Tray */}
              {isExpanded && (
                <div className="px-3 sm:px-4 pb-3.5 sm:pb-4 pt-2 border-t border-neutral-800/80 bg-neutral-950/60 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      Drop Odds per Badge (5 Badges / Pack)
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono">
                      {type === 'explorer' && (
                        <>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[5].border} ${TIER_THEMES[5].bgSubtle} ${TIER_THEMES[5].text}`}>
                            T5: 80%
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[4].border} ${TIER_THEMES[4].bgSubtle} ${TIER_THEMES[4].text}`}>
                            T4: 20%
                          </span>
                        </>
                      )}
                      {type === 'adventurer' && (
                        <>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[5].border} ${TIER_THEMES[5].bgSubtle} ${TIER_THEMES[5].text}`}>
                            T5: 65%
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[4].border} ${TIER_THEMES[4].bgSubtle} ${TIER_THEMES[4].text}`}>
                            T4: 30%
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[3].border} ${TIER_THEMES[3].bgSubtle} ${TIER_THEMES[3].text}`}>
                            T3: 5%
                          </span>
                        </>
                      )}
                      {type === 'degen' && (
                        <>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[5].border} ${TIER_THEMES[5].bgSubtle} ${TIER_THEMES[5].text}`}>
                            T5: 45%
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[4].border} ${TIER_THEMES[4].bgSubtle} ${TIER_THEMES[4].text}`}>
                            T4: 45%
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[3].border} ${TIER_THEMES[3].bgSubtle} ${TIER_THEMES[3].text}`}>
                            T3: 9%
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded border ${TIER_THEMES[2].border} ${TIER_THEMES[2].bgSubtle} ${TIER_THEMES[2].text}`}>
                            T2: 1%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-neutral-900 gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[11px] sm:text-xs text-neutral-400 font-semibold">Qty:</span>
                      {[1, 5, 10].map((q) => (
                        <Button
                          key={q}
                          variant="ghost"
                          size="sm"
                          onClick={() => setBuyQuantities((prev) => ({ ...prev, [type]: q }))}
                          className={`h-6 sm:h-7 px-2 sm:px-2.5 text-[11px] sm:text-xs cursor-pointer ${
                            qty === q
                              ? 'bg-neutral-800 text-white font-bold'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {q}x
                        </Button>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      disabled={!canAfford}
                      onClick={() => buyPacks(type, qty)}
                      className={`h-7 sm:h-8 px-3 sm:px-4 text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        canAfford
                          ? `${style.btn} shadow-md`
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={12} />
                      <span>Buy {qty}x (-{totalCost} Ink)</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}