"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Sparkles, Zap } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

const reactions = [
  { emoji: "pulse", label: "Pulse", icon: Heart },
  { emoji: "spark", label: "Spark", icon: Sparkles },
  { emoji: "charge", label: "Charge", icon: Zap }
];

export function ReactionBar() {
  const addReaction = usePingStore((state) => state.addReaction);

  return (
    <div className="reaction-bar flex items-center justify-between gap-3">
      <div className="flex gap-2">
        {reactions.map((reaction) => {
          const Icon = reaction.icon;

          return (
            <motion.button
              whileTap={{ scale: 0.94 }}
              key={reaction.emoji}
              onClick={() => addReaction(reaction.emoji)}
              className="group grid size-10 place-items-center rounded-full border border-ping-black/10 bg-ping-surface text-ping-ink transition hover:border-ping-pink/45 hover:bg-ping-softPink/20 sm:size-11"
              aria-label={reaction.label}
              title={reaction.label}
            >
              <Icon size={18} className="transition group-hover:text-ping-pink" />
            </motion.button>
          );
        })}
      </div>
      <p className="max-w-[9.5rem] text-right font-mono text-[9px] uppercase leading-relaxed text-ping-ink/45 sm:max-w-[12rem] sm:text-[10px]">
        reactions ripple through the room
      </p>
    </div>
  );
}

export function ReactionPulses() {
  const reactions = usePingStore((state) => state.reactions);
  const removeReaction = usePingStore((state) => state.removeReaction);

  return (
    <div className="pointer-events-none absolute inset-0 z-[8] overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: 80, scale: 0.7 }}
            animate={{ opacity: [0, 0.85, 0], y: -180, scale: [0.7, 1.15, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            onAnimationComplete={() => removeReaction(reaction.id)}
            className="absolute bottom-8 grid size-12 place-items-center rounded-full border border-ping-bg/45 bg-ping-bg/35 text-ping-pink backdrop-blur-md"
            style={{ left: `${reaction.x}%`, color: "var(--pulse-pink)" }}
          >
            <span className="size-4 rounded-full bg-current opacity-45 shadow-[0_0_28px_currentColor]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
