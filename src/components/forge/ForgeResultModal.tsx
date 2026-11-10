// src/components/forge/ForgeResultModal.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Badge } from '@/store/useShowcaseStore';
import BadgeCard from '@/components/BadgeCard';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, Droplet, Flame } from 'lucide-react';

interface ForgeResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  forgedBadges: Badge[];
  inkSaved: number;
}

export default function ForgeResultModal({
  isOpen,
  onClose,
  forgedBadges,
  inkSaved,
}: ForgeResultModalProps) {
  if (!isOpen || forgedBadges.length === 0) return null;

  const isBatch = forgedBadges.length > 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Subtle Ambient Radial Backlight */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Badge & Title */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Transmutation Complete</span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-wide">
            {isBatch
              ? `Forged ${forgedBadges.length}x Badges Successfully`
              : 'Transmuted Higher Tier Badge'}
          </h3>

          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            Ingredients consumed on the anvil. New badges minted directly to your persistent inventory.
          </p>

          {/* 15% Ink Retention Notification Banner */}
          {inkSaved > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/70 text-amber-300 text-xs font-mono flex items-center gap-2 shadow-sm"
            >
              <Droplet size={14} className="text-amber-400 shrink-0" />
              <span>
                <strong>15% Ink Retention Triggered!</strong> Saved {inkSaved.toLocaleString()} Ink!
              </span>
            </motion.div>
          )}

          {/* Badge Display Area */}
          <div className="w-full my-5">
            {isBatch ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                {forgedBadges.map((badge, idx) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="w-full aspect-[3/4]"
                  >
                    <BadgeCard
                      tier={badge.tier}
                      projectId={badge.projectId}
                      shape={badge.shape}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-2">
                <motion.div
                  initial={{ scale: 0.85, rotate: -3 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-28 aspect-[3/4] shadow-2xl"
                >
                  <BadgeCard
                    tier={forgedBadges[0].tier}
                    projectId={forgedBadges[0].projectId}
                    shape={forgedBadges[0].shape}
                  />
                </motion.div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <Button
            type="button"
            onClick={onClose}
            className="h-9 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Check size={14} />
            <span>Collect & Return to Forge</span>
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}