"use client";

import { FormEvent, useState } from "react";
import { Bell, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { ScheduleAct } from "@/data/schedule";
import { usePingStore } from "@/store/usePingStore";

type NotifyModalProps = {
  act: ScheduleAct | null;
  onClose: () => void;
};

export function NotifyModal({ act, onClose }: NotifyModalProps) {
  const [contact, setContact] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const captureNotifyLead = usePingStore((state) => state.captureNotifyLead);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!act || !contact.trim()) {
      return;
    }

    captureNotifyLead({
      actId: act.id,
      actTitle: act.title,
      contact: contact.trim()
    });
    setIsSaved(true);
  };

  return (
    <AnimatePresence>
      {act ? (
        <div className="fixed inset-0 z-[60]">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close notify capture"
            className="absolute inset-0 bg-ping-black/25"
            onClick={onClose}
          />
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="absolute inset-x-4 top-1/2 mx-auto max-w-sm -translate-y-1/2 rounded-xl border border-ping-black/10 bg-ping-bg p-5 shadow-mist"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ping-accent">
                  <Bell size={14} />
                  notify me
                </div>
                <h2 className="text-2xl font-semibold leading-none">{act.title}</h2>
                <p className="mt-2 text-sm text-ping-ink/55">
                  {act.time} / {act.artist}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-ping-black/10 bg-ping-surface"
              >
                <X size={16} />
              </button>
            </div>

            {isSaved ? (
              <div className="rounded-lg border border-ping-accent/25 bg-ping-sage/35 p-4">
                <p className="text-sm font-medium">saved for the next transmission</p>
                <p className="mt-2 text-sm leading-relaxed text-ping-ink/55">No messages will be sent yet. This stays local for the test.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="email or Telegram"
                  className="h-12 w-full rounded-full border border-ping-black/10 bg-ping-surface px-4 text-sm outline-none placeholder:text-ping-ink/35 focus:border-ping-accent/60"
                  required
                />
                <button className="h-11 w-full rounded-full bg-ping-accent text-sm font-medium text-ping-bg transition hover:bg-ping-black">
                  save signal
                </button>
              </form>
            )}
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
