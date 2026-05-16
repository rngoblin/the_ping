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
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const reactionCount = usePingStore((state) => state.reactionCountsByRoom[activeRoomId] ?? 0);

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
              className="group grid size-10 place-items-center rounded-full border border-ping-bg/20 bg-ping-bg/10 text-ping-bg shadow-line backdrop-blur-md transition hover:border-ping-pink/50 hover:bg-ping-softPink/20 sm:size-11"
              aria-label={reaction.label}
              title={reaction.label}
            >
              <Icon size={18} className="transition group-hover:text-ping-pink" />
            </motion.button>
          );
        })}
      </div>
      <p className="max-w-[9.5rem] text-right font-mono text-[9px] uppercase leading-relaxed text-ping-bg/55 sm:max-w-[12rem] sm:text-[10px]">
        {reactionCount.toLocaleString()} pulses in this room
      </p>
    </div>
  );
}

function ReactionSymbol({ emoji, size = 20 }: { emoji: string; size?: number }) {
  if (emoji === "spark") {
    return <Sparkles size={size} />;
  }

  if (emoji === "charge") {
    return <Zap size={size} />;
  }

  return <Heart size={size} />;
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
            initial={{ opacity: 0, y: 74, scale: 0.78 }}
            animate={{ opacity: [0, 0.86, 0.56, 0], y: -190, scale: [0.78, 1.08, 1, 0.92] }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 1.8, times: [0, 0.18, 0.62, 1], ease: "easeOut" }}
            onAnimationComplete={() => removeReaction(reaction.id)}
            className="absolute bottom-8 grid size-12 place-items-center rounded-full border border-ping-bg/35 bg-ping-bg/28 text-ping-pink backdrop-blur-md"
            style={{ left: `${reaction.x}%`, color: "var(--pulse-pink)" }}
          >
            <span className="grid size-8 place-items-center rounded-full bg-ping-pink/15 shadow-[0_0_28px_currentColor]">
              <ReactionSymbol emoji={reaction.emoji} size={18} />
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
