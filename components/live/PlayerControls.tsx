"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

const formatElapsed = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
};

export function PlayerControls() {
  const currentLive = usePingStore((state) => state.currentLive);
  const isPlaying = usePingStore((state) => state.isPlaying);
  const isMuted = usePingStore((state) => state.isMuted);
  const volume = usePingStore((state) => state.volume);
  const togglePlaying = usePingStore((state) => state.togglePlaying);
  const toggleMuted = usePingStore((state) => state.toggleMuted);
  const setVolume = usePingStore((state) => state.setVolume);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-ping-bg/30 bg-ping-bg/18 px-2 py-2 text-ping-bg backdrop-blur-md sm:gap-3 sm:px-3">
      <span className="flex items-center gap-2 rounded-full bg-ping-bg/16 px-3 py-1 font-mono text-[10px] uppercase">
        <span className="size-2 rounded-full bg-ping-sage" />
        live
      </span>
      <button
        onClick={togglePlaying}
        aria-label={isPlaying ? "Pause stream" : "Play stream"}
        title={isPlaying ? "Pause stream" : "Play stream"}
        className="grid size-8 place-items-center rounded-full border border-ping-bg/25 bg-ping-bg/10"
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} />}
      </button>
      <button
        onClick={toggleMuted}
        aria-label={isMuted ? "Unmute stream" : "Mute stream"}
        title={isMuted ? "Unmute stream" : "Mute stream"}
        className="grid size-8 place-items-center rounded-full border border-ping-bg/25 bg-ping-bg/10"
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
      <input
        aria-label="Volume"
        type="range"
        min="0"
        max="100"
        value={isMuted ? 0 : volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        className="h-1 w-20 accent-ping-sage sm:w-24"
      />
      <span className="font-mono text-[10px] uppercase text-ping-bg/75">{formatElapsed(currentLive.elapsedSeconds)}</span>
    </div>
  );
}
