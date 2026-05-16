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
            initial={{ opacity: 0, y: 74, scale: 0.74, filter: "blur(4px)" }}
            animate={{ opacity: [0, 0.86, 0.58, 0], y: -210, scale: [0.74, 1.12, 1.04, 0.92], filter: ["blur(4px)", "blur(0px)", "blur(0px)", "blur(7px)"] }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            transition={{ duration: 2.45, times: [0, 0.18, 0.62, 1], ease: "easeOut" }}
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
