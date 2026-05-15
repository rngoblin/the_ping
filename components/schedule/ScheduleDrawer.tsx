"use client";

import { useState } from "react";
import { Bell, CalendarDays, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePingStore } from "@/store/usePingStore";
import { NotifyModal } from "@/components/schedule/NotifyModal";
import { EventCover } from "@/components/event/EventCover";
import type { ScheduleAct } from "@/data/schedule";

const getCoverAccent = (genre: string) => {
  if (/hardgroove|breakbeat|jungle/i.test(genre)) {
    return "pink" as const;
  }

  if (/visual|experimental/i.test(genre)) {
    return "mixed" as const;
  }

  return "green" as const;
};

export function ScheduleDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifyAct, setNotifyAct] = useState<ScheduleAct | null>(null);
  const schedule = usePingStore((state) => state.schedule);
  const featureFlags = usePingStore((state) => state.featureFlags);
  const themeMode = usePingStore((state) => state.themeMode);
  const coverTheme = themeMode === "night" ? "void" : "daylight";
  const groupedSchedule = schedule.reduce<Record<string, typeof schedule>>((groups, act) => {
    groups[act.day] = [...(groups[act.day] ?? []), act];
    return groups;
  }, {});

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close full schedule"
            onClick={onClose}
            className="absolute inset-0 bg-ping-black/25"
          />
          <motion.aside
            initial={{ x: "100%", y: 24 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: "100%", y: 24 }}
            transition={{ type: "spring", damping: 32, stiffness: 250 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-ping-black/10 bg-ping-bg shadow-mist sm:rounded-l-2xl"
          >
            <div className="flex items-start justify-between border-b border-ping-black/10 p-5">
              <div>
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ping-accent">
                  <CalendarDays size={15} />
                  full schedule
                </div>
                <h2 className="text-3xl font-semibold leading-none">tomorrow there is a new live</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ping-ink/55">
                  PING is built around return signals: quiet recurring nights, one shared stream, rooms that wake up before the set starts.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close schedule"
                title="Close schedule"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-ping-black/10 bg-ping-surface"
              >
                <X size={17} />
              </button>
            </div>

            <div className="soft-scroll flex-1 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="space-y-6">
                {Object.entries(groupedSchedule).map(([day, acts]) => (
                  <section key={day}>
                    <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/45">{day}</h3>
                    <div className="space-y-3">
                      {acts.map((act) => (
                        <article key={act.id} className="grid gap-3 rounded-lg border border-ping-black/10 bg-ping-surface/75 p-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
                          <EventCover
                            title={act.title}
                            artist={act.artist}
                            startsAt={act.time}
                            city={act.city}
                            genre={act.genre}
                            eventCode={act.id}
                            theme={coverTheme}
                            accent={getCoverAccent(act.genre)}
                            className="min-h-[14rem] [--cover-ratio:4/5] [--cover-title-size:clamp(1.55rem,13cqw,3rem)] [--cover-title-width:13ch] sm:min-h-[15rem]"
                          />
                          <div className="flex min-w-0 flex-col justify-between gap-4 p-1">
                            <div>
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <span className="font-mono text-[10px] uppercase text-ping-accent">{act.time}</span>
                                <span className="rounded-full bg-ping-bg px-3 py-1 font-mono text-[10px] uppercase text-ping-ink/45">
                                  {act.genre}
                                </span>
                              </div>
                              <h4 className="text-lg font-medium">{act.title}</h4>
                              <p className="mt-1 text-sm text-ping-ink/60">
                                {act.artist} / {act.city} / {act.source}
                              </p>
                              <p className="mt-3 text-sm leading-relaxed text-ping-ink/50">{act.mood}</p>
                            </div>
                            {featureFlags.enableScheduleNotify ? (
                              <button
                                onClick={() => setNotifyAct(act)}
                                className="pulse-action flex h-10 w-fit items-center gap-2 rounded-full border bg-ping-bg px-4 text-sm transition"
                              >
                                <Bell size={15} />
                                notify me
                              </button>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </motion.aside>
          <NotifyModal act={notifyAct} onClose={() => setNotifyAct(null)} />
        </div>
      ) : null}
    </AnimatePresence>
  );
}
