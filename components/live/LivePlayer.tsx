"use client";

import { usePingStore } from "@/store/usePingStore";
import { ReactionPulses } from "@/components/live/ReactionBar";
import { VenueAtmosphere } from "@/components/live/VenueAtmosphere";
import { PingGlyph } from "@/components/brand/PingGlyph";

export function LivePlayer() {
  const currentLive = usePingStore((state) => state.currentLive);
  const isLiveStreamActive = currentLive.status === "live" && currentLive.streamType !== "placeholder" && Boolean(currentLive.embedUrl || currentLive.streamUrl);
  const broadcastCopy = isLiveStreamActive ? "live signal standing by" : "ping broadcasting";

  return (
    <section className="live-player relative overflow-hidden rounded-md border border-ping-black/10 bg-ping-black shadow-mist">
      <div className="venue-still relative isolate min-h-[18.75rem] sm:min-h-[22rem] md:min-h-[30rem]">
        <VenueAtmosphere />
        <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_50%_32%,rgba(168,255,96,0.16),transparent_18rem),linear-gradient(180deg,rgba(9,13,11,0.08),rgba(9,13,11,0.72))]" />
        <ReactionPulses />

        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center p-8 text-center text-ping-bg">
          <div className="grid max-w-xl place-items-center gap-5">
            <PingGlyph className="size-16 text-ping-bg/80 drop-shadow-[0_0_24px_rgba(168,255,96,0.18)] sm:size-20" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-ping-accent">{broadcastCopy}</p>
              <h1 className="mt-3 text-3xl font-semibold uppercase leading-none tracking-normal sm:text-5xl">{currentLive.title}</h1>
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
      </div>
    </section>
  );
}
