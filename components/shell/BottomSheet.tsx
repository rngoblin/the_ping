"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type BottomSheetProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function BottomSheet({ isOpen, title, children, onClose }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close sheet"
            className="absolute inset-0 bg-ping-black/22"
            onClick={onClose}
          />
          <motion.section
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-hidden rounded-t-2xl border border-ping-black/10 bg-ping-bg shadow-mist"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ping-black/10 bg-ping-bg/92 px-4 py-3 backdrop-blur-xl">
              <div>
                <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-ping-black/15" />
                <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/55">{title}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="grid size-9 place-items-center rounded-full border border-ping-black/10 bg-ping-surface"
              >
                <X size={16} />
              </button>
            </div>
            <div className="soft-scroll max-h-[calc(82dvh-4rem)] overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
