"use client";

import { Radio } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

export function NowPlayingCard() {
  const currentLive = usePingStore((state) => state.currentLive);

  return (
    <section className="rounded-lg border border-ping-black/10 bg-ping-bg/70 p-3 shadow-line">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase text-ping-accent">
        <Radio size={13} />
        now transmitting
      </div>
      <h2 className="text-sm font-medium leading-tight">{currentLive.title}</h2>
      <p className="mt-1 text-xs text-ping-ink/60">{currentLive.artist}</p>
      <div className="mt-3 flex items-center justify-between border-t border-ping-black/10 pt-3 font-mono text-[10px] uppercase text-ping-ink/50">
        <span>{currentLive.city}</span>
        <span>{currentLive.bpm} bpm</span>
      </div>
    </section>
  );
}
