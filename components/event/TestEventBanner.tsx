"use client";

import { CalendarDays, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTestEventTime, getTestEventStatus, tomorrowTestEvent } from "@/data/testEvent";
import { sessionStateCopy, type SessionState } from "@/data/sessionState";

const eventStatusToSessionState = {
  upcoming: "scheduled",
  live: "live",
  ended: "ended"
} satisfies Record<ReturnType<typeof getTestEventStatus>, SessionState>;

export function TestEventBanner({ onJoin, compact = false }: { onJoin?: () => void; compact?: boolean }) {
  const [status, setStatus] = useState(() => getTestEventStatus());
  const sessionState = eventStatusToSessionState[status];
  const copy = sessionStateCopy[sessionState];
  void onJoin;

  useEffect(() => {
    const interval = window.setInterval(() => setStatus(getTestEventStatus()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!tomorrowTestEvent.isPublished) {
    return null;
  }

  return (
    <aside className={`rounded-md border border-ping-black/8 bg-ping-surface/52 shadow-line ${compact ? "p-2.5" : "p-3"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ping-accent">
            <Radio size={13} />
            {copy.header}
          </p>
          <h2 className={`${compact ? "text-sm" : "text-base"} font-semibold leading-tight`}>{tomorrowTestEvent.title}</h2>
          <p className="mt-1 line-clamp-1 max-w-2xl text-sm leading-relaxed text-ping-ink/48">{tomorrowTestEvent.description}</p>
          <p className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ping-ink/42">
            <CalendarDays size={13} />
            <span>{sessionState === "live" ? copy.header : sessionState === "ended" ? copy.header : formatTestEventTime()}</span>
            <span>/</span>
            <span>{tomorrowTestEvent.roomLabel}</span>
            {sessionState === "scheduled" ? (
              <>
                <span>/</span>
                <span>room already open</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </aside>
  );
}
