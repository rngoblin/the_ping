"use client";

import { CalendarDays, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTestEventTime, getTestEventStatus, tomorrowTestEvent } from "@/data/testEvent";

const statusCopy = {
  upcoming: "upcoming",
  live: "live now",
  ended: "ended"
};

export function TestEventBanner({ onJoin, compact = false }: { onJoin?: () => void; compact?: boolean }) {
  const [status, setStatus] = useState(() => getTestEventStatus());

  useEffect(() => {
    const interval = window.setInterval(() => setStatus(getTestEventStatus()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!tomorrowTestEvent.isPublished) {
    return null;
  }

  return (
    <aside className={`rounded-lg border border-ping-accent/25 bg-ping-surface/82 shadow-line ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ping-accent">
            <Radio size={13} />
            {statusCopy[status]}
          </p>
          <h2 className={`${compact ? "text-lg" : "text-xl"} font-semibold leading-tight`}>{tomorrowTestEvent.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ping-ink/58">{tomorrowTestEvent.description}</p>
          <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ping-ink/45">
            <CalendarDays size={13} />
            <span>{status === "live" ? "live now" : status === "ended" ? "session ended" : formatTestEventTime()}</span>
            <span>/</span>
            <span>{tomorrowTestEvent.roomLabel}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onJoin}
          className="shrink-0 rounded-full border border-ping-accent/35 bg-ping-bg px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ping-accent transition hover:bg-ping-sage/35"
        >
          {onJoin ? "join test session" : "enter room"}
        </button>
      </div>
    </aside>
  );
}
