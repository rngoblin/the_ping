"use client";

import { CalendarDays } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

export function SchedulePanel({ onOpenFullSchedule }: { onOpenFullSchedule: () => void }) {
  const schedule = usePingStore((state) => state.schedule);
  const previewSchedule = schedule.slice(0, 4);

  return (
    <section className="rounded-lg border border-ping-black/10 bg-ping-surface/80 p-4 shadow-line">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">up next</h2>
        <CalendarDays size={16} className="text-ping-accent" />
      </div>
      <div className="space-y-3">
        {previewSchedule.map((act) => (
          <button
            key={act.id}
            className="w-full rounded-md border border-ping-black/10 bg-ping-bg/55 p-3 text-left transition hover:border-ping-accent/35 hover:bg-ping-bg"
          >
            <div className="mb-2 font-mono text-[10px] uppercase text-ping-accent">{act.time}</div>
            <div className="text-sm font-medium">{act.title}</div>
            <div className="mt-1 flex justify-between gap-3 text-xs text-ping-ink/50">
              <span>{act.artist}</span>
              <span>{act.city}</span>
            </div>
            <div className="mt-3 inline-flex rounded-full bg-ping-surface px-2.5 py-1 font-mono text-[10px] uppercase text-ping-ink/45">
              {act.genre}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onOpenFullSchedule}
        className="mt-4 flex h-11 w-full items-center justify-center rounded-full border border-ping-accent/30 bg-ping-bg text-sm font-medium text-ping-accent transition hover:bg-ping-sage/45"
      >
        full schedule
      </button>
    </section>
  );
}
