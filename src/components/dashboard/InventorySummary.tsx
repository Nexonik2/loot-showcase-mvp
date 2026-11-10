import React, { useState, useMemo } from 'react';
import { PieChart, ChevronDown, ChevronUp, Circle, Square, Triangle, Hexagon, Star } from 'lucide-react';
import { type Badge } from '@/store/useShowcaseStore';

interface InventorySummaryProps {
  badges: Record<string, Badge>;
}

const renderSmallShapeIcon = (shape: string) => {
  switch (shape) {
    case 'circle': return <Circle className="w-2.5 h-2.5 inline text-neutral-400" />;
    case 'square': return <Square className="w-2.5 h-2.5 inline text-neutral-400" />;
    case 'triangle': return <Triangle className="w-2.5 h-2.5 inline text-neutral-400" />;
    case 'wildcard': return <Star className="w-2.5 h-2.5 inline text-neutral-400 fill-neutral-400" />;
    case 'hexagon':
    default:
      return <Hexagon className="w-2.5 h-2.5 inline text-neutral-400" />;
  }
};

export default function InventorySummary({ badges }: InventorySummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      byProject[badge.projectId].shapes[badge.shape] = (byProject[badge.projectId].shapes[badge.shape] || 0) + 1;
    });

    return { total, byTier, byProject, byShape };
  }, [badges]);

  // Pin 'wildcard' to the very top of project listings
  const sortedProjects = useMemo(() => {
    return Object.entries(summary.byProject).sort(([projA], [projB]) => {
      if (projA === 'wildcard') return -1;
      if (projB === 'wildcard') return 1;
      return projA.localeCompare(projB);
    });
  }, [summary.byProject]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-neutral-300 hover:bg-neutral-800/50"
      >
        <div className="flex items-center gap-2">
          <PieChart size={14} className="text-emerald-400" />
          <span>INVENTORY SUMMARY ({summary.total} Badges)</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 grid grid-cols-12 gap-3 text-xs">
          {/* By Tier (Narrow: col-span-3) */}
          <div className="col-span-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">By Tier</span>
            <div className="flex flex-col gap-1">
              {[1, 2, 3, 4, 5].map((t) => (
                <div key={t} className="flex justify-between text-neutral-400">
                  <span>Tier {t}:</span>
                  <span className="font-mono text-neutral-200">{summary.byTier[t] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Project (Expanded: col-span-5) */}
          <div className="col-span-5">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">By Project</span>
            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
              {sortedProjects.length === 0 ? (
                <span className="text-neutral-600">None</span>
              ) : (
                sortedProjects.map(([proj, data]) => (
                  <div key={proj} className="flex flex-col text-neutral-400 border-b border-neutral-900 pb-1 last:border-none">
                    <div className="flex justify-between font-medium text-neutral-300">
                      <span className="capitalize">{proj}:</span>
                      <span className="font-mono text-neutral-200">{data.total}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 opacity-80">
                      {Object.entries(data.shapes).map(([sh, cnt]) => (
                        <span key={sh} className="flex items-center gap-0.5 text-[10px]">
                          {renderSmallShapeIcon(sh)} {cnt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* By Shape (Balanced: col-span-4) */}
          <div className="col-span-4">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">By Shape</span>
            <div className="flex flex-col gap-1">
              {Object.entries(summary.byShape).length === 0 ? (
                <span className="text-neutral-600">None</span>
              ) : (
                Object.entries(summary.byShape).map(([shape, count]) => (
                  <div key={shape} className="flex items-center justify-between text-neutral-400">
                    <span className="capitalize flex items-center gap-1.5">
                      {renderSmallShapeIcon(shape)} {shape}:
                    </span>
                    <span className="font-mono text-neutral-200">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}