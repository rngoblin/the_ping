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
    <section className="relative overflow-hidden rounded-lg border border-ping-black/10 bg-ping-black shadow-mist">
      <div className="venue-still relative min-h-[22rem] md:min-h-[30rem]">
        <StreamEmbed />
        <VenueAtmosphere />
        <div className="absolute inset-0 opacity-35 mix-blend-screen" style={{ animation: "drift 10s linear infinite alternate" }}>
          <div className="h-full w-[120%] bg-[radial-gradient(circle_at_35%_50%,rgba(244,244,242,0.42),transparent_20rem)]" />
        </div>

        <ReactionPulses />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
          <div className="rounded-full border border-ping-bg/30 bg-ping-bg/20 px-3 py-1.5 font-mono text-[10px] uppercase text-ping-bg backdrop-blur-md">
            {isLive ? `${currentLive.startedAt} local signal` : `starts in ${currentLive.startsInMinutes}m`}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-ping-bg/30 bg-ping-bg/20 px-3 py-1.5 font-mono text-[10px] uppercase text-ping-bg backdrop-blur-md">
            <span className="size-2 rounded-full bg-ping-sage shadow-[0_0_14px_rgba(183,194,178,0.8)]" />
            {viewerCount.toLocaleString()} here
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
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

          <div className="mb-5 flex h-16 items-end gap-1.5">
            {Array.from({ length: 36 }).map((_, index) => (
              <span
                key={index}
                className={`signal-bar w-full rounded-full ${isLive ? "bg-ping-bg/70" : "bg-ping-bg/35"}`}
                style={{ height: `${18 + ((index * 17) % 46)}px` }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase text-ping-bg/80">
                <Radio size={14} />
                {eyebrow}
              </div>
              <h1 className="max-w-2xl text-[2.55rem] font-semibold leading-[0.95] text-ping-bg sm:text-6xl">
                {isLive ? currentLive.title : isStartingSoon ? currentLive.nextTitle : "Next live soon"}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ping-bg/80">
                <span>{isLive ? currentLive.artist : currentLive.nextArtist}</span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
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
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-ping-bg/35 bg-ping-bg/20 px-5 text-sm font-medium text-ping-bg backdrop-blur-md transition hover:bg-ping-bg/30"
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
