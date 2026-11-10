import React, { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import BadgeCard, { type BadgeCardProps } from './BadgeCard';

interface InscriptionCelebrationProps {
  badgeProps: BadgeCardProps;
  isCelebrating: boolean;
  onCelebrationEnd?: () => void;
  sparkCount?: number;
}

export default function InscriptionCelebration({
  badgeProps,
  isCelebrating,
  onCelebrationEnd,
  sparkCount = 14,
}: InscriptionCelebrationProps) {
  const shouldReduceMotion = useReducedMotion();

  // Generate randomized positions and drift offsets for sparks
  const sparks = useMemo(() => {
    return Array.from({ length: sparkCount }).map((_, i) => ({
      id: i,
      xOffset: (Math.random() - 0.5) * 80,
      yTravel: -(50 + Math.random() * 60),
      left: `${15 + Math.random() * 70}%`,
      bottom: `${10 + Math.random() * 30}%`,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 0.35,
      duration: 0.7 + Math.random() * 0.4,
    }));
  }, [sparkCount]);

  return (
    <div className="relative inline-block w-full">
      <AnimatePresence onExitComplete={onCelebrationEnd}>
        {isCelebrating && (
          <motion.div
            key="celebration-overlay"
            className="absolute inset-0 pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shifting Border Glow Overlay */}
            <motion.div
              className="absolute -inset-1 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 0.8 }
                  : {
                      opacity: [0, 1, 0.8, 0],
                      boxShadow: [
                        '0 0 0px 0px rgba(59, 130, 246, 0)',
                        '0 0 16px 2px rgba(147, 51, 234, 0.8)',
                        '0 0 24px 4px rgba(236, 72, 153, 0.7)',
                        '0 0 0px 0px rgba(236, 72, 153, 0)',
                      ],
                    }
              }
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />

            {/* Dissolving Floating Sparks */}
            {!shouldReduceMotion &&
              sparks.map((spark) => (
                <motion.span
                  key={spark.id}
                  className="absolute rounded-full bg-amber-300 pointer-events-none"
                  style={{
                    width: spark.size,
                    height: spark.size,
                    left: spark.left,
                    bottom: spark.bottom,
                    boxShadow: '0 0 6px 1px #FBBF24',
                  }}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0.9, 0],
                    scale: [0, 1.2, 1, 0.2],
                    x: spark.xOffset,
                    y: spark.yTravel,
                  }}
                  transition={{
                    duration: spark.duration,
                    delay: spark.delay,
                    ease: 'easeOut',
                  }}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Badge Component */}
      <div className="relative z-10">
        <BadgeCard {...badgeProps} />
      </div>
    </div>
  );
}