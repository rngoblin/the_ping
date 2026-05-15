"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Radio, Settings2 } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";
import { ThemeSwitch } from "@/components/shell/ThemeSwitch";

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
  const viewerCount = usePingStore((state) => state.viewerCount);
  const currentLive = usePingStore((state) => state.currentLive);
  const localUser = usePingStore((state) => state.localUser);
  const [now, setNow] = useState(() => Date.now());
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const liveMinutes = Math.floor((currentLive.elapsedSeconds + Math.floor((now - mountedAt.current) / 1000)) / 60);
  const insideMinutes = localUser?.enteredAt ? Math.max(0, Math.floor((now - new Date(localUser.enteredAt).getTime()) / 60_000)) : 0;

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-ping-accent/30 bg-ping-sage/45 px-3 py-1.5 font-mono text-[10px] uppercase text-ping-accent">
          <span className="size-2 rounded-full bg-ping-accent shadow-[0_0_14px_rgba(94,122,100,0.7)]" />
          live
        </span>
        <span className="hidden items-center gap-2 font-mono text-[10px] uppercase text-ping-ink/50 sm:flex">
          <Radio size={13} />
          {viewerCount.toLocaleString()} connected
        </span>
        <span className="hidden font-mono text-[10px] uppercase text-ping-ink/40 md:inline">
          live for {formatDuration(liveMinutes)}
        </span>
        {localUser ? (
          <span className="hidden font-mono text-[10px] uppercase text-ping-ink/40 lg:inline">
            {formatDuration(insideMinutes)} inside
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitch compact />
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
      </div>
    </header>
  );
}
