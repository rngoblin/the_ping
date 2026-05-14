"use client";

import { AlertCircle, Heart, MapPin, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { usePingStore } from "@/store/usePingStore";
import { ReactionPulses } from "@/components/live/ReactionBar";
import { VenueAtmosphere } from "@/components/live/VenueAtmosphere";
import { PlayerControls } from "@/components/live/PlayerControls";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { StreamEmbed } from "@/components/live/StreamEmbed";

export function LivePlayer() {
  const currentLive = usePingStore((state) => state.currentLive);
  const viewerCount = usePingStore((state) => state.viewerCount);
  const addReaction = usePingStore((state) => state.addReaction);
  const isLive = currentLive.status === "live";
  const isStartingSoon = currentLive.status === "startingSoon";
  const isOffline = currentLive.status === "offline";
  const eyebrow = isLive ? "live now" : isStartingSoon ? "starting soon" : isOffline ? "signal quiet" : "next live soon";

  return (
    <section className="live-player relative overflow-hidden rounded-md border border-ping-black/10 bg-ping-black shadow-mist">
      <div className="venue-still relative min-h-[18.75rem] sm:min-h-[22rem] md:min-h-[30rem]">
        <StreamEmbed />
        <VenueAtmosphere />
        <div className="venue-glow absolute inset-0 opacity-35 mix-blend-screen" style={{ animation: "drift 10s linear infinite alternate" }}>
          <div className="h-full w-[120%] bg-[radial-gradient(circle_at_35%_50%,rgba(244,244,242,0.42),transparent_20rem)]" />
        </div>

        <ReactionPulses />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-5">
          <div className="rounded-full border border-ping-bg/30 bg-ping-bg/20 px-2.5 py-1.5 font-mono text-[9px] uppercase text-ping-bg backdrop-blur-md sm:px-3 sm:text-[10px]">
            {isLive ? `${currentLive.startedAt} local signal` : `starts in ${currentLive.startsInMinutes}m`}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-ping-bg/30 bg-ping-bg/20 px-2.5 py-1.5 font-mono text-[9px] uppercase text-ping-bg backdrop-blur-md sm:px-3 sm:text-[10px]">
            <span className="size-2 rounded-full bg-ping-sage shadow-[0_0_14px_rgba(183,194,178,0.8)]" />
            {viewerCount.toLocaleString()} here
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
          {!isLive ? (
            <div className="mb-5 flex max-w-md items-center gap-3 rounded-lg border border-ping-bg/30 bg-ping-bg/18 p-3 text-ping-bg backdrop-blur-md">
              {isOffline ? <AlertCircle size={18} /> : <PingGlyph className="size-8 bg-ping-bg/20" />}
              <div>
                <p className="text-sm font-medium">{isOffline ? currentLive.errorCopy : `${currentLive.nextTitle} / ${currentLive.nextArtist}`}</p>
                <p className="mt-1 font-mono text-[10px] uppercase text-ping-bg/65">
                  {isStartingSoon ? "chat stays open while the room gathers" : "schedule is the signal back"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mb-4 flex h-10 items-end gap-1 sm:mb-5 sm:h-16 sm:gap-1.5">
            {Array.from({ length: 36 }).map((_, index) => (
              <span
                key={index}
                className={`signal-bar w-full rounded-full ${isLive ? "bg-ping-bg/70" : "bg-ping-bg/35"}`}
                style={{ height: `${18 + ((index * 17) % 46)}px` }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase text-ping-bg/80 sm:mb-3 sm:text-[10px]">
                <Radio size={13} />
                {eyebrow}
              </div>
              <h1 className="max-w-2xl text-[2rem] font-semibold leading-[0.96] text-ping-bg sm:text-[2.55rem] md:text-6xl">
                {isLive ? currentLive.title : isStartingSoon ? currentLive.nextTitle : "Next live soon"}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ping-bg/80 sm:mt-4 sm:gap-x-4 sm:text-sm">
                <span>{isLive ? currentLive.artist : currentLive.nextArtist}</span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {currentLive.city} / {currentLive.source}
                </span>
                <span>{currentLive.genre}</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <PlayerControls />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => addReaction("heart")}
                className="flex h-10 items-center justify-center gap-2 rounded-full border border-ping-bg/35 bg-ping-bg/20 px-4 text-sm font-medium text-ping-bg backdrop-blur-md transition hover:bg-ping-bg/30 sm:h-12 sm:px-5"
              >
                <Heart size={17} />
                send pulse
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
