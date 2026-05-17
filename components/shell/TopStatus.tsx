"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Settings2 } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";
import { LowPowerSwitch, ThemeSwitch } from "@/components/shell/ThemeSwitch";
import { getSessionState, sessionStateCopy } from "@/data/sessionState";

const formatDuration = (minutes: number) => {
  if (minutes < 1) {
    return "just inside";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export function TopStatus({ onOpenHostPanel }: { onOpenHostPanel?: () => void }) {
  const currentLive = usePingStore((state) => state.currentLive);
  const localUser = usePingStore((state) => state.localUser);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const [now, setNow] = useState(() => Date.now());
  const sessionState = getSessionState(new Date(now));
  const copy = sessionStateCopy[sessionState];
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const liveMinutes = Math.floor((currentLive.elapsedSeconds + Math.floor((now - mountedAt.current) / 1000)) / 60);
  const insideMinutes = localUser?.enteredAt ? Math.max(0, Math.floor((now - new Date(localUser.enteredAt).getTime()) / 60_000)) : 0;
  const roomCount = presenceByRoom[activeRoomId]?.count ?? 0;
  const roomCountCopy = `${roomCount.toLocaleString()} ${roomCount === 1 ? "inside" : "inside"}`;

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase ${
            sessionState === "live"
              ? "border-ping-accent/30 bg-ping-sage/45 text-ping-accent"
              : "border-ping-black/10 bg-ping-surface text-ping-ink/55"
          }`}
        >
          <span className={`size-2 rounded-full ${sessionState === "live" ? "bg-ping-accent shadow-[0_0_14px_rgba(94,122,100,0.7)]" : "bg-ping-ink/35"}`} />
          {copy.header}
        </span>
        <span className="hidden font-mono text-[10px] uppercase text-ping-ink/45 sm:inline">{copy.detail}</span>
        <span className="hidden font-mono text-[10px] uppercase text-ping-ink/45 sm:inline">{roomCountCopy}</span>
        {sessionState === "live" ? (
          <span className="hidden font-mono text-[10px] uppercase text-ping-ink/40 md:inline">live for {formatDuration(liveMinutes)}</span>
        ) : null}
        {localUser ? (
          <span className="hidden font-mono text-[10px] uppercase text-ping-ink/40 lg:inline">
            {formatDuration(insideMinutes)} inside
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <LowPowerSwitch compact />
        <ThemeSwitch compact />
        {onOpenHostPanel ? (
          <>
            <button
              onClick={onOpenHostPanel}
              className="hidden size-9 place-items-center rounded-full border border-ping-black/10 bg-ping-surface transition hover:bg-ping-muted sm:grid"
              aria-label="Open host panel"
              title="Host panel"
            >
              <Settings2 size={16} />
            </button>
            <button
              onClick={onOpenHostPanel}
              className="grid size-9 place-items-center rounded-full border border-ping-black/10 bg-ping-surface transition hover:bg-ping-muted lg:hidden"
              aria-label="Open host panel"
              title="Host panel"
            >
              <Menu size={17} />
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
