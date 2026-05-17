"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";
import { EventCover } from "@/components/event/EventCover";

export function SchedulePanel({ onOpenFullSchedule }: { onOpenFullSchedule: () => void }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const schedule = usePingStore((state) => state.schedule);
  const nextAct = schedule[0];

  return (
    <section className="rounded-lg border border-ping-black/10 bg-ping-surface/80 p-4 shadow-line">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">up next</h2>
        <CalendarDays size={16} className="text-ping-accent" />
      </div>
      {nextAct ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsDetailsOpen((isOpen) => !isOpen)}
            aria-expanded={isDetailsOpen}
            className="group w-full rounded-md border border-ping-black/10 bg-ping-bg/55 p-2 text-left transition hover:border-ping-accent/35 hover:bg-ping-bg"
          >
            <EventCover
              title={nextAct.title}
              artist={nextAct.artist}
              startsAt={nextAct.time}
              city={nextAct.city}
              genre={nextAct.genre}
              eventCode={nextAct.id}
              theme="void"
              accent="green"
              className="[--cover-ratio:16/9]"
            />
          </button>
          {isDetailsOpen ? (
            <article className="rounded-md border border-ping-black/10 bg-ping-bg/70 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase text-ping-accent">{nextAct.time}</span>
                <span className="rounded-full bg-ping-surface px-3 py-1 font-mono text-[10px] uppercase text-ping-ink/45">{nextAct.genre}</span>
              </div>
              <h3 className="text-base font-medium leading-tight">{nextAct.title}</h3>
              <p className="mt-1 text-sm text-ping-ink/60">
                {nextAct.artist} / {nextAct.city} / {nextAct.source}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ping-ink/50">{nextAct.mood}</p>
            </article>
          ) : null}
        </div>
      ) : null}
      <button
        onClick={onOpenFullSchedule}
        className="mt-4 flex h-11 w-full items-center justify-center rounded-full border border-ping-accent/30 bg-ping-bg text-sm font-medium text-ping-accent transition hover:bg-ping-sage/45"
      >
        full schedule
      </button>
    </section>
  );
}
