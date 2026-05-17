"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { sessionStateCopy, type SessionState } from "@/data/sessionState";

const VIDEO_ID = "FzmkttWQNPE";
const STREAM_START_AT_UTC = "2026-05-17T16:00:00.000Z";
const CHECK_INTERVAL_MS = 15_000;
const STREAM_COVER_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/ping-stream-cover.png`;
export const STREAM_START_LABEL = "21:00";
const STREAM_START_TIME = new Date(STREAM_START_AT_UTC).getTime();

type StreamYouTubePlayer = {
  destroy: () => void;
  getPlayerState?: () => number;
  playVideo: () => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
};

let youtubeApiPromise: Promise<void> | null = null;

const loadYouTubeApi = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
};

export const isAfterStreamStartTime = () => {
  return Date.now() >= STREAM_START_TIME;
};

export const getMsUntilStreamStart = () => {
  return Math.max(0, STREAM_START_TIME - Date.now());
};

function StreamBadge({ children }: { children: ReactNode }) {
  return (
    <div className="stream-badge absolute left-3 top-3 z-[13] rounded-md border border-ping-accent/35 bg-ping-surface/88 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ping-accent shadow-line backdrop-blur-md">
      {children}
    </div>
  );
}

function PingStreamOverlay({
  sessionState,
  title,
  artist,
  onPlay
}: {
  sessionState: SessionState;
  title: string;
  artist: string;
  onPlay: () => void;
}) {
  const copy = sessionStateCopy[sessionState];
  const isLive = sessionState === "live";

  return (
    <button
      type="button"
      onClick={onPlay}
      className="group absolute inset-0 z-[12] grid place-items-center bg-ping-black/42 p-6 text-center text-ping-bg transition hover:bg-ping-black/36"
      aria-label={isLive ? "Play live stream" : "Open stream replay"}
    >
      <div className="grid max-w-xl place-items-center gap-4">
        <span className="grid size-16 place-items-center rounded-full border border-ping-accent/45 bg-ping-surface/72 text-ping-accent shadow-[0_0_34px_rgba(168,255,96,0.16)] transition group-hover:scale-105 group-hover:border-ping-pink/50 group-hover:text-ping-pink sm:size-20">
          <Play size={28} fill="currentColor" />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-accent">{copy.playerBadge}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-none sm:text-4xl">{title}</h2>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ping-bg/58">{artist}</p>
        </div>
        <div className="flex items-center gap-2 text-ping-bg/55">
          <PingGlyph className="size-5" />
          <span className="h-px w-20 bg-ping-accent/35" />
          <span className="size-1.5 rounded-full bg-ping-accent" />
          <span className="h-px w-20 bg-ping-accent/35" />
        </div>
      </div>
    </button>
  );
}

export function StreamEmbed({
  sessionState,
  title,
  artist
}: {
  sessionState: SessionState;
  title: string;
  artist: string;
}) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPlayer, setHasPlayer] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const playerTargetRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<StreamYouTubePlayer | null>(null);
  const streamIsOpen = sessionState !== "scheduled" && isAvailable;
  const copy = sessionStateCopy[sessionState];

  useEffect(() => {
    const checkAvailability = () => setIsAvailable(isAfterStreamStartTime());
    checkAvailability();

    const startTimeout = window.setTimeout(checkAvailability, getMsUntilStreamStart() + 100);
    const interval = window.setInterval(checkAvailability, CHECK_INTERVAL_MS);
    return () => {
      window.clearTimeout(startTimeout);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (sessionState === "live" && isAvailable) {
      setHasPlayer(true);
    }
  }, [isAvailable, sessionState]);

  useEffect(() => {
    if (!streamIsOpen || !hasPlayer || !playerTargetRef.current) {
      return () => undefined;
    }

    let player: StreamYouTubePlayer | null = null;
    let isMounted = true;

    void loadYouTubeApi().then(() => {
      if (!isMounted || !playerTargetRef.current || !window.YT?.Player) {
        return;
      }

      player = new window.YT.Player(playerTargetRef.current, {
        width: "100%",
        height: "100%",
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 1,
          enablejsapi: 1,
          mute: 0,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            const target = event.target as unknown as StreamYouTubePlayer;
            playerRef.current = target;
            window.setTimeout(() => {
              target.unMute();
              target.setVolume(100);
              target.playVideo();
            }, 100);
            window.setTimeout(() => {
              if (target.getPlayerState?.() !== window.YT?.PlayerState?.PLAYING) {
                setShowOverlay(true);
              }
            }, 1400);
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState?.PLAYING) {
              setShowOverlay(false);
            }
          }
        }
      }) as unknown as StreamYouTubePlayer;
    });

    return () => {
      isMounted = false;
      playerRef.current = null;
      player?.destroy();
    };
  }, [hasPlayer, streamIsOpen]);

  const activatePlayer = () => {
    setHasPlayer(true);
    setShowOverlay(true);
    window.setTimeout(() => {
      const player = playerRef.current;
      player?.unMute();
      player?.setVolume(100);
      player?.playVideo();
    }, 50);
  };

  if (!streamIsOpen) {
    return (
      <div className="absolute inset-0 z-[12] overflow-hidden bg-ping-surface text-ping-ink">
        <div className="absolute inset-x-0 top-0 bottom-[3.75rem] overflow-hidden sm:bottom-[5rem]">
          <Image src={STREAM_COVER_SRC} alt="" fill sizes="100vw" priority className="theme-cover-art stream-cover-art object-cover object-top" />
        </div>
        <div className="stream-control-band absolute inset-x-0 bottom-0 h-[3.75rem] border-t border-ping-black/10 bg-ping-surface/90 sm:h-[5rem]" />
        <StreamBadge>{copy.playerBadge} {STREAM_START_LABEL}</StreamBadge>
        <div className="absolute bottom-[4.85rem] left-3 z-[13] max-w-[calc(100%-1.5rem)] rounded-md border border-ping-black/10 bg-ping-surface/92 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.13em] text-ping-accent shadow-line sm:bottom-[6rem] sm:left-4 sm:text-[10px]">
          Room open · broadcast starts at {STREAM_START_LABEL}
        </div>
        <div className="sr-only">
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-ping-accent sm:text-base">stream starts at {STREAM_START_LABEL}</p>
          <p className="mt-2 text-sm leading-relaxed text-ping-bg/60">Waiting for signal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StreamBadge>{copy.playerBadge}</StreamBadge>
      {hasPlayer ? <div ref={playerTargetRef} className="absolute inset-0 z-[1] h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0" /> : null}
      {showOverlay ? <PingStreamOverlay sessionState={sessionState} title={title} artist={artist} onPlay={activatePlayer} /> : null}
    </>
  );
}
