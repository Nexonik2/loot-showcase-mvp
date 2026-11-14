// Run inside: frontend/
// src/components/dashboard/WorkbenchHelpBanner.tsx

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useShowcaseStore, type HelpTipId } from '@/store/useShowcaseStore';

interface WorkbenchHelpBannerProps {
  tipId: HelpTipId;
  title: string;
  bullets: string[];
}

export default function WorkbenchHelpBanner({
  tipId,
  title,
  bullets,
}: WorkbenchHelpBannerProps) {
  const isDismissed = useShowcaseStore((state) => Boolean(state.dismissedTips?.[tipId]));
  const dismissTip = useShowcaseStore((state) => state.dismissTip);
  const [isManuallyOpen, setIsManuallyOpen] = useState<boolean>(false);

  const isExpanded = !isDismissed || isManuallyOpen;

  const handleClose = () => {
    if (!isDismissed) {
      dismissTip(tipId);
    }
    setIsManuallyOpen(false);
  };

  if (!isExpanded) {
    return (
      <div className="w-full max-w-xl mx-auto flex justify-end shrink-0 -mb-1">
        <button
          type="button"
          onClick={() => setIsManuallyOpen(true)}
          aria-label={`Open ${title}`}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-amber-500/50 bg-amber-950/50 text-xs font-mono font-bold text-amber-300 hover:bg-amber-900/60 hover:border-amber-400 hover:text-amber-100 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <HelpCircle size={15} className="text-amber-400 shrink-0" />
          <span>Guide</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto rounded-xl border border-amber-500/40 bg-neutral-900/95 p-3 sm:p-3.5 shadow-md flex flex-col gap-2 animate-in fade-in duration-150 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
          <HelpCircle size={15} className="shrink-0" />
          <span>{title}</span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close guide"
          className="w-7 h-7 rounded-full border border-red-900/60 bg-red-950/40 text-red-300 hover:border-red-600 hover:bg-red-900/60 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      <ul className="flex flex-col gap-1.5 text-[11px] sm:text-xs text-neutral-300 leading-relaxed pl-1">
        {bullets.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-amber-400 font-bold leading-tight mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}