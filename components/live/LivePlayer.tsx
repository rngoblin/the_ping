"use client";

import { AlertCircle, Play } from "lucide-react";
import { motion } from "framer-motion";
import { usePingStore } from "@/store/usePingStore";
import { ReactionPulses } from "@/components/live/ReactionBar";
import { VenueAtmosphere } from "@/components/live/VenueAtmosphere";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { StreamEmbed } from "@/components/live/StreamEmbed";

export function LivePlayer() {
  const currentLive = usePingStore((state) => state.currentLive);
  const isPlaying = usePingStore((state) => state.isPlaying);
  const togglePlaying = usePingStore((state) => state.togglePlaying);
  const isLive = currentLive.status === "live";
  const isStartingSoon = currentLive.status === "startingSoon";
  const isOffline = currentLive.status === "offline";
  const showGeneratedAtmosphere = !isLive || !isPlaying || currentLive.streamType === "placeholder";

  return (
    <section className="live-player relative overflow-hidden rounded-md border border-ping-black/10 bg-ping-black shadow-mist">
      <div className="venue-still relative isolate min-h-[18.75rem] sm:min-h-[22rem] md:min-h-[30rem]">
        <StreamEmbed />
        {showGeneratedAtmosphere ? <VenueAtmosphere /> : null}
        {showGeneratedAtmosphere ? (
          <div className="venue-glow pointer-events-none absolute inset-0 z-[2] opacity-35 mix-blend-screen" style={{ animation: "drift 10s linear infinite alternate" }}>
            <div className="h-full w-[120%] bg-[radial-gradient(circle_at_35%_50%,rgba(244,244,242,0.42),transparent_20rem)]" />
          </div>
        ) : null}

        <ReactionPulses />

        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center p-4">
          {isLive && !isPlaying ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={togglePlaying}
              aria-label="Play stream"
              title="Play stream"
              className="pointer-events-auto grid size-20 place-items-center rounded-full border border-ping-bg/45 bg-ping-pink/88 text-white shadow-[0_0_44px_var(--pink-glow)] backdrop-blur-md transition hover:bg-ping-softPink sm:size-24"
            >
              <Play size={34} fill="currentColor" />
            </motion.button>
          ) : null}

          {!isLive ? (
            <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg border border-ping-bg/30 bg-ping-bg/18 p-3 text-ping-bg backdrop-blur-md">
              {isOffline ? <AlertCircle size={18} /> : <PingGlyph className="size-8 bg-ping-bg/20" />}
              <div>
                <p className="text-sm font-medium">{isOffline ? currentLive.errorCopy : `${currentLive.nextTitle} / ${currentLive.nextArtist}`}</p>
                <p className="mt-1 font-mono text-[10px] uppercase text-ping-bg/65">
                  {isStartingSoon ? "chat stays open while the room gathers" : "schedule is the signal back"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
