"use client";

import { CalendarDays } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";
import { EventCover } from "@/components/event/EventCover";

export function SchedulePanel({ onOpenFullSchedule }: { onOpenFullSchedule: () => void }) {
  const schedule = usePingStore((state) => state.schedule);
  const previewSchedule = schedule.slice(0, 3);

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
            className="group w-full rounded-md border border-ping-black/10 bg-ping-bg/55 p-2 text-left transition hover:border-ping-accent/35 hover:bg-ping-bg"
          >
            <EventCover
              title={act.title}
              artist={act.artist}
              startsAt={act.time}
              city={act.city}
              genre={act.genre}
              eventCode={act.id}
              theme="void"
              accent="green"
              className="[--cover-ratio:16/9]"
            />
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
