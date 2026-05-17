"use client";

import { useEffect, useState } from "react";
import { usePingStore } from "@/store/usePingStore";
import { ReactionBar, ReactionPulses } from "@/components/live/ReactionBar";
import { getMsUntilStreamStart, isAfterStreamStartTime, StreamEmbed } from "@/components/live/StreamEmbed";
import { VenueAtmosphere } from "@/components/live/VenueAtmosphere";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { getSessionState } from "@/data/sessionState";

export function LivePlayer() {
  const currentLive = usePingStore((state) => state.currentLive);
  const [now, setNow] = useState(() => Date.now());
  const [isScheduledStreamActive, setIsScheduledStreamActive] = useState(false);
  const sessionState = getSessionState(new Date(now));
  const broadcastCopy = sessionState === "live" ? "live signal standing by" : sessionState === "ended" ? "session memory" : "ping broadcasting";

  useEffect(() => {
    const checkSchedule = () => setIsScheduledStreamActive(isAfterStreamStartTime());
    checkSchedule();

    const startTimeout = window.setTimeout(checkSchedule, getMsUntilStreamStart() + 100);
    const interval = window.setInterval(checkSchedule, 15_000);
    return () => {
      window.clearTimeout(startTimeout);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="live-player relative overflow-hidden rounded-md border border-ping-black/10 bg-ping-black shadow-mist">
      <div className="venue-still relative isolate aspect-[1.12/1] sm:aspect-video">
        {!isScheduledStreamActive ? <VenueAtmosphere /> : null}
        <StreamEmbed sessionState={sessionState} title={currentLive.title} artist={currentLive.artist} />
        {!isScheduledStreamActive ? (
          <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_50%_32%,rgba(168,255,96,0.16),transparent_18rem),linear-gradient(180deg,rgba(9,13,11,0.08),rgba(9,13,11,0.72))]" />
        ) : null}
        <ReactionPulses />

        {!isScheduledStreamActive ? (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center p-6 pb-20 text-center text-ping-bg sm:p-8 sm:pb-28">
            <div className="grid max-w-xl place-items-center gap-5">
              <PingGlyph className="size-16 text-ping-bg/80 drop-shadow-[0_0_24px_rgba(168,255,96,0.18)] sm:size-20" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ping-accent">{broadcastCopy}</p>
                <h1 className="mt-3 text-[2.35rem] font-semibold uppercase leading-[0.92] tracking-normal sm:text-5xl">{currentLive.title}</h1>
                <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ping-bg/55">
                  <span>{currentLive.artist}</span>
                  <span className="text-ping-accent/70">/</span>
                  <span>{currentLive.city}</span>
                  <span className="text-ping-accent/70">/</span>
                  <span>{currentLive.genre}</span>
                </p>
              </div>
            </div>
          </div>
        ) : null}
        <div className="stream-reaction-dock absolute inset-x-0 bottom-0 z-20 border-t border-ping-black/10 bg-ping-surface/90 px-3 py-2 sm:p-4">
          <ReactionBar />
        </div>
      </div>
    </section>
  );
}
