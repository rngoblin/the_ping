"use client";

import { CalendarDays } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";
import { EventCover } from "@/components/event/EventCover";

const getCoverAccent = (genre: string) => {
  if (/hardgroove|breakbeat|jungle/i.test(genre)) {
    return "pink" as const;
  }

  if (/visual|experimental/i.test(genre)) {
    return "mixed" as const;
  }

  return "green" as const;
};

export function SchedulePanel({ onOpenFullSchedule }: { onOpenFullSchedule: () => void }) {
  const schedule = usePingStore((state) => state.schedule);
  const themeMode = usePingStore((state) => state.themeMode);
  const coverTheme = themeMode === "night" ? "void" : "daylight";
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
              theme={coverTheme}
              accent={getCoverAccent(act.genre)}
              className="min-h-[11.25rem] border-ping-black/10 p-2 [--cover-ratio:16/10.5] [--cover-title-size:clamp(1.25rem,7.4cqw,1.85rem)] [--cover-title-width:15ch] sm:p-2"
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
